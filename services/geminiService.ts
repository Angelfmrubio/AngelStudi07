
import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/genai";

export const getGeminiAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("La variable de entorno API_KEY no está configurada");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
  };
};

export const analyzeImage = async (image: File, prompt: string): Promise<string> => {
  const ai = getGeminiAI();
  const imagePart = await fileToGenerativePart(image);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: { parts: [imagePart, { text: prompt }] },
  });
  return response.text;
};

export const generateImage = async (prompt: string, aspectRatio: string): Promise<string[]> => {
    const ai = getGeminiAI();
    const response = await ai.models.generateImages({
        model: 'imagen-4.0-generate-001',
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: aspectRatio as "1:1" | "3:4" | "4:3" | "9:16" | "16:9",
        },
    });

    return response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
};

export const editImage = async (image: File, prompt: string): Promise<string> => {
  const ai = getGeminiAI();
  const imagePart = await fileToGenerativePart(image);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [imagePart, { text: prompt }],
    },
    config: {
        responseModalities: [Modality.IMAGE],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No se generó ninguna imagen");
};

export const generateVideo = async (prompt: string, image: File | null, aspectRatio: '16:9' | '9:16') => {
  // IMPORTANT: A new instance must be created to get the latest API key from the selection dialog.
  if (!process.env.API_KEY) {
    await window.aistudio.openSelectKey();
    if (!await window.aistudio.hasSelectedApiKey()) {
        throw new Error("No se ha seleccionado una clave de API.");
    }
  }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart = image ? { 
      imageBytes: (await fileToGenerativePart(image)).inlineData.data, 
      mimeType: image.type 
    } : undefined;

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: prompt,
    image: imagePart,
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: aspectRatio,
    }
  });
  
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 10000));
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) {
    throw new Error("La generación de video falló o no devolvió ningún enlace.");
  }
  
  const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  if (!videoResponse.ok) {
      throw new Error("Error al descargar el video.");
  }
  const videoBlob = await videoResponse.blob();
  return URL.createObjectURL(videoBlob);
};

export const groundedSearch = async (prompt: string): Promise<GenerateContentResponse> => {
  const ai = getGeminiAI();
  return await ai.models.generateContent({
     model: "gemini-2.5-flash",
     contents: prompt,
     config: {
       tools: [{googleSearch: {}}],
     },
  });
};

export const textToSpeech = async (prompt: string): Promise<string> => {
    const ai = getGeminiAI();
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (base64Audio) {
        return base64Audio;
    }
    throw new Error("No se recibieron datos de audio de la API.");
};