import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { FeaturePage } from './FeaturePage';
import { GoogleGenAI } from '@google/genai';
import { UploadIcon, PublishIcon } from './IconComponents';

type AnalysisType = 'timeline' | 'scene_breakdown' | 'character_arc' | 'thematic_outline' | 'idea_synthesis';

export const NarrativeArchitect: React.FC = () => {
  const [manuscript, setManuscript] = useState('');
  const [analysisType, setAnalysisType] = useState<AnalysisType>('idea_synthesis');
  const [systemInstruction, setSystemInstruction] = useState('Actúa como un editor y analista literario brillante y colaborativo. Tu propósito es iluminar la estructura subyacente del texto proporcionado, revelando su belleza y coherencia. Enfócate en la claridad y la organización, presentando tus hallazgos de una manera que empodere al autor.');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const saveTimeoutRef = useRef<number | null>(null);

  // Load manuscript from local storage on initial render
  useEffect(() => {
    try {
      const savedManuscript = localStorage.getItem('narrativeArchitect_manuscript');
      if (savedManuscript) {
        setManuscript(savedManuscript);
      }
    } catch (e) {
      console.error("Could not read from local storage:", e);
    }
  }, []);

  // Auto-save manuscript to local storage
  useEffect(() => {
    if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
    }
    if (manuscript) {
        setSaveStatus('saving');
        saveTimeoutRef.current = window.setTimeout(() => {
            try {
                localStorage.setItem('narrativeArchitect_manuscript', manuscript);
                setSaveStatus('saved');
                saveTimeoutRef.current = window.setTimeout(() => setSaveStatus('idle'), 2000);
            } catch(e) {
                console.error("Could not save to local storage:", e);
                setSaveStatus('idle');
            }
        }, 1000);
    }
    return () => {
        if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    }
  }, [manuscript]);


  const getAnalysisPrompt = () => {
    switch (analysisType) {
      case 'idea_synthesis':
        return 'Analiza este texto para sintetizar sus ideas clave. Identifica el argumento o tema central y preséntalo en un esquema claro y progresivo. Muestra cómo cada idea se construye sobre la anterior, creando un flujo lógico. El objetivo es obtener un mapa conceptual del diálogo o exposición.';
      case 'timeline':
        return 'Genera una secuencia clara de los eventos clave en el texto. Lístalos en orden cronológico para visualizar el flujo de la historia.';
      case 'scene_breakdown':
        return 'Proporciona una estructura de las escenas. Para cada una, identifica la ubicación, los personajes y el propósito principal de la acción. Esto ayudará a ver el ritmo de la narrativa.';
      case 'character_arc':
        return 'Analiza la evolución de los personajes. Identifica a los protagonistas y traza su desarrollo, mostrando sus decisiones y transformaciones clave a lo largo del texto.';
      case 'thematic_outline':
        return 'Crea un mapa de los temas principales. Agrupa las ideas y eventos por los temas que exploran, mostrando cómo se entrelazan para dar profundidad a la narrativa.';
    }
  };

  const handleAnalyze = async () => {
    if (!manuscript.trim() || isLoading) return;
    setIsLoading(true);
    setFeedback('');
    setResponse('');
    
    try {
      if (!process.env.API_KEY) {
        throw new Error("Para comenzar, por favor configura tu clave de API.");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const fullPrompt = `${getAnalysisPrompt()}\n\nAquí está el texto:\n\n${manuscript}`;
      
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: fullPrompt,
        config: {
            systemInstruction: systemInstruction,
        }
      });
      setResponse(result.text);
    } catch (err) {
      console.error(err);
      setFeedback('¡Aha! Parece que este texto tiene una complejidad especial. Para asegurar el mejor análisis, ¿podrías intentar con un fragmento un poco más corto? ¡Vamos a descubrir su estructura juntos!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setManuscript(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleDownload = () => {
    if (!response) return;
    const blob = new Blob([response], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analisis-narrativo-${analysisType}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <FeaturePage
      title="Arquitecto Narrativo"
      description="Ilumina el orden dentro de tu creatividad. Pega tu texto y elige un análisis para visualizar su estructura y potenciar tus ideas."
    >
      <div className="flex flex-col h-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="md:col-span-2">
                <label htmlFor="system-instruction" className="block text-sm font-semibold text-dark-text mb-1">Rol de la IA</label>
                <textarea
                    id="system-instruction"
                    rows={3}
                    value={systemInstruction}
                    onChange={(e) => setSystemInstruction(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm bg-gray-50"
                    disabled={isLoading}
                />
            </div>
            <div>
                <label htmlFor="analysis-type" className="block text-sm font-semibold text-dark-text mb-1">Tipo de Análisis</label>
                <select
                    id="analysis-type"
                    value={analysisType}
                    onChange={(e) => setAnalysisType(e.target.value as AnalysisType)}
                    className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    disabled={isLoading}
                    >
                    <option value="idea_synthesis">Síntesis de Ideas Clave</option>
                    <option value="timeline">Secuencia de Eventos</option>
                    <option value="scene_breakdown">Estructura por Escenas</option>
                    <option value="character_arc">Evolución de Personajes</option>
                    <option value="thematic_outline">Mapa de Temas</option>
                </select>
            </div>
        </div>

        <div className="mb-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-2">
                <label htmlFor="manuscript" className="block text-lg font-semibold text-dark-text">Tu Texto</label>
                <div className="flex items-center gap-2">
                    <span className={`text-sm text-gray-500 transition-opacity duration-300 ${saveStatus !== 'idle' ? 'opacity-100' : 'opacity-0'}`}>
                        {saveStatus === 'saving' ? 'Guardando...' : '¡Guardado!'}
                    </span>
                    <button
                        onClick={handleUploadClick}
                        title="Subir Archivo de Texto"
                        className="flex items-center gap-1 p-2 border border-gray-300 rounded-md text-sm hover:bg-gray-100 disabled:opacity-50"
                        disabled={isLoading}
                    >
                        <UploadIcon />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt,.md,.text" />
                </div>
            </div>
          <textarea
            id="manuscript"
            value={manuscript}
            onChange={(e) => setManuscript(e.target.value)}
            placeholder="Pega aquí tu diálogo, ensayo o capítulo..."
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary flex-1"
            disabled={isLoading}
          />
        </div>
        <button
          onClick={handleAnalyze}
          disabled={isLoading || !manuscript.trim()}
          className="w-full px-6 py-3 bg-primary text-white rounded-md font-bold text-lg hover:bg-primary-focus disabled:bg-gray-400 transition-colors"
        >
          {isLoading ? 'Analizando...' : 'Analizar Texto'}
        </button>
        {feedback && <div className="text-center p-4 mt-4 bg-amber-100 text-amber-800 rounded-md">{feedback}</div>}
        {response && (
          <div className="mt-6 flex-1 overflow-y-auto border-t border-gray-200 pt-4">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-bold font-serif text-dark-text">Análisis Revelado</h3>
                <button
                    onClick={handleDownload}
                    title="Descargar Análisis"
                    className="flex items-center gap-1 p-2 border border-gray-300 rounded-md text-sm hover:bg-gray-100"
                >
                    <PublishIcon />
                </button>
            </div>
            <div className="prose max-w-none bg-gray-50 p-4 rounded-md">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </FeaturePage>
  );
};
