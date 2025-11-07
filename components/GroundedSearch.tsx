
import React, { useState } from 'react';
import { FeaturePage } from './FeaturePage';
import { groundedSearch } from '../services/geminiService';
import { GenerateContentResponse, GroundingChunk } from '@google/genai';
import ReactMarkdown from 'react-markdown';

export const GroundedSearch: React.FC = () => {
    const [prompt, setPrompt] = useState('');
    const [result, setResult] = useState<GenerateContentResponse | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async () => {
        if (!prompt.trim() || isLoading) return;
        setIsLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await groundedSearch(prompt);
            setResult(response);
        } catch (err) {
            console.error(err);
            setError('Ocurrió un error durante la búsqueda. Por favor, inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    const groundingChunks = result?.candidates?.[0]?.groundingMetadata?.groundingChunks;

    return (
        <FeaturePage
            title="Búsqueda Fundamentada"
            description="Obtén respuestas actualizadas a tus preguntas, basadas en información en tiempo real de la Búsqueda de Google."
        >
            <div className="flex flex-col h-full">
                <div className="flex items-center space-x-2 mb-4">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        placeholder="Pregunta sobre eventos recientes o temas de actualidad..."
                        className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSearch}
                        disabled={isLoading || !prompt.trim()}
                        className="px-6 py-3 bg-primary text-white rounded-md font-semibold hover:bg-primary-focus disabled:bg-gray-400 transition-colors"
                    >
                        {isLoading ? 'Buscando...' : 'Buscar'}
                    </button>
                </div>
                {error && <p className="text-red-500 text-center p-2">{error}</p>}
                
                {result && (
                     <div className="mt-4 flex-1 overflow-y-auto border-t border-gray-200 pt-4">
                        <div className="prose max-w-none mb-6">
                           <ReactMarkdown>{result.text}</ReactMarkdown>
                        </div>
                        
                        {groundingChunks && groundingChunks.length > 0 && (
                            <div>
                                <h3 className="text-xl font-bold font-serif text-dark-text mb-2">Fuentes</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    {groundingChunks.map((chunk, index) => (
                                        chunk.web ? (
                                            <li key={index}>
                                                <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                                                    {chunk.web.title || chunk.web.uri}
                                                </a>
                                            </li>
                                        ) : null
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </FeaturePage>
    );
};