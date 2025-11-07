
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { FeaturePage } from './FeaturePage';
import { GoogleGenAI } from '@google/genai';

export const ComplexQuery: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setError('');
    setResponse('');
    
    try {
      if (!process.env.API_KEY) {
        throw new Error("La variable de entorno API_KEY no está configurada");
      }
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-pro', // Using pro for complex tasks
        contents: prompt,
      });
      setResponse(result.text);
    } catch (err) {
      console.error(err);
      setError('No se pudo generar la respuesta. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FeaturePage
      title="Consulta Compleja"
      description="Aprovecha el poder de Gemini 2.5 Pro para razonamiento avanzado, codificación y análisis en profundidad."
    >
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <label htmlFor="prompt" className="block text-lg font-semibold text-dark-text mb-2">Tu Petición</label>
          <textarea
            id="prompt"
            rows={8}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Introduce una petición compleja, como un problema de codificación, una pregunta detallada o una solicitud de generación de texto creativo..."
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="w-full px-6 py-3 bg-primary text-white rounded-md font-bold text-lg hover:bg-primary-focus disabled:bg-gray-400 transition-colors"
        >
          {isLoading ? 'Generando...' : 'Generar Respuesta'}
        </button>
        {error && <p className="text-red-500 text-center p-4">{error}</p>}
        {response && (
          <div className="mt-6 flex-1 overflow-y-auto border-t border-gray-200 pt-4">
            <h3 className="text-2xl font-bold font-serif text-dark-text mb-2">Resultado</h3>
            <div className="prose max-w-none">
              <ReactMarkdown>{response}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </FeaturePage>
  );
};