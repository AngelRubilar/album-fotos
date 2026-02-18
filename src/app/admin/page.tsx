"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/Toast";
import LoginModal from "@/components/LoginModal";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/MotionWrap";

interface Album {
  id: string;
  year: number;
  title: string;
  description: string;
  subAlbum?: string;
  imageCount: number;
  createdAt: string;
}

export default function AdminPage() {
  const { t } = useTheme();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const router = useRouter();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newAlbum, setNewAlbum] = useState({ year: new Date().getFullYear(), title: '', description: '', subAlbum: '' });

  useEffect(() => {
    fetch('/api/albums')
      .then(r => r.json())
      .then(d => { if (d.success) setAlbums(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const createAlbum = async () => {
    if (!newAlbum.title.trim()) { addToast('El titulo es requerido', 'error'); return; }
    try {
      const res = await fetch('/api/albums', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newAlbum) });
      const data = await res.json();
      if (data.success) {
        setAlbums(prev => [...prev, data.data]);
        setNewAlbum({ year: new Date().getFullYear(), title: '', description: '', subAlbum: '' });
        setShowForm(false);
        addToast('Album creado exitosamente', 'success');
      } else { addToast(data.error || 'Error', 'error'); }
    } catch { addToast('Error al crear album', 'error'); }
  };

  const deleteAlbum = async (id: string) => {
    if (!confirm('Eliminar este album y todas sus fotos?')) return;
    try {
      const res = await fetch(`/api/albums/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAlbums(prev => prev.filter(a => a.id !== id));
        addToast('Album eliminado', 'success');
      } else { addToast(data.error || 'Error', 'error'); }
    } catch { addToast('Error al eliminar', 'error'); }
  };

  if (!isAuthenticated) {
    return <LoginModal onSuccess={() => {}} onCancel={() => router.push('/')} />;
  }

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${t.gradientBg}`}>
        <div className={`animate-spin rounded-full h-8 w-8 border-2 border-t-transparent ${t.border}`} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${t.gradientBg} transition-colors duration-300`}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <FadeUp className="mb-8 md:ml-0 ml-10">
          <nav className={`flex items-center gap-1.5 text-sm ${t.textMuted} mb-3`}>
            <Link href="/" className="hover:underline">Inicio</Link>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className={t.text}>Administrar</span>
          </nav>
          <div className="flex items-center justify-between">
            <h1 className={`text-2xl font-bold ${t.text}`}>Administrar Albumes</h1>
            <button onClick={() => setShowForm(!showForm)} className="px-4 py-2 rounded-xl text-sm font-medium text-white btn-glass-accent">
              {showForm ? 'Cancelar' : 'Crear Album'}
            </button>
          </div>
        </FadeUp>

        {showForm && (
          <div className={`${t.glassCard} rounded-2xl p-6 mb-6`}>
            <h3 className={`font-semibold ${t.text} mb-4`}>Nuevo Album</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm ${t.textMuted} mb-1`}>Ano</label>
                <input type="number" value={newAlbum.year} onChange={e => setNewAlbum(prev => ({ ...prev, year: parseInt(e.target.value) }))} className={`w-full px-3 py-2.5 rounded-xl border ${t.inputBorder} ${t.inputBg} ${t.text} focus:ring-2 focus:ring-blue-500 focus:outline-none`} />
              </div>
              <div>
                <label className={`block text-sm ${t.textMuted} mb-1`}>Titulo</label>
                <input type="text" value={newAlbum.title} onChange={e => setNewAlbum(prev => ({ ...prev, title: e.target.value }))} placeholder="Ej: Vacaciones" className={`w-full px-3 py-2.5 rounded-xl border ${t.inputBorder} ${t.inputBg} ${t.text} focus:ring-2 focus:ring-blue-500 focus:outline-none`} />
              </div>
              <div>
                <label className={`block text-sm ${t.textMuted} mb-1`}>Categoria</label>
                <input type="text" value={newAlbum.subAlbum} onChange={e => setNewAlbum(prev => ({ ...prev, subAlbum: e.target.value }))} placeholder="Ej: Viajes" className={`w-full px-3 py-2.5 rounded-xl border ${t.inputBorder} ${t.inputBg} ${t.text} focus:ring-2 focus:ring-blue-500 focus:outline-none`} />
              </div>
              <div>
                <label className={`block text-sm ${t.textMuted} mb-1`}>Descripcion</label>
                <input type="text" value={newAlbum.description} onChange={e => setNewAlbum(prev => ({ ...prev, description: e.target.value }))} placeholder="Opcional" className={`w-full px-3 py-2.5 rounded-xl border ${t.inputBorder} ${t.inputBg} ${t.text} focus:ring-2 focus:ring-blue-500 focus:outline-none`} />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={createAlbum} className="px-5 py-2.5 rounded-xl text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors">Crear</button>
            </div>
          </div>
        )}

        {albums.length === 0 ? (
          <div className="text-center py-20">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl ${t.glassCard} mb-6`}>
              <svg className={`w-10 h-10 ${t.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className={`text-lg font-semibold ${t.text} mb-2`}>Sin albumes</h3>
            <p className={`${t.textMuted} mb-5`}>Crea tu primer album para empezar.</p>
            <button onClick={() => setShowForm(true)} className="px-5 py-2 rounded-xl text-white font-medium btn-glass-accent">Crear Album</button>
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {albums.map(album => (
              <StaggerItem key={album.id} className={`${t.glassCard} rounded-2xl p-5`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`font-semibold ${t.text}`}>{album.title}</h3>
                      {album.subAlbum && <span className={`text-xs px-2 py-0.5 rounded-full ${t.inputBg} ${t.textMuted}`}>{album.subAlbum}</span>}
                    </div>
                    <p className={`text-sm ${t.textMuted}`}>Ano {album.year}</p>
                  </div>
                  <button onClick={() => deleteAlbum(album.id)} className={t.danger}>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
                {album.description && <p className={`text-sm ${t.textMuted} mb-3`}>{album.description}</p>}
                <div className={`flex items-center justify-between text-sm ${t.textMuted} mb-4`}>
                  <span>{album.imageCount} fotos</span>
                  <span>{new Date(album.createdAt).toLocaleDateString()}</span>
                </div>
                <Link href={`/album/${album.year}`}>
                  <button className="w-full px-4 py-2 rounded-xl text-sm font-medium text-white btn-glass-accent">Ver Album</button>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
