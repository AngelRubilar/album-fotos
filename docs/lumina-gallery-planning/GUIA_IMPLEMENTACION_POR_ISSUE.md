# Guía de Implementación por Issue - Clean Architecture

> Roadmap detallado de cómo implementar cada issue aplicando principios SOLID y Clean Architecture

---

## Tabla de Contenidos

1. [Estrategia de Migración](#1-estrategia-de-migración)
2. [ISSUE #1: Migración de Base de Datos](#issue-1-migración-de-base-de-datos)
3. [ISSUE #2: Componente Sidebar](#issue-2-componente-sidebar)
4. [ISSUE #3: Ajustar Layout Principal](#issue-3-ajustar-layout-principal)
5. [ISSUE #5: Vista Timeline](#issue-5-vista-timeline)
6. [ISSUE #6: Sistema de Favoritos](#issue-6-sistema-de-favoritos)
7. [ISSUE #7: Vista Explorar](#issue-7-vista-explorar)
8. [ISSUE #9: Bento Grid](#issue-9-bento-grid)
9. [ISSUE #10-11: EXIF Data](#issue-10-11-exif-data)
10. [ISSUE #12-13: Smart Albums](#issue-12-13-smart-albums)
11. [Checklist de Validación](#checklist-de-validación)

---

## 1. Estrategia de Migración

### Fases de Implementación

```
FASE 1: FUNDACIONES (Días 1-2)
├── Estructura de carpetas nueva
├── Domain Layer (modelos, interfaces)
├── Infrastructure Layer (repositorios Prisma)
└── Application Layer (servicios, DTOs)

FASE 2: MIGRACIÓN GRADUAL (Días 3-5)
├── Migrar componentes existentes
├── Crear nuevos hooks
├── Implementar Context API mejorado
└── Configurar React Query

FASE 3: NUEVAS FEATURES (Días 6-20)
├── Implementar issues según prioridad
├── Testing continuo
└── Refactoring según aprendizaje

FASE 4: OPTIMIZACIÓN (Días 21-28)
├── Performance tuning
├── Error handling robusto
└── Documentación final
```

### Pasos Iniciales

1. **Crear estructura de carpetas**

```bash
# Desde la raíz del proyecto
mkdir -p src/domain/{models,repositories}
mkdir -p src/application/{services,dtos}
mkdir -p src/infrastructure/{repositories,adapters}
mkdir -p src/presentation/{hooks,commands}
mkdir -p src/components/{atoms,molecules,organisms,templates,features}
mkdir -p src/contexts
mkdir -p src/providers
mkdir -p src/factories
mkdir -p src/strategies
mkdir -p src/validators
mkdir -p src/config
```

2. **Instalar dependencias necesarias**

```bash
npm install zod sonner react-masonry-css @tanstack/react-query @tanstack/react-virtual exifr
npm install -D @testing-library/react @testing-library/jest-dom @playwright/test
```

3. **Configurar React Query**

```typescript
// src/providers/QueryProvider.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, PropsWithChildren } from 'react';

export function QueryProvider({ children }: PropsWithChildren) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        cacheTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1
      }
    }
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}
```

4. **Actualizar layout raíz**

```typescript
// src/app/layout.tsx
import { AppProviders } from '@/providers/AppProviders';

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <AppProviders>
          {children}
        </AppProviders>
      </body>
    </html>
  );
}
```

---

## ISSUE #1: Migración de Base de Datos

### Arquitectura Aplicada

- **Domain Layer**: Modelos actualizados
- **Infrastructure Layer**: Migración de Prisma

### Paso a Paso

#### 1. Actualizar Schema de Prisma

```prisma
// prisma/schema.prisma

model Image {
  id           String   @id @default(cuid())
  // ... campos existentes ...

  // NUEVOS CAMPOS LUMINA GALLERY
  isFavorite   Boolean  @default(false)
  featured     Boolean  @default(false)
  exifData     Json?
  takenAt      DateTime?
  location     String?
  latitude     Float?
  longitude    Float?
  cameraMake   String?
  cameraModel  String?
  lens         String?
  focalLength  String?
  aperture     String?
  shutterSpeed String?
  iso          Int?

  // Nueva relación con tags
  tags Tag[] @relation("ImageTags")

  // Índices nuevos
  @@index([isFavorite])
  @@index([featured])
  @@index([takenAt])
  @@index([cameraMake])
}

model Tag {
  id        String   @id @default(cuid())
  name      String   @unique
  category  String
  color     String?
  createdAt DateTime @default(now())
  images    Image[]  @relation("ImageTags")

  @@index([category])
  @@index([name])
  @@map("tags")
}

model SmartAlbum {
  id          String   @id @default(cuid())
  title       String
  description String?
  icon        String?
  rules       Json
  isSystem    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([isSystem])
  @@map("smart_albums")
}
```

#### 2. Crear Migración

```bash
npx prisma migrate dev --name add_lumina_gallery_fields
```

#### 3. Crear Modelos de Domain

```typescript
// src/domain/models/image.model.ts
export interface Image {
  id: string;
  albumId: string | null;
  filename: string;
  originalName: string;
  fileUrl: string;
  thumbnailUrl: string | null;
  fileSize: number;
  width: number;
  height: number;
  mimeType: string;
  description: string | null;
  uploadedAt: Date;
  updatedAt: Date;

  // Lumina Gallery
  isFavorite: boolean;
  featured: boolean;
  exifData: ExifData | null;
  takenAt: Date | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  cameraMake: string | null;
  cameraModel: string | null;
  lens: string | null;
  focalLength: string | null;
  aperture: string | null;
  shutterSpeed: string | null;
  iso: number | null;

  album?: Album;
  tags?: Tag[];
}
```

#### 4. Actualizar Seed (Opcional)

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Crear algunos tags de ejemplo
  const tags = await Promise.all([
    prisma.tag.create({
      data: { name: 'Viaje', category: 'event', color: '#3b82f6' }
    }),
    prisma.tag.create({
      data: { name: 'Familia', category: 'person', color: '#ec4899' }
    }),
    prisma.tag.create({
      data: { name: 'Playa', category: 'location', color: '#06b6d4' }
    })
  ]);

  console.log('Seed completado', { tags });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

```bash
npx prisma db seed
```

#### 5. Verificar Migración

```bash
npx prisma studio
# Verificar que los nuevos campos y tablas estén presentes
```

### Criterios de Aceptación

- [ ] Migración ejecuta sin errores
- [ ] Nuevos campos visibles en Prisma Studio
- [ ] Seed data funciona correctamente
- [ ] Rollback funciona: `npx prisma migrate reset`

---

## ISSUE #2: Componente Sidebar

### Arquitectura Aplicada

- **Presentation Layer**: Componente `Sidebar` (organism)
- **Context API**: `SidebarContext` para estado
- **Atomic Design**: `SidebarItem` (molecule)

### Paso a Paso

#### 1. Crear SidebarContext

```typescript
// src/contexts/SidebarContext.tsx
'use client';

import { createContext, useContext, useState, useCallback, PropsWithChildren } from 'react';

interface SidebarContextValue {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function SidebarProvider({ children }: PropsWithChildren) {
  const [isOpen, setIsOpen] = useState(true);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, open, close }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('useSidebar must be used within SidebarProvider');
  return context;
}
```

#### 2. Crear SidebarItem (Molecule)

```typescript
// src/components/molecules/SidebarItem/SidebarItem.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

export function SidebarItem({ href, icon, label, badge }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200',
        'hover:bg-white/10 group',
        isActive && 'bg-white/20 font-semibold'
      )}
    >
      <span className={cn(
        'text-xl transition-transform duration-200',
        'group-hover:scale-110'
      )}>
        {icon}
      </span>

      <span className="flex-1">{label}</span>

      {badge !== undefined && badge > 0 && (
        <span className="px-2 py-0.5 rounded-full bg-pink-500 text-white text-xs font-semibold">
          {badge}
        </span>
      )}
    </Link>
  );
}
```

#### 3. Crear Sidebar (Organism)

```typescript
// src/components/organisms/Sidebar/Sidebar.tsx
'use client';

import { useSidebar } from '@/contexts/SidebarContext';
import { useFavorites } from '@/contexts/FavoriteContext';
import { SidebarItem } from '@/components/molecules/SidebarItem';
import { cn } from '@/lib/cn';
import { motion } from 'framer-motion';

export function Sidebar() {
  const { isOpen, toggle } = useSidebar();
  const { favoriteCount } = useFavorites();

  const menuItems = [
    { href: '/', icon: '🏠', label: 'Inicio' },
    { href: '/timeline', icon: '📅', label: 'Timeline' },
    { href: '/explore', icon: '🔍', label: 'Explorar' },
    { href: '/favorites', icon: '⭐', label: 'Favoritos', badge: favoriteCount },
    { href: '/albums', icon: '📁', label: 'Álbumes' }
  ];

  return (
    <>
      {/* Overlay en móvil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 lg:hidden z-40"
          onClick={toggle}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : -280,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={cn(
          'fixed left-0 top-0 bottom-0 w-72 z-50',
          'bg-gradient-to-br from-blue-600 to-purple-600 text-white',
          'shadow-2xl backdrop-blur-lg',
          'lg:relative lg:opacity-100 lg:translate-x-0'
        )}
      >
        {/* Header con avatar */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl">
              👤
            </div>
            <div>
              <h3 className="font-semibold">Mi Galería</h3>
              <p className="text-sm text-white/70">Lumina Gallery</p>
            </div>
          </div>
        </div>

        {/* Navegación */}
        <nav className="p-4 space-y-2">
          {menuItems.map(item => (
            <SidebarItem key={item.href} {...item} />
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <SidebarItem href="/settings" icon="⚙️" label="Configuración" />
        </div>
      </motion.aside>

      {/* Botón de toggle para móvil */}
      <button
        onClick={toggle}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-blue-600 text-white shadow-lg"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </>
  );
}
```

#### 4. Integrar en Layout

```typescript
// src/app/(main)/layout.tsx
import { Sidebar } from '@/components/organisms/Sidebar';

export default function MainLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}
```

### Criterios de Aceptación

- [ ] Sidebar visible en desktop
- [ ] Sidebar colapsable en móvil con overlay
- [ ] Navegación funcional
- [ ] Indicador de página activa
- [ ] Badge de favoritos se actualiza

---

## ISSUE #5: Vista Timeline

### Arquitectura Aplicada

- **Domain Layer**: `Image` model
- **Application Layer**: `ImageService.getTimeline()`
- **Presentation Layer**: `TimelinePage`, `useInfiniteTimeline` hook
- **Performance**: Infinite scroll con React Query

### Paso a Paso

#### 1. Crear API Route

```typescript
// src/app/api/timeline/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ImageService } from '@/application/services/image.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const result = await ImageService.getTimeline({ page, limit });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Timeline API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch timeline' },
      { status: 500 }
    );
  }
}
```

#### 2. Crear Custom Hook

```typescript
// src/presentation/hooks/useInfiniteTimeline.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { ImageService } from '@/application/services/image.service';

export function useInfiniteTimeline() {
  const query = useInfiniteQuery({
    queryKey: ['timeline'],
    queryFn: ({ pageParam = 1 }) =>
      ImageService.getTimeline({ page: pageParam, limit: 50 }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 1
  });

  const images = query.data?.pages.flatMap(page => page.images) ?? [];

  return {
    images,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage
  };
}
```

#### 3. Crear TimelineGrid Component

```typescript
// src/components/organisms/TimelineGrid/TimelineGrid.tsx
'use client';

import { Image } from '@/domain/models/image.model';
import { ImageCard } from '@/components/features/images/ImageCard';
import { useEffect, useRef } from 'react';

interface TimelineGridProps {
  images: Image[];
  onImageClick: (index: number) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoadingMore: boolean;
}

export function TimelineGrid({
  images,
  onImageClick,
  onLoadMore,
  hasMore,
  isLoadingMore
}: TimelineGridProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!hasMore || isLoadingMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore]);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {images.map((image, index) => (
          <ImageCard
            key={image.id}
            image={image}
            onClick={() => onImageClick(index)}
          />
        ))}
      </div>

      {/* Load more trigger */}
      {hasMore && (
        <div ref={loadMoreRef} className="py-8 text-center">
          {isLoadingMore && <div className="animate-spin">⏳</div>}
        </div>
      )}
    </div>
  );
}
```

#### 4. Crear Timeline Page

```typescript
// src/app/(main)/timeline/page.tsx
'use client';

import { useState } from 'react';
import { TimelineGrid } from '@/components/organisms/TimelineGrid';
import { ImageGallery } from '@/components/organisms/ImageGallery';
import { useInfiniteTimeline } from '@/presentation/hooks/useInfiniteTimeline';

export default function TimelinePage() {
  const { images, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteTimeline();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  if (isLoading) {
    return <div className="text-center py-20">Cargando timeline...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Timeline</h1>

      <TimelineGrid
        images={images}
        onImageClick={handleImageClick}
        onLoadMore={fetchNextPage}
        hasMore={hasNextPage ?? false}
        isLoadingMore={isFetchingNextPage}
      />

      <ImageGallery
        images={images}
        currentIndex={currentIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onImageChange={setCurrentIndex}
      />
    </div>
  );
}
```

### Criterios de Aceptación

- [ ] Timeline muestra todas las fotos cronológicamente
- [ ] Scroll infinito funciona correctamente
- [ ] Performance optimizada (< 3s carga inicial)
- [ ] Click abre lightbox
- [ ] Navegación por teclado funciona

---

## ISSUE #6: Sistema de Favoritos

### Arquitectura Aplicada

- **Context API**: `FavoriteContext` (Observer Pattern)
- **Application Layer**: `ImageService.toggleFavorite()`
- **Commands**: `useToggleFavorite` con optimistic updates
- **Components**: `FavoriteButton` (molecule)

### Paso a Paso

#### 1. Crear API Endpoint

```typescript
// src/app/api/images/[id]/favorite/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ImageService } from '@/application/services/image.service';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const image = await ImageService.update(params.id, { isFavorite: true });
    return NextResponse.json({ success: true, data: image });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to add favorite' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const image = await ImageService.update(params.id, { isFavorite: false });
    return NextResponse.json({ success: true, data: image });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to remove favorite' },
      { status: 500 }
    );
  }
}
```

#### 2. Ya tenemos FavoriteContext (creado antes)

Ver sección 9.1 de EJEMPLOS_CODIGO_CLEAN_ARCHITECTURE.md

#### 3. Crear FavoriteButton

Ver sección 7.2 de EJEMPLOS_CODIGO_CLEAN_ARCHITECTURE.md

#### 4. Integrar en ImageCard y ImageGallery

```typescript
// src/components/features/images/ImageCard.tsx
import { Image } from '@/domain/models/image.model';
import { FavoriteButton } from '@/components/molecules/FavoriteButton';

export function ImageCard({ image, onClick }) {
  return (
    <div className="relative group" onClick={onClick}>
      <img src={image.fileUrl} alt={image.originalName} />

      {/* Favorite Button */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
        <FavoriteButton imageId={image.id} isFavorite={image.isFavorite} />
      </div>
    </div>
  );
}
```

#### 5. Crear Página de Favoritos

```typescript
// src/app/(main)/favorites/page.tsx
'use client';

import { useFavoriteImages } from '@/presentation/hooks/useImages';
import { ImageCard } from '@/components/features/images/ImageCard';

export default function FavoritesPage() {
  const { data: favorites, isLoading } = useFavoriteImages();

  if (isLoading) return <div>Cargando favoritos...</div>;
  if (!favorites || favorites.length === 0) {
    return <div>No tienes fotos favoritas aún</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Favoritos</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {favorites.map(image => (
          <ImageCard key={image.id} image={image} />
        ))}
      </div>
    </div>
  );
}
```

### Criterios de Aceptación

- [ ] Marcar/desmarcar desde lightbox funciona
- [ ] Marcar/desmarcar desde grid funciona
- [ ] Contador en sidebar se actualiza automáticamente
- [ ] Optimistic updates funcionan
- [ ] Vista de favoritos muestra solo favoritos

---

## ISSUE #9: Bento Grid

### Arquitectura Aplicada

- **Presentation Layer**: `BentoGrid` (organism)
- **Performance**: Memoización, lazy loading
- **Animation**: Framer Motion para stagger

### Paso a Paso

#### 1. Instalar dependencias

```bash
npm install react-masonry-css framer-motion
```

#### 2. Crear BentoGrid y BentoGridItem

Ver sección 7.3 de EJEMPLOS_CODIGO_CLEAN_ARCHITECTURE.md

#### 3. Implementar lógica de Featured

```typescript
// src/application/services/image.service.ts

export class ImageService {
  // ...

  static async setFeaturedImages(albumId: string, imageIds: string[]) {
    // Quitar featured de todas las imágenes del álbum
    await imageRepository.updateMany(
      { albumId },
      { featured: false }
    );

    // Marcar solo las seleccionadas como featured
    await Promise.all(
      imageIds.map(id => imageRepository.update(id, { featured: true }))
    );
  }

  static async getAlbumWithFeatured(albumId: string) {
    const images = await imageRepository.findByAlbum(albumId);

    // Auto-seleccionar featured si no hay ninguna
    const hasFeatured = images.some(img => img.featured);
    if (!hasFeatured && images.length > 0) {
      // Seleccionar las primeras 2-3 fotos como featured
      const featuredIds = images.slice(0, 3).map(img => img.id);
      await this.setFeaturedImages(albumId, featuredIds);
    }

    return images;
  }
}
```

#### 4. Usar BentoGrid en Home

```typescript
// src/app/page.tsx
'use client';

import { useState } from 'react';
import { BentoGrid } from '@/components/organisms/BentoGrid';
import { ImageGallery } from '@/components/organisms/ImageGallery';
import { useImages } from '@/presentation/hooks/useImages';

export default function Home() {
  const { data: images = [], isLoading } = useImages({ take: 20 });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Galería</h1>

      <BentoGrid
        images={images}
        onImageClick={(index) => {
          setCurrentIndex(index);
          setLightboxOpen(true);
        }}
      />

      <ImageGallery
        images={images}
        currentIndex={currentIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onImageChange={setCurrentIndex}
      />
    </div>
  );
}
```

### Criterios de Aceptación

- [ ] Grid masonry funciona correctamente
- [ ] Fotos featured ocupan 2x2
- [ ] Fotos normales ocupan 1x1
- [ ] Responsive en todos los breakpoints
- [ ] Animaciones suaves (stagger effect)
- [ ] Performance > 60fps

---

## ISSUE #10-11: EXIF Data

### Arquitectura Aplicada

- **Infrastructure Layer**: `ExifrAdapter` (Adapter Pattern)
- **Application Layer**: Extracción en upload
- **Presentation Layer**: `ExifPanel` component

### Paso a Paso

#### 1. Instalar librería EXIF

```bash
npm install exifr
```

#### 2. Crear Adapter

```typescript
// src/infrastructure/adapters/exifr.adapter.ts
import exifr from 'exifr';
import { ExifData } from '@/domain/models/image.model';

export class ExifrAdapter {
  static async extractFromFile(file: File): Promise<ExifData | null> {
    try {
      const rawExif = await exifr.parse(file, {
        pick: [
          'DateTimeOriginal', 'Make', 'Model', 'LensModel',
          'FocalLength', 'FNumber', 'ExposureTime', 'ISO',
          'GPSLatitude', 'GPSLongitude', 'ImageWidth', 'ImageHeight'
        ]
      });

      if (!rawExif) return null;

      return {
        takenAt: rawExif.DateTimeOriginal ? new Date(rawExif.DateTimeOriginal) : undefined,
        cameraMake: rawExif.Make,
        cameraModel: rawExif.Model,
        lens: rawExif.LensModel,
        focalLength: rawExif.FocalLength ? `${rawExif.FocalLength}mm` : undefined,
        aperture: rawExif.FNumber ? `f/${rawExif.FNumber}` : undefined,
        shutterSpeed: this.formatShutterSpeed(rawExif.ExposureTime),
        iso: rawExif.ISO,
        latitude: rawExif.GPSLatitude,
        longitude: rawExif.GPSLongitude,
        width: rawExif.ImageWidth,
        height: rawExif.ImageHeight,
        raw: rawExif
      };
    } catch (error) {
      console.error('EXIF extraction failed', error);
      return null;
    }
  }

  private static formatShutterSpeed(exposureTime?: number): string | undefined {
    if (!exposureTime) return undefined;

    if (exposureTime >= 1) {
      return `${exposureTime}s`;
    } else {
      const fraction = Math.round(1 / exposureTime);
      return `1/${fraction}s`;
    }
  }
}
```

#### 3. Integrar en Upload API

```typescript
// src/app/api/upload/route.ts
import { ExifrAdapter } from '@/infrastructure/adapters/exifr.adapter';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  // Extraer EXIF
  const exifData = await ExifrAdapter.extractFromFile(file);

  // Crear imagen con EXIF
  const image = await ImageService.create({
    // ... otros campos
    exifData: exifData?.raw,
    takenAt: exifData?.takenAt,
    cameraMake: exifData?.cameraMake,
    cameraModel: exifData?.cameraModel,
    lens: exifData?.lens,
    focalLength: exifData?.focalLength,
    aperture: exifData?.aperture,
    shutterSpeed: exifData?.shutterSpeed,
    iso: exifData?.iso,
    latitude: exifData?.latitude,
    longitude: exifData?.longitude
  });

  return NextResponse.json({ success: true, data: image });
}
```

#### 4. Crear ExifPanel Component

```typescript
// src/components/organisms/ExifPanel/ExifPanel.tsx
import { Image } from '@/domain/models/image.model';

interface ExifPanelProps {
  image: Image;
}

export function ExifPanel({ image }: ExifPanelProps) {
  if (!image.exifData && !image.cameraMake) {
    return <div className="text-gray-500">No hay datos EXIF disponibles</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Información EXIF</h3>

      {image.takenAt && (
        <ExifRow icon="📅" label="Fecha" value={new Date(image.takenAt).toLocaleDateString()} />
      )}

      {image.cameraMake && (
        <ExifRow icon="📷" label="Cámara" value={`${image.cameraMake} ${image.cameraModel}`} />
      )}

      {image.lens && (
        <ExifRow icon="🔍" label="Lente" value={image.lens} />
      )}

      {image.focalLength && (
        <ExifRow icon="📏" label="Focal" value={image.focalLength} />
      )}

      {image.aperture && (
        <ExifRow icon="🌗" label="Apertura" value={image.aperture} />
      )}

      {image.shutterSpeed && (
        <ExifRow icon="⚡" label="Velocidad" value={image.shutterSpeed} />
      )}

      {image.iso && (
        <ExifRow icon="🎚️" label="ISO" value={image.iso.toString()} />
      )}

      {image.latitude && image.longitude && (
        <ExifRow
          icon="📍"
          label="Ubicación"
          value={`${image.latitude.toFixed(6)}, ${image.longitude.toFixed(6)}`}
        />
      )}
    </div>
  );
}

function ExifRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-2xl">{icon}</span>
      <div>
        <div className="text-sm text-gray-500">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}
```

#### 5. Integrar en ImageGallery

```typescript
// src/components/organisms/ImageGallery/ImageGallery.tsx
import { ExifPanel } from '@/components/organisms/ExifPanel';

export function ImageGallery({ images, currentIndex, isOpen, onClose }) {
  const [showExif, setShowExif] = useState(true);
  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 z-50">
      {/* ... resto del lightbox ... */}

      {/* Panel EXIF lateral */}
      {showExif && (
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-white p-6 overflow-y-auto">
          <ExifPanel image={currentImage} />
        </div>
      )}

      {/* Botón toggle EXIF */}
      <button onClick={() => setShowExif(prev => !prev)}>
        {showExif ? 'Ocultar' : 'Mostrar'} EXIF
      </button>
    </div>
  );
}
```

### Criterios de Aceptación

- [ ] EXIF se extrae correctamente al subir
- [ ] Datos se guardan en BD
- [ ] Panel EXIF muestra información
- [ ] No falla si EXIF no existe
- [ ] Panel colapsable funciona

---

## ISSUE #12-13: Smart Albums

### Arquitectura Aplicada

- **Domain Layer**: `SmartAlbum` model, `SmartAlbumRule` interface
- **Factory Pattern**: `SmartAlbumFactory`
- **Strategy Pattern**: Evaluador de reglas

### Paso a Paso

#### 1. Crear Factory (ya creado)

Ver sección 10.1 de EJEMPLOS_CODIGO_CLEAN_ARCHITECTURE.md

#### 2. Crear Strategy de Evaluación

```typescript
// src/strategies/smart-album-rule.strategy.ts
import { Image } from '@/domain/models/image.model';
import { SmartAlbumRule } from '@/domain/models/smart-album.model';

export class SmartAlbumRuleEvaluator {
  static evaluate(image: Image, rule: SmartAlbumRule): boolean {
    switch (rule.field) {
      case 'date':
        return this.evaluateDateRule(image, rule);

      case 'camera':
        return this.evaluateCameraRule(image, rule);

      case 'favorite':
        return this.evaluateFavoriteRule(image, rule);

      case 'tag':
        return this.evaluateTagRule(image, rule);

      case 'location':
        return this.evaluateLocationRule(image, rule);

      default:
        return false;
    }
  }

  private static evaluateDateRule(image: Image, rule: SmartAlbumRule): boolean {
    const date = image.takenAt || image.uploadedAt;

    if (rule.operator === 'between') {
      const { from, to } = rule.value;
      return date >= from && date <= to;
    }

    return false;
  }

  private static evaluateCameraRule(image: Image, rule: SmartAlbumRule): boolean {
    const camera = `${image.cameraMake} ${image.cameraModel}`.toLowerCase();

    if (rule.operator === 'contains') {
      return camera.includes(rule.value.toLowerCase());
    }

    return false;
  }

  private static evaluateFavoriteRule(image: Image, rule: SmartAlbumRule): boolean {
    return image.isFavorite === rule.value;
  }

  private static evaluateTagRule(image: Image, rule: SmartAlbumRule): boolean {
    if (!image.tags) return false;

    if (rule.operator === 'in') {
      return image.tags.some(tag => rule.value.includes(tag.name));
    }

    return false;
  }

  private static evaluateLocationRule(image: Image, rule: SmartAlbumRule): boolean {
    if (rule.operator === 'not') {
      return image.latitude !== null && image.longitude !== null;
    }

    return false;
  }
}
```

#### 3. Crear Service

```typescript
// src/application/services/smart-album.service.ts
import { smartAlbumRepository, imageRepository } from '@/lib/repositories';
import { SmartAlbum } from '@/domain/models/smart-album.model';
import { SmartAlbumRuleEvaluator } from '@/strategies/smart-album-rule.strategy';

export class SmartAlbumService {
  static async create(config: SmartAlbumConfig): Promise<SmartAlbum> {
    return smartAlbumRepository.create(config);
  }

  static async getAll(): Promise<SmartAlbum[]> {
    return smartAlbumRepository.findAll();
  }

  static async getSystemAlbums(): Promise<SmartAlbum[]> {
    return smartAlbumRepository.findBySystem(true);
  }

  static async getImages(albumId: string): Promise<Image[]> {
    const album = await smartAlbumRepository.findById(albumId);
    if (!album) throw new Error('Smart album not found');

    // Obtener todas las imágenes
    const allImages = await imageRepository.findAll();

    // Filtrar según reglas
    return allImages.filter(image =>
      album.rules.every(rule => SmartAlbumRuleEvaluator.evaluate(image, rule))
    );
  }

  static async generateSystemAlbums(): Promise<void> {
    const systemAlbums = SmartAlbumFactory.getAllSystemAlbums();

    for (const config of systemAlbums) {
      // Verificar si ya existe
      const existing = await smartAlbumRepository.findByTitle(config.title);

      if (!existing) {
        await smartAlbumRepository.create(config);
      }
    }
  }
}
```

#### 4. Crear API Endpoints

```typescript
// src/app/api/smart-albums/route.ts
import { SmartAlbumService } from '@/application/services/smart-album.service';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const albums = await SmartAlbumService.getAll();
    return NextResponse.json({ success: true, data: albums });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const album = await SmartAlbumService.create(body);
    return NextResponse.json({ success: true, data: album }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

```typescript
// src/app/api/smart-albums/[id]/images/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const images = await SmartAlbumService.getImages(params.id);
    return NextResponse.json({ success: true, data: images });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
```

#### 5. Generar Smart Albums del Sistema

```typescript
// Ejecutar al inicio de la app o via script
// src/scripts/generate-system-albums.ts
import { SmartAlbumService } from '@/application/services/smart-album.service';

async function main() {
  await SmartAlbumService.generateSystemAlbums();
  console.log('Smart albums generados');
}

main();
```

### Criterios de Aceptación

- [ ] Álbumes del sistema se generan automáticamente
- [ ] Reglas se evalúan correctamente
- [ ] UI muestra smart albums
- [ ] Click abre vista de imágenes del smart album
- [ ] Álbumes se actualizan automáticamente con nuevas fotos

---

## Checklist de Validación

### Arquitectura

- [ ] Domain Layer no depende de nadie
- [ ] Infrastructure implementa interfaces de Domain
- [ ] Application orquesta lógica de negocio
- [ ] Presentation solo renderiza UI

### SOLID

- [ ] Cada clase/componente tiene una responsabilidad
- [ ] Configuración es extensible (temas, smart albums)
- [ ] Interfaces segregadas y específicas
- [ ] Dependencias inyectadas via Context/Providers

### Testing

- [ ] Unit tests para servicios críticos
- [ ] Integration tests para flujos principales
- [ ] E2E tests para user journeys

### Performance

- [ ] Lighthouse score > 90
- [ ] FCP < 1.5s
- [ ] TTI < 3s
- [ ] Scroll a 60fps

### UX

- [ ] Mobile responsive
- [ ] Keyboard navigation
- [ ] Loading states
- [ ] Error states
- [ ] Animaciones suaves

---

Esta guía proporciona un roadmap claro para implementar cada issue siguiendo Clean Architecture y principios SOLID. Cada paso está detallado con código concreto y criterios de aceptación.
