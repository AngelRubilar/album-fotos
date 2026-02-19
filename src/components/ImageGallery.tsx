'use client';

import { useState, useEffect, useCallback, useRef, memo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';

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
  // Zoom display (for toolbar UI — updated from motion values)
  const [zoomDisplay, setZoomDisplay] = useState(1);
  const [rotDisplay, setRotDisplay] = useState(0);

  const modalRef = useRef<HTMLDivElement>(null);
  const imgContainerRef = useRef<HTMLDivElement>(null);

  // Motion values: updates happen without React re-renders → smooth gestures
  const mvX = useMotionValue(0);
  const mvY = useMotionValue(0);
  const mvScale = useMotionValue(1);
  const mvRotate = useMotionValue(0);

  // Gesture state refs
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{ dist: number; scale: number } | null>(null);
  const panRef = useRef<{ startX: number; startY: number; x0: number; y0: number } | null>(null);
  const swipeRef = useRef<{ startX: number; startY: number } | null>(null);
  const lastTapRef = useRef(0);

  useEffect(() => { setIdx(currentIndex); }, [currentIndex]);

  const resetTransform = useCallback((animated = true) => {
    if (animated) {
      animate(mvX, 0, { type: 'spring', stiffness: 300, damping: 30 });
      animate(mvY, 0, { type: 'spring', stiffness: 300, damping: 30 });
      animate(mvScale, 1, { type: 'spring', stiffness: 300, damping: 30 });
      animate(mvRotate, Math.round(mvRotate.get() / 90) * 90, { type: 'spring', stiffness: 300, damping: 30 });
    } else {
      mvX.set(0); mvY.set(0); mvScale.set(1); mvRotate.set(0);
    }
    setZoomDisplay(1);
    setRotDisplay(0);
  }, [mvX, mvY, mvScale, mvRotate]);

  // Reset transform and clear UI state when changing image
  useEffect(() => {
    setShowInfo(false);
    setEditingDesc(false);
    setLoading(true);
    mvX.set(0); mvY.set(0); mvScale.set(1); mvRotate.set(0);
    setZoomDisplay(1); setRotDisplay(0);
  }, [idx, mvX, mvY, mvScale, mvRotate]);

  const go = useCallback((dir: -1 | 1) => {
    const next = dir === -1
      ? (idx > 0 ? idx - 1 : images.length - 1)
      : (idx < images.length - 1 ? idx + 1 : 0);
    setIdx(next);
    onImageChange?.(next);
  }, [idx, images.length, onImageChange]);

  const zoomBy = useCallback((factor: number) => {
    const next = Math.max(1, Math.min(5, mvScale.get() * factor));
    animate(mvScale, next, { type: 'spring', stiffness: 300, damping: 30 });
    setZoomDisplay(Math.round(next * 100) / 100);
    if (next === 1) {
      animate(mvX, 0, { type: 'spring', stiffness: 300, damping: 30 });
      animate(mvY, 0, { type: 'spring', stiffness: 300, damping: 30 });
    }
  }, [mvScale, mvX, mvY]);

  const rotateTo = useCallback((dir: 1 | -1) => {
    const next = mvRotate.get() + dir * 90;
    animate(mvRotate, next, { type: 'spring', stiffness: 200, damping: 25 });
    setRotDisplay(prev => ((prev + dir * 90) + 360) % 360);
  }, [mvRotate]);

  // Wheel zoom
  useEffect(() => {
    const container = imgContainerRef.current;
    if (!container || !isOpen) return;
    const handler = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const next = Math.max(1, Math.min(5, mvScale.get() * factor));
      mvScale.set(next);
      setZoomDisplay(Math.round(next * 100) / 100);
      if (next === 1) { mvX.set(0); mvY.set(0); }
    };
    container.addEventListener('wheel', handler, { passive: false });
    return () => container.removeEventListener('wheel', handler);
  }, [isOpen, mvScale, mvX, mvY]);

  // Keyboard
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (editingDesc) return;
      const scale = mvScale.get();
      if (e.key === 'Escape') {
        if (showInfo) setShowInfo(false);
        else if (scale > 1 || mvRotate.get() % 360 !== 0) resetTransform();
        else onClose();
      }
      if (e.key === 'ArrowLeft' && scale === 1) go(-1);
      if (e.key === 'ArrowRight' && scale === 1) go(1);
      if (e.key === 'i') setShowInfo(p => !p);
      if (e.key === '+' || e.key === '=') zoomBy(1.3);
      if (e.key === '-') zoomBy(1 / 1.3);
      if (e.key === '0') resetTransform();
      if (e.key === 'r') rotateTo(1);
      if (e.key === 'R') rotateTo(-1);
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [isOpen, onClose, go, showInfo, editingDesc, resetTransform, zoomBy, rotateTo, mvScale, mvRotate]);

  // Pointer gesture helpers
  const getPinchDist = () => {
    const pts = Array.from(pointers.current.values());
    if (pts.length < 2) return 0;
    const [a, b] = pts;
    return Math.hypot(b.x - a.x, b.y - a.y);
  };

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size >= 2) {
      // Start pinch
      pinchRef.current = { dist: getPinchDist(), scale: mvScale.get() };
      panRef.current = null;
      swipeRef.current = null;
    } else {
      panRef.current = { startX: e.clientX, startY: e.clientY, x0: mvX.get(), y0: mvY.get() };
      swipeRef.current = { startX: e.clientX, startY: e.clientY };
      pinchRef.current = null;
    }

    // Double tap: toggle zoom
    const now = Date.now();
    if (now - lastTapRef.current < 280) {
      lastTapRef.current = 0;
      if (mvScale.get() > 1) {
        animate(mvScale, 1, { type: 'spring', stiffness: 300, damping: 30 });
        animate(mvX, 0, { type: 'spring', stiffness: 300, damping: 30 });
        animate(mvY, 0, { type: 'spring', stiffness: 300, damping: 30 });
        setZoomDisplay(1);
      } else {
        animate(mvScale, 2.5, { type: 'spring', stiffness: 300, damping: 30 });
        setZoomDisplay(2.5);
      }
    } else {
      lastTapRef.current = now;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mvScale, mvX, mvY]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size >= 2 && pinchRef.current) {
      const newDist = getPinchDist();
      const next = Math.max(1, Math.min(5, pinchRef.current.scale * (newDist / pinchRef.current.dist)));
      mvScale.set(next);
      setZoomDisplay(Math.round(next * 100) / 100);
      if (next === 1) { mvX.set(0); mvY.set(0); }
      return;
    }

    if (panRef.current && mvScale.get() > 1) {
      mvX.set(panRef.current.x0 + (e.clientX - panRef.current.startX));
      mvY.set(panRef.current.y0 + (e.clientY - panRef.current.startY));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mvScale, mvX, mvY]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    const swipe = swipeRef.current;
    pointers.current.delete(e.pointerId);
    pinchRef.current = null;

    // Swipe navigation when at 1x zoom
    if (mvScale.get() === 1 && swipe && pointers.current.size === 0) {
      const dx = e.clientX - swipe.startX;
      const dy = e.clientY - swipe.startY;
      if (Math.abs(dx) > 80 && Math.abs(dy) < 60) {
        dx > 0 ? go(-1) : go(1);
      }
    }

    if (pointers.current.size === 0) {
      swipeRef.current = null;
      panRef.current = null;
    }
  }, [mvScale, go]);

  // Preload adjacent images
  useEffect(() => {
    if (!isOpen) return;
    [idx - 1, idx + 1]
      .filter(i => i >= 0 && i < images.length)
      .forEach(i => { const p = new window.Image(); p.src = images[i].fileUrl; });
  }, [idx, images, isOpen]);

  // Focus management
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.activeElement as HTMLElement;
    modalRef.current?.focus();
    return () => prev?.focus();
  }, [isOpen]);

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
      if (data.success) { onImageUpdate?.(img.id, { description: descValue }); setEditingDesc(false); }
    } catch { /* skip */ }
    finally { setSaving(false); }
  };

  const img = images[idx];
  const hasTransform = zoomDisplay !== 1 || rotDisplay !== 0;

  return (
    <AnimatePresence>
    {isOpen && images.length > 0 && (
    <motion.div
      ref={modalRef}
      className="fixed inset-0 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      tabIndex={-1}
      role="dialog"
      aria-label="Galeria de imagenes"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
        onClick={() => {
          if (hasTransform) { resetTransform(); return; }
          if (showInfo) setShowInfo(false); else onClose();
        }}
      />

      <div className="relative w-full h-full flex flex-col">

        {/* Top bar */}
        <div className="flex items-center justify-between px-4 py-3 relative z-10 bg-gradient-to-b from-black/40 to-transparent">
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate max-w-[220px] sm:max-w-xs">{img.originalName}</p>
            <p className="text-white/40 text-xs">{idx + 1} / {images.length}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setShowInfo(p => !p)}
              className={`p-2 rounded-xl transition-all ${showInfo ? 'bg-white/20 text-white' : 'text-white/50 hover:bg-white/10 hover:text-white'}`}
              title="Info (I)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition-colors"
              title="Cerrar (Esc)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main area */}
        <div className="flex-1 relative flex min-h-0">

          {/* Image container */}
          <div
            ref={imgContainerRef}
            className="flex-1 relative flex items-center justify-center overflow-hidden select-none"
            style={{ touchAction: 'none', cursor: zoomDisplay > 1 ? 'grab' : 'default' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-white/30" />
              </div>
            )}

            {/* Transform wrapper (zoom + pan + rotate via motion values) */}
            <motion.div style={{ x: mvX, y: mvY, scale: mvScale, rotate: mvRotate }}>
              {/* Image fade transition on index change */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <Image
                    src={img.fileUrl}
                    alt={img.originalName}
                    width={1400}
                    height={900}
                    className={`max-w-[90vw] max-h-[65vh] object-contain block pointer-events-none transition-opacity duration-200 ${loading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={() => setLoading(false)}
                    priority
                    draggable={false}
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Nav arrows — ocultar cuando hay zoom activo */}
            {zoomDisplay === 1 && images.length > 1 && (
              <>
                <button
                  onClick={e => { e.stopPropagation(); go(-1); }}
                  className="absolute left-3 p-3 rounded-2xl bg-black/20 backdrop-blur-md hover:bg-white/10 transition-all text-white/50 hover:text-white border border-white/[0.06] z-10"
                  aria-label="Imagen anterior"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={e => { e.stopPropagation(); go(1); }}
                  className="absolute right-3 p-3 rounded-2xl bg-black/20 backdrop-blur-md hover:bg-white/10 transition-all text-white/50 hover:text-white border border-white/[0.06] z-10"
                  aria-label="Imagen siguiente"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* Info panel */}
          <AnimatePresence>
          {showInfo && (
            <motion.div
              className="w-72 bg-white/[0.06] backdrop-blur-2xl border-l border-white/[0.1] overflow-y-auto relative z-10 shrink-0"
              initial={{ x: 288, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 288, opacity: 0 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            >
              <div className="p-5 space-y-4">
                <h3 className="text-white font-semibold text-sm">Información</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Nombre</p>
                    <p className="text-white/90 text-sm break-all">{img.originalName}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Tamaño</p>
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
                      <p className="text-white/90 text-sm">{img.width && img.height ? `${img.width} × ${img.height}` : 'Desconocido'}</p>
                    </div>
                    <div>
                      <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Fecha</p>
                      <p className="text-white/90 text-sm">{formatDate(img.uploadedAt)}</p>
                    </div>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-white/40 text-xs uppercase tracking-wider">Descripción</p>
                    {!editingDesc && (
                      <button onClick={() => { setDescValue(img.description || ''); setEditingDesc(true); }} className="text-xs text-blue-400 hover:text-blue-300">
                        {img.description ? 'Editar' : 'Agregar'}
                      </button>
                    )}
                  </div>
                  {editingDesc ? (
                    <div className="space-y-2">
                      <textarea
                        value={descValue}
                        onChange={e => setDescValue(e.target.value)}
                        placeholder="Escribe una descripción..."
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-blue-500 resize-none"
                        rows={3}
                        autoFocus
                      />
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => setEditingDesc(false)} className="text-xs text-white/50 hover:text-white/70 px-3 py-1.5 rounded-lg">Cancelar</button>
                        <button onClick={saveDescription} disabled={saving} className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-500 disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar'}</button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-white/70 text-sm">{img.description || <span className="text-white/30 italic">Sin descripción</span>}</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>
        </div>

        {/* Toolbar: controles de zoom y rotación */}
        <div className="flex items-center justify-center gap-1 px-4 py-2 relative z-10 bg-gradient-to-t from-black/40 to-transparent">
          {/* Rotar izquierda */}
          <button
            onClick={() => rotateTo(-1)}
            title="Rotar izquierda (Shift+R)"
            className="p-2 rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          {/* Rotar derecha */}
          <button
            onClick={() => rotateTo(1)}
            title="Rotar derecha (R)"
            className="p-2 rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2m18-10l-6-6m6 6l-6 6" />
            </svg>
          </button>

          <div className="w-px h-5 bg-white/15 mx-1" />

          {/* Zoom out */}
          <button
            onClick={() => zoomBy(1 / 1.3)}
            disabled={zoomDisplay <= 1}
            title="Alejar (-)"
            className="p-2 rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-25"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
          </button>

          {/* Zoom level */}
          <span className="text-white/40 text-xs tabular-nums w-11 text-center">
            {Math.round(zoomDisplay * 100)}%
          </span>

          {/* Zoom in */}
          <button
            onClick={() => zoomBy(1.3)}
            disabled={zoomDisplay >= 5}
            title="Acercar (+)"
            className="p-2 rounded-xl text-white/50 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-25"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </button>

          {/* Reset — solo visible cuando hay transformación activa */}
          <AnimatePresence>
          {hasTransform && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden flex items-center"
            >
              <div className="w-px h-5 bg-white/15 mx-1" />
              <button
                onClick={() => resetTransform()}
                title="Restablecer (0)"
                className="px-3 py-1.5 rounded-xl text-xs text-white/50 hover:bg-white/10 hover:text-white transition-colors whitespace-nowrap"
              >
                Restablecer
              </button>
            </motion.div>
          )}
          </AnimatePresence>
        </div>

        {/* Bottom: descripción + miniaturas */}
        <div className="px-4 pb-4 pt-1 relative z-10">
          {!showInfo && img.description && (
            <p className="text-center text-white/60 text-sm mb-2">{img.description}</p>
          )}
          {images.length > 1 && (
            <div className="flex justify-center gap-1.5 overflow-x-auto thumbnail-scroll py-1 max-w-2xl mx-auto">
              {images.map((image, i) => (
                <button
                  key={image.id}
                  onClick={() => { setIdx(i); onImageChange?.(i); }}
                  className={`flex-shrink-0 w-11 h-11 rounded-lg overflow-hidden transition-all duration-200 ${
                    i === idx ? 'ring-2 ring-white scale-110' : 'opacity-35 hover:opacity-65'
                  }`}
                >
                  <Image
                    src={image.thumbnailUrl || image.fileUrl}
                    alt=""
                    width={44}
                    height={44}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
          <p className="text-center text-white/20 text-xs mt-2 hidden sm:block">
            ← → navegar · scroll o pinch zoom · R rotar · I info · Esc cerrar
          </p>
        </div>

      </div>
    </motion.div>
    )}
    </AnimatePresence>
  );
});

export default ImageGallery;
