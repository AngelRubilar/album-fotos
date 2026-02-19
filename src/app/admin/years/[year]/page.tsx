"use client";

import { useState, useEffect, use, useRef, useCallback } from "react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/components/Toast";
import { FadeUp } from "@/components/MotionWrap";

interface YearCoverData {
  coverImageUrl: string | null;
  coverFocalPoint: string | null;
  description: string | null;
}

interface AlbumSummary {
  id: string;
  title: string;
  subAlbum: string | null;
  imageCount: number;
  coverImageUrl: string | null;
}

function parseFocalPoint(fp: string | null | undefined): string {
  if (!fp) return "50% 50%";
  const [x, y] = fp.split(",");
  return `${x}% ${y}%`;
}

// Mini modal para ajustar el focal point de la portada del año
function FocalPointModal({
  imageSrc,
  initialFocalPoint,
  onSave,
  onCancel,
  saving,
}: {
  imageSrc: string;
  initialFocalPoint: string | null;
  onSave: (fp: string) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [fp, setFp] = useState<{ x: number; y: number }>(() => {
    if (initialFocalPoint) {
      const [x, y] = initialFocalPoint.split(",").map(Number);
      return { x: isNaN(x) ? 50 : x, y: isNaN(y) ? 50 : y };
    }
    return { x: 50, y: 50 };
  });
  const dragging = useRef(false);

  const compute = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const y = Math.max(0, Math.min(100, Math.round(((e.clientY - rect.top) / rect.height) * 100)));
    setFp({ x, y });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-white font-semibold text-base">Editar punto focal de la portada del año</h2>
          <button onClick={onCancel} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5">
          <div className="space-y-2">
            <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Editor — clic o arrastra</p>
            <div
              className="relative select-none cursor-crosshair rounded-xl overflow-hidden"
              style={{ touchAction: "none" }}
              onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); compute(e); }}
              onPointerMove={(e) => { if (dragging.current) compute(e); }}
              onPointerUp={() => { dragging.current = false; }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageSrc} alt="" className="w-full h-auto block pointer-events-none" draggable={false} />
              <div
                className="absolute w-7 h-7 rounded-full border-[3px] border-white pointer-events-none -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${fp.x}%`, top: `${fp.y}%`, boxShadow: "0 0 0 2px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.6)" }}
              />
            </div>
            <p className="text-white/40 text-xs text-center">Punto: {fp.x}%, {fp.y}%</p>
          </div>
          <div className="space-y-2">
            <p className="text-white/60 text-xs font-medium uppercase tracking-wider">Preview 16:10</p>
            <div className="aspect-[16/10] rounded-xl overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageSrc} alt="" className="w-full h-full object-cover" style={{ objectPosition: `${fp.x}% ${fp.y}%` }} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-5 py-4 border-t border-white/10">
          <button onClick={onCancel} disabled={saving} className="px-4 py-2 rounded-xl text-sm font-medium text-white/70 border border-white/20 hover:bg-white/10 transition-colors disabled:opacity-50">
            Cancelar
          </button>
          <button onClick={() => onSave(`${fp.x},${fp.y}`)} disabled={saving} className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50">
            {saving ? "Guardando…" : "Guardar punto focal"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminYearPage({ params }: { params: Promise<{ year: string }> }) {
  const { year: yearStr } = use(params);
  const year = parseInt(yearStr, 10);
  const { t } = useTheme();
  const { addToast } = useToast();

  const [yearCover, setYearCover] = useState<YearCoverData | null>(null);
  const [albums, setAlbums] = useState<AlbumSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [focalModalOpen, setFocalModalOpen] = useState(false);
  const [focalSaving, setFocalSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/year-covers/${year}`).then((r) => r.json()),
      fetch(`/api/albums/year/${year}`).then((r) => r.json()),
    ])
      .then(([coverData, albumsData]) => {
        if (coverData.success) {
          setYearCover(coverData.data);
          setDescription(coverData.data?.description ?? "");
        }
        if (albumsData.success) setAlbums(albumsData.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [year]);

  const saveDescription = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/year-covers/${year}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim() || null }),
      });
      const data = await res.json();
      if (data.success) {
        setYearCover((prev) => prev ? { ...prev, description: description.trim() || null } : { coverImageUrl: null, coverFocalPoint: null, description: description.trim() || null });
        addToast("Descripción guardada", "success");
      } else {
        addToast(data.error || "Error", "error");
      }
    } catch {
      addToast("Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  const saveFocalPoint = async (fp: string) => {
    if (!yearCover?.coverImageUrl) return;
    setFocalSaving(true);
    try {
      const res = await fetch(`/api/year-covers/${year}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverFocalPoint: fp }),
      });
      const data = await res.json();
      if (data.success) {
        setYearCover((prev) => prev ? { ...prev, coverFocalPoint: fp } : prev);
        setFocalModalOpen(false);
        addToast("Punto focal actualizado", "success");
      } else {
        addToast(data.error || "Error", "error");
      }
    } catch {
      addToast("Error al guardar punto focal", "error");
    } finally {
      setFocalSaving(false);
    }
  };

  const removeCover = async () => {
    try {
      await fetch(`/api/year-covers/${year}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ coverImageUrl: null, coverFocalPoint: null }),
      });
      setYearCover((prev) => prev ? { ...prev, coverImageUrl: null, coverFocalPoint: null } : prev);
      addToast("Portada del año eliminada", "success");
    } catch {
      addToast("Error al quitar portada", "error");
    }
  };

  const inputClass = `w-full px-3 py-2.5 rounded-xl border ${t.inputBorder} ${t.inputBg} ${t.text} text-sm focus:ring-2 focus:ring-green-500 focus:outline-none`;

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${t.gradientBg}`}>
        <div className={`animate-spin rounded-full h-8 w-8 border-2 border-t-transparent ${t.border}`} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${t.gradientBg} transition-colors duration-300`}>
      <div className="max-w-2xl mx-auto px-6 py-8">

        <FadeUp className="mb-8 md:ml-0 ml-10">
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/admin/albums"
              className={`p-1.5 rounded-lg ${t.navItem} shrink-0`}
              title="Volver a álbumes"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className={`text-2xl font-bold ${t.text}`}>Configurar año {year}</h1>
              <p className={`text-sm ${t.textMuted} mt-0.5`}>
                {albums.length} álbum(es) · {albums.reduce((s, a) => s + a.imageCount, 0)} fotos
              </p>
            </div>
          </div>
        </FadeUp>

        <div className="space-y-5">

          {/* Descripción */}
          <div className={`${t.glassCard} rounded-2xl p-6`}>
            <h2 className={`text-sm font-semibold ${t.text} mb-1`}>Descripción del año</h2>
            <p className={`text-xs ${t.textMuted} mb-4`}>
              Aparece como subtítulo en la tarjeta del año en la página principal.
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: El año de los grandes viajes y momentos en familia"
              rows={3}
              className={`${inputClass} resize-none`}
            />
            <div className="flex justify-end mt-3">
              <button
                onClick={saveDescription}
                disabled={saving}
                className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {saving ? "Guardando…" : "Guardar descripción"}
              </button>
            </div>
          </div>

          {/* Portada */}
          <div className={`${t.glassCard} rounded-2xl p-6`}>
            <h2 className={`text-sm font-semibold ${t.text} mb-1`}>Portada del año</h2>
            <p className={`text-xs ${t.textMuted} mb-4`}>
              Imagen fija con punto focal para la tarjeta del año. Se asigna desde la galería de un álbum.
            </p>

            {yearCover?.coverImageUrl ? (
              <div className="space-y-3">
                {/* Preview de la portada actual */}
                <div className="aspect-[16/9] rounded-xl overflow-hidden relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={yearCover.coverImageUrl}
                    alt="Portada del año"
                    className="w-full h-full object-cover"
                    style={{ objectPosition: parseFocalPoint(yearCover.coverFocalPoint) }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-4">
                    <span className="text-3xl font-bold text-white drop-shadow-lg">{year}</span>
                    {description && (
                      <p className="text-sm text-white/80 mt-0.5 drop-shadow">{description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setFocalModalOpen(true)}
                    className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
                  >
                    Editar punto focal
                  </button>
                  <button
                    onClick={removeCover}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border ${t.inputBorder} ${t.danger} transition-colors`}
                  >
                    Quitar portada
                  </button>
                </div>
              </div>
            ) : (
              <div className={`rounded-xl ${t.inputBg} px-4 py-5 text-center`}>
                <p className={`text-sm ${t.textMuted} mb-3`}>
                  Sin portada asignada — el año mostrará un slideshow automático.
                </p>
                {albums.length > 0 && (
                  <p className={`text-xs ${t.textMuted}`}>
                    Para asignar una portada, ve a{" "}
                    <Link href={`/admin/albums/${albums[0].id}`} className="text-green-500 hover:underline">
                      uno de los álbumes de {year}
                    </Link>
                    {" "}y usa el botón verde (📅) en cualquier foto.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Álbumes del año */}
          {albums.length > 0 && (
            <div className={`${t.glassCard} rounded-2xl p-6`}>
              <h2 className={`text-sm font-semibold ${t.text} mb-4`}>Álbumes de {year}</h2>
              <div className="space-y-2">
                {albums.map((album) => (
                  <div key={album.id} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${t.inputBg}`}>
                    {album.coverImageUrl ? (
                      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={album.coverImageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className={`w-8 h-8 rounded-lg ${t.border} border flex items-center justify-center shrink-0`}>
                        <svg className={`w-4 h-4 ${t.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${t.text} truncate`}>{album.title}</p>
                      {album.subAlbum && (
                        <p className={`text-xs ${t.textMuted}`}>{album.subAlbum}</p>
                      )}
                    </div>
                    <span className={`text-xs ${t.textMuted} shrink-0`}>{album.imageCount} fotos</span>
                    <Link
                      href={`/admin/albums/${album.id}`}
                      className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-medium border ${t.inputBorder} ${t.text} hover:opacity-80 transition-opacity`}
                    >
                      Fotos →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Modal focal point */}
      {focalModalOpen && yearCover?.coverImageUrl && (
        <FocalPointModal
          imageSrc={yearCover.coverImageUrl}
          initialFocalPoint={yearCover.coverFocalPoint}
          onSave={saveFocalPoint}
          onCancel={() => setFocalModalOpen(false)}
          saving={focalSaving}
        />
      )}
    </div>
  );
}
