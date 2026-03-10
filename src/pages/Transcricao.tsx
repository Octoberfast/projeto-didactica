import React, { useEffect, useState, useRef } from 'react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabaseClient'
import { ArrowLeft, Upload, X, CheckCircle, AlertCircle, FileText } from 'lucide-react'
import type { Upload as TusUpload } from 'tus-js-client'
import * as tus from 'tus-js-client'

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
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle')
  // velocidade e ETA
  const [uploadSpeedMBps, setUploadSpeedMBps] = useState<number>(0)
  const [uploadEtaSeconds, setUploadEtaSeconds] = useState<number>(0)
  const [uploadStartTime, setUploadStartTime] = useState<number | null>(null)
  const uploadStartTimeRef = useRef<number | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const tusRef = useRef<TusUpload | null>(null)

  useEffect(() => {
    // Limpa mensagens ao alterar entradas
    setError(null)
    setSuccess(null)
  }, [form.nomeEmpresa, form.nomeProjeto, file])

  // Evita comportamento padrão do navegador (abrir arquivo) ao soltar fora da área
  useEffect(() => {
    const preventDefault = (e: DragEvent) => {
      e.preventDefault()
    }
    window.addEventListener('dragover', preventDefault)
    window.addEventListener('drop', preventDefault)
    return () => {
      window.removeEventListener('dragover', preventDefault)
      window.removeEventListener('drop', preventDefault)
    }
  }, [])

  const onChangeForm = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const validateFile = (f: File): string | null => {
    const MAX_BYTES = 2 * 1024 * 1024 * 1024 // 2GB
    if (!f) return 'Selecione um arquivo de áudio ou vídeo.'
    if (!f.type.startsWith('audio/') && !f.type.startsWith('video/')) {
      return 'Formato inválido. Aceitamos apenas arquivos de áudio ou vídeo.'
    }
    if (f.size > MAX_BYTES) {
      return 'Arquivo muito grande. O tamanho máximo permitido é 2GB.'
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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setIsDragging(true)
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(false)
    let f: File | null = null

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      f = e.dataTransfer.files[0]
    } else if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      const item = e.dataTransfer.items[0]
      if (item.kind === 'file') {
        f = item.getAsFile()
      }
    }

    if (!f) return

    const validationMsg = validateFile(f)
    if (validationMsg) {
      setError(validationMsg)
      setFile(null)
    } else {
      setError(null)
      setFile(f)
    }

    e.dataTransfer.clearData()
  }

  const openFilePicker = () => {
     inputRef.current?.click()
   }

   const handleDropzoneKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
     if (e.key === 'Enter' || e.key === ' ') {
       e.preventDefault()
       openFilePicker()
     }
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
    setUploadStatus('uploading')
    setUploadProgress(0)
    const startTime = Date.now()
    setUploadStartTime(startTime)
    uploadStartTimeRef.current = startTime
    setUploadSpeedMBps(0)
    setUploadEtaSeconds(0)

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        throw new Error(sessionError.message)
      }
      const user = session?.user
      if (!user) {
        setIsSubmitting(false)
        setUploadStatus('error')
        window.location.href = '/login'
        return
      }

      const projectSlug = sanitize(form.nomeProjeto)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const fileSlug = sanitize(file.name)
      const path = `${user.id}/${projectSlug}/${timestamp}-${fileSlug}`

      // Configurar endpoint TUS usando URL padrão do Supabase
      const supabaseProjectUrl = (import.meta.env.VITE_SUPABASE_URL as string).replace(/\/$/, '')
      const tusEndpoint = `${supabaseProjectUrl}/storage/v1/upload/resumable`

      const upload = new tus.Upload(file, {
        endpoint: tusEndpoint,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        headers: {
          authorization: `Bearer ${session?.access_token ?? ''}`,
          'x-upsert': 'false',
        },
        uploadDataDuringCreation: true,
        removeFingerprintOnSuccess: true,
        metadata: {
          bucketName: 'transcriptions',
          objectName: path,
          contentType: file.type,
          cacheControl: '3600',
          metadata: JSON.stringify({ user_id: user.id }),
        },
        chunkSize: 6 * 1024 * 1024,
        onError: (err) => {
          const message = err?.message || 'Erro no upload resumível.'
          setError(message)
          setUploadStatus('error')
          setIsSubmitting(false)
          setUploadSpeedMBps(0)
          setUploadEtaSeconds(0)
          setUploadStartTime(null)
          uploadStartTimeRef.current = null
        },
        onProgress: (bytesUploaded, bytesTotal) => {
          const percentage = Math.floor((bytesUploaded / bytesTotal) * 100)
          setUploadProgress(percentage)
          const now = Date.now()
          const startTs = uploadStartTimeRef.current
          const elapsedSec = startTs ? (now - startTs) / 1000 : 0
          if (elapsedSec > 0) {
            const speedBps = bytesUploaded / elapsedSec
            const mbps = speedBps / (1024 * 1024)
            setUploadSpeedMBps(mbps)
            const remainingBytes = bytesTotal - bytesUploaded
            const etaSec = speedBps > 0 ? remainingBytes / speedBps : 0
            setUploadEtaSeconds(etaSec)
          }
        },
        onSuccess: async () => {
          // Inserir metadados
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
            console.error('Falha ao registrar metadados de transcrição:', metaErr)
          }

          // Inserir tarefa no Dashboard (project_requests)
          try {
            if (user.email) {
              const responsible = (user.user_metadata?.name as string) || (user.email as string)

              await supabase
                .from('project_requests')
                .insert({
                  company_name: form.nomeEmpresa,
                  project_name: form.nomeProjeto,
                  responsible,
                  department: 'Transcrição',
                  status: 'aguardando_ingestao',
                  user_email: user.email,
                  form_data: {
                    nomeEmpresa: form.nomeEmpresa,
                    nomeProjeto: form.nomeProjeto,
                    tipo: 'transcricao'
                  }
                })
            } else {
              console.warn('Usuário autenticado sem e-mail. Ignorando inserção em project_requests devido a política RLS.')
            }
          } catch (prErr) {
            console.error('Falha ao inserir tarefa em project_requests:', prErr)
          }

          setSuccess('Upload realizado. A transcrição será enviada por email.')
          setUploadStatus('done')
          setIsSubmitting(false)
          setFile(null)
          setForm({ nomeEmpresa: '', nomeProjeto: '' })
          setUploadSpeedMBps(0)
          setUploadEtaSeconds(0)
          setUploadStartTime(null)
          uploadStartTimeRef.current = null
        },
      })

      tusRef.current = upload

      const previousUploads = await upload.findPreviousUploads()
      if (previousUploads.length) {
        upload.resumeFromPreviousUpload(previousUploads[0])
      }
      upload.start()
    } catch (err: unknown) {
      const message = (err as Error)?.message || 'Ocorreu um erro ao enviar o arquivo.'
      let friendly = message
      if (message.toLowerCase().includes('rls') || message.includes('row-level security')) {
        friendly = 'As políticas de segurança (RLS) do Storage estão bloqueando o upload. Crie uma política de INSERT para usuários autenticados no bucket "transcriptions".'
      } else if (message.includes('Not Found')) {
        friendly = 'Bucket "transcriptions" não encontrado ou sem permissão. Verifique a configuração no Supabase.'
      }
      setError(friendly)
      setUploadStatus('error')
    } finally {
      // isSubmitting é atualizado nos handlers
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
           <div className="content-card rounded-2xl border border-slate-200 bg-white shadow-sm px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-700 ring-1 ring-slate-200">
                <FileText className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">Informações do Projeto</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
              <div>
                <label htmlFor="nomeEmpresa" className="block text-sm font-medium text-gray-700">Nome da Empresa</label>
                <input
                  id="nomeEmpresa"
                  type="text"
                  name="nomeEmpresa"
                  value={form.nomeEmpresa}
                  onChange={onChangeForm}
                  className="mt-1 w-full rounded-md border border-gray-300 focus:border-purple-500 focus:ring-purple-500 focus:ring-2"
                  placeholder="Ex.: Didáctica, sempre."
                />
              </div>
              <div>
                <label htmlFor="nomeProjeto" className="block text-sm font-medium text-gray-700">Nome do Projeto</label>
                <input
                  id="nomeProjeto"
                  type="text"
                  name="nomeProjeto"
                  value={form.nomeProjeto}
                  onChange={onChangeForm}
                  className="mt-1 w-full rounded-md border border-gray-300 focus:border-purple-500 focus:ring-purple-500 focus:ring-2"
                  placeholder="Ex.: Podcast de Educação Inclusiva"
                />
              </div>
            </div>
          </div>

          <div className="content-card mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 text-yellow-700 ring-1 ring-yellow-200">
                <Upload className="w-5 h-5" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">Anexar arquivo de mídia</h3>
            </div>


            <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors mt-4 ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-gray-400'}`}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={openFilePicker}
              role="button"
              tabIndex={0}
              aria-label="Selecionar arquivo de áudio ou vídeo para transcrição"
              onKeyDown={handleDropzoneKeyDown}
            >
              <input
                type="file"
                accept="audio/*,video/*"
                multiple={false}
                onChange={handleFileChange}
                className="hidden"
                id="audio-video-upload"
                ref={inputRef}
              />
              <label htmlFor="audio-video-upload" className="cursor-pointer select-none">
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

            {uploadStatus === 'uploading' && (
              <div className="mt-4">
                <div className="h-3 w-full bg-gray-200 rounded">
                  <div
                    className="h-3 bg-purple-500 rounded"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 mt-2">Enviando: {uploadProgress}%</p>
                <p className="text-xs text-gray-600 mt-1">Velocidade: {uploadSpeedMBps.toFixed(1)} MB/s • Tempo restante: {formatEta(uploadEtaSeconds)}</p>
              </div>
            )}

            <p className="text-sm text-gray-600 mt-4">Envie 1 arquivo de áudio ou vídeo (máximo 2GB)</p>
            <div className="mt-8 flex justify-center">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit() || uploadStatus === 'uploading'}
                className={`px-6 py-3 rounded-md text-white ${canSubmit() && uploadStatus !== 'uploading' ? 'bg-orange-500 hover:bg-orange-600' : 'bg-gray-400 cursor-not-allowed'}`}
              >
                {isSubmitting ? 'Enviando...' : 'Enviar Arquivo'}
              </button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

// formata o tempo restante em h/m/s
const formatEta = (seconds: number): string => {
  if (!isFinite(seconds) || seconds <= 0) return 'calculando...'
  const s = Math.round(seconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${m}m ${sec}s`
  if (m > 0) return `${m}m ${sec}s`
  return `${sec}s`
}

// duplicata de formatEta removida