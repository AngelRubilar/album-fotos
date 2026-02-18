'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/components/Toast";
import AlbumPreview from "@/components/AlbumPreview";
import SearchBar from "@/components/SearchBar";
import { Skeleton, AlbumCardSkeleton } from "@/components/Skeleton";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/MotionWrap";

const ImageGallery = dynamic(() => import("@/components/ImageGallery"), {
  loading: () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-white/40" />
    </div>
  ),
  ssr: false,
});

type LayoutMode = 'masonry' | 'grid';
const PAGE_SIZE = 50;

export default function AlbumPage({ params }: { params: Promise<{ year: string }> }) {
  const { t } = useTheme();
  const { addToast } = useToast();
  const [year, setYear] = useState('');
  const [images, setImages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [subAlbums, setSubAlbums] = useState<any[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
  const [selectedAlbumData, setSelectedAlbumData] = useState<any>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('masonry');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [totalImages, setTotalImages] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('album-layout') as LayoutMode;
    if (saved === 'masonry' || saved === 'grid') setLayoutMode(saved);
  }, []);

  const toggleLayout = (mode: LayoutMode) => {
    setLayoutMode(mode);
    localStorage.setItem('album-layout', mode);
  };

  useEffect(() => { params.then(({ year }) => setYear(year)); }, [params]);

  const loadAlbumImages = useCallback(async (albumId: string, page: number = 1, append: boolean = false) => {
    if (page > 1) setLoadingMore(true);
    try {
      const res = await fetch(`/api/albums/${albumId}/images?page=${page}&limit=${PAGE_SIZE}`);
      const data = await res.json();
      if (data.success) {
        if (!append) {
          setSelectedAlbum(albumId);
          setSelectedAlbumData(data.data.album);
          setImages(data.data.images);
        } else {
          setImages(prev => [...prev, ...data.data.images]);
        }
        setCurrentPage(data.data.pagination.page);
        setHasMore(data.data.pagination.hasMore);
        setTotalImages(data.data.pagination.total);
      }
    } catch (e) { console.error(e); }
    finally { setLoadingMore(false); }
  }, []);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore || !selectedAlbum) return;
    loadAlbumImages(selectedAlbum, currentPage + 1, true);
  }, [loadingMore, hasMore, selectedAlbum, currentPage, loadAlbumImages]);

  // Infinite scroll observer
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || !selectedAlbum) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: '400px' }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, selectedAlbum, loadMore]);

  const deleteImage = async (imageId: string) => {
    if (!confirm('Eliminar esta imagen?')) return;
    try {
      const res = await fetch(`/api/images/${imageId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setImages(prev => prev.filter(img => img.id !== imageId));
        setTotalImages(prev => prev - 1);
        addToast('Imagen eliminada', 'success');
      } else {
        addToast('Error: ' + data.error, 'error');
      }
    } catch { addToast('Error al eliminar', 'error'); }
  };

  useEffect(() => {
    if (!year) return;
    fetch(`/api/albums/year/${year}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setSubAlbums(d.data);
          setSelectedAlbum(null);
          setSelectedAlbumData(null);
          setImages([]);
          setHasMore(false);
          setTotalImages(0);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year]);

  const filteredAlbums = useMemo(() =>
    subAlbums.filter(a =>
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [subAlbums, searchQuery]
  );

  if (!year || loading) {
    return (
      <div className={`min-h-screen ${t.gradientBg}`}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <Skeleton className="h-4 w-32 mb-3" />
            <Skeleton className="h-7 w-24" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <AlbumCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${t.gradientBg} transition-colors duration-300`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Breadcrumb + Title */}
        <FadeUp className="mb-8 md:ml-0 ml-10">
          <nav className={`flex items-center gap-1.5 text-sm ${t.textMuted} mb-3`}>
            <Link href="/" className="hover:underline">Inicio</Link>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {selectedAlbum ? (
              <>
                <button onClick={() => { setSelectedAlbum(null); setImages([]); setHasMore(false); }} className="hover:underline">{year}</button>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className={t.text}>{selectedAlbumData?.title}</span>
              </>
            ) : (
              <span className={t.text}>{year}</span>
            )}
          </nav>
          <h1 className={`text-2xl font-bold ${t.text}`}>
            {selectedAlbum ? selectedAlbumData?.title : year}
          </h1>
          {selectedAlbum && selectedAlbumData?.description && (
            <p className={`text-sm ${t.textMuted} mt-1`}>{selectedAlbumData.description}</p>
          )}
        </FadeUp>

        {/* Album tabs */}
        {selectedAlbum && subAlbums.length > 1 && (
          <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 thumbnail-scroll">
            {subAlbums.map((album) => (
              <button
                key={album.id}
                onClick={() => loadAlbumImages(album.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  selectedAlbum === album.id
                    ? 'btn-glass-accent text-white'
                    : `${t.glassBg} border border-white/10 ${t.textMuted} hover:bg-white/10`
                }`}
              >
                {album.title}
              </button>
            ))}
          </div>
        )}

        {/* Action bar */}
        {selectedAlbum && images.length > 0 && (
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className={`text-sm ${t.textMuted}`}>{totalImages} fotos</span>
              <span className={`text-sm ${t.textMuted}`}>&middot;</span>
              <button
                onClick={async () => {
                  if (!confirm(`Descargar ${totalImages} imagenes?`)) return;
                  try {
                    const res = await fetch(`/api/albums/${selectedAlbum}/download`);
                    if (!res.ok) throw new Error((await res.json()).error || 'Error');
                    const blob = await res.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `${selectedAlbumData?.year}_${selectedAlbumData?.title}.zip`;
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    document.body.removeChild(a);
                  } catch (e) { addToast(`Error: ${(e as Error).message}`, 'error'); }
                }}
                className={`text-sm ${t.accent} hover:underline inline-flex items-center gap-1`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Descargar ZIP
              </button>
            </div>

            <div className={`${t.glassBg} border border-white/10 rounded-xl p-1 flex gap-0.5`}>
              <button
                onClick={() => toggleLayout('masonry')}
                className={`p-1.5 rounded-lg transition-all ${layoutMode === 'masonry' ? `${t.accentBg} text-white` : t.textMuted}`}
                title="Masonry"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 12a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
                </svg>
              </button>
              <button
                onClick={() => toggleLayout('grid')}
                className={`p-1.5 rounded-lg transition-all ${layoutMode === 'grid' ? `${t.accentBg} text-white` : t.textMuted}`}
                title="Grid"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Busqueda de albums */}
        {!selectedAlbum && subAlbums.length > 2 && (
          <div className="mb-6 max-w-sm">
            <SearchBar onSearch={setSearchQuery} placeholder="Buscar album..." />
          </div>
        )}

        {/* Album cards */}
        {!selectedAlbum && filteredAlbums.length > 0 && (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAlbums.map((album) => (
              <StaggerItem
                key={album.id}
                onClick={() => loadAlbumImages(album.id)}
                className={`cursor-pointer rounded-2xl overflow-hidden ${t.glassCard} glass-card glass-glow`}
              >
                <div className="aspect-[16/10] relative overflow-hidden">
                  <AlbumPreview albumId={album.id} imageCount={album.imageCount} className="w-full h-full" />
                </div>
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className={`font-semibold ${t.text}`}>{album.title}</h3>
                    {album.subAlbum && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${t.inputBg} ${t.textMuted}`}>{album.subAlbum}</span>
                    )}
                  </div>
                  {album.description && <p className={`text-sm ${t.textMuted} mb-2`}>{album.description}</p>}
                  <div className="flex items-center justify-between">
                    <span className={`text-sm ${t.textMuted}`}>{album.imageCount} fotos</span>
                    <Link href={`/upload?album=${album.id}`} onClick={e => e.stopPropagation()} className={`text-sm ${t.accent}`}>Subir</Link>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}

        {/* Photos: Masonry - uses thumbnails for performance */}
        {selectedAlbum && images.length > 0 && layoutMode === 'masonry' && (
          <div className="masonry">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                className="masonry-item group"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
              >
                <div className="photo-card cursor-pointer relative" onClick={() => { setGalleryIndex(index); setGalleryOpen(true); }}>
                  <Image src={image.thumbnailUrl || image.fileUrl || '/placeholder.jpg'} alt={image.originalName || ''} width={600} height={0} className="w-full h-auto block rounded-xl" sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw" placeholder={image.blurDataUrl ? 'blur' : 'empty'} blurDataURL={image.blurDataUrl || undefined} />
                  <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                    <svg className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                  <button onClick={e => { e.stopPropagation(); deleteImage(image.id); }} className={`absolute top-2 right-2 p-1.5 rounded-lg bg-black/30 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all ${t.danger}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Photos: Grid - uses thumbnails for performance */}
        {selectedAlbum && images.length > 0 && layoutMode === 'grid' && (
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
            {images.map((image, index) => (
              <motion.div
                key={image.id}
                className="group"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
              >
                <div className="photo-card cursor-pointer relative aspect-square" onClick={() => { setGalleryIndex(index); setGalleryOpen(true); }}>
                  <Image src={image.thumbnailUrl || image.fileUrl || '/placeholder.jpg'} alt={image.originalName || ''} fill className="object-cover rounded-xl" sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw" placeholder={image.blurDataUrl ? 'blur' : 'empty'} blurDataURL={image.blurDataUrl || undefined} />
                  <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center">
                    <svg className="w-7 h-7 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                  <button onClick={e => { e.stopPropagation(); deleteImage(image.id); }} className={`absolute top-2 right-2 p-1.5 rounded-lg bg-black/30 backdrop-blur-md border border-white/10 opacity-0 group-hover:opacity-100 transition-all ${t.danger}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Infinite scroll sentinel + loading indicator */}
        {selectedAlbum && hasMore && (
          <div ref={sentinelRef} className="flex justify-center py-8">
            {loadingMore ? (
              <div className={`animate-spin rounded-full h-6 w-6 border-2 border-t-transparent ${t.border}`} />
            ) : (
              <button onClick={loadMore} className={`text-sm ${t.accent} hover:underline`}>
                Cargar mas fotos ({images.length} de {totalImages})
              </button>
            )}
          </div>
        )}

        {/* Empty states */}
        {selectedAlbum && images.length === 0 && !loadingMore && (
          <div className="text-center py-20">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl ${t.glassCard} mb-6`}>
              <svg className={`w-10 h-10 ${t.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className={`text-xl font-semibold ${t.text} mb-2`}>Album vacio</h3>
            <p className={`${t.textMuted} mb-6 max-w-sm mx-auto`}>Sube fotos para llenar este album.</p>
            <Link href={`/upload?album=${selectedAlbum}`}>
              <button className="px-6 py-3 rounded-xl text-white font-medium btn-glass-accent">Subir Fotos</button>
            </Link>
          </div>
        )}

        {!selectedAlbum && filteredAlbums.length === 0 && searchQuery && (
          <div className="text-center py-16">
            <p className={`${t.textMuted}`}>No se encontraron albums para &ldquo;{searchQuery}&rdquo;</p>
          </div>
        )}

        {!selectedAlbum && subAlbums.length === 0 && !searchQuery && (
          <div className="text-center py-20">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl ${t.glassCard} mb-6`}>
              <svg className={`w-10 h-10 ${t.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className={`text-xl font-semibold ${t.text} mb-2`}>Sin albumes para {year}</h3>
            <p className={`${t.textMuted} mb-6 max-w-sm mx-auto`}>Crea albumes para organizar tus fotos.</p>
            <Link href="/admin">
              <button className="px-6 py-3 rounded-xl text-white font-medium btn-glass-accent">Crear Albumes</button>
            </Link>
          </div>
        )}
      </div>

      <ImageGallery
        images={images}
        currentIndex={galleryIndex}
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        onImageChange={setGalleryIndex}
        onImageUpdate={(id, data) => {
          setImages(prev => prev.map(img => img.id === id ? { ...img, ...data } : img));
        }}
      />
    </div>
  );
}
