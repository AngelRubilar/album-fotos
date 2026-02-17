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

  useEffect(() => {
    let isMounted = true;

    const fetchImages = async () => {
      try {
        if (albumId) {
          // Single fetch: get 4 images for this specific album
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
          // Single fetch: dedicated preview endpoint replaces N+1 cascade
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

  if (previewImages.length === 1) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image src={previewImages[0]} alt="Preview" fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 gap-[2px]">
        {previewImages.slice(0, 4).map((src, i) => (
          <div key={i} className="relative overflow-hidden">
            <Image src={src} alt="" fill className="object-cover" sizes="25vw" />
          </div>
        ))}
        {previewImages.length < 4 && Array.from({ length: 4 - previewImages.length }).map((_, i) => (
          <div key={`p-${i}`} className="bg-gray-200 dark:bg-neutral-800" />
        ))}
      </div>
    </div>
  );
});

export default AlbumPreview;
