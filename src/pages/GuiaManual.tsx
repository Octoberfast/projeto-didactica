import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, Target, Users, Map, Palette, ArrowLeft, Hash, AlertCircle, Upload, X, MessageCircle, Star, FileText, Mic, Copy } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

// Componente simples de upload de arquivos
interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

function FileUpload({ files, onFilesChange }: FileUploadProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      onFilesChange([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    onFilesChange(updatedFiles);
  };

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Clique para selecionar arquivos ou arraste aqui</p>
        </label>
      </div>
      
      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Arquivos selecionados:</h4>
          {files.map((file, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span className="text-sm text-gray-600">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="text-red-500 hover:text-red-700 text-sm"
              >
                Remover
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function GuiaManual() {
  // Estilos CSS para o slider customizado
  const sliderStyles = `
    .slider::-webkit-slider-thumb {
      appearance: none;
      height: 20px;
      width: 20px;
      border-radius: 50%;
      background: #3b82f6;
      cursor: pointer;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      transition: all 0.2s ease;
    }
    
    .slider::-webkit-slider-thumb:hover {
      background: #2563eb;
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }
    
    .slider::-moz-range-thumb {
      height: 20px;
      width: 20px;
      border-radius: 50%;
      background: #3b82f6;
      cursor: pointer;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      transition: all 0.2s ease;
    }
    
    .slider::-moz-range-thumb:hover {
      background: #2563eb;
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }
    
    .slider:focus {
      outline: none;
    }
    
    .slider:focus::-webkit-slider-thumb {
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
    }
  `;

  // Estilos CSS para os botões 3D pushable
  const pushableButtonStyles = `
    .button-82-pushable {
      position: relative;
      border: none;
      background: transparent;
      padding: 0;
      cursor: pointer;
      outline-offset: 4px;
      transition: filter 250ms;
      user-select: none;
      -webkit-user-select: none;
      touch-action: manipulation;
      width: 100%;
    }

    .button-82-shadow {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 8px;
      background: hsl(0deg 0% 0% / 0.25);
      will-change: transform;
      transform: translateY(2px);
      transition: transform 600ms cubic-bezier(.3, .7, .4, 1);
    }

    .button-82-edge {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 8px;
      background: linear-gradient(
        to left,
        hsl(260deg 30% 35%) 0%,
        hsl(260deg 30% 45%) 8%,
        hsl(260deg 30% 45%) 92%,
        hsl(260deg 30% 35%) 100%
      );
    }

    .button-82-front {
      display: block;
      position: relative;
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 0.9rem;
      color: white;
      background: #5f4a8c;
      will-change: transform;
      transform: translateY(-3px);
      transition: transform 600ms cubic-bezier(.3, .7, .4, 1);
      font-weight: 500;
    }

    .button-82-pushable.selected .button-82-front {
      background: hsl(260deg 30% 40%);
    }

    .button-82-pushable.selected .button-82-edge {
      background: linear-gradient(
        to left,
        hsl(260deg 30% 25%) 0%,
        hsl(260deg 30% 35%) 8%,
        hsl(260deg 30% 35%) 92%,
        hsl(260deg 30% 25%) 100%
      );
    }

    @media (min-width: 768px) {
      .button-82-front {
        font-size: 1rem;
        padding: 10px 20px;
      }
    }

    .button-82-pushable:hover {
      filter: brightness(110%);
      -webkit-filter: brightness(110%);
    }

    .button-82-pushable:hover .button-82-front {
      transform: translateY(-5px);
      transition: transform 250ms cubic-bezier(.3, .7, .4, 1.5);
    }

    .button-82-pushable:active .button-82-front {
      transform: translateY(-1px);
      transition: transform 34ms;
    }

    .button-82-pushable:hover .button-82-shadow {
      transform: translateY(3px);
      transition: transform 250ms cubic-bezier(.3, .7, .4, 1.5);
    }

    .button-82-pushable:active .button-82-shadow {
      transform: translateY(1px);
      transition: transform 34ms;
    }

    .button-82-pushable:focus:not(:focus-visible) {
      outline: none;
    }
  `;

  // Estado para o usuário logado
  const [user, setUser] = useState<User | null>(null)

  // Adicionar estilos ao head
  React.useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = pushableButtonStyles;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  // Obter usuário logado
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
      }
    }
    getUser()
  }, [])

  // Função para carregar dados do projeto original
  const loadOriginalProjectData = async (projectId: string) => {
    setIsLoadingOriginalData(true)
    try {
      const { data: project, error } = await supabase
        .from('project_requests')
        .select('*')
        .eq('id', projectId)
        .single()

      if (error) {
        throw new Error(`Erro ao carregar projeto original: ${error.message}`)
      }

      if (project && project.form_data) {
        // Pré-preencher formulário com dados do projeto original (exceto anexos)
        const originalData = project.form_data
        setFormData(prev => ({
          ...prev,
          nomeEmpresa: originalData.nomeEmpresa || '',
          nomeProjeto: originalData.nomeProjeto || '',
          responsavelNome: originalData.responsavelNome || '',
          responsavelEmail: originalData.responsavelEmail || '',
          areaDepartamento: originalData.areaDepartamento || '',
          prazoEntrega: originalData.prazoEntrega || '',
          objetivo: originalData.objetivo || '',
          tomVoz: originalData.tomVoz || '',
          cargo: originalData.cargo || '',
          escolaridade: originalData.escolaridade || '',
          dominioTecnico: originalData.dominioTecnico || '',
          quantidadeSecoes: originalData.quantidadeSecoes || '',
          pontosCriticos: originalData.pontosCriticos || '',
          estiloVisual: originalData.estiloVisual || [],
          // anexos permanecem vazios conforme solicitado
          anexos: []
        }))
      }
    } catch (error) {
      console.error('Erro ao carregar dados do projeto original:', error)
      setSubmitError(error instanceof Error ? error.message : 'Erro ao carregar dados do projeto original')
      setShowErrorModal(true)
    } finally {
      setIsLoadingOriginalData(false)
    }
  }

  const [formData, setFormData] = useState({
    // 1. Informações do Projeto
    nomeEmpresa: '',
    nomeProjeto: '',
    responsavelNome: '',
    responsavelEmail: '',
    areaDepartamento: '',
    prazoEntrega: '',
    
    // 2. Objetivo do Conteúdo
    objetivo: '', // Inicialmente vazio para não aparecer selecionado
    
    // 3. Tom de Voz
    tomVoz: '', // Inicialmente vazio para não aparecer selecionado
    
    // 4. Público-Alvo
    cargo: '',
    escolaridade: '',
    dominioTecnico: '',
    
    // 5. Quantidade de Seções
    quantidadeSecoes: '',
    
    // 6. Pontos Críticos
    pontosCriticos: '',
    
    // 7. Estilo Visual
    estiloVisual: [] as string[],
    
    // 8. Anexar documentos
    anexos: [] as File[]
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitProgress, setSubmitProgress] = useState('')
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const navigate = useNavigate()
  
  // Estados para modo de reutilização
  const [searchParams] = useSearchParams()
  const [isReuseMode, setIsReuseMode] = useState(false)
  const [originalProjectId, setOriginalProjectId] = useState<string | null>(null)
  const [isLoadingOriginalData, setIsLoadingOriginalData] = useState(false)

  // Detectar modo de reutilização
  useEffect(() => {
    const reuseProjectId = searchParams.get('reuse')
    if (reuseProjectId) {
      setIsReuseMode(true)
      setOriginalProjectId(reuseProjectId)
      loadOriginalProjectData(reuseProjectId)
    }
  }, [searchParams])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCheckboxChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      estiloVisual: prev.estiloVisual.includes(value)
        ? prev.estiloVisual.filter(item => item !== value)
        : [...prev.estiloVisual, value]
    }));
  };

  const handleRadioChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFilesChange = (files: File[]) => {
    setFormData(prev => ({
      ...prev,
      anexos: files
    }));
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    navigate('/');
  };

  const handleErrorClose = () => {
    setShowErrorModal(false);
    setSubmitError('');
  };

  const validateForm = () => {
    const requiredFields = [
      'nomeEmpresa', 'nomeProjeto', 'responsavelNome', 'responsavelEmail',
      'areaDepartamento', 'prazoEntrega', 'objetivo', 'tomVoz',
      'cargo', 'escolaridade', 'dominioTecnico', 'quantidadeSecoes'
    ];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        return false;
      }
    }
    
    const numSecoes = parseInt(formData.quantidadeSecoes);
    if (isNaN(numSecoes) || numSecoes < 1 || numSecoes > 50) {
      return false;
    }
    
    return true;
  };

  const validateFiles = () => {
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    for (const file of formData.anexos) {
      if (file.size > maxFileSize) {
        throw new Error(`O arquivo "${file.name}" excede o tamanho máximo de 10MB.`);
      }
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`O arquivo "${file.name}" não é um tipo permitido. Use apenas PDF, DOC, DOCX ou TXT.`);
      }
    }
  };

  // Função para sanitizar nome do arquivo
  const sanitizeFileName = (fileName: string): string => {
    // Remove acentos e caracteres especiais
    const sanitized = fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-zA-Z0-9._-]/g, '_') // Substitui caracteres especiais por underscore
      .replace(/_{2,}/g, '_') // Remove underscores duplos
      .replace(/^_|_$/g, ''); // Remove underscores no início e fim
    
    return sanitized;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setSubmitError('Por favor, preencha todos os campos obrigatórios.');
      setShowErrorModal(true);
      return;
    }
    
    if (!user?.email) {
      setSubmitError('Usuário não autenticado. Faça login novamente.');
      setShowErrorModal(true);
      return;
    }

    // Validar arquivos antes de enviar
    try {
      validateFiles();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Erro na validação dos arquivos.');
      setShowErrorModal(true);
      return;
    }
    
    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitProgress('Criando projeto...')

    try {
      // 1. Inserir projeto no Supabase
      const projectData = {
        company_name: formData.nomeEmpresa,
        project_name: formData.nomeProjeto,
        responsible: formData.responsavelNome,
        department: formData.areaDepartamento,
        request_deadline: formData.prazoEntrega,
        delivery_deadline: formData.prazoEntrega, // Usando mesmo prazo por enquanto
        user_email: user.email,
        status: 'aguardando_ingestao',
        form_data: formData,
        ...(originalProjectId && { origin_id: originalProjectId })
      };

      const { data: projectResult, error: projectError } = await supabase
        .from('project_requests')
        .insert(projectData)
        .select('id')
        .single();

      if (projectError) {
        throw new Error(`Erro ao criar projeto: ${projectError.message}`);
      }

      const projectId = projectResult.id;

      // 2. Upload de arquivos com nomenclatura única
      if (formData.anexos.length > 0) {
        setSubmitProgress(`Enviando arquivos (0/${formData.anexos.length})...`);
      }
      
      const uploadedFiles = [];
      for (let i = 0; i < formData.anexos.length; i++) {
        const file = formData.anexos[i];
        setSubmitProgress(`Enviando arquivos (${i + 1}/${formData.anexos.length}): ${file.name}...`);
        
        // Substitui espaços e caracteres problemáticos
        const sanitizedName = file.name.replace(/[^\w.-]/g, '_');
        const storagePath = `${projectId}/${sanitizedName}`;

        // Upload para Supabase Storage com upsert: true
        const { error: uploadError } = await supabase.storage
          .from('project_files')
          .upload(storagePath, file, {
            upsert: true // impede renomeação automática
          });

        if (uploadError) {
          throw new Error(`Erro no upload do arquivo ${file.name}: ${uploadError.message}`);
        }

        // 3. Mapear metadados do arquivo
        const fileMetadata = {
          project_id: projectId,
          file_name: sanitizedName,
          file_path: storagePath,
          original_name: file.name,
          storage_path: storagePath,
          mime_type: file.type,
          file_size: file.size
        };

        const { error: metadataError } = await supabase
          .from('project_files_map')
          .insert(fileMetadata);

        if (metadataError) {
          throw new Error(`Erro ao salvar metadados do arquivo ${file.name}: ${metadataError.message}`);
        }

        uploadedFiles.push({
          name: file.name,
          uniqueName: sanitizedName,
          path: storagePath
        });
      }

      setSubmitProgress('Finalizando...');
      
      // 4. Sucesso - exibir modal de confirmação
      setShowSuccessModal(true);

    } catch (error) {
      console.error('Erro no envio:', error);
      setSubmitError(error instanceof Error ? error.message : 'Erro ao enviar o briefing. Tente novamente.');
      setShowErrorModal(true);
    } finally {
      setIsSubmitting(false)
      setSubmitProgress('')
    }
  }

  const handleBack = () => {
    navigate('/elementos-aprendizagem')
  }

  return (
    <>
      <style>{sliderStyles}</style>
      <Header />
      
      <main className="main-content">
        {/* Hero Section */}
        <div className="welcome-section">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Map className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Briefing para Guia e Manual
          </h1>
          <p className="subtitle">
            Forneça as informações necessárias para criarmos um guia ou manual completo e eficaz
          </p>
        </div>

        {/* Back Navigation */}
        <div className="back-navigation mb-8">
          <button
            onClick={handleBack}
            className="back-button flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Voltar à seleção
          </button>
        </div>

        {/* Banner de Reutilização */}
        {isReuseMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                <Copy className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  Modo Reutilização Ativado
                </h3>
                <p className="text-blue-700 text-sm">
                  Os dados do projeto original foram carregados automaticamente. Você pode editá-los conforme necessário antes de enviar. 
                  Os arquivos anexados do projeto original não foram incluídos - você pode anexar novos arquivos se desejar.
                </p>
                {isLoadingOriginalData && (
                  <div className="mt-3 flex items-center text-blue-600">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                    <span className="text-sm">Carregando dados do projeto original...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informações do Projeto */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mr-4">
                <FileText className="w-5 h-5 text-slate-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900">Informações do Projeto</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="nomeEmpresa" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  id="nomeEmpresa"
                  name="nomeEmpresa"
                  value={formData.nomeEmpresa}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="nomeProjeto" className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Projeto
                </label>
                <input
                  type="text"
                  id="nomeProjeto"
                  name="nomeProjeto"
                  value={formData.nomeProjeto}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="responsavelNome" className="block text-sm font-medium text-gray-700 mb-2">
                  Responsável pelo Projeto
                </label>
                <input
                  type="text"
                  id="responsavelNome"
                  name="responsavelNome"
                  value={formData.responsavelNome}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="responsavelEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  E-mail do Responsável
                </label>
                <input
                  type="email"
                  id="responsavelEmail"
                  name="responsavelEmail"
                  value={formData.responsavelEmail}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="areaDepartamento" className="block text-sm font-medium text-gray-700 mb-2">
                  Área/Departamento
                </label>
                <select
                  id="areaDepartamento"
                  name="areaDepartamento"
                  value={formData.areaDepartamento}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione a área</option>
                  <option value="laboratorio">Laboratório</option>
                  <option value="originais">Originais</option>
                  <option value="do-seu-jeito">Do seu jeito</option>
                  <option value="tec">Tec</option>
                  <option value="move">Move</option>
                  <option value="marketing">Marketing</option>
                  <option value="comercial">Comercial</option>
                  <option value="administrativo">Administrativo</option>
                  <option value="pd">P&D</option>
                  <option value="pc">P&C</option>
                </select>
              </div>
              <div>
                <label htmlFor="prazoEntrega" className="block text-sm font-medium text-gray-700 mb-2">
                  Prazo de Entrega
                </label>
                <input
                  type="date"
                  id="prazoEntrega"
                  name="prazoEntrega"
                  value={formData.prazoEntrega}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* 2. Objetivo do Conteúdo */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                <Target className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900">Objetivo do Conteúdo</h2>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-6">Escolha apenas uma opção:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Informar', 'Treinar', 'Avaliar'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, objetivo: option.toLowerCase() }))}
                    className={`
                      px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200
                      ${formData.objetivo === option.toLowerCase()
                        ? 'bg-white text-orange-600 border-2 border-orange-500'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Tom de Voz */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                <Mic className="w-5 h-5 text-purple-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900">Tom de Voz</h2>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-6">Escolha apenas uma opção:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Formal', 'Informal', 'Lúdico'].map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, tomVoz: option.toLowerCase() }))}
                    className={`
                      px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200
                      ${formData.tomVoz === option.toLowerCase()
                        ? 'bg-white text-purple-600 border-2 border-purple-500'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Público-Alvo */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900">Público-Alvo</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-2">
                  Cargo *
                </label>
                <select
                  id="cargo"
                  name="cargo"
                  value={formData.cargo}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione o cargo</option>
                  <option value="analista">Analista</option>
                  <option value="coordenador">Coordenador</option>
                  <option value="gerente">Gerente</option>
                  <option value="diretor">Diretor</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="especialista">Especialista</option>
                  <option value="assistente">Assistente</option>
                  <option value="tecnico">Técnico</option>
                </select>
              </div>
              <div>
                <label htmlFor="escolaridade" className="block text-sm font-medium text-gray-700 mb-2">
                  Escolaridade *
                </label>
                <select
                  id="escolaridade"
                  name="escolaridade"
                  value={formData.escolaridade}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione a escolaridade</option>
                  <option value="fundamental">Ensino Fundamental</option>
                  <option value="medio">Ensino Médio</option>
                  <option value="superior-incompleto">Superior Incompleto</option>
                  <option value="superior-completo">Superior Completo</option>
                  <option value="pos-graduacao">Pós-graduação</option>
                  <option value="mestrado">Mestrado</option>
                  <option value="doutorado">Doutorado</option>
                </select>
              </div>
              <div>
                <label htmlFor="dominioTecnico" className="block text-sm font-medium text-gray-700 mb-2">
                  Domínio Técnico *
                </label>
                <select
                  id="dominioTecnico"
                  name="dominioTecnico"
                  value={formData.dominioTecnico}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Selecione o domínio</option>
                  <option value="iniciante">Iniciante</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="avancado">Avançado</option>
                  <option value="especialista">Especialista</option>
                </select>
              </div>
            </div>
          </div>

          {/* 5. Quantidade de Seções */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <Hash className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900">Quantidade de Seções</h2>
            </div>
            <div className="max-w-md">
              <label htmlFor="quantidadeSecoes" className="block text-sm font-medium text-gray-700 mb-4">
                Quantidade de Seções *
              </label>
              <div className="relative">
                {/* Valor exibido */}
                <div className="flex justify-center mb-4">
                  <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold text-lg min-w-[60px] text-center">
                    {formData.quantidadeSecoes || 1}
                  </div>
                </div>
                
                {/* Slider */}
                <div className="relative">
                  <input
                    type="range"
                    id="quantidadeSecoes"
                    name="quantidadeSecoes"
                    value={formData.quantidadeSecoes || 1}
                    onChange={handleInputChange}
                    min="1"
                    max="20"
                    required
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((Number(formData.quantidadeSecoes) || 1) - 1) * 100 / 19}%, #e5e7eb ${((Number(formData.quantidadeSecoes) || 1) - 1) * 100 / 19}%, #e5e7eb 100%)`
                    }}
                  />
                  
                  {/* Marcadores de valores */}
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>1</span>
                    <span>5</span>
                    <span>10</span>
                    <span>15</span>
                    <span>20</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-3 text-center">Arraste para selecionar de 1 a 20 seções</p>
            </div>
          </div>

          {/* 6. Pontos Críticos */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <AlertCircle className="w-5 h-5 text-red-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900">Pontos Críticos</h2>
            </div>
            <div>
              <label htmlFor="pontosCriticos" className="block text-sm font-medium text-gray-700 mb-2">
                Descrição
              </label>
              <textarea
                id="pontosCriticos"
                name="pontosCriticos"
                value={formData.pontosCriticos}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Descreva pontos importantes, dificuldades comuns, aspectos que precisam de atenção especial..."
              />
            </div>
          </div>

          {/* 7. Estilo Visual */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center mr-4">
                <Palette className="w-5 h-5 text-pink-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900">Estilo Visual</h2>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-6">Selecione os elementos visuais desejados (pode escolher várias opções):</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[{label: 'Ícones', value: 'icones'}, {label: 'Ilustrações', value: 'ilustracoes'}, {label: 'Cores Institucionais', value: 'coresInstitucionais'}].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleCheckboxChange(option.value)}
                    className={`
                      px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200
                      ${formData.estiloVisual.includes(option.value)
                        ? 'bg-white text-pink-600 border-2 border-pink-500'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>



          {/* 8. Anexar documentos base */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                <Upload className="w-5 h-5 text-yellow-600" />
              </div>
              <h2 className="text-2xl font-semibold text-slate-900">Anexar documentos base</h2>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-4">Envie arquivos de referência para o projeto:</p>
              <FileUpload
                files={formData.anexos}
                onFilesChange={handleFilesChange}
              />
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">
                  Apenas arquivos que não foram estruturados
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Formatos aceitos: PDF, DOC, DOCX, TXT (máximo 10MB por arquivo)
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {submitProgress || 'Enviando...'}
                </div>
              ) : (
                'Enviar Briefing'
              )}
            </button>
            {isSubmitting && submitProgress && (
              <p className="text-sm text-gray-600 mt-2">{submitProgress}</p>
            )}
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="text-center">
              <div className="inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg">
                <AlertCircle className="w-4 h-4 mr-2" />
                {submitError}
              </div>
            </div>
          )}
        </form>

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg max-w-md mx-4">
              <div className="text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{color: '#5f4a8c'}} />
                <h3 className="text-xl font-semibold mb-2">Briefing Enviado!</h3>
                <p className="text-gray-600 mb-4">
                  Seu projeto "{formData.nomeProjeto}" foi criado com sucesso e está aguardando processamento.
                </p>
                {formData.anexos.length > 0 && (
                  <p className="text-sm text-gray-500 mb-4">
                    {formData.anexos.length} arquivo{formData.anexos.length > 1 ? 's' : ''} enviado{formData.anexos.length > 1 ? 's' : ''} com sucesso.
                  </p>
                )}
                <button
                  onClick={handleSuccessClose}
                  className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Voltar ao Início
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Modal */}
        {showErrorModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg max-w-md mx-4">
              <div className="text-center">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Erro no Envio</h3>
                <p className="text-gray-600 mb-4">
                  {submitError || 'Ocorreu um erro ao enviar o briefing. Tente novamente.'}
                </p>
                <button
                  onClick={handleErrorClose}
                  className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </>
  )
}