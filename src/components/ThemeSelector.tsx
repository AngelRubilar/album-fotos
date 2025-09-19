'use client';

import React, { useState } from 'react';
import { useTheme, themeInfo } from '@/contexts/ThemeContext';

export default function ThemeSelector() {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      {/* Botón del selector de tema */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg shadow-lg hover:bg-white/30 transition-all duration-300 border border-white/30"
        aria-label="Cambiar tema"
      >
        <span className="mr-2 text-lg">
          {themeInfo[currentTheme].icon}
        </span>
        <span className="text-sm font-medium mr-2">
          {themeInfo[currentTheme].name}
        </span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown de temas */}
      {isOpen && (
        <>
          {/* Overlay para cerrar */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Panel de temas */}
          <div className="absolute top-full right-0 mt-2 w-80 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
                🎨 Elegir Tema
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {availableThemes.map((theme) => (
                  <button
                    key={theme}
                    onClick={() => {
                      setTheme(theme);
                      setIsOpen(false);
                    }}
                    className={`relative p-4 rounded-xl transition-all duration-300 ${
                      currentTheme === theme 
                        ? 'ring-2 ring-blue-500 bg-blue-50' 
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Preview del tema */}
                    <div className={`w-full h-12 rounded-lg mb-2 ${
                      theme === 'light' ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                      theme === 'dark' ? 'bg-gradient-to-r from-blue-500 to-blue-700' :
                      theme === 'ocean' ? 'bg-gradient-to-r from-cyan-400 to-teal-600' :
                      theme === 'sunset' ? 'bg-gradient-to-r from-orange-400 to-pink-600' :
                      theme === 'forest' ? 'bg-gradient-to-r from-green-400 to-teal-600' :
                      'bg-gradient-to-r from-purple-400 to-indigo-600'
                    }`} />
                    
                    {/* Información del tema */}
                    <div className="text-center">
                      <div className="text-lg mb-1">
                        {themeInfo[theme].icon}
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {themeInfo[theme].name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {themeInfo[theme].description}
                      </div>
                    </div>
                    
                    {/* Indicador de selección */}
                    {currentTheme === theme && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              {/* Información adicional */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 text-center">
                  💡 El tema se guarda automáticamente y se aplicará en toda la aplicación
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
