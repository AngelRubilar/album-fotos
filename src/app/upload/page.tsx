"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/components/Toast";
import { FadeUp } from "@/components/MotionWrap";

function UploadContent() {
  const { t } = useTheme();
  const { addToast } = useToast();
  const searchParams = useSearchParams();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [albums, setAlbums] = useState<any[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<string>('');

  useEffect(() => {
    fetch('/api/albums')
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setAlbums(d.data);
          const albumFromUrl = searchParams.get('album');
          if (albumFromUrl) setSelectedAlbum(albumFromUrl);
        }
      })
      .catch(console.error);
  }, [searchParams]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      const imageFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
      setSelectedFiles(prev => [...prev, ...imageFiles]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const imageFiles = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
      setSelectedFiles(prev => [...prev, ...imageFiles]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;
    if (!selectedAlbum) { addToast('Selecciona un album', 'error'); return; }
    setUploading(true);
    setUploadProgress(0);
    try {
      const BATCH_SIZE = 10;
      let uploadedCount = 0, failedCount = 0;
      for (let i = 0; i < selectedFiles.length; i += BATCH_SIZE) {
        const batch = selectedFiles.slice(i, i + BATCH_SIZE);
        const formData = new FormData();
        batch.forEach(f => formData.append('files', f));
        formData.append('albumId', selectedAlbum);
        try {
          const res = await fetch('/api/upload', { method: 'POST', body: formData });
          const data = await res.json();
          if (data.success) uploadedCount += data.data.length;
          else failedCount += batch.length;
        } catch { failedCount += batch.length; }
        setUploadProgress(Math.round(((i + batch.length) / selectedFiles.length) * 100));
      }
      setUploadProgress(100);
      if (failedCount === 0) {
        addToast(`Se subieron ${uploadedCount} imagen(es)`, 'success');
      } else {
        addToast(`${uploadedCount} subidas, ${failedCount} fallaron`, 'error');
      }
      setSelectedFiles([]);
    } catch { addToast('Error al subir las imagenes', 'error'); }
    finally { setUploading(false); setUploadProgress(0); }
  };

  return (
    <div className={`min-h-screen ${t.gradientBg} transition-colors duration-300`}>
      <div className="max-w-3xl mx-auto px-6 py-8">
        <FadeUp className="mb-8 md:ml-0 ml-10">
          <nav className={`flex items-center gap-1.5 text-sm ${t.textMuted} mb-3`}>
            <Link href="/" className="hover:underline">Inicio</Link>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className={t.text}>Subir Fotos</span>
          </nav>
          <h1 className={`text-2xl font-bold ${t.text}`}>Subir Fotos</h1>
        </FadeUp>

        <div className="space-y-6">
          <div className={`${t.glassCard} rounded-2xl p-6`}>
            <label className={`block text-sm font-medium ${t.text} mb-2`}>Album de destino</label>
            <select value={selectedAlbum} onChange={e => setSelectedAlbum(e.target.value)} className={`w-full px-4 py-3 rounded-xl border ${t.inputBorder} ${t.inputBg} ${t.text} focus:ring-2 focus:ring-blue-500 focus:outline-none`}>
              <option value="">-- Selecciona un album --</option>
              {albums.map(a => <option key={a.id} value={a.id}>{a.year} - {a.title} {a.subAlbum ? `(${a.subAlbum})` : ''}</option>)}
            </select>
          </div>

          <div className={`${t.glassCard} rounded-2xl p-8`} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}>
            <div className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-300 ${dragActive ? 'border-blue-500 bg-blue-500/10 backdrop-blur-sm scale-[1.01]' : t.inputBorder}`}>
              <svg className={`w-12 h-12 mx-auto mb-4 ${t.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className={`font-medium ${t.text} mb-1`}>Arrastra tus fotos aqui</p>
              <p className={`text-sm ${t.textMuted} mb-4`}>o haz clic para seleccionar</p>
              <input type="file" multiple accept="image/*" onChange={handleFileInput} className="hidden" id="file-input" />
              <label htmlFor="file-input" className="inline-flex items-center px-5 py-2.5 btn-glass-accent text-white rounded-xl cursor-pointer text-sm font-medium">Seleccionar Archivos</label>
              <p className={`text-xs ${t.textMuted} mt-4`}>JPG, PNG, GIF, WebP (max 10MB)</p>
            </div>
          </div>

          {selectedFiles.length > 0 && (
            <div className={`${t.glassCard} rounded-2xl p-6`}>
              <div className="flex justify-between items-center mb-3">
                <h3 className={`font-semibold ${t.text}`}>{selectedFiles.length} archivo(s)</h3>
                <button onClick={() => setSelectedFiles([])} className={`text-sm ${t.danger}`}>Limpiar</button>
              </div>
              {/* Barra de tamaño total */}
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-sm ${t.textMuted} whitespace-nowrap`}>
                  {(selectedFiles.reduce((a, f) => a + f.size, 0) / 1024 / 1024).toFixed(1)} MB
                </span>
                <div className={`flex-1 h-1.5 rounded-full ${t.inputBg}`}>
                  <div
                    className={`h-full rounded-full transition-all ${
                      selectedFiles.reduce((a, f) => a + f.size, 0) > 100 * 1024 * 1024 ? 'bg-red-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min((selectedFiles.reduce((a, f) => a + f.size, 0) / (100 * 1024 * 1024)) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedFiles.map((file, i) => (
                  <div key={i} className={`flex items-center justify-between p-3 rounded-xl ${t.inputBg}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="min-w-0">
                        <p className={`text-sm font-medium ${t.text} truncate`}>{file.name}</p>
                        <p className={`text-xs ${t.textMuted}`}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))} className={t.danger}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-black/5 dark:border-white/5">
                <button onClick={() => setSelectedFiles([])} className={`px-5 py-2.5 rounded-xl text-sm font-medium border ${t.inputBorder} ${t.text}`}>Cancelar</button>
                <button onClick={handleUpload} disabled={uploading || !selectedAlbum} className={`px-5 py-2.5 rounded-xl text-sm font-medium text-white ${t.accentBg} disabled:opacity-50`}>
                  {uploading ? 'Subiendo...' : 'Subir Fotos'}
                </button>
              </div>
            </div>
          )}

          {uploading && (
            <div className={`${t.glassCard} rounded-2xl p-6`}>
              <p className={`text-sm font-medium ${t.text} mb-3`}>Subiendo...</p>
              <div className={`w-full ${t.inputBg} rounded-full h-2`}>
                <div className={`${t.accentBg} h-2 rounded-full transition-all duration-300`} style={{ width: `${uploadProgress}%` }} />
              </div>
              <p className={`text-xs ${t.textMuted} mt-2`}>{uploadProgress}%</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-stone-100 dark:bg-neutral-950"><div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-gray-300" /></div>}>
      <UploadContent />
    </Suspense>
  );
}
