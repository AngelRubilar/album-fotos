# 🚀 GUÍA DE IMPLEMENTACIÓN - COMPONENTES LUMINA GALLERY

> Orden de implementación paso a paso con ejemplos de código listos para usar

---

## 📋 ORDEN DE IMPLEMENTACIÓN RECOMENDADO

### FASE 1: Setup y Fundamentos (Día 1-2)

#### 1.1 Instalar Dependencias

```bash
cd album-fotos
npm install @tanstack/react-query @tanstack/react-virtual
npm install framer-motion
npm install zustand
npm install react-masonry-css
npm install exifr
npm install lucide-react
npm install focus-trap-react
npm install sonner  # Para toasts
npm install -D @storybook/nextjs @storybook/addon-a11y
```

#### 1.2 Crear Estructura de Carpetas

```bash
# En src/
mkdir -p components/ui
mkdir -p components/layout
mkdir -p components/gallery
mkdir -p components/explore
mkdir -p components/albums
mkdir -p components/themes
mkdir -p hooks
mkdir -p store
mkdir -p types
mkdir -p lib
```

#### 1.3 Crear Tipos Base

```typescript
// src/types/image.ts

export interface Image {
  id: string;
  url: string;
  thumbnailUrl: string;
  alt: string;
  width: number;
  height: number;
  isFavorite: boolean;
  featured: boolean;
  exifData?: ExifData;
  takenAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExifData {
  takenAt?: Date;
  cameraMake?: string;
  cameraModel?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: number;
  width?: number;
  height?: number;
  fileSize?: number;
  location?: string;
  latitude?: number;
  longitude?: number;
}
```

```typescript
// src/types/album.ts

export interface Album {
  id: string;
  year: number;
  title: string;
  description?: string;
  coverImageUrl: string;
  imageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SmartAlbum {
  id: string;
  title: string;
  description?: string;
  icon: string;
  imageCount: number;
  coverImages: string[];
  isSystem: boolean;
  rules: SmartAlbumRule[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SmartAlbumRule {
  field: 'date' | 'camera' | 'location' | 'favorite' | 'tag';
  operator: 'equals' | 'contains' | 'between' | 'in' | 'exists';
  value: any;
}
```

```typescript
// src/types/theme.ts

export interface Theme {
  id: string;
  name: string;
  description: string;
  category: 'light' | 'dark' | 'glass';
  preview: string;
  cssVariables: Record<string, string>;
}
```

### FASE 2: Atoms (Día 2-3)

#### 2.1 Button Components

```typescript
// src/components/ui/Button.tsx

'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  icon,
  fullWidth = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-medium transition-all rounded-lg';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400 dark:bg-gray-700 dark:text-white',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed';
  const fullWidthClass = fullWidth ? 'w-full' : '';

  return (
    <motion.button
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${(disabled || isLoading) && disabledClasses}
        ${fullWidthClass}
        ${className}
      `}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      ) : icon}
      {children}
    </motion.button>
  );
}
```

```typescript
// src/components/ui/IconButton.tsx

'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'solid';
}

export function IconButton({
  icon,
  label,
  size = 'md',
  variant = 'ghost',
  className = '',
  ...props
}: IconButtonProps) {
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  const variantClasses = {
    ghost: 'hover:bg-white/10 backdrop-blur-md',
    solid: 'bg-white/10 backdrop-blur-md hover:bg-white/20',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      aria-label={label}
      className={`
        rounded-full transition-colors
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${className}
      `}
      {...props}
    >
      {icon}
    </motion.button>
  );
}
```

#### 2.2 Input Components

```typescript
// src/components/ui/TextInput.tsx

'use client';

import React, { forwardRef } from 'react';

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(
  function TextInput(
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = '',
      id,
      ...props
    },
    ref
  ) {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-4 py-2 rounded-lg
              bg-white dark:bg-gray-800
              border ${error ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
              focus:outline-none focus:ring-2 focus:ring-blue-500
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${className}
            `}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}

        {helperText && !error && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        )}
      </div>
    );
  }
);
```

#### 2.3 Image Components

```typescript
// src/components/ui/OptimizedImage.tsx

'use client';

import React, { useState } from 'react';
import Image from 'next/image';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-200 dark:bg-gray-800 ${className}`}
        style={{ width, height }}
      >
        <span className="text-gray-400 text-sm">Failed to load image</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        onLoad={handleLoad}
        onError={handleError}
        className={`
          transition-all duration-700 ease-in-out
          ${isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0'}
        `}
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800 animate-pulse">
          <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}
```

### FASE 3: Hooks (Día 3-4)

#### 3.1 Store (Zustand)

```typescript
// src/store/useAppStore.ts

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface Filters {
  searchQuery: string;
  dateRange?: { startDate?: Date; endDate?: Date };
  albums: string[];
  cameras: string[];
  tags: string[];
  onlyFavorites: boolean;
}

