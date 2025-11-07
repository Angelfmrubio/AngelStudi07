
import React, { useState, useRef, useEffect } from 'react';
import { FeaturePage } from './FeaturePage';
import { GoogleGenAI, Chat } from '@google/genai';
import ReactMarkdown from 'react-markdown';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

export const LowLatencyChat: React.FC = () => {
    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        try {
            if (!process.env.API_KEY) {
                throw new Error("La variable de entorno API_KEY no está configurada");
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const newChat = ai.chats.create({ model: 'gemini-2.5-flash' });
            setChat(newChat);
            setMessages([{ sender: 'bot', text: "¡Hola! Responderé mientras pienso. ¿Qué tienes en mente?" }]);
        } catch (err) {
            console.error(err);
            setError("No se pudo inicializar el chat. Por favor, verifica tu clave de API.");
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages[messages.length - 1]?.text]);

    const handleSend = async () => {
        if (!input.trim() || !chat || isLoading) return;

        const userMessage: Message = { sender: 'user', text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        setError('');

        // Add a placeholder for the bot's response
        setMessages(prev => [...prev, { sender: 'bot', text: '' }]);

        try {
            const stream = await chat.sendMessageStream({ message: input });

            for await (const chunk of stream) {
                const chunkText = chunk.text;
                setMessages(prev => {
                    const newMessages = [...prev];
                    newMessages[newMessages.length - 1].text += chunkText;
                    return newMessages;
                });
            }
        } catch (err) {
            console.error(err);
            setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].text = 'Lo siento, algo salió mal.';
                return newMessages;
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <FeaturePage
            title="Chat de Baja Latencia"
            description="Experimenta una conversación más natural con respuestas en streaming que aparecen a medida que se generan."
        >
            <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-lg px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-gray-200 text-dark-text'}`}>
                                <ReactMarkdown>{msg.text || '...'}</ReactMarkdown>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
                {error && <p className="text-red-500 text-center p-2">{error}</p>}
                <div className="p-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Escribe tu mensaje..."
                            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                            disabled={isLoading || !chat}
                        />
                        <button
                            onClick={handleSend}
                            disabled={isLoading || !chat || !input.trim()}
                            className="px-6 py-2 bg-primary text-white rounded-md font-semibold hover:bg-primary-focus disabled:bg-gray-400 transition-colors"
                        >
                            {isLoading ? 'Pensando...' : 'Enviar'}
                        </button>
                    </div>
                </div>
            </div>
        </FeaturePage>
    );
};