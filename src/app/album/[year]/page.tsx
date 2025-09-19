'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeSelector from "@/components/ThemeSelector";

interface AlbumPageProps {
  params: Promise<{
    year: string;
  }>;
}

// Datos de ejemplo para las imágenes
const images = [
  { 
    id: "1", 
    url: "/placeholder-1.jpg", 
    title: "Foto 1", 
    description: "Descripción de la foto 1",
    width: 800,
    height: 600
  },
  { 
    id: "2", 
    url: "/placeholder-2.jpg", 
    title: "Foto 2", 
    description: "Descripción de la foto 2",
    width: 1200,
    height: 800
  },
  { 
    id: "3", 
    url: "/placeholder-3.jpg", 
    title: "Foto 3", 
    description: "Descripción de la foto 3",
    width: 600,
    height: 900
  },
  { 
    id: "4", 
    url: "/placeholder-4.jpg", 
    title: "Foto 4", 
    description: "Descripción de la foto 4",
    width: 1000,
    height: 750
  },
  { 
    id: "5", 
    url: "/placeholder-5.jpg", 
    title: "Foto 5", 
    description: "Descripción de la foto 5",
    width: 800,
    height: 1200
  },
  { 
    id: "6", 
    url: "/placeholder-6.jpg", 
    title: "Foto 6", 
    description: "Descripción de la foto 6",
    width: 900,
    height: 600
  },
];

export default function AlbumPage({ params }: AlbumPageProps) {
  const { currentTheme } = useTheme();
  const [year, setYear] = useState<string>('');
  
  // Resolver el parámetro year
  useEffect(() => {
    params.then(({ year }) => setYear(year));
  }, [params]);

  if (!year) {
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
          }`}>Cargando álbum...</p>
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
      {/* Header */}
      <header className={`shadow-sm border-b transition-all duration-300 ${
        currentTheme === 'dark' ? 'bg-gray-800 border-gray-700' :
        currentTheme === 'cosmic' ? 'bg-purple-800/80 border-purple-600' :
        currentTheme === 'ocean' ? 'bg-white/80 border-cyan-200' :
        currentTheme === 'sunset' ? 'bg-white/80 border-orange-200' :
        currentTheme === 'forest' ? 'bg-white/80 border-green-200' :
        'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/" className={`flex items-center transition-colors duration-300 ${
                currentTheme === 'dark' || currentTheme === 'cosmic' ? 
                'text-gray-300 hover:text-white' : 
                'text-gray-600 hover:text-gray-900'
              }`}>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver
              </Link>
              <div className={`h-6 w-px transition-colors duration-300 ${
                currentTheme === 'dark' ? 'bg-gray-600' :
                currentTheme === 'cosmic' ? 'bg-purple-400' :
                'bg-gray-300'
              }`} />
              <h1 className={`text-xl font-semibold transition-colors duration-300 ${
                currentTheme === 'dark' || currentTheme === 'cosmic' ? 'text-white' : 'text-gray-900'
              }`}>
                Álbum {year}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/upload">
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Subir Fotos
                </button>
              </Link>
              {/* Selector de tema */}
              <ThemeSelector />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumbs */}
        <nav className="mb-8 text-sm font-medium text-gray-500">
          <ol className="list-none p-0 inline-flex">
            <li className="flex items-center">
              <Link href="/" className="text-blue-600 hover:underline">
                Álbumes
              </Link>
              <svg className="fill-current w-3 h-3 mx-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                <path d="M285.476 272.971L91.132 467.314c-9.373 9.373-24.569 9.373-33.941 0l-22.667-22.667c-9.357-9.357-9.375-24.522-.04-33.901L188.505 256 34.488 101.255c-9.335-9.379-9.317-24.544.04-33.901l22.667-22.667c9.373-9.373 24.569-9.373 33.941 0L285.475 239.03c9.373 9.372 9.373 24.568.001 33.941z"/>
              </svg>
            </li>
            <li>
              <span>{year}</span>
            </li>
          </ol>
        </nav>

        {/* Galería Masonry */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Fotos de {year}
          </h2>
          
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
            {images.map((image) => (
              <div
                key={image.id}
                className="break-inside-avoid mb-6"
              >
                <Link href={`/image/${image.id}`} className="group block">
                  <div className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden">
                    {/* Imagen */}
                    <div className="relative overflow-hidden">
                      <Image
                        src={image.url}
                        alt={image.title}
                        width={image.width}
                        height={image.height}
                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      
                      {/* Overlay de información */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <h3 className="text-lg font-semibold mb-1 line-clamp-1">
                            {image.title}
                          </h3>
                          <p className="text-sm line-clamp-2 opacity-90">
                            {image.description}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Información de la Imagen */}
                    <div className="p-4">
                      <h3 className="text-md font-bold text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors duration-300">
                        {image.title}
                      </h3>
                      <p className="text-sm text-gray-600 truncate mb-2">
                        {image.description}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{image.width}x{image.height} px</span>
                        <span>Ver detalles</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Mensaje si no hay imágenes */}
        {images.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📷</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              ¡Este álbum está vacío!
            </h3>
            <p className="text-lg text-gray-600 mb-6">
              Sube algunas fotos para empezar a llenarlo.
            </p>
            <Link href="/upload">
              <button className="px-8 py-4 bg-blue-600 text-white rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl hover:bg-blue-700 transition-all duration-300">
                Subir Fotos
              </button>
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-600 mb-2">
              © 2024 Álbum de Fotos - Creado con Next.js y Tailwind CSS
            </p>
            <p className="text-xs text-gray-500">
              Organiza tus recuerdos de manera inteligente
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
