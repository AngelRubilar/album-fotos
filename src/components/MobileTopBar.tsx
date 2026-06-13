'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useSidebar } from '@/contexts/SidebarContext';

// Barra superior de la app en móvil. En desktop el sidebar es permanente,
// así que esta barra solo aparece en móvil (md:hidden). Vive en el flujo del
// layout, por lo que el contenido siempre queda debajo (no flota sobre la hora).
export default function MobileTopBar() {
  const pathname = usePathname();
  const { t } = useTheme();
  const { open, toggle } = useSidebar();

  // El panel admin tiene su propia barra/sidebar
  if (pathname.startsWith('/admin')) return null;

  return (
    <header className={`md:hidden shrink-0 relative z-50 flex items-center gap-1 h-14 px-2 ${t.sidebarBg} border-b ${t.border}`}>
      <button
        onClick={toggle}
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        aria-expanded={open}
        className={`h-11 w-11 flex items-center justify-center rounded-xl ${t.navItem}`}
      >
        <svg className={`w-6 h-6 ${t.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
      <Link href="/" className={`font-display text-lg font-semibold ${t.text}`}>
        Álbum de Fotos
      </Link>
    </header>
  );
}
