import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, 
  ListOrdered, 
  Check,
  ArrowLeft
} from 'lucide-react';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { SummaryBuilder } from '../components/SummaryBuilder';
import { FixedSection, TocItem } from '../types/summary';

function Sumario() {
  const navigate = useNavigate();
  

  // State: Fixed Sections (Introduction, etc.)
  const [fixedSections, setFixedSections] = useState<FixedSection[]>([
    { id: 'intro', label: 'Introdução', selected: true },
    { id: 'abstract', label: 'Resumo Final', selected: false },
    { id: 'lists', label: 'Listas de Figuras', selected: false },
    { id: 'refs', label: 'Referências Bibliográficas', selected: true },
    { id: 'appendix', label: 'Anexos', selected: false },
    { id: 'glossary', label: 'Glossário', selected: false },
  ]);

  // State: Dynamic Table of Contents
  const [tocItems, setTocItems] = useState<TocItem[]>([
    { id: '1', title: 'Fundamentação Teórica', type: 'chapter' },
    { id: '2', title: 'Contexto Histórico', type: 'subchapter' },
    { id: '3', title: 'Metodologia', type: 'chapter' },
  ]);

  

  // Handlers
  const toggleFixedSection = (id: string) => {
    setFixedSections(prev => prev.map(section => 
      section.id === id ? { ...section, selected: !section.selected } : section
    ));
  };

  

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans text-gray-900">
      <Header />

      <main className="flex-1 container mx-auto max-w-4xl px-4 py-8 md:py-12 space-y-8">
        
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Voltar</span>
          </button>
        </div>

        {/* Intro Text */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">
            Gerador de Sumário
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto text-lg">
            Estruture livros, guias e documentos com acabamento editorial profissional.
          </p>
        </div>

        {/* Section 2: Fixed Structure */}
        <div className="bg-white rounded-2xl border border-gray-100 pt-6 pb-8 px-8 my-5">
          <div className="flex items-center gap-2 mb-4">
            <Layout className="w-5 h-5 text-[#7A4CE0]" />
            <h2 className="text-lg font-semibold text-gray-800">Estrutura Fixa</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Selecione os elementos pré-textuais e pós-textuais essenciais.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {fixedSections.map((section) => (
              <button
                key={section.id}
                onClick={() => toggleFixedSection(section.id)}
                className={`
                  relative p-4 rounded-xl border-2 text-left transition-all duration-200
                  flex flex-col justify-between h-24
                  ${section.selected 
                    ? 'border-[#7A4CE0] bg-[rgba(122,76,224,0.05)] shadow-md' 
                    : 'border-gray-100 bg-gray-50 hover:border-gray-300 hover:bg-white'}
                `}
              >
                <span className={`font-medium ${section.selected ? 'text-[#7A4CE0]' : 'text-gray-600'}`}>
                  {section.label}
                </span>
                {section.selected && (
                  <div className="absolute top-3 right-3 bg-[#7A4CE0] text-white p-0.5 rounded-full">
                    <Check size={12} strokeWidth={4} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Section 3: TOC Builder */}
        <div className="bg-white rounded-2xl border border-gray-100 pt-6 pb-8 px-8 my-5">
          <div className="flex items-center gap-2 mb-4">
            <ListOrdered className="w-5 h-5 text-[#7A4CE0]" />
            <h2 className="text-lg font-semibold text-gray-800">Construção do Sumário</h2>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Adicione e organize os capítulos e subcapítulos arrastando os itens.
          </p>
          
          <SummaryBuilder items={tocItems} setItems={setTocItems} />
        </div>

        

        

      </main>

      <Footer />
    </div>
  );
}

export default Sumario;