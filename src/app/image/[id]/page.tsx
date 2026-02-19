'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import { Skeleton } from '@/components/Skeleton';
import { FadeUp } from '@/components/MotionWrap';

export default function ImagePage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useTheme();
  const [imageId, setImageId] = useState('');
  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    params.then(({ id }) => setImageId(id));
  }, [params]);

  useEffect(() => {
    if (!imageId) return;
    fetch(`/api/images/${imageId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setImage(d.data);
        else setError(d.error);
      })
      .catch(() => setError('Error al cargar la imagen'))
      .finally(() => setLoading(false));
  }, [imageId]);

  if (loading) {
    return (
      <div className={`min-h-screen ${t.gradientBg}`}>
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Skeleton className="h-4 w-48 mb-6" />
          <Skeleton className="w-full aspect-video rounded-2xl mb-6" />
          <Skeleton className="h-6 w-64 mb-3" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
    );
  }

  if (error || !image) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${t.gradientBg}`}>
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl ${t.glassCard} mb-6`}>
            <svg className={`w-10 h-10 ${t.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className={`text-xl font-bold ${t.text} mb-2`}>Imagen no encontrada</h2>
          <p className={`${t.textMuted} mb-4`}>{error}</p>
          <Link href="/" className={`${t.accent} hover:underline`}>Volver al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${t.gradientBg} transition-colors duration-300`}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <FadeUp>
          {/* Breadcrumb */}
          <nav className={`flex items-center gap-1.5 text-sm ${t.textMuted} mb-6 md:ml-0 ml-10`}>
            <Link href="/" className="hover:underline">Inicio</Link>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            {image.album && (
              <>
                <Link href={`/album/${image.album.year}`} className="hover:underline">{image.album.year}</Link>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </>
            )}
            <span className={t.text}>{image.originalName}</span>
          </nav>
        </FadeUp>

        {/* Imagen principal */}
        <div className={`${t.glassCard} rounded-2xl overflow-hidden mb-6`}>
          <div className="relative flex items-center justify-center bg-black/5 dark:bg-black/20 min-h-[50vh]">
            <Image
              src={image.fileUrl}
              alt={image.originalName}
              width={image.width || 1200}
              height={image.height || 800}
              className="max-w-full max-h-[70vh] object-contain"
              placeholder={image.blurDataUrl ? 'blur' : 'empty'}
              blurDataURL={image.blurDataUrl || undefined}
              priority
            />
          </div>
        </div>

        {/* Metadata */}
        <div className={`${t.glassCard} rounded-2xl p-6`}>
          <h2 className={`text-lg font-semibold ${t.text} mb-1`}>{image.originalName}</h2>
          {image.description && (
            <p className={`${t.textMuted} mb-4`}>{image.description}</p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className={`text-xs uppercase tracking-wider ${t.textMuted} mb-1`}>Dimensiones</p>
              <p className={`text-sm font-medium ${t.text}`}>
                {image.width && image.height ? `${image.width} x ${image.height}` : 'Desconocido'}
              </p>
            </div>
            <div>
              <p className={`text-xs uppercase tracking-wider ${t.textMuted} mb-1`}>Tamaño</p>
              <p className={`text-sm font-medium ${t.text}`}>
                {image.fileSize ? `${(image.fileSize / 1024 / 1024).toFixed(1)} MB` : 'Desconocido'}
              </p>
            </div>
            <div>
              <p className={`text-xs uppercase tracking-wider ${t.textMuted} mb-1`}>Tipo</p>
              <p className={`text-sm font-medium ${t.text}`}>{image.mimeType || 'Desconocido'}</p>
            </div>
            <div>
              <p className={`text-xs uppercase tracking-wider ${t.textMuted} mb-1`}>Álbum</p>
              {image.album ? (
                <Link href={`/album/${image.album.year}`} className={`text-sm font-medium ${t.accent} hover:underline`}>
                  {image.album.title}
                </Link>
              ) : (
                <p className={`text-sm font-medium ${t.text}`}>Sin álbum</p>
              )}
            </div>
          </div>
          {image.uploadedAt && (
            <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5">
              <p className={`text-xs ${t.textMuted}`}>
                Subida el {new Date(image.uploadedAt).toLocaleDateString('es-CL', {
                  year: 'numeric', month: 'long', day: 'numeric'
                })}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
