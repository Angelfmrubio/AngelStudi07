
import React, { useState, useRef } from 'react';
import { FeaturePage } from './FeaturePage';
import { analyzeImage } from '../services/geminiService';
import { UploadIcon } from './IconComponents';
import ReactMarkdown from 'react-markdown';

export const ImageAnalysis: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('¿Qué hay en esta imagen?');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setResult('');
      setError('');
    }
  };

  const handleAnalyze = async () => {
    if (!image || !prompt.trim() || isLoading) return;
    setIsLoading(true);
    setError('');
    setResult('');

    try {
      const analysisResult = await analyzeImage(image, prompt);
      setResult(analysisResult);
    } catch (err) {
      console.error(err);
      setError('No se pudo analizar la imagen. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FeaturePage
      title="Análisis de Imágenes"
      description="Sube una imagen y haz preguntas para comprender su contenido, contexto o detalles."
    >
      <div className="flex flex-col md:flex-row gap-6 h-full">
        <div className="md:w-1/2 flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            className="hidden"
          />
          {imagePreview ? (
            <img src={imagePreview} alt="Preview" className="max-h-full max-w-full rounded-md object-contain cursor-pointer" onClick={() => fileInputRef.current?.click()}/>
          ) : (
            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center text-gray-500 hover:text-primary transition-colors">
              <UploadIcon />
              <span className="mt-2">Haz clic para subir una imagen</span>
            </button>
          )}
        </div>
        <div className="md:w-1/2 flex flex-col">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            placeholder="Pregunta algo sobre la imagen..."
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary mb-4"
            disabled={isLoading || !image}
          />
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !image || !prompt.trim()}
            className="w-full px-6 py-3 bg-primary text-white rounded-md font-bold text-lg hover:bg-primary-focus disabled:bg-gray-400 transition-colors"
          >
            {isLoading ? 'Analizando...' : 'Analizar Imagen'}
          </button>
          {error && <p className="text-red-500 text-center p-4">{error}</p>}
          {result && (
            <div className="mt-6 flex-1 overflow-y-auto border-t border-gray-200 pt-4">
               <h3 className="text-2xl font-bold font-serif text-dark-text mb-2">Análisis</h3>
               <div className="prose max-w-none">
                 <ReactMarkdown>{result}</ReactMarkdown>
               </div>
            </div>
          )}
        </div>
      </div>
    </FeaturePage>
  );
};