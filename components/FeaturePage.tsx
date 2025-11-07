
import React from 'react';

interface FeaturePageProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export const FeaturePage: React.FC<FeaturePageProps> = ({ title, description, children }) => {
  return (
    <div className="container mx-auto p-4 sm:p-6 md:p-8 h-full flex flex-col">
      <header className="mb-6 md:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-dark-text">{title}</h1>
        <p className="text-gray-600 mt-2 text-base sm:text-lg">{description}</p>
      </header>
      <div className="flex-1 bg-white rounded-lg shadow-md p-4 sm:p-6 flex flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
};
