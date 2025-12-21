import React, { useState } from 'react';
import { 
  Layout, 
  ListOrdered, 
  Download, 
  Check
} from 'lucide-react';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/Card';
import { Button } from './components/ui/Button';
import { SummaryBuilder } from './components/SummaryBuilder';
import { FixedSection, TocItem } from './types';

function App() {
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

  const handleExport = () => {
    const payload = {
      meta: {
        generatedAt: new Date().toISOString(),
        application: "StructSum v1.0"
      },
      structure: {
        preTextual: fixedSections.filter(s => s.selected && ['intro', 'abstract', 'lists'].includes(s.id)).map(s => s.label),
        body: tocItems.map((item, index) => ({
          order: index + 1,
          ...item
        })),
        postTextual: fixedSections.filter(s => s.selected && !['intro', 'abstract', 'lists'].includes(s.id)).map(s => s.label)
      }
    };
    
    console.log("payload_webhook_ready:", JSON.stringify(payload, null, 2));
    alert("Estrutura gerada! Verifique o console do navegador para ver o JSON payload.");
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans text-slate-900">
      <Header />

      <main className="flex-1 container mx-auto max-w-4xl px-4 py-8 md:py-12 space-y-8">
        
        {/* Intro Text */}
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Gerador de Sumário
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto text-lg">
            Estruture livros, guias e documentos com acabamento editorial profissional.
          </p>
        </div>

        {/* Section 2: Fixed Structure */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Layout className="text-primary" /> Estrutura Fixa
            </CardTitle>
            <CardDescription>
              Selecione os elementos pré-textuais e pós-textuais essenciais.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {fixedSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => toggleFixedSection(section.id)}
                  className={`
                    relative p-4 rounded-xl border-2 text-left transition-all duration-200
                    flex flex-col justify-between h-24
                    ${section.selected 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-slate-100 bg-slate-50 hover:border-slate-300 hover:bg-white'}
                  `}
                >
                  <span className={`font-medium ${section.selected ? 'text-primary' : 'text-slate-600'}`}>
                    {section.label}
                  </span>
                  {section.selected && (
                    <div className="absolute top-3 right-3 bg-primary text-white p-0.5 rounded-full">
                      <Check size={12} strokeWidth={4} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Section 3: TOC Builder */}
        <Card>
          <CardHeader>
            <CardTitle>
              <ListOrdered className="text-primary" /> Construção do Sumário
            </CardTitle>
            <CardDescription>
              Adicione e organize os capítulos e subcapítulos arrastando os itens.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SummaryBuilder items={tocItems} setItems={setTocItems} />
          </CardContent>
        </Card>

        {/* Section 4: Export */}
        <div className="sticky bottom-4 z-40">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent -z-10 h-24 -top-24 pointer-events-none" />
            <Button 
                onClick={handleExport}
                size="lg" 
                className="w-full shadow-xl shadow-primary/20 text-lg font-semibold h-14 rounded-xl"
            >
                <Download className="mr-2 h-5 w-5" /> Gerar Sumário
            </Button>
        </div>

      </main>

      <Footer />
    </div>
  );
}

export default App;