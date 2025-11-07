
import React, { useState, useRef, useEffect } from 'react';
import { FeaturePage } from './FeaturePage';
import { textToSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../services/audioUtils';
import { Volume2 } from './IconComponents';

export const TextToSpeech: React.FC = () => {
  const [text, setText] = useState('¡Hola! Soy una IA amigable, lista para dar vida a tus palabras.');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  useEffect(() => {
      // Initialize AudioContext on user interaction if needed, but here we do it on load.
      // Browsers may require a user gesture to start AudioContext.
      if (!audioContextRef.current) {
        try {
          // Fix: Cast window to `any` to support `webkitAudioContext` for older browsers.
          audioContextRef.current = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        } catch (e) {
            setError("No se pudo inicializar el audio. Por favor, interactúa con la página e inténtalo de nuevo.");
        }
      }

      return () => {
        audioSourceRef.current?.stop();
        audioContextRef.current?.close();
      }
  }, []);

  const handleSynthesize = async () => {
    if (!text.trim() || isLoading) return;

    // Resume AudioContext if it was suspended
    if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
    }
    
    setIsLoading(true);
    setError('');

    try {
      const base64Audio = await textToSpeech(text);
      
      const ctx = audioContextRef.current;
      if (!ctx) {
        throw new Error("AudioContext not available.");
      }

      // Stop any previously playing audio
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
      }

      const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start();
      audioSourceRef.current = source;
    } catch (err) {
      console.error(err);
      setError('No se pudo sintetizar el discurso. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FeaturePage
      title="Texto a Voz"
      description="Convierte texto escrito en un discurso de sonido natural con una voz de IA de alta calidad."
    >
        <div className="flex flex-col h-full">
            <label htmlFor="tts-input" className="block text-lg font-semibold text-dark-text mb-2">Texto a Sintetizar</label>
            <textarea
                id="tts-input"
                rows={8}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Introduce el texto aquí..."
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary flex-1"
                disabled={isLoading}
            />
            <button
                onClick={handleSynthesize}
                disabled={isLoading || !text.trim()}
                className="w-full px-6 py-3 mt-4 bg-primary text-white rounded-md font-bold text-lg hover:bg-primary-focus disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
            >
                <Volume2 />
                <span>{isLoading ? 'Sintetizando...' : 'Reproducir Audio'}</span>
            </button>
            {error && <p className="text-red-500 text-center p-4">{error}</p>}
        </div>
    </FeaturePage>
  );
};