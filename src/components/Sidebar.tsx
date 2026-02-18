'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

export default function Sidebar() {
  const { t, isDark, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [years, setYears] = useState<{ year: number; totalImages: number }[]>([]);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    fetch('/api/years')
      .then(r => r.json())
      .then(d => { if (d.success) setYears(d.data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const activeYear = pathname.match(/\/album\/(\d+)/)?.[1];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className={`md:hidden fixed top-4 left-4 z-50 p-2 rounded-xl ${t.glassCard}`}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? 'Cerrar menu' : 'Abrir menu'}
      >
        <svg className={`w-5 h-5 ${t.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {mobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:sticky top-0 left-0 h-screen w-60 z-40
        ${t.sidebarBg}
        flex flex-col
        transition-all duration-300 ease-out
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        shrink-0 glass-glow
      `}>
        {/* Header */}
        <div className="px-5 pt-6 pb-4">
          <Link href="/" className="block">
            <h1 className={`text-lg font-bold ${t.text}`}>Album de Fotos</h1>
            <p className={`text-xs ${t.textMuted} mt-0.5`}>Tu galeria personal</p>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 overflow-y-auto">
          <div className="space-y-0.5">
            <Link
              href="/"
              className={`sidebar-nav-item ${isActive('/') && !activeYear ? t.navActive : t.navItem}`}
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Inicio
            </Link>
          </div>

          {years.length > 0 && (
            <div className="mt-6">
              <p className={`px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider ${t.textMuted}`}>
                Colecciones
              </p>
              <div className="space-y-0.5">
                {years.map(({ year, totalImages }) => (
                  <Link
                    key={year}
                    href={`/album/${year}`}
                    className={`sidebar-nav-item ${activeYear === String(year) ? t.navActive : t.navItem}`}
                  >
                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="flex-1">{year}</span>
                    <span className={`text-xs ${activeYear === String(year) ? 'text-white/60' : t.textMuted}`}>
                      {totalImages}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6">
            <p className={`px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider ${t.textMuted}`}>
              Acciones
            </p>
            <div className="space-y-0.5">
              <Link
                href="/admin"
                className={`sidebar-nav-item ${isActive('/admin') ? t.navActive : t.navItem}`}
              >
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Panel Admin
              </Link>
            </div>
          </div>
        </nav>

        {/* Dark mode toggle */}
        <div className={`px-4 py-4 border-t ${t.border}`}>
          <button
            onClick={toggleTheme}
            className={`sidebar-nav-item w-full ${t.navItem}`}
            aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {isDark ? (
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
            <span className="flex-1 text-left">Dark Mode</span>
            <div className={`toggle-track ${isDark ? 'bg-blue-600' : 'bg-gray-300'}`} data-checked={isDark ? 'true' : 'false'}>
              <div className="toggle-thumb" />
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
