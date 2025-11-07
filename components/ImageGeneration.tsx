
import React, { useState } from 'react';
import { FeaturePage } from './FeaturePage';
import { generateImage } from '../services/geminiService';

export const ImageGeneration: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [images, setImages] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const aspectRatios = ["1:1", "16:9", "9:16", "4:3", "3:4"];

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return;
    setIsLoading(true);
    setError('');
    setImages([]);

    try {
      const generatedImages = await generateImage(prompt, aspectRatio);
      setImages(generatedImages);
    } catch (err) {
      console.error(err);
      setError('No se pudo generar la imagen. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <FeaturePage
      title="Generación de Imágenes"
      description="Transforma tus ideas en imágenes impresionantes. Describe lo que quieres ver y deja que la IA le dé vida."
    >
      <div className="flex flex-col h-full">
        <div className="flex flex-col md:flex-row items-start gap-4 mb-4">
          <textarea
            rows={3}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ej: Una toma cinematográfica de un mapache en una biblioteca, leyendo un libro, con iluminación suave..."
            className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            disabled={isLoading}
          />
          <div className="flex flex-col w-full md:w-auto">
            <label htmlFor="aspectRatio" className="text-sm font-medium text-gray-700 mb-1">Relación de Aspecto</label>
            <select
                id="aspectRatio"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={isLoading}
            >
                {aspectRatios.map(ar => <option key={ar} value={ar}>{ar}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isLoading || !prompt.trim()}
          className="w-full px-6 py-3 bg-primary text-white rounded-md font-bold text-lg hover:bg-primary-focus disabled:bg-gray-400 transition-colors"
        >
          {isLoading ? 'Generando...' : 'Generar Imagen'}
        </button>
        {error && <p className="text-red-500 text-center p-4">{error}</p>}
        <div className="mt-6 flex-1 overflow-y-auto flex items-center justify-center border-t border-gray-200 pt-4">
            {images.length > 0 && (
                <div className="grid grid-cols-1 gap-4">
                    {images.map((imgSrc, index) => (
                        <img key={index} src={imgSrc} alt={`Generated image ${index + 1}`} className="max-h-full max-w-full rounded-lg shadow-md object-contain" />
                    ))}
                </div>
            )}
        </div>
      </div>
    </FeaturePage>
  );
};