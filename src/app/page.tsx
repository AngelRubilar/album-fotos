'use client';

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useTheme } from "@/contexts/ThemeContext";
import AlbumPreview from "@/components/AlbumPreview";
import SearchBar from "@/components/SearchBar";
import { Skeleton, AlbumCardSkeleton } from "@/components/Skeleton";
import { FadeUp, StaggerContainer, StaggerItem } from "@/components/MotionWrap";

interface Year {
  year: number;
  totalImages: number;
  albumCount: number;
}

export default function Home() {
  const { t } = useTheme();
  const [years, setYears] = useState<Year[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/years')
      .then(r => r.json())
      .then(d => { if (d.success) setYears(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredYears = useMemo(() =>
    years.filter(y => String(y.year).includes(searchQuery)),
    [years, searchQuery]
  );

  if (loading) {
    return (
      <div className={`min-h-screen ${t.gradientBg}`}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="mb-10">
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <AlbumCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${t.gradientBg}`}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <FadeUp className="mb-10 md:ml-0 ml-10">
          <h1 className={`text-3xl font-bold ${t.text} mb-1`}>Bienvenido</h1>
          <p className={`${t.textMuted}`}>Tus recuerdos organizados por momentos</p>
        </FadeUp>

        {/* Busqueda */}
        {years.length > 0 && (
          <div className="mb-6 max-w-sm">
            <SearchBar onSearch={setSearchQuery} placeholder="Buscar por año..." />
          </div>
        )}

        {/* Year Cards */}
        {filteredYears.length === 0 && !searchQuery ? (
          <div className="text-center py-20">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl ${t.glassCard} mb-6`}>
              <svg className={`w-10 h-10 ${t.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className={`text-xl font-semibold ${t.text} mb-2`}>Sin fotos todavia</h3>
            <p className={`${t.textMuted} mb-6 max-w-sm mx-auto`}>Sube tus primeras fotos para comenzar a crear tu galeria.</p>
            <Link href="/upload">
              <button className="btn-glass-accent px-6 py-3 rounded-xl text-white font-medium">Subir Fotos</button>
            </Link>
          </div>
        ) : filteredYears.length === 0 && searchQuery ? (
          <div className="text-center py-16">
            <p className={`${t.textMuted}`}>No se encontraron resultados para &ldquo;{searchQuery}&rdquo;</p>
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredYears.map((yearData) => (
              <StaggerItem key={yearData.year}>
                <Link
                  href={`/album/${yearData.year}`}
                  className="group block"
                >
                  <div className={`rounded-2xl overflow-hidden ${t.glassCard} glass-card glass-glow`}>
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <AlbumPreview year={yearData.year} className="w-full h-full" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <h2 className="text-4xl font-bold text-white drop-shadow-lg">{yearData.year}</h2>
                      </div>
                      <div className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium bg-black/30 backdrop-blur-md text-white border border-white/20">
                        {yearData.totalImages} fotos
                      </div>
                    </div>
                    <div className="px-5 py-4">
                      <p className={`text-sm ${t.textMuted}`}>
                        {yearData.albumCount} album{yearData.albumCount !== 1 ? 'es' : ''}
                      </p>
                      <span className={`text-sm font-medium ${t.accent} inline-flex items-center gap-1 mt-2 group-hover:gap-2 transition-all`}>
                        Explorar
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </div>
    </div>
  );
}
