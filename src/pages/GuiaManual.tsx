import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, Target, Users, Map, Palette, ArrowLeft, Hash, AlertCircle, Upload, FileText, Mic, Copy, SendHorizontal } from 'lucide-react'
import Header from '../components/Header'
import Footer from '../components/Footer'
import { supabase } from '../lib/supabaseClient'
import type { User } from '@supabase/supabase-js'

interface FileUploadProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

function FileUpload({ files, onFilesChange }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const MAX_BYTES = 100 * 1024 * 1024;
  const allowedExtensions = ['pdf','doc','docx','txt','ppt','pptx','xls','xlsx','csv','rtf','odt','ods','odp','png','jpg','jpeg'];
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'application/rtf',
    'application/vnd.oasis.opendocument.text',
    'application/vnd.oasis.opendocument.spreadsheet',
    'application/vnd.oasis.opendocument.presentation',
    'image/png',
    'image/jpeg'
  ];
  const validateLocal = (f: File) => {
    const extension = f.name.split('.').pop()?.toLowerCase() || '';
    if (f.size > MAX_BYTES) return `O arquivo "${f.name}" excede 100MB.`;
    if (!allowedExtensions.includes(extension)) return `Formato não permitido para "${f.name}".`;
    if (!allowedTypes.includes(f.type)) return `Tipo MIME inválido para "${f.name}".`;
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      for (const f of newFiles) {
        const v = validateLocal(f);
        if (v) {
          setErrorMsg(v);
          continue;
        }
        validFiles.push(f);
      }
      if (validFiles.length) {
        onFilesChange([...files, ...validFiles]);
        setErrorMsg(null);
      }
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    onFilesChange(updatedFiles);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      const validFiles: File[] = [];
      let firstError: string | null = null;
      for (const f of newFiles) {
        const v = validateLocal(f);
        if (v && !firstError) firstError = v;
        if (!v) validFiles.push(f);
      }
      if (validFiles.length > 0) {
        onFilesChange([...files, ...validFiles]);
      }
      setErrorMsg(firstError);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging 
            ? 'border-[#7A4CE0] bg-[rgba(122,76,224,0.05)]' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt,.ppt,.pptx,.xls,.xlsx,.csv,.rtf,.odt,.ods,.odp,.png,.jpg,.jpeg"
          onChange={handleFileChange}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Clique para selecionar arquivos ou arraste aqui</p>
          <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">Máximo 100MB por arquivo</div>
        </label>
      </div>
      {errorMsg && (
        <div className="flex items-center gap-2 text-red-700 bg-red-100 border border-red-200 rounded-lg px-3 py-2">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{errorMsg}</span>
        </div>
      )}
      
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
      background: #7A4CE0;
      cursor: pointer;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      transition: all 0.2s ease;
    }
    
    .slider::-webkit-slider-thumb:hover {
      background: #6939d6;
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(122, 76, 224, 0.4);
    }
    
    .slider::-moz-range-thumb {
      height: 20px;
      width: 20px;
      border-radius: 50%;
      background: #7A4CE0;
      cursor: pointer;
      border: 2px solid #ffffff;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      transition: all 0.2s ease;
    }
    
    .slider::-moz-range-thumb:hover {
      background: #6939d6;
      transform: scale(1.1);
      box-shadow: 0 4px 12px rgba(122, 76, 224, 0.4);
    }
    
    .slider:focus {
      outline: none;
    }
    
    .slider:focus::-webkit-slider-thumb {
      box-shadow: 0 0 0 3px rgba(122, 76, 224, 0.3);
    }
  `;

  const formCardStyles = `
    .form-card {
      background-color: #FFFFFF;
      box-shadow: 0 3px 12px rgba(0, 0, 0, 0.05);
      transition: all 180ms ease;
      transform: translateY(0);
      will-change: transform, box-shadow;
    }
    .form-card:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
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
          cargo: originalData.cargo || '',
          publicoCargo: originalData.cargo || '',
          escolaridade: originalData.escolaridade || '',
          dominioTecnico: originalData.dominioTecnico || '',
          quantidadeSecoes: originalData.quantidadeSecoes || '',
          numeroPaginas: originalData.numeroPaginas || '',
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

    // Tipo de Elemento Educacional
    tipoElementoEducacional: '',
    
    // Estilo de Linguagem
    estiloLinguagem: '',
    
    // 4. Público-Alvo
    cargo: '',
    publicoCargo: '',
    escolaridade: '',
    dominioTecnico: '',
    
    // 5. Quantidade de Seções
    quantidadeSecoes: '',
    numeroPaginas: '',
    
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
  const [uploadTotal, setUploadTotal] = useState(0)
  const [uploadIndex, setUploadIndex] = useState(0)
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

  const handleFilesChange = (files: File[]) => {
    setFormData(prev => ({
      ...prev,
      anexos: files
    }));
  };

  const getLaudasRange = (tipo: string) => {
    switch (tipo) {
      case 'guia':
        return { min: 1, max: 20 };
      case 'manual':
        return { min: 1, max: 25 };
      case 'ebook':
        return { min: 5, max: 50 };
      case 'livro_didatico':
        return { min: 10, max: 80 };
      case 'artigo':
        return { min: 1, max: 15 };
      default:
        return { min: 1, max: 40 };
    }
  };

  useEffect(() => {
    const { min } = getLaudasRange(formData.tipoElementoEducacional);
    setFormData(prev => ({
      ...prev,
      numeroPaginas: String(min),
    }));
  }, [formData.tipoElementoEducacional]);

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
      'areaDepartamento', 'estiloLinguagem', 'tipoElementoEducacional',
      'publicoCargo', 'escolaridade', 'dominioTecnico', 'quantidadeSecoes'
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
    const maxFileSize = 100 * 1024 * 1024;
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/csv',
      'application/rtf',
      'application/vnd.oasis.opendocument.text',
      'application/vnd.oasis.opendocument.spreadsheet',
      'application/vnd.oasis.opendocument.presentation',
      'image/png',
      'image/jpeg'
    ];

    for (const file of formData.anexos) {
      if (file.size > maxFileSize) {
        throw new Error(`O arquivo "${file.name}" excede o tamanho máximo de 100MB.`);
      }
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`O arquivo "${file.name}" não é um tipo permitido.`);
      }
    }
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

      if (formData.anexos.length > 0) {
        setSubmitProgress(`Enviando arquivos (0/${formData.anexos.length})...`)
        setUploadTotal(formData.anexos.length)
        setUploadIndex(0)
      }
      
      const uploadedFiles = [];
      for (let i = 0; i < formData.anexos.length; i++) {
        const file = formData.anexos[i];
        setSubmitProgress(`Enviando arquivos (${i + 1}/${formData.anexos.length}): ${file.name}...`)
        setUploadIndex(i + 1)
        
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
      setUploadTotal(0)
      setUploadIndex(0)
    }
  }

  const handleBack = () => {
    navigate('/elementos-aprendizagem')
  }

  return (
    <>
      <style>{sliderStyles}</style>
      <style>{formCardStyles}</style>
      <Header />
      
      <main className="main-content">
        {/* Hero Section */}
        <div className="welcome-section">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Map className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-wide leading-tight text-slate-900 mb-2">Briefing para Criação</h1>
          <div className="w-12 h-[3px] bg-primary-500 rounded-full mx-auto mt-3 mb-4"></div>
          <p className="text-sm text-gray-600 tracking-tight">Forneça as informações necessárias para criarmos um Guia, Manual, E-book, Livro Didáticos ou Artigo</p>
        </div>

        {/* Back Navigation */}
        <div className="back-navigation mb-8">
          <button
            onClick={handleBack}
            className="back-button flex items-center text-sm text-[#7A4CE0] hover:text-[#6939d6] transition-colors duration-200"
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
          <div className="form-card bg-white rounded-2xl border border-gray-100 pt-6 pb-8 px-8 my-5 mt-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[rgba(122,76,224,0.12)]">
                <FileText className="w-5 h-5 text-[#7A4CE0]" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Informações do Projeto</h2>
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
                  Responsável
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
                  Produto/Departamento
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
              
          </div>
        </div>

        {/* Tipo de Elemento Educacional */}
        <div className="form-card bg-white rounded-2xl border border-gray-100 pt-6 pb-8 px-8 my-5 mt-10">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[rgba(122,76,224,0.12)]">
              <FileText className="w-5 h-5 text-[#7A4CE0]" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Que tipo de elemento educacional você quer fazer?</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Guia', value: 'guia' },
                { label: 'Manual', value: 'manual' },
                { label: 'E-book', value: 'ebook' },
                { label: 'Livro Didático', value: 'livro_didatico' },
                { label: 'Artigo', value: 'artigo' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, tipoElementoEducacional: option.value }))}
                  className={`
                    inline-flex items-center justify-center px-4 py-2 rounded-xl font-medium text-sm transition-all duration-150 ease-in-out
                    ${formData.tipoElementoEducacional === option.value
                      ? 'bg-[#EDE7FF] text-[#7C54FF] border-[rgba(124,84,255,0.45)] ring-1 ring-[rgba(122,76,224,0.20)] shadow-sm font-semibold'
                      : 'bg-white text-[#4B4B4B] border-[rgba(124,84,255,0.25)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] hover:bg-[rgba(124,84,255,0.06)] hover:border-[rgba(124,84,255,0.35)] hover:shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)]'
                    }
                  `}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>

          {/* Objetivo do Conteúdo (Taxonomia de Bloom) */}
          <div className="form-card bg-white rounded-2xl border border-gray-100 pt-6 pb-8 px-8 my-5 mt-12">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[rgba(122,76,224,0.12)]">
                <Target className="w-5 h-5 text-[#7A4CE0]" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Objetivo do Conteúdo</h2>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 tracking-tight mb-7">Escolha apenas uma opção:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Memorizar', value: 'memorizar' },
                  { label: 'Compreender', value: 'compreender' },
                  { label: 'Aplicar', value: 'aplicar' },
                  { label: 'Analisar', value: 'analisar' },
                  { label: 'Avaliar', value: 'avaliar' },
                  { label: 'Criar', value: 'criar' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, objetivo: option.value }))}
                    className={`
                      inline-flex items-center justify-center px-4 py-2 rounded-xl font-medium text-sm transition-all duration-150 ease-in-out
                      ${formData.objetivo === option.value
                        ? 'bg-[#EDE7FF] text-[#7C54FF] border-[rgba(124,84,255,0.45)] ring-1 ring-[rgba(122,76,224,0.20)] shadow-sm font-semibold'
                        : 'bg-white text-[#4B4B4B] border-[rgba(124,84,255,0.25)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] hover:bg-[rgba(124,84,255,0.06)] hover:border-[rgba(124,84,255,0.35)] hover:shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)]'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Estilo de Linguagem */}
          <div className="form-card bg-white rounded-2xl border border-gray-100 pt-6 pb-8 px-8 my-5 mt-12 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[rgba(122,76,224,0.12)]">
                <Mic className="w-5 h-5 text-[#7A4CE0]" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Tom de Voz</h2>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 tracking-tight mb-7">Escolha apenas uma opção:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: 'Dialógico', value: 'dialogico' },
                  { label: 'Coloquial', value: 'coloquial' },
                  { label: 'Formal', value: 'formal' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, estiloLinguagem: option.value }))}
                    className={`
                      inline-flex items-center justify-center px-4 py-2 rounded-xl font-medium text-sm transition-all duration-150 ease-in-out
                      ${formData.estiloLinguagem === option.value
                        ? 'bg-[#EDE7FF] text-[#7C54FF] border-[rgba(124,84,255,0.45)] ring-1 ring-[rgba(122,76,224,0.20)] shadow-sm font-semibold'
                        : 'bg-white text-[#4B4B4B] border-[rgba(124,84,255,0.25)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] hover:bg-[rgba(124,84,255,0.06)] hover:border-[rgba(124,84,255,0.35)] hover:shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)]'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Público-Alvo */}
          <div className="form-card bg-white rounded-2xl border border-gray-100 pt-6 pb-8 px-8 my-5 mt-12 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[rgba(122,76,224,0.12)]">
                <Users className="w-5 h-5 text-[#7A4CE0]" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Público-Alvo</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
              <div>
                <label htmlFor="publicoCargo" className="block text-sm font-medium text-gray-700 mb-2">Cargo:</label>
                <select
                  id="publicoCargo"
                  name="publicoCargo"
                  value={formData.publicoCargo}
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
                  <option value="toda_empresa">Toda a empresa</option>
                </select>
              </div>
              <div>
                <label htmlFor="escolaridade" className="block text-sm font-medium text-gray-700 mb-2">Escolaridade:</label>
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
                <label htmlFor="dominioTecnico" className="block text-sm font-medium text-gray-700 mb-2">Domínio Técnico:</label>
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
          <div className="form-card bg-white rounded-2xl border border-gray-100 pt-6 pb-8 px-8 my-5 mt-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[rgba(122,76,224,0.12)]">
                <Hash className="w-5 h-5 text-[#7A4CE0]" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Quantidade</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="max-w-md">
                <label htmlFor="quantidadeSecoes" className="block text-sm font-medium text-gray-700 mb-3">Quantidade de Seções:</label>
                <div className="relative">
                  <div className="flex justify-center mb-2">
                    <div className="bg-[rgba(122,76,224,0.12)] text-[#7A4CE0] px-[18px] py-[10px] rounded-full font-semibold text-lg min-w-[60px] text-center shadow-[0_2px_8px_rgba(122,76,224,0.25)]">
                      {formData.quantidadeSecoes || 1}
                    </div>
                  </div>
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
                        background: `linear-gradient(to right, #7A4CE0 0%, #7A4CE0 ${((Number(formData.quantidadeSecoes) || 1) - 1) * 100 / 19}%, #E5E5E5 ${((Number(formData.quantidadeSecoes) || 1) - 1) * 100 / 19}%, #E5E5E5 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1</span>
                      <span>5</span>
                      <span>10</span>
                      <span>15</span>
                      <span>20</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-3 text-center">Arraste para selecionar a quantidade de seções</p>
              </div>
              <div>
                <label htmlFor="numeroPaginas" className="block text-sm font-medium text-gray-700 mb-3">Número Máximo de Laudas:</label>
                <div className="relative">
                  <div className="flex justify-center mb-2">
                    <div className="bg-[rgba(122,76,224,0.12)] text-[#7A4CE0] px-[18px] py-[10px] rounded-full font-semibold text-lg min-w-[60px] text-center shadow-[0_2px_8px_rgba(122,76,224,0.25)]">
                      {Number(formData.numeroPaginas) || getLaudasRange(formData.tipoElementoEducacional).min}
                    </div>
                  </div>
                  <div className="relative">
                    {
                      (() => {
                        const { min, max } = getLaudasRange(formData.tipoElementoEducacional);
                        const current = Number(formData.numeroPaginas) || min;
                        const percent = ((current - min) * 100) / (max - min);
                        const marks = [min, Math.round(min + (max - min) * 0.25), Math.round(min + (max - min) * 0.5), Math.round(min + (max - min) * 0.75), max];
                        return (
                          <>
                            <input
                              type="range"
                              id="numeroPaginas"
                              name="numeroPaginas"
                              value={current}
                              onChange={handleInputChange}
                              min={min}
                              max={max}
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                              style={{
                                background: `linear-gradient(to right, #7A4CE0 0%, #7A4CE0 ${percent}%, #E5E5E5 ${percent}%, #E5E5E5 100%)`
                              }}
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                              {marks.map(m => (
                                <span key={m}>{m}</span>
                              ))}
                            </div>
                          </>
                        );
                      })()
                    }
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2 text-center">Selecione a quantidade aproximada de laudas desejadas para o conteúdo.</p>
              </div>
            </div>
          </div>

          {/* 6. Pontos Críticos */}
          <div className="form-card bg-white rounded-2xl border border-gray-100 pt-6 pb-8 px-8 my-5 mt-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[rgba(122,76,224,0.12)]">
                <AlertCircle className="w-5 h-5 text-[#7A4CE0]" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Pontos Críticos</h2>
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
          <div className="form-card bg-white rounded-2xl border border-gray-100 pt-6 pb-8 px-8 my-5 mt-12">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[rgba(122,76,224,0.12)]">
                <Palette className="w-5 h-5 text-[#7A4CE0]" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Estilo Visual</h2>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 tracking-tight mb-7">Selecione os elementos visuais desejados (pode escolher várias opções):</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[{label: 'Ícones', value: 'icones'}, {label: 'Ilustrações', value: 'ilustracoes'}, {label: 'Fotos', value: 'fotos'}, {label: 'Cartoon', value: 'cartoon'}, {label: 'Lettering', value: 'lettering'}, {label: '3D', value: '3d'}].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleCheckboxChange(option.value)}
                    className={`
                      inline-flex items-center justify-center px-4 py-2 rounded-xl font-medium text-sm transition-all duration-150 ease-in-out
                      ${formData.estiloVisual.includes(option.value)
                        ? 'bg-[#EDE7FF] text-[#7C54FF] border-[rgba(124,84,255,0.45)] ring-1 ring-[rgba(122,76,224,0.20)] shadow-sm font-semibold'
                        : 'bg-white text-[#4B4B4B] border-[rgba(124,84,255,0.25)] shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] hover:bg-[rgba(124,84,255,0.06)] hover:border-[rgba(124,84,255,0.35)] hover:shadow-[inset_0_1px_3px_rgba(0,0,0,0.08)]'
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
          <div className="form-card bg-white rounded-2xl border border-gray-100 pt-6 pb-8 px-8 my-5 mt-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[rgba(122,76,224,0.12)]">
                <Upload className="w-5 h-5 text-[#7A4CE0]" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Anexar documentos base</h2>
            </div>
            <div>
              <p className="text-sm text-gray-600 tracking-tight mb-4">Envie arquivos de referência para o projeto:</p>
              <FileUpload
                files={formData.anexos}
                onFilesChange={handleFilesChange}
              />
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600 tracking-tight">
                  Apenas arquivos que não foram estruturados
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Formatos aceitos: PDF, DOC, DOCX, TXT, PPT, PPTX, XLS, XLSX, CSV, RTF, ODT, ODS, ODP, PNG, JPG (máximo 100MB por arquivo)
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="text-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 px-5 py-2.5 rounded-xl bg-[#7A4CE0] text-white shadow-md font-medium text-base inline-flex items-center justify-center transition-all duration-200 ease-out hover:bg-[#6B3DD8] hover:shadow-lg hover:-translate-y-0.5 active:scale-95 active:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed min-w-[220px]"
              style={{ boxShadow: '0 4px 12px rgba(122, 76, 224, 0.20)' }}
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {submitProgress || 'Enviando...'}
                </div>
              ) : (
                <span className="inline-flex items-center">
                  Enviar Briefing
                  <SendHorizontal className="w-[16px] h-[16px] ml-[6px] text-white" />
                </span>
              )}
            </button>
            {isSubmitting && submitProgress && (
              <div className="mt-2">
                <p className="text-sm text-gray-600">{submitProgress}</p>
                {uploadTotal > 0 && (
                  <div className="mt-2 h-2 bg-gray-200 rounded">
                    <div
                      className="h-2 bg-[#7A4CE0] rounded"
                      style={{ width: `${Math.min(100, Math.round((uploadIndex / uploadTotal) * 100))}%` }}
                    ></div>
                  </div>
                )}
              </div>
            )}
            {!isSubmitting && (
              <p className="text-sm text-gray-600 mt-4">Você poderá editar este briefing depois.</p>
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
