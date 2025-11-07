
import React, { useState, useCallback } from 'react';
import { Home } from './components/Home';
// Fix: Corrected import paths for components to resolve module errors.
import { Chatbot } from './components/Chatbot.tsx';
import { ComplexQuery } from './components/ComplexQuery.tsx';
import { GroundedSearch } from './components/GroundedSearch.tsx';
import { LowLatencyChat } from './components/LowLatencyChat.tsx';
import { ImageAnalysis } from './components/ImageAnalysis.tsx';
import { ImageGeneration } from './components/ImageGeneration.tsx';
import { ImageEditing } from './components/ImageEditing.tsx';
import { VideoGeneration } from './components/VideoGeneration.tsx';
import { LiveConversation } from './components/LiveConversation.tsx';
import { TextToSpeech } from './components/TextToSpeech.tsx';
import { NarrativeArchitect } from './components/NarrativeArchitect.tsx';
import { PenTool, MessageSquare, BrainCircuit, Search, Zap, Image as ImageIcon, Wand2, Film, Mic, Volume2, HomeIcon, Sitemap } from './components/IconComponents';

type Feature = 
  | 'home'
  | 'chatbot'
  | 'complexQuery'
  | 'groundedSearch'
  | 'lowLatencyChat'
  | 'imageAnalysis'
  | 'imageGeneration'
  | 'imageEditing'
  | 'videoGeneration'
  | 'liveConversation'
  | 'textToSpeech'
  | 'narrativeArchitect';

const App: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<Feature>('home');

  const renderFeature = useCallback(() => {
    switch (activeFeature) {
      case 'home': return <Home onNavigate={(feature) => setActiveFeature(feature as Feature)} />;
      case 'chatbot': return <Chatbot />;
      case 'complexQuery': return <ComplexQuery />;
      case 'narrativeArchitect': return <NarrativeArchitect />;
      case 'groundedSearch': return <GroundedSearch />;
      case 'lowLatencyChat': return <LowLatencyChat />;
      case 'imageAnalysis': return <ImageAnalysis />;
      case 'imageGeneration': return <ImageGeneration />;
      case 'imageEditing': return <ImageEditing />;
      case 'videoGeneration': return <VideoGeneration />;
      case 'liveConversation': return <LiveConversation />;
      case 'textToSpeech': return <TextToSpeech />;
      default: return <Home onNavigate={(feature) => setActiveFeature(feature as Feature)} />;
    }
  }, [activeFeature]);

  const navItems = [
    { id: 'home', label: 'Inicio', icon: <HomeIcon /> },
    { id: 'chatbot', label: 'Chatbot', icon: <MessageSquare /> },
    { id: 'complexQuery', label: 'Consulta Compleja', icon: <BrainCircuit /> },
    { id: 'narrativeArchitect', label: 'Arquitecto Narrativo', icon: <Sitemap /> },
    { id: 'groundedSearch', label: 'Búsqueda Fundamentada', icon: <Search /> },
    { id: 'lowLatencyChat', label: 'Chat de Baja Latencia', icon: <Zap /> },
    { id: 'imageAnalysis', label: 'Análisis de Imágenes', icon: <ImageIcon /> },
    { id: 'imageGeneration', label: 'Generación de Imágenes', icon: <Wand2 /> },
    { id: 'imageEditing', label: 'Edición de Imágenes', icon: <PenTool /> },
    { id: 'videoGeneration', label: 'Generación de Video', icon: <Film /> },
    { id: 'liveConversation', label: 'Conversación en Vivo', icon: <Mic /> },
    { id: 'textToSpeech', label: 'Texto a Voz', icon: <Volume2 /> },
  ];

  return (
    <div className="bg-slate-100 min-h-screen font-sans flex">
      <nav className="w-64 bg-white p-4 space-y-2 border-r border-gray-200 overflow-y-auto">
        <h1 className="text-xl font-bold font-serif text-dark-text mb-4">Suite Creativa con IA</h1>
        <ul>
          {navItems.map(item => (
            <li key={item.id}>
              <button
                onClick={() => setActiveFeature(item.id as Feature)}
                className={`w-full text-left px-3 py-2 rounded-md flex items-center space-x-3 transition-colors duration-200 ${
                  activeFeature === item.id
                    ? 'bg-primary/20 text-primary-focus font-semibold'
                    : 'text-dark-text hover:bg-gray-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <main className="flex-1 overflow-auto bg-light-bg">
        {renderFeature()}
      </main>
    </div>
  );
};

export default App;