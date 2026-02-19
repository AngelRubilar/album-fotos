"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/MotionWrap";

interface Stats {
  totalImages: number;
  totalAlbums: number;
  totalYears: number;
  diskUsageMB: number;
}

export default function AdminDashboard() {
  const { t } = useTheme();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => { if (d.success) setStats(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = stats
    ? [
        {
          label: "Total de fotos",
          value: stats.totalImages.toLocaleString("es"),
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
          color: "text-blue-500",
        },
        {
          label: "Total de álbumes",
          value: stats.totalAlbums.toLocaleString("es"),
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          ),
          color: "text-emerald-500",
        },
        {
          label: "Años con fotos",
          value: stats.totalYears.toLocaleString("es"),
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          ),
          color: "text-violet-500",
        },
        {
          label: "Espacio en disco",
          value: `${stats.diskUsageMB} MB`,
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
            </svg>
          ),
          color: "text-amber-500",
        },
      ]
    : [];

  return (
    <div className={`min-h-screen ${t.gradientBg} transition-colors duration-300`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <FadeUp className="mb-8 md:ml-0 ml-10">
          <h1 className={`text-2xl font-bold ${t.text}`}>Dashboard</h1>
          <p className={`text-sm ${t.textMuted} mt-1`}>Resumen de tu galería personal</p>
        </FadeUp>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className={`animate-spin rounded-full h-8 w-8 border-2 border-t-transparent ${t.border}`} />
          </div>
        ) : (
          <>
            <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((card) => (
                <StaggerItem key={card.label} className={`${t.glassCard} rounded-2xl p-5`}>
                  <div className={`${card.color} mb-3`}>{card.icon}</div>
                  <p className={`text-2xl font-bold ${t.text}`}>{card.value}</p>
                  <p className={`text-xs ${t.textMuted} mt-1`}>{card.label}</p>
                </StaggerItem>
              ))}
            </StaggerContainer>

            <FadeUp>
              <h2 className={`text-base font-semibold ${t.text} mb-4`}>Acceso rápido</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link
                  href="/admin/albums"
                  className={`${t.glassCard} rounded-2xl p-6 flex items-center gap-4 hover:scale-[1.01] transition-transform`}
                >
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className={`font-semibold ${t.text}`}>Gestionar Álbumes</p>
                    <p className={`text-sm ${t.textMuted}`}>Crear y eliminar álbumes</p>
                  </div>
                </Link>

                <Link
                  href="/admin/upload"
                  className={`${t.glassCard} rounded-2xl p-6 flex items-center gap-4 hover:scale-[1.01] transition-transform`}
                >
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <div>
                    <p className={`font-semibold ${t.text}`}>Subir Fotos</p>
                    <p className={`text-sm ${t.textMuted}`}>Añadir nuevas imágenes</p>
                  </div>
                </Link>
              </div>
            </FadeUp>
          </>
        )}
      </div>
    </div>
  );
}
