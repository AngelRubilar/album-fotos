"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/contexts/ThemeContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { t, isDark, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    {
      href: "/admin",
      label: "Dashboard",
      exact: true,
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
    {
      href: "/admin/albums",
      label: "Álbumes",
      exact: false,
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
    },
    {
      href: "/admin/upload",
      label: "Subir Fotos",
      exact: false,
      icon: (
        <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
    },
  ];

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  };

  const sidebar = (
    <aside className={`
      fixed md:sticky top-0 left-0 h-screen w-60 z-40
      ${t.sidebarBg}
      flex flex-col
      transition-all duration-300 ease-out
      ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      shrink-0 glass-glow
    `}>
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <Link href="/admin" className="block">
          <h1 className={`text-lg font-bold ${t.text}`}>Panel Admin</h1>
          <p className={`text-xs ${t.textMuted} mt-0.5`}>Gestión del álbum</p>
        </Link>
      </div>

      {/* Volver al album */}
      <div className="px-3 mb-2">
        <Link
          href="/"
          className={`sidebar-nav-item ${t.navItem}`}
          onClick={() => setMobileOpen(false)}
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Volver al álbum
        </Link>
      </div>

      <div className={`mx-4 mb-4 border-t ${t.border}`} />

      {/* Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <p className={`px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider ${t.textMuted}`}>
          Administración
        </p>
        <div className="space-y-0.5">
          {navItems.map(({ href, label, exact, icon }) => (
            <Link
              key={href}
              href={href}
              className={`sidebar-nav-item ${isActive(href, exact) ? t.navActive : t.navItem}`}
              onClick={() => setMobileOpen(false)}
            >
              {icon}
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Dark mode toggle */}
      <div className={`px-4 py-4 border-t ${t.border}`}>
        <button
          onClick={toggleTheme}
          className={`sidebar-nav-item w-full ${t.navItem}`}
          aria-label={isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
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
          <div className={`toggle-track ${isDark ? "bg-blue-600" : "bg-gray-300"}`} data-checked={isDark ? "true" : "false"}>
            <div className="toggle-thumb" />
          </div>
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden w-full">
      {/* Mobile hamburger */}
      <button
        className={`md:hidden fixed top-4 left-4 z-50 p-2 rounded-xl ${t.glassCard}`}
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label={mobileOpen ? "Cerrar menu" : "Abrir menu"}
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
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {sidebar}

      <div className="flex-1 h-screen overflow-y-auto glass-bg">
        {children}
      </div>
    </div>
  );
}
