'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeSelector from "@/components/ThemeSelector";
import AlbumPreview from "@/components/AlbumPreview";

// Lazy load del componente ImageGallery (solo se carga cuando se abre)
const ImageGallery = dynamic(() => import("@/components/ImageGallery"), {
  loading: () => <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
  </div>,
  ssr: false
});

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
  
  // Estados para la galería de imágenes
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  
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

  // Función para eliminar una imagen
  const deleteImage = async (imageId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta imagen?')) {
      return;
    }

    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: 'DELETE'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Recargar las imágenes del álbum
        if (selectedAlbum) {
          await loadAlbumImages(selectedAlbum);
        }
      } else {
        alert('Error al eliminar la imagen: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Error al eliminar la imagen');
    }
  };

  // Función para abrir la galería
  const openGallery = (imageIndex: number) => {
    setGalleryIndex(imageIndex);
    setGalleryOpen(true);
  };

  // Función para cerrar la galería
  const closeGallery = () => {
    setGalleryOpen(false);
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

        {/* Botones de navegación y descarga */}
        {selectedAlbum && images.length > 0 && (
          <div className="mb-8 flex gap-4">
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

            {/* Botón de Descarga */}
            <button
              onClick={async () => {
                try {
                  const confirmed = confirm(
                    `¿Descargar ${images.length} imágenes en alta calidad?\n\nEsto puede tomar unos momentos.`
                  );

                  if (!confirmed) return;

                  // Descargar ZIP
                  const response = await fetch(`/api/albums/${selectedAlbum}/download`);

                  if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.error || 'Error al descargar');
                  }

                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${selectedAlbumData?.year}_${selectedAlbumData?.title}.zip`;
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);

                  alert('✅ Álbum descargado exitosamente');
                } catch (error) {
                  console.error('Download error:', error);
                  alert(`❌ Error: ${(error as Error).message}`);
                }
              }}
              className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                currentTheme === 'ocean' ? 'bg-green-600 hover:bg-green-700 text-white' :
                currentTheme === 'sunset' ? 'bg-green-600 hover:bg-green-700 text-white' :
                currentTheme === 'forest' ? 'bg-emerald-700 hover:bg-emerald-800 text-white' :
                currentTheme === 'cosmic' ? 'bg-green-600 hover:bg-green-700 text-white' :
                currentTheme === 'dark' ? 'bg-green-600 hover:bg-green-700 text-white' :
                'bg-green-600 hover:bg-green-700 text-white'
              }`}
              title="Descargar todas las imágenes en alta calidad"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Descargar Álbum ({images.length} fotos)
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
                  className={`cursor-pointer rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group ${
                    currentTheme === 'dark' ? 'bg-gray-800' :
                    currentTheme === 'cosmic' ? 'bg-purple-800/80' :
                    currentTheme === 'ocean' ? 'bg-white/80' :
                    currentTheme === 'sunset' ? 'bg-white/80' :
                    currentTheme === 'forest' ? 'bg-white/80' :
                    'bg-white'
                  }`}
                >
                  {/* Previsualización de imágenes */}
                  <div className="p-2">
                    <AlbumPreview 
                      albumId={album.id} 
                      imageCount={album.imageCount}
                      className="group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  {/* Información del álbum */}
                  <div className="p-4">
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
                    
                    {album.description && (
                      <p className={`text-sm mb-3 transition-colors duration-300 ${
                        currentTheme === 'dark' || currentTheme === 'cosmic' ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        {album.description}
                      </p>
                    )}
                    
                    <div className={`flex items-center justify-between text-sm transition-colors duration-300 mb-4 ${
                      currentTheme === 'dark' || currentTheme === 'cosmic' ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <span className="flex items-center gap-1">
                        📸 {album.imageCount} fotos
                      </span>
                      <span className="font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Ver álbum →
                      </span>
                    </div>
                    
                    {/* Botón de subir fotos */}
                    <Link href={`/upload?album=${album.id}`} onClick={(e) => e.stopPropagation()}>
                      <button className={`w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                        currentTheme === 'ocean' ? 'bg-cyan-600 hover:bg-cyan-700 text-white' :
                        currentTheme === 'sunset' ? 'bg-orange-600 hover:bg-orange-700 text-white' :
                        currentTheme === 'forest' ? 'bg-green-600 hover:bg-green-700 text-white' :
                        currentTheme === 'cosmic' ? 'bg-purple-600 hover:bg-purple-700 text-white' :
                        currentTheme === 'dark' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                        'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}>
                        📸 Subir Fotos
                      </button>
                    </Link>
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
                    className={`group relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer ${
                      currentTheme === 'dark' ? 'bg-gray-800' :
                      currentTheme === 'cosmic' ? 'bg-purple-800/80' :
                      'bg-white'
                    }`}
                    onClick={() => openGallery(index)}
                  >
                    <div className="aspect-square relative">
                      <Image
                        src={image.fileUrl || '/placeholder.jpg'}
                        alt={image.originalName || `Foto ${index + 1}`}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                      
                      {/* Overlay de zoom */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      </div>
                      
                      {/* Botón de eliminar */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteImage(image.id);
                        }}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        title="Eliminar imagen"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
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
                      {/* Indicador de clic para ver */}
                      <div className="mt-2 text-xs text-gray-500 group-hover:text-blue-500 transition-colors duration-300">
                        Haz clic para ver en tamaño completo
                      </div>
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
                <Link href={`/upload?album=${selectedAlbum}`} className="mt-6 inline-block">
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

      {/* Galería de imágenes modal */}
      <ImageGallery
        images={images}
        currentIndex={galleryIndex}
        isOpen={galleryOpen}
        onClose={closeGallery}
        onImageChange={setGalleryIndex}
      />
    </div>
  );
}