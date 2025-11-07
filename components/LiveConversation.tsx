
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FeaturePage } from './FeaturePage';
import { GoogleGenAI, LiveSession, Modality, LiveServerMessage, Blob } from '@google/genai';
import { encode, decode, decodeAudioData } from '../services/audioUtils';
import { Mic, MicOff } from './IconComponents';

interface Transcription {
    sender: 'user' | 'model';
    text: string;
}

export const LiveConversation: React.FC = () => {
  const [isLive, setIsLive] = useState(false);
  const [transcriptions, setTranscriptions] = useState<Transcription[]>([]);
  const [error, setError] = useState('');
  
  const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
  const aiRef = useRef<GoogleGenAI | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const currentInputTranscriptionRef = useRef('');
  const currentOutputTranscriptionRef = useRef('');

  const stopConversation = useCallback(() => {
    setIsLive(false);

    sessionPromiseRef.current?.then(session => session.close());
    sessionPromiseRef.current = null;

    if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
    }
    if (scriptProcessorRef.current) {
        scriptProcessorRef.current.disconnect();
        scriptProcessorRef.current = null;
    }
    if (mediaStreamSourceRef.current) {
        mediaStreamSourceRef.current.disconnect();
        mediaStreamSourceRef.current = null;
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
        inputAudioContextRef.current.close();
        inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current && outputAudioContextRef.current.state !== 'closed') {
        outputAudioContextRef.current.close();
        outputAudioContextRef.current = null;
    }
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
    nextStartTimeRef.current = 0;
  }, []);
  
  const startConversation = async () => {
    setError('');
    setIsLive(true);
    setTranscriptions([]);
    
    try {
        if (!process.env.API_KEY) {
            throw new Error("La variable de entorno API_KEY no está configurada");
        }
        if (!aiRef.current) {
          aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
        }
        
        // Fix: Cast window to `any` to support `webkitAudioContext` for older browsers.
        inputAudioContextRef.current = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        // Fix: Cast window to `any` to support `webkitAudioContext` for older browsers.
        outputAudioContextRef.current = new ((window as any).AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

        sessionPromiseRef.current = aiRef.current.live.connect({
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          callbacks: {
            onopen: async () => {
              mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
              const source = inputAudioContextRef.current!.createMediaStreamSource(mediaStreamRef.current);
              mediaStreamSourceRef.current = source;
              const scriptProcessor = inputAudioContextRef.current!.createScriptProcessor(4096, 1, 1);
              scriptProcessorRef.current = scriptProcessor;

              scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                const pcmBlob: Blob = {
                  // Fix: Convert the ArrayBuffer to a Uint8Array before passing to the encode function.
                  data: encode(new Uint8Array(new Int16Array(inputData.map(f => f * 32768)).buffer)),
                  mimeType: 'audio/pcm;rate=16000',
                };
                sessionPromiseRef.current?.then((session) => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              };
              source.connect(scriptProcessor);
              scriptProcessor.connect(inputAudioContextRef.current!.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
                if (message.serverContent?.outputTranscription) {
                    currentOutputTranscriptionRef.current += message.serverContent.outputTranscription.text;
                } else if (message.serverContent?.inputTranscription) {
                    currentInputTranscriptionRef.current += message.serverContent.inputTranscription.text;
                }

                if (message.serverContent?.turnComplete) {
                    const fullInput = currentInputTranscriptionRef.current.trim();
                    const fullOutput = currentOutputTranscriptionRef.current.trim();
                    if (fullInput) setTranscriptions(prev => [...prev, { sender: 'user', text: fullInput }]);
                    if (fullOutput) setTranscriptions(prev => [...prev, { sender: 'model', text: fullOutput }]);
                    currentInputTranscriptionRef.current = '';
                    currentOutputTranscriptionRef.current = '';
                }

                const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData.data;
                if (base64Audio) {
                    const outputCtx = outputAudioContextRef.current!;
                    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                    const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                    const source = outputCtx.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(outputCtx.destination);
                    source.addEventListener('ended', () => sourcesRef.current.delete(source));
                    source.start(nextStartTimeRef.current);
                    nextStartTimeRef.current += audioBuffer.duration;
                    sourcesRef.current.add(source);
                }

                if (message.serverContent?.interrupted) {
                    sourcesRef.current.forEach(source => source.stop());
                    sourcesRef.current.clear();
                    nextStartTimeRef.current = 0;
                }
            },
            onerror: (e: ErrorEvent) => {
              console.error(e);
              setError('Ocurrió un error. Por favor, inténtalo de nuevo.');
              stopConversation();
            },
            onclose: (e: CloseEvent) => {
              stopConversation();
            },
          },
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: { voiceConfig: {prebuiltVoiceConfig: {voiceName: 'Zephyr'}}},
            outputAudioTranscription: {},
            inputAudioTranscription: {},
          },
        });
    } catch(err) {
        console.error(err);
        setError('No se pudo iniciar la conversación. Revisa los permisos del micrófono y la clave de API.');
        stopConversation();
    }
  };

  const handleToggleConversation = () => {
    isLive ? stopConversation() : startConversation();
  };

  useEffect(() => {
    return () => stopConversation();
  }, [stopConversation]);

  return (
    <FeaturePage
      title="Conversación en Vivo"
      description="Habla directamente con la IA en una conversación de audio en tiempo real y de baja latencia."
    >
      <div className="flex flex-col h-full items-center">
        <button
          onClick={handleToggleConversation}
          className={`w-32 h-32 rounded-full flex items-center justify-center transition-colors text-white ${isLive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
        >
          {isLive ? <MicOff /> : <Mic />}
        </button>
        <p className="mt-4 text-lg font-semibold">{isLive ? 'La conversación está activa...' : 'Toca para empezar'}</p>
        {error && <p className="text-red-500 text-center p-2">{error}</p>}
        <div className="mt-6 w-full flex-1 overflow-y-auto border-t border-gray-200 pt-4 space-y-2">
            {transcriptions.map((t, i) => (
                <div key={i} className={`p-2 rounded-lg ${t.sender === 'user' ? 'bg-blue-100 text-right' : 'bg-gray-100'}`}>
                    <span className="font-bold">{t.sender === 'user' ? 'Tú' : 'Modelo'}: </span>{t.text}
                </div>
            ))}
        </div>
      </div>
    </FeaturePage>
  );
};