interface User {
  name: string;
  avatar?: string;
}

interface AppState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Filters
  filters: Filters;

  // User
  user?: User;

  // Actions
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  collapseSidebar: (collapsed: boolean) => void;
  setFilters: (filters: Partial<Filters>) => void;
  clearFilters: () => void;
  setUser: (user: User) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        sidebarOpen: true,
        sidebarCollapsed: false,
        filters: {
          searchQuery: '',
          albums: [],
          cameras: [],
          tags: [],
          onlyFavorites: false,
        },
        user: undefined,

        // Actions
        toggleSidebar: () =>
          set((state) => ({ sidebarOpen: !state.sidebarOpen })),

        setSidebarOpen: (open) =>
          set({ sidebarOpen: open }),

        collapseSidebar: (collapsed) =>
          set({ sidebarCollapsed: collapsed }),

        setFilters: (newFilters) =>
          set((state) => ({
            filters: { ...state.filters, ...newFilters },
          })),

        clearFilters: () =>
          set({
            filters: {
              searchQuery: '',
              albums: [],
              cameras: [],
              tags: [],
              onlyFavorites: false,
            },
          }),

        setUser: (user) => set({ user }),
      }),
      {
        name: 'lumina-storage',
        partialize: (state) => ({
          sidebarCollapsed: state.sidebarCollapsed,
          user: state.user,
        }),
      }
    ),
    {
      name: 'Lumina App Store',
    }
  )
);
```

#### 3.2 React Query Setup

```typescript
// src/app/providers.tsx

'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from 'sonner';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000, // 1 minute
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
        <Toaster position="top-right" />
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

```typescript
// src/app/layout.tsx - Update to use Providers

import { Providers } from './providers';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

#### 3.3 Custom Hooks

```typescript
// src/hooks/useMediaQuery.ts

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

export function useIsMobile() {
  return useMediaQuery('(max-width: 768px)');
}

export function useIsTablet() {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1025px)');
}
```

### FASE 4: Layout Components (Día 4-5)

#### 4.1 Sidebar

```typescript
// src/components/layout/Sidebar.tsx
// Ver ejemplo completo en ARQUITECTURA_COMPONENTES_REACT.md línea 1100
```

#### 4.2 Main Layout

```typescript
// src/components/layout/MainLayout.tsx

'use client';

import React from 'react';
import { Sidebar } from './Sidebar';
import { useAppStore } from '@/store/useAppStore';
import { useIsMobile } from '@/hooks/useMediaQuery';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { sidebarOpen, sidebarCollapsed } = useAppStore();
  const isMobile = useIsMobile();

  // Calculate margin based on sidebar state
  const marginLeft = isMobile
    ? '0'
    : sidebarCollapsed
    ? '5rem'
    : '16rem';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Sidebar />
      <main
        className="transition-all duration-300 ease-in-out"
        style={{ marginLeft }}
      >
        <div className="container mx-auto px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
```

```typescript
// src/app/layout.tsx - Update

import { MainLayout } from '@/components/layout/MainLayout';
import { Providers } from './providers';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <MainLayout>{children}</MainLayout>
        </Providers>
      </body>
    </html>
  );
}
```

### FASE 5: Gallery Components (Día 5-7)

#### 5.1 BentoGrid
Ver ejemplo completo en ARQUITECTURA_COMPONENTES_REACT.md línea 1225

#### 5.2 ImageGallery (Lightbox)
Ver ejemplo completo en ARQUITECTURA_COMPONENTES_REACT.md línea 1310

#### 5.3 ExifPanel
Ver ejemplo completo en ARQUITECTURA_COMPONENTES_REACT.md línea 1470

### FASE 6: API Integration (Día 7-8)

#### 6.1 Timeline API

```typescript
// src/app/api/timeline/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const cursor = searchParams.get('cursor');

    const images = await prisma.image.findMany({
      take: limit + 1,
      ...(cursor && {
        skip: 1,
        cursor: {
          id: cursor,
        },
      }),
      orderBy: {
        takenAt: 'desc',
      },
      include: {
        album: true,
      },
    });

    const hasMore = images.length > limit;
    const items = hasMore ? images.slice(0, -1) : images;

    return NextResponse.json({
      images: items,
      nextCursor: hasMore ? items[items.length - 1].id : undefined,
      hasMore,
    });
  } catch (error) {
    console.error('Timeline API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch timeline' },
      { status: 500 }
    );
  }
}
```

#### 6.2 Favorites API

```typescript
// src/app/api/images/[id]/favorite/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const image = await prisma.image.update({
      where: { id: params.id },
      data: { isFavorite: true },
    });

    return NextResponse.json(image);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to favorite image' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const image = await prisma.image.update({
      where: { id: params.id },
      data: { isFavorite: false },
    });

    return NextResponse.json(image);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to unfavorite image' },
      { status: 500 }
    );
  }
}
```

```typescript
// src/app/api/favorites/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const images = await prisma.image.findMany({
      where: { isFavorite: true },
      orderBy: { takenAt: 'desc' },
      include: { album: true },
    });

    return NextResponse.json(images);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}
