"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/components/Toast";
import { FadeUp } from "@/components/MotionWrap";

interface Album {
  id: string;
  year: number;
  title: string;
  description: string | null;
  subAlbum?: string | null;
  categoryId?: string | null;
  category?: { id: string; name: string } | null;
  eventDate?: string | null;
  coverImageUrl?: string | null;
  coverFocalPoint?: string | null;
  imageCount: number;
  createdAt: string;
  updatedAt: string;
}

function parseFocalPoint(fp: string | null | undefined): string {
  if (!fp) return "50% 50%";
  const [x, y] = fp.split(",");
  return `${x}% ${y}%`;
}

interface Category {
  id: string;
  name: string;
}

type SortKey = "year" | "title" | "imageCount";
type SortDir = "asc" | "desc";

const inputClass = (t: any) =>
  `w-full px-3 py-2.5 rounded-xl border ${t.inputBorder} ${t.inputBg} ${t.text} text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none`;

function formatEventDate(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("es", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

// Convierte Date a string "YYYY-MM-DD" para input[type=date]
function toDateInput(dateStr: string | null | undefined) {
  if (!dateStr) return "";
  return new Date(dateStr).toISOString().slice(0, 10);
}

export default function AdminAlbumsPage() {
  const { t } = useTheme();
  const { addToast } = useToast();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newAlbum, setNewAlbum] = useState({
    year: new Date().getFullYear(),
    title: "",
    description: "",
    categoryId: "",
    eventDate: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState({ title: "", description: "", categoryId: "", eventDate: "" });
  const [sortKey, setSortKey] = useState<SortKey>("year");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    Promise.all([
      fetch("/api/albums").then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
    ])
      .then(([albumsData, catsData]) => {
        if (albumsData.success) setAlbums(albumsData.data);
        if (catsData.success) setCategories(catsData.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const sortedAlbums = useMemo(() => {
    return [...albums].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "year") cmp = a.year - b.year;
      else if (sortKey === "title") cmp = a.title.localeCompare(b.title);
      else if (sortKey === "imageCount") cmp = a.imageCount - b.imageCount;
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [albums, sortKey, sortDir]);

  const groupedByYear = useMemo(() => {
    const groups = new Map<number, Album[]>();
    for (const album of sortedAlbums) {
      if (!groups.has(album.year)) groups.set(album.year, []);
      groups.get(album.year)!.push(album);
    }
    const years = Array.from(groups.keys()).sort((a, b) =>
      sortKey === "year" ? (sortDir === "desc" ? b - a : a - b) : b - a
    );
    return years.map((year) => ({ year, albums: groups.get(year)! }));
  }, [sortedAlbums, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("desc"); }
  };

  const SortButton = ({ label, k }: { label: string; k: SortKey }) => (
    <button
      onClick={() => toggleSort(k)}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        sortKey === k ? t.navActive : t.navItem
      }`}
    >
      {label}
      {sortKey === k && (
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5}
            d={sortDir === "desc" ? "M19 9l-7 7-7-7" : "M5 15l7-7 7 7"} />
        </svg>
      )}
    </button>
  );

  const createAlbum = async () => {
    if (!newAlbum.title.trim()) { addToast("El título es requerido", "error"); return; }
    try {
      const res = await fetch("/api/albums", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAlbum),
      });
      const data = await res.json();
      if (data.success) {
        setAlbums((prev) => [...prev, data.data]);
        setNewAlbum({ year: new Date().getFullYear(), title: "", description: "", categoryId: "", eventDate: "" });
        setShowForm(false);
        addToast("Álbum creado exitosamente", "success");
      } else {
        addToast(data.error || "Error", "error");
      }
    } catch {
      addToast("Error al crear álbum", "error");
    }
  };

  const startEdit = (album: Album) => {
    setEditingId(album.id);
    setEditData({
      title: album.title,
      description: album.description || "",
      categoryId: album.categoryId || "",
      eventDate: toDateInput(album.eventDate),
    });
  };

  const saveEdit = async (id: string) => {
    if (!editData.title.trim()) { addToast("El título es requerido", "error"); return; }
    try {
      const res = await fetch(`/api/albums/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (data.success) {
        setAlbums((prev) => prev.map((a) => a.id === id ? { ...a, ...data.data } : a));
        setEditingId(null);
        addToast("Álbum actualizado", "success");
      } else {
        addToast(data.error || "Error", "error");
      }
    } catch {
      addToast("Error al guardar", "error");
    }
  };

  const deleteAlbum = async (id: string, name: string) => {
    if (!confirm(`Eliminar "${name}" y todas sus fotos?`)) return;
    try {
      const res = await fetch(`/api/albums/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setAlbums((prev) => prev.filter((a) => a.id !== id));
        addToast("Álbum eliminado", "success");
      } else {
        addToast(data.error || "Error", "error");
      }
    } catch {
      addToast("Error al eliminar", "error");
    }
  };

  const CategorySelect = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={inputClass(t)}>
      <option value="">— Sin categoría —</option>
      {categories.map((c) => (
        <option key={c.id} value={c.id}>{c.name}</option>
      ))}
    </select>
  );

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${t.gradientBg}`}>
        <div className={`animate-spin rounded-full h-8 w-8 border-2 border-t-transparent ${t.border}`} />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${t.gradientBg} transition-colors duration-300`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Header */}
        <FadeUp className="mb-6 md:ml-0 ml-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className={`text-2xl font-bold ${t.text}`}>Álbumes</h1>
              <p className={`text-sm ${t.textMuted} mt-1`}>
                {albums.length} álbum(es) · {groupedByYear.length} año(s)
              </p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="shrink-0 px-4 py-2 rounded-xl text-sm font-medium text-white btn-glass-accent"
            >
              {showForm ? "Cancelar" : "+ Crear Álbum"}
            </button>
          </div>
        </FadeUp>

        {/* Formulario nuevo álbum */}
        {showForm && (
          <div className={`${t.glassCard} rounded-2xl p-6 mb-6`}>
            <h3 className={`font-semibold ${t.text} mb-4`}>Nuevo Álbum</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-medium ${t.textMuted} mb-1.5`}>Año</label>
                <input
                  type="number"
                  value={newAlbum.year}
                  onChange={(e) => setNewAlbum((p) => ({ ...p, year: parseInt(e.target.value) }))}
                  className={inputClass(t)}
                />
              </div>
              <div>
                <label className={`block text-xs font-medium ${t.textMuted} mb-1.5`}>Título *</label>
                <input
                  type="text"
                  value={newAlbum.title}
                  onChange={(e) => setNewAlbum((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Ej: Vacaciones"
                  className={inputClass(t)}
                />
              </div>
              <div>
                <label className={`block text-xs font-medium ${t.textMuted} mb-1.5`}>
                  Fecha del evento
                </label>
                <input
                  type="date"
                  value={newAlbum.eventDate}
                  onChange={(e) => {
                    const date = e.target.value;
                    const year = date ? new Date(date).getFullYear() : newAlbum.year;
                    setNewAlbum((p) => ({ ...p, eventDate: date, year }));
                  }}
                  className={inputClass(t)}
                />
              </div>
              <div>
                <label className={`block text-xs font-medium ${t.textMuted} mb-1.5`}>
                  Categoría{" "}
                  <Link href="/admin/categories" className="text-blue-500 hover:underline ml-1">
                    (gestionar)
                  </Link>
                </label>
                <CategorySelect
                  value={newAlbum.categoryId}
                  onChange={(v) => setNewAlbum((p) => ({ ...p, categoryId: v }))}
                />
              </div>
              <div className="sm:col-span-2">
                <label className={`block text-xs font-medium ${t.textMuted} mb-1.5`}>Descripción</label>
                <input
                  type="text"
                  value={newAlbum.description}
                  onChange={(e) => setNewAlbum((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Opcional"
                  className={inputClass(t)}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => setShowForm(false)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border ${t.inputBorder} ${t.text}`}
              >
                Cancelar
              </button>
              <button
                onClick={createAlbum}
                className="px-5 py-2 rounded-xl text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                Crear
              </button>
            </div>
          </div>
        )}

        {albums.length === 0 ? (
          <div className="text-center py-24">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl ${t.glassCard} mb-6`}>
              <svg className={`w-10 h-10 ${t.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className={`text-lg font-semibold ${t.text} mb-2`}>Sin álbumes</h3>
            <p className={`${t.textMuted} mb-5`}>Crea tu primer álbum para empezar.</p>
            <button onClick={() => setShowForm(true)} className="px-5 py-2 rounded-xl text-white font-medium btn-glass-accent">
              Crear Álbum
            </button>
          </div>
        ) : (
          <>
            {/* Controles de ordenamiento */}
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              <span className={`text-xs font-medium ${t.textMuted} mr-1`}>Ordenar:</span>
              <SortButton label="Año" k="year" />
              <SortButton label="Nombre" k="title" />
              <SortButton label="Fotos" k="imageCount" />
            </div>

            {/* Grupos por año */}
            <div className="space-y-8">
              {groupedByYear.map(({ year, albums: yearAlbums }) => (
                <div key={year}>
                  <div className="flex items-center gap-3 mb-3">
                    <h2 className={`text-base font-bold ${t.text}`}>{year}</h2>
                    <div className={`flex-1 h-px ${t.border}`} />
                    <span className={`text-xs ${t.textMuted}`}>{yearAlbums.length} álbum(es)</span>
                    <Link
                      href={`/admin/years/${year}`}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium border ${t.inputBorder} ${t.text} hover:opacity-80 transition-opacity`}
                      title={`Configurar año ${year}`}
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {year}
                    </Link>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {yearAlbums.map((album) => (
                      <div key={album.id} className={`${t.glassCard} rounded-2xl overflow-hidden`}>
                        {editingId === album.id ? (
                          /* Modo edición */
                          <div className="p-5">
                            <p className={`text-xs font-semibold ${t.textMuted} uppercase tracking-wider mb-3`}>
                              Editando
                            </p>
                            <div className="space-y-3">
                              <div>
                                <label className={`block text-xs ${t.textMuted} mb-1`}>Título *</label>
                                <input
                                  autoFocus
                                  type="text"
                                  value={editData.title}
                                  onChange={(e) => setEditData((p) => ({ ...p, title: e.target.value }))}
                                  className={inputClass(t)}
                                />
                              </div>
                              <div>
                                <label className={`block text-xs ${t.textMuted} mb-1`}>Fecha del evento</label>
                                <input
                                  type="date"
                                  value={editData.eventDate}
                                  onChange={(e) => setEditData((p) => ({ ...p, eventDate: e.target.value }))}
                                  className={inputClass(t)}
                                />
                              </div>
                              <div>
                                <label className={`block text-xs ${t.textMuted} mb-1`}>
                                  Categoría{" "}
                                  <Link href="/admin/categories" className="text-blue-500 hover:underline">
                                    (gestionar)
                                  </Link>
                                </label>
                                <CategorySelect
                                  value={editData.categoryId}
                                  onChange={(v) => setEditData((p) => ({ ...p, categoryId: v }))}
                                />
                              </div>
                              <div>
                                <label className={`block text-xs ${t.textMuted} mb-1`}>Descripción</label>
                                <input
                                  type="text"
                                  value={editData.description}
                                  onChange={(e) => setEditData((p) => ({ ...p, description: e.target.value }))}
                                  placeholder="Opcional"
                                  className={inputClass(t)}
                                />
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <button
                                onClick={() => setEditingId(null)}
                                className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium border ${t.inputBorder} ${t.text}`}
                              >
                                Cancelar
                              </button>
                              <button
                                onClick={() => saveEdit(album.id)}
                                className="flex-1 px-3 py-2 rounded-xl text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                              >
                                Guardar
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Modo vista */
                          <div>
                            {/* Portada */}
                            {album.coverImageUrl ? (
                              <div className="relative h-36 overflow-hidden">
                                <img
                                  src={album.coverImageUrl}
                                  alt={`Portada de ${album.title}`}
                                  className="w-full h-full object-cover"
                                  style={{ objectPosition: parseFocalPoint(album.coverFocalPoint) }}
                                />
                                <div className={`absolute inset-0 bg-gradient-to-t from-black/40 to-transparent`} />
                              </div>
                            ) : (
                              <div className={`h-16 flex items-center justify-center ${t.inputBg} opacity-60`}>
                                <svg className={`w-6 h-6 ${t.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                            )}
                            <div className="p-5">
                            <div className="flex items-start justify-between mb-2">
                              <div className="min-w-0 flex-1 mr-2">
                                <h3 className={`font-semibold ${t.text} truncate`}>{album.title}</h3>
                                {album.subAlbum && (
                                  <span className={`inline-block text-xs px-2 py-0.5 rounded-full mt-1 ${t.inputBg} ${t.textMuted}`}>
                                    {album.subAlbum}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  onClick={() => startEdit(album)}
                                  className={`p-1.5 rounded-lg ${t.navItem} transition-colors`}
                                  title="Editar"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => deleteAlbum(album.id, album.title)}
                                  className={`p-1.5 rounded-lg ${t.danger} transition-colors`}
                                  title="Eliminar"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>

                            {album.description && (
                              <p className={`text-xs ${t.textMuted} mb-3 line-clamp-2`}>{album.description}</p>
                            )}

                            <div className={`space-y-1 text-xs ${t.textMuted} mb-4`}>
                              {album.eventDate && (
                                <p className="flex items-center gap-1.5">
                                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <span className={`font-medium ${t.text}`}>{formatEventDate(album.eventDate)}</span>
                                </p>
                              )}
                              <p className="flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {album.imageCount} fotos
                              </p>
                            </div>

                            <div className="grid grid-cols-3 gap-1.5">
                              <Link href={`/admin/albums/${album.id}`} className="col-span-2">
                                <button className={`w-full px-3 py-2 rounded-xl text-xs font-medium border ${t.inputBorder} ${t.text} hover:opacity-80 transition-opacity`}>
                                  Gestionar fotos
                                </button>
                              </Link>
                              <Link href={`/album/${album.year}?album=${album.id}`}>
                                <button className="w-full px-3 py-2 rounded-xl text-xs font-medium text-white btn-glass-accent">
                                  Ver →
                                </button>
                              </Link>
                            </div>
                            </div>{/* /p-5 */}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
