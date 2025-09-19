"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Album {
  id: string;
  year: number;
  title: string;
  description: string;
  imageCount: number;
  createdAt: string;
}

export default function AdminPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAlbum, setNewAlbum] = useState({
    year: new Date().getFullYear(),
    title: '',
    description: ''
  });

  // Cargar álbumes
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const response = await fetch('/api/albums');
        const data = await response.json();
        if (data.success) {
          setAlbums(data.data);
        }
      } catch (error) {
        console.error('Error fetching albums:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlbums();
  }, []);

  // Crear nuevo álbum
  const handleCreateAlbum = async () => {
    if (!newAlbum.title.trim()) {
      alert('El título es requerido');
      return;
    }

    try {
      const response = await fetch('/api/albums', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAlbum),
      });

      const data = await response.json();
      
      if (data.success) {
        setAlbums(prev => [...prev, data.data]);
        setNewAlbum({ year: new Date().getFullYear(), title: '', description: '' });
        setShowCreateForm(false);
      } else {
        alert(data.error || 'Error al crear álbum');
      }
    } catch (error) {
      console.error('Error creating album:', error);
      alert('Error al crear álbum');
    }
  };

  // Eliminar álbum
  const handleDeleteAlbum = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este álbum?')) {
      return;
    }

    try {
      const response = await fetch(`/api/albums/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        setAlbums(prev => prev.filter(album => album.id !== id));
      } else {
        alert(data.error || 'Error al eliminar álbum');
      }
    } catch (error) {
      console.error('Error deleting album:', error);
      alert('Error al eliminar álbum');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando álbumes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">
                Administrar Álbumes
              </h1>
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
              <span>Administrar</span>
            </li>
          </ol>
        </nav>

        <div className="space-y-8">
          {/* Panel de Administración */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Gestión de Álbumes
              </h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear Nuevo Álbum
              </button>
            </div>

            {/* Formulario de Creación */}
            {showCreateForm && (
              <div className="border-t border-gray-200 pt-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Crear Nuevo Álbum
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Año
                    </label>
                    <input
                      type="number"
                      value={newAlbum.year}
                      onChange={(e) => setNewAlbum(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1900"
                      max="2100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título
                    </label>
                    <input
                      type="text"
                      value={newAlbum.title}
                      onChange={(e) => setNewAlbum(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Ej: Año 2024"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Descripción
                    </label>
                    <input
                      type="text"
                      value={newAlbum.description}
                      onChange={(e) => setNewAlbum(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descripción opcional"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-4 mt-4">
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreateAlbum}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Crear Álbum
                  </button>
                </div>
              </div>
            )}

            {/* Lista de Álbumes */}
            <div className="space-y-4">
              {albums.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📁</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    No hay álbumes creados
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Crea tu primer álbum para empezar a organizar tus fotos.
                  </p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Crear Primer Álbum
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {albums.map((album) => (
                    <div key={album.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {album.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Año {album.year}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteAlbum(album.id)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      {album.description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {album.description}
                        </p>
                      )}
                      
                      <div className="flex justify-between items-center text-sm text-gray-500">
                        <span>{album.imageCount} fotos</span>
                        <span>{new Date(album.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="mt-4">
                        <Link href={`/album/${album.year}`}>
                          <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Ver Álbum
                          </button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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
