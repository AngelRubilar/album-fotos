'use client';

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeSelector from "@/components/ThemeSelector";

interface Year {
  year: number;
  totalImages: number;
  albumCount: number;
}

export default function Home() {
  const { currentTheme } = useTheme();
  const [years, setYears] = useState<Year[]>([]);
  const [loading, setLoading] = useState(true);

  // Gradientes adaptados al tema actual - Memoizado para evitar cálculos en cada render
  const gradients = useMemo(() => {
    switch (currentTheme) {
      case 'light':
        return [
          "from-blue-400 via-blue-500 to-blue-600",
          "from-indigo-400 via-indigo-500 to-indigo-600",
          "from-purple-400 via-purple-500 to-purple-600",
          "from-pink-400 via-pink-500 to-pink-600"
        ];
      case 'dark':
        return [
          "from-blue-500 via-blue-600 to-blue-700",
          "from-indigo-500 via-indigo-600 to-indigo-700",
          "from-purple-500 via-purple-600 to-purple-700",
          "from-pink-500 via-pink-600 to-pink-700"
        ];
      case 'ocean':
        return [
          "from-cyan-400 via-cyan-500 to-cyan-600",
          "from-blue-400 via-blue-500 to-blue-600",
          "from-teal-400 via-teal-500 to-teal-600",
          "from-sky-400 via-sky-500 to-sky-600"
        ];
      case 'sunset':
        return [
          "from-orange-400 via-orange-500 to-orange-600",
          "from-red-400 via-red-500 to-red-600",
          "from-pink-400 via-pink-500 to-pink-600",
          "from-yellow-400 via-yellow-500 to-yellow-600"
        ];
      case 'forest':
        return [
          "from-green-400 via-green-500 to-green-600",
          "from-emerald-400 via-emerald-500 to-emerald-600",
          "from-teal-400 via-teal-500 to-teal-600",
          "from-lime-400 via-lime-500 to-lime-600"
        ];
      case 'cosmic':
        return [
          "from-purple-400 via-purple-500 to-purple-600",
          "from-indigo-400 via-indigo-500 to-indigo-600",
          "from-pink-400 via-pink-500 to-pink-600",
          "from-violet-400 via-violet-500 to-violet-600"
        ];
      default:
        return [
          "from-blue-400 via-blue-500 to-blue-600",
          "from-indigo-400 via-indigo-500 to-indigo-600",
          "from-purple-400 via-purple-500 to-purple-600",
          "from-pink-400 via-pink-500 to-pink-600"
        ];
    }
  }, [currentTheme]);

  // Cargar años con imágenes desde la API
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const response = await fetch('/api/years');
        const data = await response.json();
        if (data.success) {
          setYears(data.data);
        } else {
          // Si no hay años con imágenes, usar datos de ejemplo
          setYears([
            { year: 2025, totalImages: 45, albumCount: 4 },
            { year: 2024, totalImages: 150, albumCount: 1 },
            { year: 2023, totalImages: 89, albumCount: 1 },
            { year: 2022, totalImages: 234, albumCount: 1 },
            { year: 2021, totalImages: 167, albumCount: 1 },
          ]);
        }
      } catch (error) {
        console.error('Error fetching years:', error);
        // En caso de error, usar datos de ejemplo
        setYears([
          { year: 2025, totalImages: 45, albumCount: 4 },
          { year: 2024, totalImages: 150, albumCount: 1 },
          { year: 2023, totalImages: 89, albumCount: 1 },
          { year: 2022, totalImages: 234, albumCount: 1 },
          { year: 2021, totalImages: 167, albumCount: 1 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchYears();
  }, []);

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all duration-500 ${
        currentTheme === 'ocean' ? 'bg-gradient-to-br from-cyan-50 to-blue-100' :
        currentTheme === 'sunset' ? 'bg-gradient-to-br from-orange-50 to-red-100' :
        currentTheme === 'forest' ? 'bg-gradient-to-br from-green-50 to-emerald-100' :
        currentTheme === 'cosmic' ? 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900' :
        currentTheme === 'dark' ? 'bg-gray-900' :
        'bg-gray-50'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`transition-colors duration-300 ${
            currentTheme === 'dark' || currentTheme === 'cosmic' ? 'text-gray-300' : 'text-gray-600'
          }`}>Cargando álbumes...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`min-h-screen transition-all duration-500 ${
      currentTheme === 'ocean' ? 'bg-gradient-to-br from-cyan-50 to-blue-100' :
      currentTheme === 'sunset' ? 'bg-gradient-to-br from-orange-50 to-red-100' :
      currentTheme === 'forest' ? 'bg-gradient-to-br from-green-50 to-emerald-100' :
      currentTheme === 'cosmic' ? 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900' :
      currentTheme === 'dark' ? 'bg-gray-900' :
      'bg-gray-50'
    }`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12 relative">
          {/* Selector de tema en la esquina superior derecha */}
          <div className="absolute top-0 right-0">
            <ThemeSelector />
          </div>
          
          <h1 className={`text-4xl md:text-6xl font-bold mb-4 transition-colors duration-300 ${
            currentTheme === 'dark' || currentTheme === 'cosmic' ? 'text-white' : 'text-gray-900'
          }`}>
            📸 Álbum de Fotos
          </h1>
          <p className={`text-lg max-w-2xl mx-auto mb-8 transition-colors duration-300 ${
            currentTheme === 'dark' || currentTheme === 'cosmic' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Explora tus recuerdos organizados por años. Cada imagen cuenta una historia única.
          </p>
          
          {/* Botones de Acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/upload">
              <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all duration-300">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Subir Nuevas Fotos
              </button>
            </Link>
            
            <Link href="/admin">
              <button className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg shadow-lg hover:shadow-xl hover:bg-gray-700 transition-all duration-300">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Administrar Álbumes
              </button>
            </Link>
          </div>
        </header>

        {/* Grid de Años */}
        <main className="max-w-7xl mx-auto">
          {years.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📁</div>
              <h3 className={`text-2xl font-bold mb-3 transition-colors duration-300 ${
                currentTheme === 'dark' || currentTheme === 'cosmic' ? 'text-white' : 'text-gray-900'
              }`}>
                ¡No hay fotos subidas!
              </h3>
              <p className={`text-lg mb-6 transition-colors duration-300 ${
                currentTheme === 'dark' || currentTheme === 'cosmic' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                Sube tus primeras fotos para empezar a organizar tus recuerdos.
              </p>
              <Link href="/upload">
                <button className="px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all duration-300">
                  Subir Fotos
                </button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {years.map((yearData, index) => {
              const gradient = gradients[index % gradients.length];
              
              return (
                <Link
                  key={yearData.year}
                  href={`/album/${yearData.year}`}
                  className="group block"
                >
                  <div className={`relative rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 hover:rotate-1 overflow-hidden border ${
                    currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' :
                    currentTheme === 'cosmic' ? 'bg-purple-800/80 border-purple-600' :
                    currentTheme === 'ocean' ? 'bg-white/80 border-cyan-200' :
                    currentTheme === 'sunset' ? 'bg-white/80 border-orange-200' :
                    currentTheme === 'forest' ? 'bg-white/80 border-green-200' :
                    'bg-white border-gray-100'
                  }`}>
                    {/* Imagen de Portada con diseño moderno */}
                    <div className={`aspect-[4/3] bg-gradient-to-br ${gradient} relative overflow-hidden`}>
                      {/* Patrón de fondo */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute inset-0" style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                          backgroundSize: '60px 60px'
                        }}></div>
                      </div>
                      
                      {/* Año grande con efecto glassmorphism */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="backdrop-blur-sm bg-white/20 rounded-3xl px-8 py-6 border border-white/30">
                          <span className="text-7xl font-bold text-white drop-shadow-lg">
                            {yearData.year}
                          </span>
                        </div>
                      </div>
                      
                      {/* Efecto de overlay al hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Indicador de fotos en la esquina */}
                      <div className="absolute top-4 right-4 backdrop-blur-sm bg-white/20 rounded-full px-3 py-1 border border-white/30">
                        <span className="text-white text-sm font-medium">
                          {yearData.totalImages} 📸
                        </span>
                      </div>
                    </div>

                    {/* Información del Año */}
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className={`text-2xl font-bold transition-colors duration-300 ${
                          currentTheme === 'dark' || currentTheme === 'cosmic' ? 
                          'text-white group-hover:text-gray-300' : 
                          'text-gray-900 group-hover:text-gray-700'
                        }`}>
                          Año {yearData.year}
                        </h2>
                        <div className={`w-2 h-2 rounded-full animate-pulse ${
                          currentTheme === 'ocean' ? 'bg-cyan-400' :
                          currentTheme === 'sunset' ? 'bg-orange-400' :
                          currentTheme === 'forest' ? 'bg-green-400' :
                          currentTheme === 'cosmic' ? 'bg-purple-400' :
                          currentTheme === 'dark' ? 'bg-blue-400' :
                          'bg-green-400'
                        }`}></div>
                      </div>
                      
                      <p className={`mb-6 text-sm leading-relaxed transition-colors duration-300 ${
                        currentTheme === 'dark' || currentTheme === 'cosmic' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {yearData.albumCount} álbum{yearData.albumCount !== 1 ? 'es' : ''} con {yearData.totalImages} momentos especiales
                      </p>
                      
                      {/* Barra de progreso visual */}
                      <div className="mb-4">
                        <div className={`flex justify-between text-xs mb-1 transition-colors duration-300 ${
                          currentTheme === 'dark' || currentTheme === 'cosmic' ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          <span>Memorias</span>
                          <span>{Math.round((yearData.totalImages / 250) * 100)}%</span>
                        </div>
                        <div className={`w-full rounded-full h-2 transition-colors duration-300 ${
                          currentTheme === 'dark' ? 'bg-gray-700' :
                          currentTheme === 'cosmic' ? 'bg-purple-700' :
                          currentTheme === 'ocean' ? 'bg-cyan-200' :
                          currentTheme === 'sunset' ? 'bg-orange-200' :
                          currentTheme === 'forest' ? 'bg-green-200' :
                          'bg-gray-200'
                        }`}>
                          <div 
                            className={`h-2 rounded-full bg-gradient-to-r ${gradient} transition-all duration-1000`}
                            style={{ width: `${Math.min((yearData.totalImages / 250) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Botón de Acceso rediseñado */}
                      <div className="flex items-center justify-between">
                        <div className={`flex items-center transition-colors duration-300 ${
                          currentTheme === 'dark' || currentTheme === 'cosmic' ? 
                          'text-gray-300 group-hover:text-white' : 
                          'text-gray-600 group-hover:text-gray-800'
                        }`}>
                          <svg 
                            className="w-5 h-5 mr-2" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="font-medium">Explorar</span>
                        </div>
                        <svg 
                          className={`w-5 h-5 transform group-hover:translate-x-1 transition-all duration-300 ${
                            currentTheme === 'dark' || currentTheme === 'cosmic' ? 
                            'text-gray-400 group-hover:text-gray-200' : 
                            'text-gray-400 group-hover:text-gray-600'
                          }`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              );
              })}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="text-center mt-16">
          <p className={`transition-colors duration-300 ${
            currentTheme === 'dark' || currentTheme === 'cosmic' ? 'text-gray-400' : 'text-gray-500'
          }`}>
            © 2024 Álbum de Fotos - Creado con Next.js y Tailwind CSS
          </p>
        </footer>
      </div>
    </div>
  );
}
