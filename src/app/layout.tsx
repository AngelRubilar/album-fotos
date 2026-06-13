import type { Metadata, Viewport } from "next";
import { Newsreader, Hanken_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastProvider } from "@/components/Toast";
import ErrorBoundary from "@/components/ErrorBoundary";
import ConditionalSidebar from "@/components/ConditionalSidebar";

// Display: serif literario y refinado (títulos, años)
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

// Body: grotesca limpia para UI y texto
const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Album de Fotos",
  description: "Tu galeria personal de recuerdos",
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Album de Fotos',
  },
};

export const viewport: Viewport = {
  themeColor: '#2f6b6b',
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        {/* Aplica el tema guardado ANTES de pintar para evitar el flash claro
            en modo oscuro (FOUC). Debe ir antes que el resto. */}
        <script dangerouslySetInnerHTML={{ __html: `try{if(localStorage.getItem('album-theme')==='dark'){document.documentElement.className='dark'}}catch(e){}` }} />
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}` }} />
      </head>
      <body className={`${newsreader.variable} ${hanken.variable} antialiased`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-[#2f6b6b] focus:text-white">
          Saltar al contenido
        </a>
        <ThemeProvider>
          <ToastProvider>
            <div className={`flex h-screen overflow-hidden`}>
              <ConditionalSidebar />
              <main id="main-content" className="flex-1 h-screen overflow-y-auto glass-bg">
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </main>
            </div>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
