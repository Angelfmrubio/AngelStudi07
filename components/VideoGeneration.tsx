
import React, { useState, useRef, useEffect } from 'react';
import { FeaturePage } from './FeaturePage';
import { generateVideo } from '../services/geminiService';
import { UploadIcon } from './IconComponents';

export const VideoGeneration: React.FC = () => {
  const [apiKeySelected, setApiKeySelected] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Generando video...');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    const checkApiKey = async () => {
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setApiKeySelected(hasKey);
      }
    };
    checkApiKey();
  }, []);

  const loadingMessages = [
    "Calentando las cámaras virtuales...",
    "Coreografiando los píxeles...",
    "Renderizando brillantez cinematográfica...",
    "Esto puede tardar unos minutos, por favor espera...",
    "Casi listo, añadiendo los toques finales..."
  ];

  useEffect(() => {
    // Fix: Changed NodeJS.Timeout to ReturnType<typeof setInterval> for browser compatibility.
    let interval: ReturnType<typeof setInterval>;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingMessage(loadingMessages[Math.floor(Math.random() * loadingMessages.length)]);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);
  
  const handleSelectKey = async () => {
    await window.aistudio.openSelectKey();
    setApiKeySelected(true); // Assume success to avoid race conditions
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleGenerate = async () => {
    if ((!prompt.trim() && !image) || isLoading) return;
    setIsLoading(true);
    setError('');
    setVideoUrl(null);
    setLoadingMessage('Iniciando generación...');
    
    try {
        const url = await generateVideo(prompt, image, aspectRatio);
        setVideoUrl(url);
    } catch (err: any) {
        console.error(err);
        if (err.message.includes("not found")) {
            setError("Error de clave de API. Por favor, vuelve a seleccionar tu clave de API. Puede que tarde un momento en activarse.");
            setApiKeySelected(false);
        } else {
            setError('No se pudo generar el video. Por favor, inténtalo de nuevo.');
        }
    } finally {
        setIsLoading(false);
    }
  };

  if (!apiKeySelected) {
    return (
        <FeaturePage title="Generación de Video" description="Genera video de alta calidad a partir de texto o imágenes.">
            <div className="text-center">
                <p className="mb-4">Para usar la generación de video, debes seleccionar una clave de API.</p>
                <p className="mb-4 text-sm text-gray-600">Esta función utiliza modelos que pueden requerir que la facturación esté habilitada en tu proyecto. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Saber más</a>.</p>
                <button onClick={handleSelectKey} className="px-6 py-3 bg-primary text-white rounded-md font-bold text-lg hover:bg-primary-focus">
                    Seleccionar Clave de API
                </button>
            </div>
        </FeaturePage>
    );
  }

  return (
    <FeaturePage
      title="Generación de Video"
      description="Crea impresionantes videos a 720p a partir de peticiones de texto e imágenes de inicio opcionales."
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto pr-4">
            <textarea
                rows={3}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Un holograma de neón de un gato conduciendo a toda velocidad..."
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary mb-4"
                disabled={isLoading}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Imagen de Inicio (Opcional)</label>
                  <div className="p-2 border-2 border-dashed border-gray-300 rounded-lg text-center h-24 flex items-center justify-center">
                      <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                      {imagePreview ? (
                          <img src={imagePreview} alt="Preview" className="max-h-20 max-w-full rounded-md object-contain cursor-pointer" onClick={() => fileInputRef.current?.click()} />
                      ) : (
                          <button onClick={() => fileInputRef.current?.click()} className="text-gray-500 hover:text-primary transition-colors">
                              <UploadIcon />
                          </button>
                      )}
                  </div>
              </div>
              <div>
                  <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-700 mb-1">Relación de Aspecto</label>
                  <select
                      id="aspectRatio"
                      value={aspectRatio}
                      onChange={(e) => setAspectRatio(e.target.value as '16:9' | '9:16')}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      disabled={isLoading}
                  >
                      <option value="16:9">16:9 (Horizontal)</option>
                      <option value="9:16">9:16 (Vertical)</option>
                  </select>
              </div>
            </div>
            {error && <p className="text-red-500 text-center py-2">{error}</p>}
            {videoUrl && (
                <div className="mt-4">
                    <video src={videoUrl} controls autoPlay loop className="w-full rounded-lg shadow-md" />
                </div>
            )}
            {isLoading && (
              <div className="mt-4 text-center">
                <p className="text-lg font-semibold">{loadingMessage}</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div className="bg-primary h-2.5 rounded-full animate-pulse"></div>
                </div>
              </div>
            )}
        </div>
        <div className="pt-4 border-t border-gray-200">
            <button
                onClick={handleGenerate}
                disabled={isLoading || (!prompt.trim() && !image)}
                className="w-full px-6 py-3 bg-primary text-white rounded-md font-bold text-lg hover:bg-primary-focus disabled:bg-gray-400 transition-colors"
            >
                {isLoading ? 'Generando...' : 'Generar Video'}
            </button>
        </div>
      </div>
    </FeaturePage>
  );
};