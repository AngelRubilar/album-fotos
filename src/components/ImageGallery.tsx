'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import Image from 'next/image';

interface ImageData {
  id: string;
  fileUrl: string;
  thumbnailUrl?: string;
  originalName: string;
  description?: string;
  width?: number;
  height?: number;
  fileSize?: number;
  mimeType?: string;
  uploadedAt?: string;
}

interface ImageGalleryProps {
  images: ImageData[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onImageChange?: (index: number) => void;
  onImageUpdate?: (id: string, data: Partial<ImageData>) => void;
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return 'Desconocido';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return 'Desconocido';
  return new Date(dateStr).toLocaleDateString('es-CL', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  });
}

const ImageGallery = memo(function ImageGallery({ images, currentIndex, isOpen, onClose, onImageChange, onImageUpdate }: ImageGalleryProps) {
  const [idx, setIdx] = useState(currentIndex);
  const [loading, setLoading] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const [editingDesc, setEditingDesc] = useState(false);
  const [descValue, setDescValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { setIdx(currentIndex); }, [currentIndex]);
  useEffect(() => { setShowInfo(false); setEditingDesc(false); }, [idx]);

  const go = useCallback((dir: -1 | 1) => {
    const next = dir === -1
      ? (idx > 0 ? idx - 1 : images.length - 1)
      : (idx < images.length - 1 ? idx + 1 : 0);
    setIdx(next);
    onImageChange?.(next);
    setLoading(true);
  }, [idx, images.length, onImageChange]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (editingDesc) return;
      if (e.key === 'Escape') { if (showInfo) setShowInfo(false); else onClose(); }
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'i') setShowInfo(p => !p);
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, go, showInfo, editingDesc]);

  const saveDescription = async () => {
    const img = images[idx];
    if (!img) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/images/${img.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: descValue }),
      });
      const data = await res.json();
      if (data.success) {
        onImageUpdate?.(img.id, { description: descValue });
        setEditingDesc(false);
      }
    } catch { /* skip */ }
    finally { setSaving(false); }
  };

  if (!isOpen || !images.length) return null;

  const img = images[idx];

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-2xl" onClick={() => { if (showInfo) setShowInfo(false); else onClose(); }} />

      <div className="relative w-full h-full flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-4 relative z-10 bg-black/20 backdrop-blur-md">
          <div>
            <p className="text-white text-sm font-medium truncate max-w-[280px]">{img.originalName}</p>
            <p className="text-white/40 text-xs">{idx + 1} / {images.length}</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Info button */}
            <button
              onClick={() => setShowInfo(p => !p)}
              className={`p-2 rounded-xl transition-all duration-200 ${showInfo ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg shadow-white/5' : 'hover:bg-white/10 text-white/60 hover:text-white'}`}
              title="Info (I)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            {/* Close button */}
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white/60 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1 relative flex">
          {/* Image */}
          <div className={`flex-1 relative flex items-center justify-center px-16 transition-all duration-300 ${showInfo ? 'pr-4' : ''}`}>
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-white/30" />
              </div>
            )}
            <Image
              src={img.fileUrl}
              alt={img.originalName}
              width={1400}
              height={900}
              className={`max-w-full max-h-[75vh] object-contain transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}
              onLoad={() => setLoading(false)}
              priority
            />
            {images.length > 1 && (
              <>
                <button onClick={() => go(-1)} className="absolute left-4 p-3 rounded-2xl bg-black/20 backdrop-blur-md hover:bg-white/10 transition-all text-white/50 hover:text-white border border-white/[0.06]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button onClick={() => go(1)} className="absolute right-4 p-3 rounded-2xl bg-black/20 backdrop-blur-md hover:bg-white/10 transition-all text-white/50 hover:text-white border border-white/[0.06]">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Info panel */}
          {showInfo && (
            <div className="w-80 bg-white/[0.06] backdrop-blur-2xl border-l border-white/[0.1] overflow-y-auto relative z-10">
              <div className="p-5 space-y-5">
                <h3 className="text-white font-semibold text-sm">Informacion</h3>

                {/* Metadata grid */}
                <div className="space-y-3">
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Nombre</p>
                    <p className="text-white/90 text-sm break-all">{img.originalName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Tamano</p>
                      <p className="text-white/90 text-sm">{formatFileSize(img.fileSize)}</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Tipo</p>
                      <p className="text-white/90 text-sm">{img.mimeType || 'Desconocido'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Dimensiones</p>
                      <p className="text-white/90 text-sm">{img.width && img.height ? `${img.width} x ${img.height}` : 'Desconocido'}</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Fecha</p>
                      <p className="text-white/90 text-sm">{formatDate(img.uploadedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/40 text-xs uppercase tracking-wider">Descripcion</p>
                    {!editingDesc && (
                      <button
                        onClick={() => { setDescValue(img.description || ''); setEditingDesc(true); }}
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        {img.description ? 'Editar' : 'Agregar'}
                      </button>
                    )}
                  </div>
                  {editingDesc ? (
                    <div className="space-y-2">
                      <textarea
                        value={descValue}
                        onChange={e => setDescValue(e.target.value)}
                        placeholder="Escribe una descripcion..."
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 resize-none"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditingDesc(false)} className="text-xs text-white/50 hover:text-white/70 px-3 py-1.5 rounded-lg">
                          Cancelar
                        </button>
                        <button onClick={saveDescription} disabled={saving} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-500 disabled:opacity-50">
                          {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/70 text-sm">
                      {img.description || <span className="text-white/30 italic">Sin descripcion</span>}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom - thumbnail strip */}
        <div className="px-5 py-4 relative z-10 bg-black/20 backdrop-blur-md">
          {!showInfo && img.description && <p className="text-center text-white/70 text-sm mb-3">{img.description}</p>}
          {images.length > 1 && (
            <div className="flex justify-center gap-1.5 overflow-x-auto thumbnail-scroll py-1 max-w-2xl mx-auto">
              {images.map((image, i) => (
                <button
                  key={image.id}
                  onClick={() => { setIdx(i); onImageChange?.(i); setLoading(true); }}
                  className={`flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden transition-all duration-200 ${
                    i === idx ? 'ring-2 ring-white scale-110' : 'opacity-40 hover:opacity-70'
                  }`}
                >
                  <Image src={image.thumbnailUrl || image.fileUrl} alt="" width={48} height={48} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {images.length > 1 && <p className="text-center text-white/20 text-xs mt-2">← → navegar · I info · ESC cerrar</p>}
        </div>
      </div>
    </div>
  );
});

export default ImageGallery;
