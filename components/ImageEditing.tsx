
import React, { useState, useRef } from 'react';
import { FeaturePage } from './FeaturePage';
import { editImage } from '../services/geminiService';
import { UploadIcon } from './IconComponents';

export const ImageEditing: React.FC = () => {
    const [originalImage, setOriginalImage] = useState<File | null>(null);
    const [originalImagePreview, setOriginalImagePreview] = useState<string | null>(null);
    const [editedImage, setEditedImage] = useState<string | null>(null);
    const [prompt, setPrompt] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setOriginalImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setOriginalImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
            setEditedImage(null);
            setError('');
        }
    };

    const handleEdit = async () => {
        if (!originalImage || !prompt.trim() || isLoading) return;
        setIsLoading(true);
        setError('');
        setEditedImage(null);

        try {
            const result = await editImage(originalImage, prompt);
            setEditedImage(result);
        } catch (err) {
            console.error(err);
            setError('No se pudo editar la imagen. Por favor, inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <FeaturePage
            title="Edición de Imágenes"
            description="Sube una imagen y utiliza peticiones de texto sencillas para realizar ediciones potentes."
        >
            <div className="flex flex-col h-full">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
                    <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg h-full">
                        <input type="file" accept="image/*" onChange={handleFileChange} ref={fileInputRef} className="hidden" />
                        {originalImagePreview ? (
                            <img src={originalImagePreview} alt="Original" className="max-h-full max-w-full rounded-md object-contain cursor-pointer" onClick={() => fileInputRef.current?.click()} />
                        ) : (
                            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center text-gray-500 hover:text-primary transition-colors">
                                <UploadIcon />
                                <span className="mt-2">Subir Imagen Original</span>
                            </button>
                        )}
                    </div>
                    <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg h-full bg-gray-50">
                        {isLoading ? (
                            <p>Editando...</p>
                        ) : editedImage ? (
                            <img src={editedImage} alt="Edited" className="max-h-full max-w-full rounded-md object-contain" />
                        ) : (
                            <p className="text-gray-500">Tu imagen editada aparecerá aquí.</p>
                        )}
                    </div>
                </div>
                <div className="mt-4">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Ej: haz que parezca una pintura de acuarela"
                            className="flex-1 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            disabled={isLoading || !originalImage}
                        />
                        <button
                            onClick={handleEdit}
                            disabled={isLoading || !originalImage || !prompt.trim()}
                            className="px-6 py-3 bg-primary text-white rounded-md font-semibold hover:bg-primary-focus disabled:bg-gray-400 transition-colors"
                        >
                            {isLoading ? 'Editando...' : 'Editar'}
                        </button>
                    </div>
                    {error && <p className="text-red-500 text-center p-2">{error}</p>}
                </div>
            </div>
        </FeaturePage>
    );
};