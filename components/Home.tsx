
import React from 'react';
import { Angelstudi07Logo, UploadIcon, SyncIcon, CorrectIcon, DesignIcon, PublishIcon, AccessibleIcon, BilingualIcon, CreativeIcon, LegacyIcon, Sitemap } from './IconComponents';

const ProcessStep: React.FC<{ num: string; title: string; description: string; icon: React.ReactNode; reverse?: boolean; }> = ({ num, title, description, icon, reverse = false }) => (
    <div className={`flex flex-col md:flex-row items-center gap-8 ${reverse ? 'md:flex-row-reverse' : ''}`}>
        <div className="flex-shrink-0 relative">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center">
                    {icon}
                </div>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-dark-text text-white flex items-center justify-center font-bold font-serif border-4 border-light-bg">
                {num}
            </div>
        </div>
        <div className="bg-white border border-accent rounded-lg p-6 flex-1 text-center md:text-left">
            <h3 className="text-2xl font-bold font-serif text-dark-text mb-2">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{description}</p>
        </div>
    </div>
);

const ValueCard: React.FC<{ icon: React.ReactNode; title: string; description: string; }> = ({ icon, title, description }) => (
    <div className="bg-white border border-accent rounded-lg p-6 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="inline-flex w-16 h-16 rounded-full bg-primary/20 text-primary items-center justify-center mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-dark-text mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);


export const Home: React.FC<{ onNavigate: (feature: string) => void; }> = ({ onNavigate }) => {
    const steps = [
        { num: '1', title: 'Importar', description: 'Trae tu manuscrito. Respetamos cada palabra, cada silencio entre líneas.', icon: <UploadIcon /> },
        { num: '2', title: 'Sincronizar', description: 'Nuestra IA teje la primera hebra de la traducción, capturando la esencia.', icon: <SyncIcon />, reverse: true },
        { num: '3', title: 'Corregir', description: 'Pulimos la traducción para que resuene con tu voz original.', icon: <CorrectIcon /> },
        { num: '4', title: 'Diseñar', description: 'Maquetamos un libro donde dos idiomas dialogan en armonía visual.', icon: <DesignIcon />, reverse: true },
        { num: '5', title: 'Publicar', description: 'Generamos los archivos perfectos para las plataformas globales. Tu legado está listo.', icon: <PublishIcon /> },
    ];

    const values = [
        { title: 'Fidelidad Emocional', description: 'No se traduce para reemplazar. Se traduce para tejer un puente entre culturas.', icon: <BilingualIcon /> },
        { title: 'Claridad Arquitectónica', description: 'Revela la estructura oculta en tu texto. Ordena tu caos sin simplificar tu arte.', icon: <Sitemap /> },
        { title: 'Resistencia Creativa', description: 'Escribimos desde el alma. La tecnología es una aliada, no un sustituto de la maestría.', icon: <CreativeIcon /> },
        { title: 'Legado Bilingüe', description: 'Tu obra merece cruzar fronteras. Creamos un puente duradero para tu voz.', icon: <LegacyIcon /> },
    ];

  return (
    <div className="bg-light-bg text-dark-text min-h-full">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Angelstudi07Logo className="h-10 w-10 text-primary" />
            <div>
                <h1 className="font-serif text-2xl font-bold text-dark-text">Angelstudi07</h1>
                <p className="text-sm text-gray-500 hidden sm:block">El arte de tejer puentes con palabras.</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <button className="font-semibold px-4 py-2 border border-accent rounded-md hover:bg-gray-100 transition-colors">
                🇪🇸 / 🇬🇧
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="text-center py-20 md:py-28 px-6 bg-white">
        <h2 className="font-serif text-4xl md:text-6xl text-dark-text font-bold leading-tight">
          ¿Listo para publicar tu libro bilingüe?
        </h2>
        <p className="text-gray-600 text-lg md:text-xl mt-4 max-w-2xl mx-auto">
          Únete a autores que confían en Angelstudi07 para llevar su obra al mundo, honrando cada palabra en dos idiomas.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="bg-primary text-white font-bold py-3 px-8 rounded-md text-lg hover:bg-primary-focus transition-all duration-300 shadow-lg transform hover:scale-105">
            Empezar gratis →
          </button>
          <button 
            onClick={() => onNavigate('chatbot')}
            className="border-2 border-accent text-dark-text font-bold py-3 px-8 rounded-md text-lg hover:bg-gray-100 transition-all duration-300">
            Explorar la Suite Creativa
          </button>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
            <div className="text-center mb-16">
                <h2 className="font-serif text-4xl font-bold text-dark-text">Tu camino hacia la publicación</h2>
                <p className="text-gray-600 mt-2 text-lg">Cinco pasos claros para transformar tu manuscrito.</p>
            </div>
            <div className="max-w-4xl mx-auto grid gap-12">
                {steps.map((step, index) => <ProcessStep key={index} {...step} />)}
            </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-white py-20 px-6">
        <div className="container mx-auto">
            <div className="text-center mb-16">
                <h2 className="font-serif text-4xl font-bold text-dark-text">Diseñado para ti</h2>
                <p className="text-gray-600 mt-2 text-lg">Alma y potencia en perfecta armonía.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                {values.map((value, index) => <ValueCard key={index} {...value} />)}
            </div>
        </div>
      </section>

      {/* Publish with Purpose (CTA) */}
      <section className="py-20 px-6 text-center">
        <div className="container mx-auto max-w-3xl">
          <h2 className="font-serif text-4xl font-bold text-dark-text">Desde el manuscrito hasta el legado.</h2>
          <p className="text-lg text-gray-600 mt-4">Publicar no es terminar. Es comenzar a resonar.</p>
          <div className="mt-8 flex justify-center items-center gap-4">
            <button className="bg-primary text-white font-bold py-3 px-8 rounded-md text-lg hover:bg-primary-focus transition-all duration-300 shadow-lg">
              Comenzar ahora
            </button>
            <button className="border-2 border-accent text-dark-text font-bold py-3 px-8 rounded-md text-lg hover:bg-gray-100 transition-all duration-300">
              Saber más
            </button>
          </div>
          <div className="mt-10 flex justify-center items-center space-x-8 text-gray-400 font-medium">
            <span>Amazon KDP</span>
            <span>Kobo</span>
            <span>Lulu.com</span>
        </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-gray-600 py-10 px-6 border-t border-accent">
        <div className="container mx-auto text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                <Angelstudi07Logo className="h-8 w-8 text-dark-text"/>
                <span className="font-bold text-lg text-dark-text">Angelstudi07</span>
            </div>
            <p className="text-sm">Empoderando a autores que escriben con propósito.</p>
            <div className="mt-4 space-x-6 text-sm">
            <a href="#" className="hover:text-primary transition-colors">Accesibilidad</a>
            <a href="#" className="hover:text-primary transition-colors">Privacidad</a>
            <a href="#" className="hover:text-primary transition-colors">Libros publicados</a>
            </div>
            <p className="text-xs text-gray-400 mt-8">© 2025 Angelstudi07 — Jose Alirio Angel Corredor. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};