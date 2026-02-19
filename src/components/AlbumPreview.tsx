'use client';

import Image from 'next/image';
import { useState, useEffect, useRef, memo } from 'react';

interface AlbumPreviewProps {
  albumId?: string;
  year?: number;
  imageCount?: number;
  className?: string;
  coverImageUrl?: string;
  coverFocalPoint?: string;
}

function parseFocalPoint(fp: string | null | undefined): string {
  if (!fp) return '50% 50%';
  const [x, y] = fp.split(',');
  return `${x}% ${y}%`;
}

const AlbumPreview = memo(function AlbumPreview({
  albumId,
  year,
  imageCount,
  className = '',
  coverImageUrl,
  coverFocalPoint,
}: AlbumPreviewProps) {
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  // Si hay portada definida no necesitamos esperar a ninguna API para mostrar algo
  const [loading, setLoading] = useState(!coverImageUrl);
  const [hovered, setHovered] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const fetchedRef = useRef(false);

  // Fetch de imágenes de preview:
  // - Si NO hay portada: se hace inmediatamente (necesitamos algo para mostrar)
  // - Si HAY portada: se difiere al primer hover (solo sirve para el slideshow)
  // En móvil (sin hover) esto elimina todas las llamadas API cuando hay portada.
  useEffect(() => {
    const shouldFetch = coverImageUrl ? hovered : true;
    if (!shouldFetch || fetchedRef.current) return;
    fetchedRef.current = true;

    let isMounted = true;
    const fetchImages = async () => {
      try {
        if (albumId) {
          const res = await fetch(`/api/albums/${albumId}/images?limit=4`);
          const data = await res.json();
          if (!isMounted) return;
          if (data.success && data.data?.images) {
            setPreviewImages(data.data.images.slice(0, 4).map((img: any) =>
              img.thumbnailUrl?.includes('.webp') ? img.thumbnailUrl : (img.thumbnailUrl || img.fileUrl)
            ).filter(Boolean));
          }
        } else if (year !== undefined) {
          const res = await fetch(`/api/albums/year/${year}/preview`);
          const data = await res.json();
          if (!isMounted) return;
          if (data.success && data.data) {
            setPreviewImages(data.data);
          }
        }
      } catch { /* skip */ }
      finally { if (isMounted) setLoading(false); }
    };

    fetchImages();
    return () => { isMounted = false; };
  }, [hovered, coverImageUrl, albumId, year]);

  const displayImages = coverImageUrl
    ? [coverImageUrl, ...previewImages.filter(src => src !== coverImageUrl)]
    : previewImages;

  // Slideshow automático al hacer hover
  useEffect(() => {
    if (!hovered || displayImages.length <= 1) return;
    const total = displayImages.length;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % total);
    }, 1500);
    return () => clearInterval(interval);
  }, [hovered, displayImages.length]);

  if (loading) {
    return <div className={`bg-gray-200 dark:bg-neutral-800 animate-pulse ${className}`} />;
  }

  if (!coverImageUrl && previewImages.length === 0) {
    return (
      <div className={`bg-gray-100 dark:bg-neutral-800 flex items-center justify-center ${className}`}>
        <svg className="w-10 h-10 text-gray-300 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  const objectPosition = parseFocalPoint(coverFocalPoint);

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setActiveIndex(0); }}
    >
      {displayImages.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          className={`object-cover transition-opacity duration-700 ${
            i === activeIndex ? 'opacity-100' : 'opacity-0'
          }`}
          style={i === 0 && coverImageUrl ? { objectPosition } : undefined}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      ))}
      {/* Indicadores de slideshow */}
      {hovered && displayImages.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {displayImages.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === activeIndex ? 'bg-white w-4' : 'bg-white/40 w-1.5'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
});

export default AlbumPreview;
