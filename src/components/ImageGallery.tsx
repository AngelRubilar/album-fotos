'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import Image from 'next/image';
import { useTheme } from '@/contexts/ThemeContext';

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

const ImageGallery = memo(function ImageGallery({ 
  images, 
  currentIndex, 
  isOpen, 
  onClose, 
  onImageChange 
}: ImageGalleryProps) {
  const { currentTheme } = useTheme();
  const [currentImageIndex, setCurrentImageIndex] = useState(currentIndex);
  const [imageLoading, setImageLoading] = useState(true);

  // Actualizar el índice cuando cambie desde el componente padre
  useEffect(() => {
    setCurrentImageIndex(currentIndex);
  }, [currentIndex]);

  // Funciones de navegación
  const goToPrevious = useCallback(() => {
    const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1;
    setCurrentImageIndex(newIndex);
    onImageChange?.(newIndex);
    setImageLoading(true);
  }, [currentImageIndex, images.length, onImageChange]);

  const goToNext = useCallback(() => {
    const newIndex = currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0;
    setCurrentImageIndex(newIndex);
    onImageChange?.(newIndex);
    setImageLoading(true);
  }, [currentImageIndex, images.length, onImageChange]);

  // Navegación con teclado
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    switch (event.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowLeft':
        goToPrevious();
        break;
      case 'ArrowRight':
        goToNext();
        break;
    }
  }, [isOpen, onClose, goToPrevious, goToNext]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevenir scroll del body
    }

    // Cleanup: limpiar event listeners y restaurar scroll
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  if (!isOpen || images.length === 0) {
    return null;
  }

  const currentImage = images[currentImageIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay de fondo */}
      <div 
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal de la galería */}
      <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
        {/* Header con controles */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center">
          {/* Información de la imagen */}
          <div className="text-white">
            <h3 className="text-lg font-semibold">
              {currentImage.originalName}
            </h3>
            <p className="text-sm text-gray-300">
              {currentImageIndex + 1} de {images.length}
            </p>
          </div>
          
          {/* Botón de cerrar */}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Imagen principal */}
        <div className="relative w-full h-full flex items-center justify-center max-w-7xl max-h-[80vh]">
          {/* Indicador de carga */}
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
            </div>
          )}
          
          {/* Imagen */}
          <div className="relative w-full h-full flex items-center justify-center">
            <Image
              src={currentImage.fileUrl}
              alt={currentImage.originalName}
              width={1200}
              height={800}
              className={`max-w-full max-h-full object-contain transition-opacity duration-300 ${
                imageLoading ? 'opacity-0' : 'opacity-100'
              }`}
              onLoad={handleImageLoad}
              priority
            />
          </div>

          {/* Botones de navegación */}
          {images.length > 1 && (
            <>
              {/* Botón anterior */}
              <button
                onClick={goToPrevious}
                className="absolute left-4 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all duration-200 z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Botón siguiente */}
              <button
                onClick={goToNext}
                className="absolute right-4 p-3 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all duration-200 z-10"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Footer con descripción y miniaturas */}
        <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
          {/* Descripción */}
          {currentImage.description && (
            <div className="text-center mb-4">
              <p className="text-white text-sm max-w-2xl mx-auto">
                {currentImage.description}
              </p>
            </div>
          )}

          {/* Miniaturas */}
          {images.length > 1 && (
            <div className="flex justify-center space-x-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => {
                    setCurrentImageIndex(index);
                    onImageChange?.(index);
                    setImageLoading(true);
                  }}
                  className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    index === currentImageIndex 
                      ? 'border-white scale-110' 
                      : 'border-transparent hover:border-gray-400'
                  }`}
                >
                  <Image
                    src={image.fileUrl}
                    alt={`Miniatura ${index + 1}`}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Instrucciones de navegación */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 text-white text-xs opacity-70">
            <p>← → para navegar • ESC para cerrar</p>
          </div>
        )}
      </div>
    </div>
  );
});

export default ImageGallery;

