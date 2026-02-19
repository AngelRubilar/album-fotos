"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/components/Toast";
import { FadeUp } from "@/components/MotionWrap";

interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export default function AdminCategoriesPage() {
  const { t } = useTheme();
  const { addToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/categories")
      .then((r) => r.json())
      .then((d) => { if (d.success) setCategories(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const createCategory = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) => [...prev, data.data].sort((a, b) => a.name.localeCompare(b.name)));
        setNewName("");
        addToast("Categoría creada", "success");
      } else {
        addToast(data.error || "Error", "error");
      }
    } catch {
      addToast("Error al crear", "error");
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async () => {
    if (!editName.trim() || !editingId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/categories/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) =>
          prev.map((c) => (c.id === editingId ? data.data : c)).sort((a, b) => a.name.localeCompare(b.name))
        );
        setEditingId(null);
        addToast("Categoría actualizada", "success");
      } else {
        addToast(data.error || "Error", "error");
      }
    } catch {
      addToast("Error al guardar", "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteCategory = async (id: string, name: string) => {
    if (!confirm(`Eliminar la categoría "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setCategories((prev) => prev.filter((c) => c.id !== id));
        addToast("Categoría eliminada", "success");
      } else {
        addToast(data.error || "Error", "error");
      }
    } catch {
      addToast("Error al eliminar", "error");
    }
  };

  return (
    <div className={`min-h-screen ${t.gradientBg} transition-colors duration-300`}>
      <div className="max-w-2xl mx-auto px-6 py-8">
        <FadeUp className="mb-6 md:ml-0 ml-10">
          <h1 className={`text-2xl font-bold ${t.text}`}>Categorías</h1>
          <p className={`text-sm ${t.textMuted} mt-1`}>
            Organiza tus álbumes en categorías predefinidas
          </p>
        </FadeUp>

        {/* Formulario nueva categoría */}
        <div className={`${t.glassCard} rounded-2xl p-5 mb-6`}>
          <label className={`block text-sm font-medium ${t.text} mb-2`}>Nueva categoría</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && createCategory()}
              placeholder="Ej: Viajes, Cumpleaños, Navidad…"
              className={`flex-1 px-4 py-2.5 rounded-xl border ${t.inputBorder} ${t.inputBg} ${t.text} focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm`}
            />
            <button
              onClick={createCategory}
              disabled={!newName.trim() || saving}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-white btn-glass-accent disabled:opacity-50"
            >
              Agregar
            </button>
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className={`animate-spin rounded-full h-7 w-7 border-2 border-t-transparent ${t.border}`} />
          </div>
        ) : categories.length === 0 ? (
          <div className={`${t.glassCard} rounded-2xl p-10 text-center`}>
            <p className={`text-lg font-semibold ${t.text} mb-1`}>Sin categorías</p>
            <p className={`text-sm ${t.textMuted}`}>Crea tu primera categoría arriba.</p>
          </div>
        ) : (
          <div className={`${t.glassCard} rounded-2xl overflow-hidden`}>
            <div className={`px-4 py-3 border-b ${t.border}`}>
              <p className={`text-xs font-semibold uppercase tracking-wider ${t.textMuted}`}>
                {categories.length} categoría(s)
              </p>
            </div>
            <ul className="divide-y divide-black/5 dark:divide-white/5">
              {categories.map((cat) => (
                <li key={cat.id} className="flex items-center gap-3 px-4 py-3">
                  {editingId === cat.id ? (
                    <>
                      <input
                        autoFocus
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit();
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        className={`flex-1 px-3 py-1.5 rounded-lg border ${t.inputBorder} ${t.inputBg} ${t.text} text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none`}
                      />
                      <button
                        onClick={saveEdit}
                        disabled={saving}
                        className="px-3 py-1.5 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className={`px-3 py-1.5 rounded-lg text-sm border ${t.inputBorder} ${t.text}`}
                      >
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <span className={`flex-1 text-sm font-medium ${t.text}`}>{cat.name}</span>
                      <button
                        onClick={() => { setEditingId(cat.id); setEditName(cat.name); }}
                        className={`p-1.5 rounded-lg ${t.navItem}`}
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => deleteCategory(cat.id, cat.name)}
                        className={`p-1.5 rounded-lg ${t.danger}`}
                        title="Eliminar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
