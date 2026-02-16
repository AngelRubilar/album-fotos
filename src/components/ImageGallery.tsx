'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import Image from 'next/image';

interface ImageData {
  id: string;
  fileUrl: string;
  originalName: string;
  description?: string;
}

interface ImageGalleryProps {
  images: ImageData[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onImageChange?: (index: number) => void;
}

const ImageGallery = memo(function ImageGallery({ images, currentIndex, isOpen, onClose, onImageChange }: ImageGalleryProps) {
  const [idx, setIdx] = useState(currentIndex);
  const [loading, setLoading] = useState(true);

  useEffect(() => { setIdx(currentIndex); }, [currentIndex]);

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
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === 'ArrowRight') go(1);
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose, go]);

  if (!isOpen || !images.length) return null;

  const img = images[idx];

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-2xl" onClick={onClose} />

      <div className="relative w-full h-full flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-5 py-4 relative z-10">
          <div>
            <p className="text-white text-sm font-medium truncate max-w-[280px]">{img.originalName}</p>
            <p className="text-white/40 text-xs">{idx + 1} / {images.length}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 transition-colors text-white/60 hover:text-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image */}
        <div className="flex-1 relative flex items-center justify-center px-16">
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
              <button onClick={() => go(-1)} className="absolute left-4 p-3 rounded-2xl hover:bg-white/10 transition-colors text-white/50 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button onClick={() => go(1)} className="absolute right-4 p-3 rounded-2xl hover:bg-white/10 transition-colors text-white/50 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Bottom */}
        <div className="px-5 py-4 relative z-10">
          {img.description && <p className="text-center text-white/70 text-sm mb-3">{img.description}</p>}
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
                  <Image src={image.fileUrl} alt="" width={48} height={48} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
          {images.length > 1 && <p className="text-center text-white/20 text-xs mt-2">← → navegar · ESC cerrar</p>}
        </div>
      </div>
    </div>
  );
});

export default ImageGallery;
