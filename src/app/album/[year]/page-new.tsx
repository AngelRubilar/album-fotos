'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeSelector from "@/components/ThemeSelector";

interface AlbumPageProps {
  params: Promise<{ year: string }>;
}

export default function AlbumPage({ params }: AlbumPageProps) {
  const { currentTheme } = useTheme();
  const [year, setYear] = useState<string>('');
  const [images, setImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subAlbums, setSubAlbums] = useState<any[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [selectedAlbumData, setSelectedAlbumData] = useState<any>(null);
  
  // Resolver el parámetro year
  useEffect(() => {
    params.then(({ year }) => setYear(year));
  }, [params]);

  // Función para cargar imágenes de un álbum específico
  const loadAlbumImages = async (albumId: string) => {
    try {
      const response = await fetch(`/api/albums/${albumId}/images`);
      const data = await response.json();
      
      if (data.success) {
        setSelectedAlbum(albumId);
        setSelectedAlbumData(data.data.album);
        setImages(data.data.images);
      }
    } catch (error) {
      console.error('Error loading album images:', error);
    }
  };

  // Cargar álbumes cuando cambie el año
  useEffect(() => {
    if (year) {
      const fetchAlbums = async () => {
        try {
          // Cargar álbumes del año
          const albumsResponse = await fetch(`/api/albums/year/${year}`);
          const albumsData = await albumsResponse.json();
          
          if (albumsData.success) {
            setSubAlbums(albumsData.data);
            // Limpiar selección de álbum
            setSelectedAlbum(null);
            setSelectedAlbumData(null);
            setImages([]);
          }
        } catch (error) {
          console.error('Error fetching albums:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchAlbums();
    }
  }, [year]);

  if (!year) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all duration-500 ${
        currentTheme === 'ocean' ? 'bg-gradient-to-br from-cyan-50 to-blue-100' :
        currentTheme === 'sunset' ? 'bg-gradient-to-br from-orange-50 to-red-100' :
        currentTheme === 'forest' ? 'bg-gradient-to-br from-green-50 to-emerald-100' :
        currentTheme === 'cosmic' ? 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900' :
        currentTheme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' :
        'bg-gradient-to-br from-gray-50 to-gray-100'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`text-lg transition-colors duration-300 ${
            currentTheme === 'dark' || currentTheme === 'cosmic' ? 'text-white' : 'text-gray-700'
          }`}>
            Cargando álbum...
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-all duration-500 ${
        currentTheme === 'ocean' ? 'bg-gradient-to-br from-cyan-50 to-blue-100' :
        currentTheme === 'sunset' ? 'bg-gradient-to-br from-orange-50 to-red-100' :
        currentTheme === 'forest' ? 'bg-gradient-to-br from-green-50 to-emerald-100' :
        currentTheme === 'cosmic' ? 'bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900' :
        currentTheme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' :
        'bg-gradient-to-br from-gray-50 to-gray-100'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`text-lg transition-colors duration-300 ${
            currentTheme === 'dark' || currentTheme === 'cosmic' ? 'text-white' : 'text-gray-700'
          }`}>
            Cargando álbumes...
          </p>
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
      currentTheme === 'dark' ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' :
      'bg-gradient-to-br from-gray-50 to-gray-100'
    }`}>
      {/* Header */}
      <header className="relative py-8 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/" className={`text-2xl font-bold transition-colors duration-300 hover:opacity-80 ${
              currentTheme === 'dark' || currentTheme === 'cosmic' ? 'text-white' : 'text-gray-900'
            }`}>
              ← Volver
            </Link>
          </div>
          <ThemeSelector />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-12">
        {/* Título del Año */}
        <div className="text-center mb-12">
          <h1 className={`text-5xl font-bold mb-4 transition-colors duration-300 ${
            currentTheme === 'dark' || currentTheme === 'cosmic' ? 'text-white' : 'text-gray-900'
          }`}>
            Año {year}
          </h1>
          <p className={`text-xl transition-colors duration-300 ${
            currentTheme === 'dark' || currentTheme === 'cosmic' ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {selectedAlbum ? `Álbum: ${selectedAlbumData?.title}` : 'Selecciona un álbum para ver las fotos'}
          </p>
        </div>

        {/* Botón de volver si hay un álbum seleccionado */}
        {selectedAlbum && (
          <div className="mb-8">
            <button
              onClick={() => {
                setSelectedAlbum(null);
                setSelectedAlbumData(null);
                setImages([]);
              }}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                currentTheme === 'ocean' ? 'bg-cyan-600 hover:bg-cyan-700 text-white' :
                currentTheme === 'sunset' ? 'bg-orange-600 hover:bg-orange-700 text-white' :
                currentTheme === 'forest' ? 'bg-green-600 hover:bg-green-700 text-white' :
                currentTheme === 'cosmic' ? 'bg-purple-600 hover:bg-purple-700 text-white' :
                currentTheme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              ← Ver todos los álbumes
            </button>
          </div>
        )}

        {/* Lista de Subálbumes */}
        {!selectedAlbum && subAlbums.length > 0 && (
          <div className="mb-12">
            <h3 className={`text-2xl font-bold mb-6 transition-colors duration-300 ${
              currentTheme === 'dark' || currentTheme === 'cosmic' ? 'text-white' : 'text-gray-900'
            }`}>
              Álbumes del {year}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {subAlbums.map((album) => (
                <div
                  key={album.id}
                  onClick={() => loadAlbumImages(album.id)}
                  className={`cursor-pointer rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden ${
                    currentTheme === 'dark' ? 'bg-gray-800' :
                    currentTheme === 'cosmic' ? 'bg-purple-800/80' :
                    currentTheme === 'ocean' ? 'bg-white/80' :
                    currentTheme === 'sunset' ? 'bg-white/80' :
                    currentTheme === 'forest' ? 'bg-white/80' :
                    'bg-white'
                  }`}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className={`text-lg font-bold transition-colors duration-300 ${
                        currentTheme === 'dark' || currentTheme === 'cosmic' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {album.title}
                      </h4>
                      {album.subAlbum && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium transition-colors duration-300 ${
                          currentTheme === 'ocean' ? 'bg-cyan-100 text-cyan-800' :
                          currentTheme === 'sunset' ? 'bg-orange-100 text-orange-800' :
                          currentTheme === 'forest' ? 'bg-green-100 text-green-800' :
                          currentTheme === 'cosmic' ? 'bg-purple-100 text-purple-800' :
                          currentTheme === 'dark' ? 'bg-gray-700 text-gray-300' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {album.subAlbum}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm mb-4 transition-colors duration-300 ${
                      currentTheme === 'dark' || currentTheme === 'cosmic' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {album.description}
                    </p>
                    <div className={`flex items-center justify-between text-sm transition-colors duration-300 ${
                      currentTheme === 'dark' || currentTheme === 'cosmic' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <span>{album.imageCount} fotos</span>
                      <span className="font-medium">
                        Ver álbum →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Galería de Imágenes */}
        {selectedAlbum && (
          <div>
            <h3 className={`text-2xl font-bold mb-6 transition-colors duration-300 ${
              currentTheme === 'dark' || currentTheme === 'cosmic' ? 'text-white' : 'text-gray-900'
            }`}>
              {selectedAlbumData?.title}
            </h3>
            
            {images.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className={`group relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 ${
                      currentTheme === 'dark' ? 'bg-gray-800' :
                      currentTheme === 'cosmic' ? 'bg-purple-800/80' :
                      'bg-white'
                    }`}
                  >
                    <div className="aspect-square relative">
                      <Image
                        src={image.fileUrl || '/placeholder.jpg'}
                        alt={image.originalName || `Foto ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className={`font-semibold mb-2 transition-colors duration-300 ${
                        currentTheme === 'dark' || currentTheme === 'cosmic' ? 'text-white' : 'text-gray-900'
                      }`}>
                        {image.originalName || `Foto ${index + 1}`}
                      </h4>
                      {image.description && (
                        <p className={`text-sm transition-colors duration-300 ${
                          currentTheme === 'dark' || currentTheme === 'cosmic' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {image.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">📸</div>
                <h3 className={`text-2xl font-bold mb-3 transition-colors duration-300 ${
                  currentTheme === 'dark' || currentTheme === 'cosmic' ? 'text-white' : 'text-gray-900'
                }`}>
                  No hay fotos en este álbum
                </h3>
                <p className={`text-lg transition-colors duration-300 ${
                  currentTheme === 'dark' || currentTheme === 'cosmic' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Sube algunas fotos para empezar a llenar este álbum.
                </p>
                <Link href="/upload" className="mt-6 inline-block">
                  <button className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                    currentTheme === 'ocean' ? 'bg-cyan-600 hover:bg-cyan-700 text-white' :
                    currentTheme === 'sunset' ? 'bg-orange-600 hover:bg-orange-700 text-white' :
                    currentTheme === 'forest' ? 'bg-green-600 hover:bg-green-700 text-white' :
                    currentTheme === 'cosmic' ? 'bg-purple-600 hover:bg-purple-700 text-white' :
                    currentTheme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                    'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}>
                    Subir Fotos
                  </button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Mensaje si no hay álbumes */}
        {!selectedAlbum && subAlbums.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📁</div>
            <h3 className={`text-2xl font-bold mb-3 transition-colors duration-300 ${
              currentTheme === 'dark' || currentTheme === 'cosmic' ? 'text-white' : 'text-gray-900'
            }`}>
              No hay álbumes para {year}
            </h3>
            <p className={`text-lg mb-6 transition-colors duration-300 ${
              currentTheme === 'dark' || currentTheme === 'cosmic' ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Crea algunos álbumes para organizar tus fotos de este año.
            </p>
            <Link href="/admin">
              <button className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                currentTheme === 'ocean' ? 'bg-cyan-600 hover:bg-cyan-700 text-white' :
                currentTheme === 'sunset' ? 'bg-orange-600 hover:bg-orange-700 text-white' :
                currentTheme === 'forest' ? 'bg-green-600 hover:bg-green-700 text-white' :
                currentTheme === 'cosmic' ? 'bg-purple-600 hover:bg-purple-700 text-white' :
                currentTheme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                'bg-blue-600 hover:bg-blue-700 text-white'
              }`}>
                Crear Álbumes
              </button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
