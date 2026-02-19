"use client";

import { useState, useEffect, use, useRef, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/components/Toast";
import { FadeUp } from "@/components/MotionWrap";

interface Photo {
  id: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  originalName: string;
  fileSize: number;
  width: number;
  height: number;
  uploadedAt: string;
  description: string | null;
}

interface AlbumDetail {
  id: string;
  year: number;
  title: string;
  description: string | null;
  subAlbum: string | null;
  coverImageUrl: string | null;
  coverFocalPoint: string | null;
  eventDate: string | null;
  imageCount: number;
}

interface FocalModalState {
  src: string;
  mode: "album" | "year";
  initialFocalPoint: string | null;
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function parseFocalPoint(fp: string | null | undefined): string {
  if (!fp) return "50% 50%";
  const [x, y] = fp.split(",");
  return `${x}% ${y}%`;
}

// Modal selector de punto focal — acepta imageSrc en vez de photo completa
function FocalPointModal({
  imageSrc,
  initialFocalPoint,
  mode,
  onSave,
  onCancel,
  saving,
}: {
  imageSrc: string;
  initialFocalPoint: string | null;
  mode: "album" | "year";
  onSave: (fp: string) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [focalPoint, setFocalPoint] = useState<{ x: number; y: number }>(() => {
    if (initialFocalPoint) {
      const [x, y] = initialFocalPoint.split(",").map(Number);
      return { x: isNaN(x) ? 50 : x, y: isNaN(y) ? 50 : y };
    }
    return { x: 50, y: 50 };
  });
  const dragging = useRef(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const computePoint = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
    setFocalPoint({ x, y });
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      dragging.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      computePoint(e);
    },
    [computePoint]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging.current) return;
      computePoint(e);
    },
    [computePoint]
  );

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const objectPosition = `${focalPoint.x}% ${focalPoint.y}%`;
  const title = mode === "year" ? "Seleccionar punto focal — portada del año" : "Seleccionar punto focal de portada";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-white font-semibold text-base">{title}</h2>
          <button onClick={onCancel} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5">
          {/* Editor */}
          <div className="space-y-2">
            <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Editor — clic o arrastra para marcar</p>
            <div
              ref={editorRef}
              className="relative select-none cursor-crosshair rounded-xl overflow-hidden"
              style={{ touchAction: "none" }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt="Foto"
                className="w-full h-auto block pointer-events-none"
                draggable={false}
              />
              {/* Punto focal — círculo */}
              <div
                className="absolute w-7 h-7 rounded-full border-[3px] border-white shadow-lg pointer-events-none -translate-x-1/2 -translate-y-1/2 transition-none"
                style={{
                  left: `${focalPoint.x}%`,
                  top: `${focalPoint.y}%`,
                  boxShadow: "0 0 0 2px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.6)",
                }}
              />
            </div>
            <p className="text-white/40 text-xs text-center">
              Punto: {focalPoint.x}%, {focalPoint.y}%
            </p>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Preview recorte 16:10</p>
            <div className="aspect-[16/10] rounded-xl overflow-hidden relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageSrc}
                alt="Preview"
                className="w-full h-full object-cover pointer-events-none"
                style={{ objectPosition }}
              />
            </div>
            <p className="text-white/40 text-xs text-center">
              {mode === "year" ? "Así se verá la portada en la tarjeta del año" : "Así se verá la portada en la tarjeta del álbum"}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-white/10">
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 rounded-xl text-sm font-medium text-white/70 border border-white/20 hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSave(`${focalPoint.x},${focalPoint.y}`)}
            disabled={saving}
            className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? "Guardando…" : "Guardar portada"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AlbumPhotosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { t } = useTheme();
  const { addToast } = useToast();
  const [album, setAlbum] = useState<AlbumDetail | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [coverSaving, setCoverSaving] = useState(false);
  const [focalModal, setFocalModal] = useState<FocalModalState | null>(null);

  // Estado de portada del año
  const [yearCover, setYearCover] = useState<{ coverImageUrl: string; coverFocalPoint: string | null } | null>(null);
  const [yearCoverLoaded, setYearCoverLoaded] = useState(false);

  useEffect(() => {
    fetch(`/api/albums/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setAlbum(d.data);
          // Cargar portada del año una vez que tengamos el año del álbum
          if (d.data?.year) {
            fetch(`/api/year-covers/${d.data.year}`)
              .then((r) => r.json())
              .then((yc) => {
                if (yc.success) setYearCover(yc.data);
              })
              .catch(console.error)
              .finally(() => setYearCoverLoaded(true));
          } else {
            setYearCoverLoaded(true);
          }
        }
      })
      .catch(console.error);

    loadPhotos(1);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadPhotos = async (p: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/albums/${id}/images?page=${p}&limit=50`);
      const data = await res.json();
      if (data.success) {
        setPhotos((prev) => p === 1 ? data.data.images : [...prev, ...data.data.images]);
        setHasMore(data.data.pagination.hasMore);
        setTotal(data.data.pagination.total);
        setPage(p);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const deletePhoto = async (photoId: string) => {
    if (!confirm("¿Eliminar esta foto permanentemente?")) return;
    try {
      const res = await fetch(`/api/images/${photoId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setPhotos((prev) => prev.filter((p) => p.id !== photoId));
        setTotal((prev) => prev - 1);
        if (album?.coverImageUrl?.includes(photoId)) {
          setAlbum((prev) => prev ? { ...prev, coverImageUrl: null } : prev);
        }
        addToast("Foto eliminada", "success");
      } else {
        addToast(data.error || "Error al eliminar", "error");
      }
    } catch {
      addToast("Error al eliminar", "error");
    }
  };

  const openFocalModal = (photo: Photo, mode: "album" | "year") => {
    const src = photo.thumbnailUrl || photo.fileUrl;
    const initialFocalPoint =
      mode === "album" && album?.coverImageUrl === src
        ? (album?.coverFocalPoint ?? null)
        : mode === "year" && yearCover?.coverImageUrl === src
        ? (yearCover?.coverFocalPoint ?? null)
        : null;
    setFocalModal({ src, mode, initialFocalPoint });
  };

  const openFocalModalFromHeader = (mode: "album" | "year") => {
    const src = mode === "album" ? album?.coverImageUrl : yearCover?.coverImageUrl;
    if (!src) return;
    const initialFocalPoint =
      mode === "album" ? (album?.coverFocalPoint ?? null) : (yearCover?.coverFocalPoint ?? null);
    setFocalModal({ src, mode, initialFocalPoint });
  };

  const handleSaveFocal = async (focalPoint: string) => {
    if (!focalModal) return;
    const { src, mode } = focalModal;
    setCoverSaving(true);
    try {
      if (mode === "album") {
        const res = await fetch(`/api/albums/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coverImageUrl: src, coverFocalPoint: focalPoint }),
        });
        const data = await res.json();
        if (data.success) {
          setAlbum((prev) => prev ? { ...prev, coverImageUrl: src, coverFocalPoint: focalPoint } : prev);
          setFocalModal(null);
          addToast("Portada del álbum actualizada", "success");
        } else {
          addToast(data.error || "Error", "error");
        }
      } else {
        const year = album?.year;
        if (!year) return;
        const res = await fetch(`/api/year-covers/${year}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ coverImageUrl: src, coverFocalPoint: focalPoint }),
        });
        const data = await res.json();
        if (data.success) {
          setYearCover({ coverImageUrl: src, coverFocalPoint: focalPoint });
          setFocalModal(null);
          addToast("Portada del año actualizada", "success");
        } else {
          addToast(data.error || "Error", "error");
        }
      }
    } catch {
      addToast("Error al guardar portada", "error");
    } finally {
      setCoverSaving(false);
    }
  };

  const removeAlbumCover = () =>
    fetch(`/api/albums/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coverImageUrl: null, coverFocalPoint: null }),
    }).then(() => setAlbum((p) => p ? { ...p, coverImageUrl: null, coverFocalPoint: null } : p));

  const removeYearCover = async () => {
    const year = album?.year;
    if (!year) return;
    try {
      await fetch(`/api/year-covers/${year}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverImageUrl: null }),
      });
      setYearCover(null);
      addToast("Portada del año eliminada", "success");
    } catch {
      addToast("Error al quitar portada del año", "error");
    }
  };

  const isAlbumCover = (photo: Photo) =>
    album?.coverImageUrl === (photo.thumbnailUrl || photo.fileUrl);

  const isYearCover = (photo: Photo) =>
    yearCover?.coverImageUrl === (photo.thumbnailUrl || photo.fileUrl);

  if (loading && photos.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${t.gradientBg}`}>
        <div className={`animate-spin rounded-full h-8 w-8 border-2 border-t-transparent ${t.border}`} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${t.gradientBg} transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Header */}
        <FadeUp className="mb-6 md:ml-0 ml-10">
          <div className="flex items-start gap-4 mb-1">
            <Link
              href="/admin/albums"
              className={`mt-1 p-1.5 rounded-lg ${t.navItem} shrink-0`}
              title="Volver a álbumes"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className={`text-2xl font-bold ${t.text} truncate`}>{album?.title ?? "Álbum"}</h1>
                {album?.subAlbum && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${t.inputBg} ${t.textMuted}`}>
                    {album.subAlbum}
                  </span>
                )}
              </div>
              <p className={`text-sm ${t.textMuted} mt-0.5`}>
                {album?.year} · {total} foto(s)
                {album?.eventDate && (
                  <> · <span className="font-medium">{new Date(album.eventDate).toLocaleDateString("es", { day: "numeric", month: "long", year: "numeric" })}</span></>
                )}
              </p>
            </div>
            <Link href={`/admin/upload?album=${id}`}>
              <button className="shrink-0 px-4 py-2 rounded-xl text-sm font-medium text-white btn-glass-accent">
                + Subir fotos
              </button>
            </Link>
          </div>

          {/* Portada actual del álbum */}
          {album?.coverImageUrl && (
            <div className={`mt-3 flex items-center gap-3 px-4 py-3 rounded-xl ${t.glassCard}`}>
              <div
                className="w-10 h-10 rounded-lg overflow-hidden shrink-0"
                style={{ background: "#111" }}
              >
                <img
                  src={album.coverImageUrl}
                  alt="Portada"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: parseFocalPoint(album.coverFocalPoint) }}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-medium ${t.text}`}>Portada del álbum asignada</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <button
                    onClick={() => openFocalModalFromHeader("album")}
                    className={`text-xs text-blue-400 hover:text-blue-300 transition-colors`}
                  >
                    Editar punto focal
                  </button>
                  <span className={`text-xs ${t.textMuted}`}>·</span>
                  <button
                    onClick={removeAlbumCover}
                    className={`text-xs ${t.danger}`}
                  >
                    Quitar portada
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Portada del año */}
          {yearCoverLoaded && (
            <div className={`mt-2 flex items-center gap-3 px-4 py-3 rounded-xl ${t.glassCard}`}>
              {yearCover ? (
                <>
                  <div
                    className="w-10 h-10 rounded-lg overflow-hidden shrink-0"
                    style={{ background: "#111" }}
                  >
                    <img
                      src={yearCover.coverImageUrl}
                      alt="Portada año"
                      className="w-full h-full object-cover"
                      style={{ objectPosition: parseFocalPoint(yearCover.coverFocalPoint) }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium ${t.text}`}>Portada del año {album?.year} asignada</p>
                    <div className="flex items-center gap-3 mt-0.5">
                      <button
                        onClick={() => openFocalModalFromHeader("year")}
                        className="text-xs text-green-400 hover:text-green-300 transition-colors"
                      >
                        Editar punto focal
                      </button>
                      <span className={`text-xs ${t.textMuted}`}>·</span>
                      <button
                        onClick={removeYearCover}
                        className={`text-xs ${t.danger}`}
                      >
                        Quitar portada del año
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <p className={`text-xs ${t.textMuted}`}>
                  Sin portada para el año {album?.year} — usa el botón verde en las fotos para asignar una.
                </p>
              )}
            </div>
          )}
        </FadeUp>

        {/* Grid de fotos */}
        {photos.length === 0 ? (
          <div className={`${t.glassCard} rounded-2xl p-16 text-center`}>
            <svg className={`w-12 h-12 mx-auto mb-4 ${t.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className={`text-lg font-semibold ${t.text} mb-2`}>Sin fotos</p>
            <p className={`text-sm ${t.textMuted} mb-5`}>Sube fotos para verlas aquí.</p>
            <Link href={`/admin/upload?album=${id}`}>
              <button className="px-5 py-2 rounded-xl text-white font-medium btn-glass-accent">
                Subir fotos
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className={`group relative rounded-xl overflow-hidden aspect-square ${t.glassCard} ${isAlbumCover(photo) ? "ring-2 ring-blue-500" : ""} ${isYearCover(photo) ? "ring-2 ring-green-500" : ""}`}
              >
                {/* Thumbnail */}
                <img
                  src={photo.thumbnailUrl || photo.fileUrl}
                  alt={photo.originalName}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                  loading="lazy"
                />

                {/* Overlay con acciones */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex flex-col justify-between p-2">
                  {/* Badges */}
                  <div className="flex gap-1 flex-wrap">
                    {isAlbumCover(photo) && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-blue-500 text-white">
                        Portada
                      </span>
                    )}
                    {isYearCover(photo) && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-green-500 text-white">
                        Año
                      </span>
                    )}
                  </div>

                  {/* Botones acción — visibles solo en hover */}
                  <div className="self-end flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Portada del álbum */}
                    <button
                      onClick={() => openFocalModal(photo, "album")}
                      disabled={coverSaving}
                      title="Portada del álbum"
                      className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                    {/* Portada del año */}
                    <button
                      onClick={() => openFocalModal(photo, "year")}
                      disabled={coverSaving}
                      title="Portada del año"
                      className="p-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                    {/* Eliminar */}
                    <button
                      onClick={() => deletePhoto(photo.id)}
                      title="Eliminar foto"
                      className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Info en la parte inferior */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                  <p className="text-white text-[10px] truncate">{photo.originalName}</p>
                  <p className="text-white/70 text-[10px]">{formatSize(photo.fileSize)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cargar más */}
        {hasMore && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => loadPhotos(page + 1)}
              disabled={loading}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium border ${t.inputBorder} ${t.text} disabled:opacity-50`}
            >
              {loading ? "Cargando…" : "Cargar más fotos"}
            </button>
          </div>
        )}
      </div>

      {/* Modal punto focal */}
      {focalModal && (
        <FocalPointModal
          imageSrc={focalModal.src}
          initialFocalPoint={focalModal.initialFocalPoint}
          mode={focalModal.mode}
          onSave={handleSaveFocal}
          onCancel={() => setFocalModal(null)}
          saving={coverSaving}
        />
      )}
    </div>
  );
}
