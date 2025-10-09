import React, { useEffect, useState } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabaseClient'
import { ArrowLeft, Upload, X, CheckCircle, AlertCircle } from 'lucide-react'

interface FormState {
  nomeEmpresa: string
  nomeProjeto: string
}

export default function Transcricao() {
  const [form, setForm] = useState<FormState>({ nomeEmpresa: '', nomeProjeto: '' })
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  useEffect(() => {
    // Limpa mensagens ao alterar entradas
    setError(null)
    setSuccess(null)
  }, [form.nomeEmpresa, form.nomeProjeto, file])

  const onChangeForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const validateFile = (f: File): string | null => {
    const MAX_BYTES = 300 * 1024 * 1024 // 300MB
    if (!f) return 'Selecione um arquivo de áudio ou vídeo.'
    if (!f.type.startsWith('audio/') && !f.type.startsWith('video/')) {
      return 'Formato inválido. Aceitamos apenas arquivos de áudio ou vídeo.'
    }
    if (f.size > MAX_BYTES) {
      return 'Arquivo muito grande. O tamanho máximo permitido é 300MB.'
    }
    return null
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null
    if (!f) {
      setFile(null)
      return
    }
    const validationMsg = validateFile(f)
    if (validationMsg) {
      setError(validationMsg)
      setFile(null)
    } else {
      setError(null)
      setFile(f)
    }
  }

  const removeFile = () => {
    setFile(null)
  }

  const sanitize = (s: string) => {
    return s
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-_]/g, '')
  }

  const canSubmit = () => {
    return !!(form.nomeEmpresa && form.nomeProjeto && file && !error && !isSubmitting)
  }

  const handleSubmit = async () => {
    setError(null)
    setSuccess(null)

    if (!file) {
      setError('Selecione um arquivo antes de enviar.')
      return
    }

    const validationMsg = validateFile(file)
    if (validationMsg) {
      setError(validationMsg)
      return
    }

    setIsSubmitting(true)
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        throw new Error(sessionError.message)
      }
      const user = session?.user
      if (!user) {
        setIsSubmitting(false)
        window.location.href = '/login'
        return
      }

      const projectSlug = sanitize(form.nomeProjeto)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const fileSlug = sanitize(file.name)
      const path = `${user.id}/${projectSlug}/${timestamp}-${fileSlug}`

      // Upload para bucket "transcriptions"
      const { error: uploadError } = await supabase.storage
        .from('transcriptions')
        .upload(path, file, { contentType: file.type, upsert: false })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      // Inserir metadados do upload (não bloqueia sucesso se falhar)
      try {
        await supabase
          .from('transcriptions_meta')
          .insert({
            user_id: user.id,
            empresa: form.nomeEmpresa,
            projeto: form.nomeProjeto,
            storage_path: path,
            file_name: file.name,
            size: file.size,
            mime_type: file.type,
            bucket: 'transcriptions',
            status: 'pendente',
          })
      } catch (metaErr) {
        // Evitar atrapalhar a UX: manter sucesso e registrar falha no console
        console.error('Falha ao registrar metadados de transcrição:', metaErr)
      }

      setSuccess('Upload realizado. A transcrição será enviada por email.')
      setFile(null)
      setForm({ nomeEmpresa: '', nomeProjeto: '' })
    } catch (err: any) {
      const message = err?.message || 'Ocorreu um erro ao enviar o arquivo.'
      let friendly = message
      if (message.includes('row-level security') || message.includes('violates row-level') || message.toLowerCase().includes('rls')) {
        friendly = 'As políticas de segurança (RLS) do Storage estão bloqueando o upload. Crie uma política de INSERT para usuários autenticados no bucket "transcriptions".'
      } else if (message.includes('Not Found')) {
        friendly = 'Bucket "transcriptions" não encontrado ou sem permissão. Verifique a configuração no Supabase.'
      }
      setError(friendly)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <main className="main-content">
        <div className="back-navigation">
          <a href="/ferramentas-planejamento" className="back-button">
            <ArrowLeft className="inline-block mr-2 w-5 h-5" />
            Voltar à seleção
          </a>
        </div>

        <div className="welcome-section">
          <div className="tool-icon" style={{ margin: '0 auto' }}>
            <i className="fas fa-microphone-lines"></i>
          </div>
          <h1>Transcrição</h1>
          <p className="subtitle">Converta áudios e vídeos em texto para documentação, acessibilidade e estudo.</p>
        </div>

        <section className="content-section">
          <div className="content-card">
            <h3>Informações do Projeto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome da Empresa</label>
                <input
                  type="text"
                  name="nomeEmpresa"
                  value={form.nomeEmpresa}
                  onChange={onChangeForm}
                  className="mt-1 w-full rounded-md border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Ex.: Didáctica, sempre."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nome do Projeto</label>
                <input
                  type="text"
                  name="nomeProjeto"
                  value={form.nomeProjeto}
                  onChange={onChangeForm}
                  className="mt-1 w-full rounded-md border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                  placeholder="Ex.: Podcast de Educação Inclusiva"
                />
              </div>
            </div>
          </div>

          <div className="content-card mt-6">
            <h3>Anexar arquivo de mídia</h3>
            <p className="text-sm text-gray-600">Apenas 1 arquivo. Formatos aceitos: áudio e vídeo. Tamanho máximo: 300MB.</p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors mt-4">
              <input
                type="file"
                accept="audio/*,video/*"
                onChange={handleFileChange}
                className="hidden"
                id="audio-video-upload"
              />
              <label htmlFor="audio-video-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">Clique para selecionar o arquivo ou arraste aqui</p>
              </label>
            </div>

            {file && (
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded mt-4">
                <span className="text-sm text-gray-700">{file.name} ({Math.round(file.size / 1024 / 1024)} MB)</span>
                <button type="button" onClick={removeFile} className="text-red-500 hover:text-red-700 text-sm flex items-center">
                  <X className="w-4 h-4 mr-1" /> Remover
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 flex items-center text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 mr-2" /> {error}
              </div>
            )}

            {success && (
              <div className="mt-4 flex items-center text-green-600 text-sm">
                <CheckCircle className="w-4 h-4 mr-2" /> {success}
              </div>
            )}

            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit()}
                className={`px-6 py-3 rounded-md text-white ${canSubmit() ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-400 cursor-not-allowed'}`}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Transcrição'}
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}