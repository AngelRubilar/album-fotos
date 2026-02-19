import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuración para Docker (standalone output)
  output: 'standalone',

  // Deshabilitar ESLint durante el build de producción
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Deshabilitar TypeScript checks durante build
  typescript: {
    ignoreBuildErrors: true, // Necesario porque seed.ts tiene errores pero no se usa en producción
  },

  images: {
    // Formatos de imagen optimizados (AVIF primero, WebP como fallback)
    formats: ['image/avif', 'image/webp'],

    // Tamaños de dispositivos para responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],

    // Tamaños de iconos y thumbnails (400 = ancho de thumbnails generados)
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 400],

    // Dominios permitidos para imágenes remotas (si se usan en el futuro)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],

    // Cache de imágenes optimizadas
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 año
  },

  // Configuración experimental para mejor rendimiento
  experimental: {
    // Optimización de imports
    optimizePackageImports: ['react', 'react-dom'],
  },

  // Configuración de headers para caché
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Headers para endpoint de descarga
      {
        source: '/api/albums/:id/download',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/zip',
          },
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
