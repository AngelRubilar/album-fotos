'use client';

import Image from 'next/image';
import { useState, useEffect, memo } from 'react';

interface AlbumPreviewProps {
  albumId?: string;
  year?: number;
  imageCount?: number;
  className?: string;
}

const AlbumPreview = memo(function AlbumPreview({ albumId, year, imageCount, className = '' }: AlbumPreviewProps) {
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const fetchImages = async () => {
      try {
        if (albumId) {
          const res = await fetch(`/api/albums/${albumId}/images?limit=4`);
          const data = await res.json();
          if (!isMounted) return;
          if (data.success && data.data?.images) {
            const imgs = data.data.images.slice(0, 4).map((img: any) =>
              img.thumbnailUrl?.includes('.webp') ? img.thumbnailUrl : (img.thumbnailUrl || img.fileUrl)
            ).filter(Boolean);
            setPreviewImages(imgs);
          }
        } else if (year) {
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
  }, [albumId, year, imageCount]);

  // Slideshow automático al hacer hover
  useEffect(() => {
    if (!hovered || previewImages.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % previewImages.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [hovered, previewImages.length]);

  if (loading) {
    return <div className={`bg-gray-200 dark:bg-neutral-800 animate-pulse ${className}`} />;
  }

  if (previewImages.length === 0) {
    return (
      <div className={`bg-gray-100 dark:bg-neutral-800 flex items-center justify-center ${className}`}>
        <svg className="w-10 h-10 text-gray-300 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  // Modo slideshow: imagen única con crossfade
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setActiveIndex(0); }}
    >
      {previewImages.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          className={`object-cover transition-opacity duration-700 ${
            i === activeIndex ? 'opacity-100' : 'opacity-0'
          }`}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      ))}
      {/* Indicadores de slideshow */}
      {hovered && previewImages.length > 1 && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {previewImages.map((_, i) => (
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
