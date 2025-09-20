'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';

interface AlbumPreviewProps {
  albumId: string;
  imageCount: number;
  className?: string;
}

export default function AlbumPreview({ albumId, imageCount, className = '' }: AlbumPreviewProps) {
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPreviewImages = async () => {
      try {
        const response = await fetch(`/api/albums/${albumId}/images`);
        const data = await response.json();
        
        if (data.success && data.data.images.length > 0) {
          // Tomar las primeras 4 imágenes para la previsualización
          const images = data.data.images.slice(0, 4).map((img: any) => {
            // Usar fileUrl si es una imagen real, sino usar un placeholder
            if (img.fileUrl && !img.fileUrl.includes('placeholder')) {
              return img.fileUrl;
            } else {
              // Crear un placeholder colorido basado en el ID del álbum
              const colors = ['bg-gradient-to-br from-blue-400 to-blue-600', 'bg-gradient-to-br from-green-400 to-green-600', 'bg-gradient-to-br from-purple-400 to-purple-600', 'bg-gradient-to-br from-pink-400 to-pink-600', 'bg-gradient-to-br from-orange-400 to-orange-600'];
              const colorIndex = Math.abs(img.albumId.split('').reduce((a: number, b: string) => a + b.charCodeAt(0), 0)) % colors.length;
              return colors[colorIndex];
            }
          });
          setPreviewImages(images);
        }
      } catch (error) {
        console.error('Error fetching preview images:', error);
      } finally {
        setLoading(false);
      }
    };

    if (imageCount > 0) {
      fetchPreviewImages();
    } else {
      setLoading(false);
    }
  }, [albumId, imageCount]);

  if (loading) {
    return (
      <div className={`aspect-[4/3] bg-gray-200 rounded-lg animate-pulse flex items-center justify-center ${className}`}>
        <div className="text-gray-400">📸</div>
      </div>
    );
  }

  if (previewImages.length === 0) {
    return (
      <div className={`aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-2">📷</div>
          <div className="text-sm text-gray-500">Sin fotos</div>
        </div>
      </div>
    );
  }

  if (previewImages.length === 1) {
    const isRealImage = previewImages[0].startsWith('/') && !previewImages[0].includes('bg-gradient');
    
    if (isRealImage) {
      return (
        <div className={`aspect-[4/3] relative rounded-lg overflow-hidden ${className}`}>
          <Image
            src={previewImages[0]}
            alt="Vista previa del álbum"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </div>
      );
    } else {
      return (
        <div className={`aspect-[4/3] relative rounded-lg overflow-hidden ${previewImages[0]} ${className}`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-2xl">📸</div>
          </div>
        </div>
      );
    }
  }

  if (previewImages.length === 2) {
    return (
      <div className={`aspect-[4/3] grid grid-cols-2 gap-1 rounded-lg overflow-hidden ${className}`}>
        {previewImages.map((image, index) => {
          const isRealImage = image.startsWith('/') && !image.includes('bg-gradient');
          
          if (isRealImage) {
            return (
              <div key={index} className="relative">
                <Image
                  src={image}
                  alt={`Vista previa ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 12vw"
                />
              </div>
            );
          } else {
            return (
              <div key={index} className={`relative ${image}`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-white text-lg">📸</div>
                </div>
              </div>
            );
          }
        })}
      </div>
    );
  }

  if (previewImages.length === 3) {
    return (
      <div className={`aspect-[4/3] grid grid-cols-2 gap-1 rounded-lg overflow-hidden ${className}`}>
        <div className={`relative row-span-2 ${previewImages[0].startsWith('/') && !previewImages[0].includes('bg-gradient') ? '' : previewImages[0]}`}>
          {previewImages[0].startsWith('/') && !previewImages[0].includes('bg-gradient') ? (
            <Image
              src={previewImages[0]}
              alt="Vista previa 1"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 12vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-xl">📸</div>
            </div>
          )}
        </div>
        <div className={`relative ${previewImages[1].startsWith('/') && !previewImages[1].includes('bg-gradient') ? '' : previewImages[1]}`}>
          {previewImages[1].startsWith('/') && !previewImages[1].includes('bg-gradient') ? (
            <Image
              src={previewImages[1]}
              alt="Vista previa 2"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 12vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-lg">📸</div>
            </div>
          )}
        </div>
        <div className={`relative ${previewImages[2].startsWith('/') && !previewImages[2].includes('bg-gradient') ? '' : previewImages[2]}`}>
          {previewImages[2].startsWith('/') && !previewImages[2].includes('bg-gradient') ? (
            <Image
              src={previewImages[2]}
              alt="Vista previa 3"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 12vw"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-white text-lg">📸</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 4 o más imágenes
  return (
    <div className={`aspect-[4/3] grid grid-cols-2 gap-1 rounded-lg overflow-hidden ${className}`}>
      <div className={`relative row-span-2 ${previewImages[0].startsWith('/') && !previewImages[0].includes('bg-gradient') ? '' : previewImages[0]}`}>
        {previewImages[0].startsWith('/') && !previewImages[0].includes('bg-gradient') ? (
          <Image
            src={previewImages[0]}
            alt="Vista previa 1"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 12vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-xl">📸</div>
          </div>
        )}
      </div>
      <div className={`relative ${previewImages[1].startsWith('/') && !previewImages[1].includes('bg-gradient') ? '' : previewImages[1]}`}>
        {previewImages[1].startsWith('/') && !previewImages[1].includes('bg-gradient') ? (
          <Image
            src={previewImages[1]}
            alt="Vista previa 2"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 12vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-lg">📸</div>
          </div>
        )}
      </div>
      <div className={`relative ${previewImages[2].startsWith('/') && !previewImages[2].includes('bg-gradient') ? '' : previewImages[2]}`}>
        {previewImages[2].startsWith('/') && !previewImages[2].includes('bg-gradient') ? (
          <Image
            src={previewImages[2]}
            alt="Vista previa 3"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 12vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-lg">📸</div>
          </div>
        )}
        {previewImages.length > 3 && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white font-bold text-lg">
              +{previewImages.length - 3}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