```

### FASE 7: Pages (Día 8-10)

#### 7.1 Timeline Page

```typescript
// src/app/timeline/page.tsx

'use client';

import React from 'react';
import { useInfiniteTimeline } from '@/hooks/useInfiniteTimeline';
import { TimelineGrid } from '@/components/gallery/TimelineGrid';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function TimelinePage() {
  const {
    images,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    sentinelRef,
  } = useInfiniteTimeline();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Error: {error?.message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Timeline
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          All your photos in chronological order
        </p>
      </div>

      <TimelineGrid images={images} />

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-10" />

      {isFetchingNextPage && (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
}
```

#### 7.2 Favorites Page

```typescript
// src/app/favorites/page.tsx

'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BentoGrid } from '@/components/gallery/BentoGrid';
import { ImageGallery } from '@/components/gallery/ImageGallery';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import type { Image } from '@/types/image';

async function fetchFavorites(): Promise<Image[]> {
  const response = await fetch('/api/favorites');
  if (!response.ok) throw new Error('Failed to fetch favorites');
  return response.json();
}

export default function FavoritesPage() {
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const { data: images, isLoading, isError } = useQuery({
    queryKey: ['favorites'],
    queryFn: fetchFavorites,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (isError || !images) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">Failed to load favorites</p>
      </div>
    );
  }

  const selectedIndex = images.findIndex((img) => img.id === selectedImageId);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
          Favorites
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          {images.length} favorite {images.length === 1 ? 'photo' : 'photos'}
        </p>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No favorites yet</p>
          <p className="text-gray-400 mt-2">
            Click the heart icon on any photo to add it to favorites
          </p>
        </div>
      ) : (
        <BentoGrid
          images={images}
          onImageClick={setSelectedImageId}
        />
      )}

      {selectedImageId && selectedIndex >= 0 && (
        <ImageGallery
          images={images}
          initialIndex={selectedIndex}
          onClose={() => setSelectedImageId(null)}
        />
      )}
    </div>
  );
}
```

---

## 🎨 TAILWIND CONFIGURATION

```javascript
// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        glass: {
          light: 'rgba(255, 255, 255, 0.1)',
          dark: 'rgba(0, 0, 0, 0.2)',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};
```

---

## 🧪 TESTING SETUP

```javascript
// jest.config.js

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
};

module.exports = createJestConfig(customJestConfig);
```

```javascript
// jest.setup.js

import '@testing-library/jest-dom';
```

```json
// package.json - Add scripts
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

---

## 📚 STORYBOOK SETUP

```bash
npx storybook@latest init
```

```typescript
// .storybook/preview.tsx

import type { Preview } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../src/app/globals.css';

const queryClient = new QueryClient();

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
};

export default preview;
```

---

## 🚀 CHECKLIST DE IMPLEMENTACIÓN

### Setup
- [ ] Instalar dependencias
- [ ] Crear estructura de carpetas
- [ ] Configurar TypeScript tipos
- [ ] Configurar Tailwind
- [ ] Configurar React Query

### Atoms
- [ ] Button
- [ ] IconButton
- [ ] TextInput
- [ ] SearchInput
- [ ] Badge
- [ ] OptimizedImage
- [ ] LoadingSpinner

### Hooks
- [ ] useAppStore (Zustand)
- [ ] useMediaQuery
- [ ] useKeyboardNavigation
- [ ] useInfiniteTimeline
- [ ] useFavorites

### Layout
- [ ] Sidebar
- [ ] MainLayout
- [ ] TopBar

### Gallery
- [ ] BentoGrid
- [ ] ImageGallery (Lightbox)
- [ ] ExifPanel
- [ ] FavoriteButton

### Pages
- [ ] Timeline
- [ ] Favorites
- [ ] Explore
- [ ] Albums

### APIs
- [ ] Timeline endpoint
- [ ] Favorites endpoint
- [ ] Search endpoint

### Testing
- [ ] Jest setup
- [ ] Unit tests para atoms
- [ ] Integration tests para organisms

### Storybook
- [ ] Setup inicial
- [ ] Stories para atoms
- [ ] Stories para molecules

---

**Próximo paso**: Empezar con FASE 1 (Setup) y seguir el orden establecido.
