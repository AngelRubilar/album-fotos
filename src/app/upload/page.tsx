"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import ThemeSelector from "@/components/ThemeSelector";

export default function UploadPage() {
  const { currentTheme } = useTheme();
  const searchParams = useSearchParams();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [albums, setAlbums] = useState<any[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<string>('');

  // Cargar álbumes disponibles
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await fetch('/api/albums');
        const data = await response.json();
        if (data.success) {
          setAlbums(data.data);
          
          // Si hay un álbum en la URL, seleccionarlo automáticamente
          const albumFromUrl = searchParams.get('album');
          if (albumFromUrl) {
            setSelectedAlbum(albumFromUrl);
          }
        }
      } catch (error) {
        console.error('Error fetching albums:', error);
      }
    };
    fetchAlbums();
  }, [searchParams]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      setSelectedFiles(prev => [...prev, ...imageFiles]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const imageFiles = files.filter(file => file.type.startsWith('image/'));
      setSelectedFiles(prev => [...prev, ...imageFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    if (!selectedAlbum) {
      alert('Por favor selecciona un álbum');
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      
      // Agregar archivos al FormData
      selectedFiles.forEach((file) => {
        formData.append('files', file);
      });
      
      // Agregar ID del álbum seleccionado
      formData.append('albumId', selectedAlbum);
      
      // Simular progreso
      for (let i = 0; i <= 90; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(i);
      }
      
      // Subir archivos
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUploadProgress(100);
        alert(`¡Éxito! Se subieron ${data.data.length} imagen(es).`);
        setSelectedFiles([]);
      } else {
        alert(`Error: ${data.error}`);
      }
      
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error al subir las imágenes');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

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
                Subir Fotos
              </h1>
            </div>
            {/* Selector de tema */}
            <div className="absolute top-6 right-6">
              <ThemeSelector />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <span>Subir Fotos</span>
            </li>
          </ol>
        </nav>

        <div className="space-y-8">
          {/* Área de Subida */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Subir Nuevas Fotos
            </h2>
            
            {/* Selector de Álbum */}
            <div className="mb-6">
              <label htmlFor="album-select" className="block text-sm font-medium text-gray-700 mb-2">
                Seleccionar Álbum
              </label>
              <select
                id="album-select"
                value={selectedAlbum}
                onChange={(e) => setSelectedAlbum(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Selecciona un álbum --</option>
                {albums.map((album) => (
                  <option key={album.id} value={album.id}>
                    {album.year} - {album.title} {album.subAlbum ? `(${album.subAlbum})` : ''}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Drag & Drop Area */}
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-4">
                <div className="text-6xl text-gray-400">📷</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Arrastra tus fotos aquí
                  </h3>
                  <p className="text-gray-600 mb-4">
                    O haz clic para seleccionar archivos
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInput}
                    className="hidden"
                    id="file-input"
                  />
                  <label
                    htmlFor="file-input"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Seleccionar Archivos
                  </label>
                </div>
                <p className="text-sm text-gray-500">
                  Formatos soportados: JPG, PNG, GIF, WebP (máximo 10MB por archivo)
                </p>
              </div>
            </div>
          </div>

          {/* Archivos Seleccionados */}
          {selectedFiles.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Archivos Seleccionados ({selectedFiles.length})
                </h3>
                <button
                  onClick={() => setSelectedFiles([])}
                  className="text-sm text-red-600 hover:text-red-700 transition-colors"
                >
                  Limpiar Todo
                </button>
              </div>
              
              <div className="space-y-3">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-700 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Configuración de Álbum */}
          {/* Información del Álbum Seleccionado */}
          {selectedFiles.length > 0 && selectedAlbum && (
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                📁 Álbum de Destino
              </h3>
              <p className="text-blue-800">
                {albums.find(album => album.id === selectedAlbum)?.year} - {albums.find(album => album.id === selectedAlbum)?.title}
                {albums.find(album => album.id === selectedAlbum)?.subAlbum && ` (${albums.find(album => album.id === selectedAlbum)?.subAlbum})`}
              </p>
            </div>
          )}

          {/* Botones de Acción */}
          {selectedFiles.length > 0 && (
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setSelectedFiles([])}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {uploading ? 'Subiendo...' : 'Subir Fotos'}
              </button>
            </div>
          )}

          {/* Barra de Progreso */}
          {uploading && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Subiendo Fotos...
              </h3>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {uploadProgress}% completado
              </p>
            </div>
          )}
        </div>
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
