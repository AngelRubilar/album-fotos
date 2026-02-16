# ⚛️ REACT 19 PATTERNS & BEST PRACTICES - LUMINA GALLERY

> Patrones avanzados, optimizaciones y mejores prácticas para React 19

---

## 🆕 REACT 19 NEW FEATURES

### 1. Actions (useActionState)

Reemplaza el patrón tradicional de form handling con estados de loading/error.

```typescript
// src/components/forms/UploadForm.tsx

'use client';

import { useActionState } from 'react';
import { uploadImages } from '@/app/actions/upload';

export function UploadForm() {
  const [state, formAction, isPending] = useActionState(uploadImages, {
    success: false,
    errors: null,
  });

  return (
    <form action={formAction}>
      <input
        type="file"
        name="images"
        multiple
        accept="image/*"
        disabled={isPending}
      />

      <button type="submit" disabled={isPending}>
        {isPending ? 'Uploading...' : 'Upload Images'}
      </button>

      {state.errors && (
        <div className="text-red-500">{state.errors}</div>
      )}

      {state.success && (
        <div className="text-green-500">Images uploaded successfully!</div>
      )}
    </form>
  );
}
```

```typescript
// src/app/actions/upload.ts

'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';

export async function uploadImages(prevState: any, formData: FormData) {
  try {
    const files = formData.getAll('images') as File[];

    if (files.length === 0) {
      return { success: false, errors: 'No files selected' };
    }

    // Process uploads
    for (const file of files) {
      // Upload logic here
      await processImageUpload(file);
    }

    revalidatePath('/');
    return { success: true, errors: null };
  } catch (error) {
    return {
      success: false,
      errors: error instanceof Error ? error.message : 'Upload failed',
    };
  }
}
```

### 2. useOptimistic

Para actualizaciones optimistas de UI antes de que el servidor responda.

```typescript
// src/hooks/useFavorites.ts (MEJORADO con useOptimistic)

'use client';

import { useOptimistic } from 'react';
import { toggleFavoriteAction } from '@/app/actions/favorites';

export function useFavoriteOptimistic(imageId: string, initialIsFavorite: boolean) {
  const [optimisticFavorite, setOptimisticFavorite] = useOptimistic(
    initialIsFavorite,
    (state, newState: boolean) => newState
  );

  const handleToggle = async () => {
    // Optimistically update UI
    setOptimisticFavorite(!optimisticFavorite);

    // Send to server
    try {
      await toggleFavoriteAction(imageId, !optimisticFavorite);
    } catch (error) {
      // Rollback on error
      setOptimisticFavorite(optimisticFavorite);
      throw error;
    }
  };

  return {
    isFavorite: optimisticFavorite,
    toggleFavorite: handleToggle,
  };
}
```

```typescript
// src/components/ui/FavoriteButton.tsx (USANDO useOptimistic)

'use client';

import { Heart } from 'lucide-react';
import { useFavoriteOptimistic } from '@/hooks/useFavorites';
import { motion } from 'framer-motion';

export function FavoriteButton({
  imageId,
  initialIsFavorite,
}: {
  imageId: string;
  initialIsFavorite: boolean;
}) {
  const { isFavorite, toggleFavorite } = useFavoriteOptimistic(imageId, initialIsFavorite);

  return (
    <motion.button
      onClick={toggleFavorite}
      whileTap={{ scale: 0.9 }}
      className="p-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20"
    >
      <Heart
        className={isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}
        size={20}
      />
    </motion.button>
  );
}
```

### 3. Server Components (RSC)

Maximizar el uso de Server Components para mejor performance.

```typescript
// src/app/page.tsx (SERVER COMPONENT)

import { prisma } from '@/lib/prisma';
import { BentoGridClient } from '@/components/gallery/BentoGridClient';
import { Suspense } from 'react';
import { GridSkeleton } from '@/components/ui/GridSkeleton';

// This is a Server Component by default in App Router
export default async function HomePage() {
  // Data fetching happens on the server
  const [featuredImages, smartAlbums] = await Promise.all([
    prisma.image.findMany({
      where: { featured: true },
      take: 20,
      orderBy: { takenAt: 'desc' },
    }),
    prisma.smartAlbum.findMany({
      where: { isSystem: true },
      include: {
        _count: {
          select: { images: true },
        },
      },
    }),
  ]);

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Lumina Gallery</h1>

      {/* Suspense boundary for streaming */}
      <Suspense fallback={<GridSkeleton />}>
        <BentoGridClient initialImages={featuredImages} />
      </Suspense>

      <Suspense fallback={<div>Loading smart albums...</div>}>
        <SmartAlbumsSection albums={smartAlbums} />
      </Suspense>
    </div>
  );
}
```

```typescript
// src/components/gallery/BentoGridClient.tsx (CLIENT COMPONENT)

'use client';

import { useState } from 'react';
import { BentoGrid } from './BentoGrid';
import { ImageGallery } from './ImageGallery';
import type { Image } from '@/types/image';

export function BentoGridClient({ initialImages }: { initialImages: Image[] }) {
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);

  const selectedIndex = initialImages.findIndex((img) => img.id === selectedImageId);

  return (
    <>
      <BentoGrid images={initialImages} onImageClick={setSelectedImageId} />

      {selectedImageId && selectedIndex >= 0 && (
        <ImageGallery
          images={initialImages}
          initialIndex={selectedIndex}
          onClose={() => setSelectedImageId(null)}
        />
      )}
    </>
  );
}
```

### 4. Streaming with Suspense

```typescript
// src/components/gallery/TimelineSection.tsx

import { Suspense } from 'react';
import { TimelineGrid } from './TimelineGrid';
import { prisma } from '@/lib/prisma';

async function TimelineData() {
  // Simulate slow data fetch
  const images = await prisma.image.findMany({
    take: 50,
    orderBy: { takenAt: 'desc' },
  });

  return <TimelineGrid images={images} />;
}

export function TimelineSection() {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Recent Photos</h2>
      <Suspense
        fallback={
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
            ))}
          </div>
        }
      >
        <TimelineData />
      </Suspense>
    </div>
  );
}
```

### 5. use() Hook for Data Fetching

```typescript
// src/components/albums/AlbumDetail.tsx

'use client';

import { use } from 'react';

interface AlbumDetailProps {
  albumPromise: Promise<Album>;
}

export function AlbumDetail({ albumPromise }: AlbumDetailProps) {
  // use() hook unwraps the promise
  const album = use(albumPromise);

  return (
    <div>
      <h1>{album.title}</h1>
      <p>{album.description}</p>
      <div className="grid grid-cols-4 gap-4">
        {album.images.map((image) => (
          <img key={image.id} src={image.url} alt={image.alt} />
        ))}
      </div>
    </div>
  );
}
```

---

## 🎯 COMPOSITION PATTERNS

### 1. Compound Components

```typescript
// src/components/ui/Card.tsx

import { createContext, useContext, ReactNode } from 'react';

interface CardContextValue {
  variant: 'default' | 'glass' | 'elevated';
}

const CardContext = createContext<CardContextValue>({ variant: 'default' });

export function Card({
  children,
  variant = 'default',
  className = '',
}: {
  children: ReactNode;
  variant?: 'default' | 'glass' | 'elevated';
  className?: string;
}) {
  const baseClasses = 'rounded-xl overflow-hidden';
  const variantClasses = {
    default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
    glass: 'bg-white/10 backdrop-blur-xl border border-white/20',
    elevated: 'bg-white dark:bg-gray-800 shadow-xl',
  };

  return (
    <CardContext.Provider value={{ variant }}>
      <div className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
        {children}
      </div>
    </CardContext.Provider>
  );
}

Card.Header = function CardHeader({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const { variant } = useContext(CardContext);
  return (
    <div
      className={`
        p-6 border-b
        ${variant === 'glass' ? 'border-white/20' : 'border-gray-200 dark:border-gray-700'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

Card.Body = function CardBody({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

Card.Footer = function CardFooter({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const { variant } = useContext(CardContext);
  return (
    <div
      className={`
        p-6 border-t
        ${variant === 'glass' ? 'border-white/20' : 'border-gray-200 dark:border-gray-700'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// Usage:
// <Card variant="glass">
//   <Card.Header>Album Title</Card.Header>
//   <Card.Body>Content here</Card.Body>
//   <Card.Footer>Actions</Card.Footer>
// </Card>
```

### 2. Render Props with TypeScript

```typescript
// src/components/data/DataFetcher.tsx

import { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';

interface DataFetcherProps<T> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  children: (data: T) => ReactNode;
  loadingComponent?: ReactNode;
  errorComponent?: (error: Error) => ReactNode;
}

export function DataFetcher<T>({
  queryKey,
  queryFn,
  children,
  loadingComponent = <div>Loading...</div>,
  errorComponent = (error) => <div>Error: {error.message}</div>,
}: DataFetcherProps<T>) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey,
    queryFn,
  });

  if (isLoading) return <>{loadingComponent}</>;
  if (isError) return <>{errorComponent(error as Error)}</>;
  if (!data) return null;

  return <>{children(data)}</>;
}

// Usage:
// <DataFetcher
//   queryKey={['album', albumId]}
//   queryFn={() => fetchAlbum(albumId)}
// >
//   {(album) => (
//     <div>
//       <h1>{album.title}</h1>
//       <p>{album.description}</p>
//     </div>
//   )}
// </DataFetcher>
```

### 3. Polymorphic Components

```typescript
// src/components/ui/Text.tsx

import { ElementType, ComponentPropsWithoutRef } from 'react';

type TextProps<T extends ElementType = 'p'> = {
  as?: T;
  variant?: 'body' | 'caption' | 'small';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'muted' | 'danger';
  className?: string;
} & ComponentPropsWithoutRef<T>;

export function Text<T extends ElementType = 'p'>({
  as,
  variant = 'body',
  weight = 'normal',
  color = 'primary',
  className = '',
  children,
  ...props
}: TextProps<T>) {
  const Component = as || 'p';

  const variantClasses = {
    body: 'text-base',
    caption: 'text-sm',
    small: 'text-xs',
  };

  const weightClasses = {
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
  };

  const colorClasses = {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-700 dark:text-gray-300',
    muted: 'text-gray-500 dark:text-gray-400',
    danger: 'text-red-600 dark:text-red-400',
  };

  return (
    <Component
      className={`
        ${variantClasses[variant]}
        ${weightClasses[weight]}
        ${colorClasses[color]}
        ${className}
      `}
      {...props}
    >
      {children}
    </Component>
  );
}

// Usage:
// <Text as="h1" weight="bold">Title</Text>
// <Text as="span" variant="caption" color="muted">Subtitle</Text>
```

---

## 🚀 PERFORMANCE PATTERNS

### 1. React.memo with Custom Comparison

```typescript
// src/components/gallery/ImageCard.tsx

import { memo } from 'react';

interface ImageCardProps {
  image: {
    id: string;
    url: string;
    alt: string;
    isFavorite: boolean;
  };
  onClick: (id: string) => void;
}

export const ImageCard = memo(
  function ImageCard({ image, onClick }: ImageCardProps) {
    return (
      <div
        onClick={() => onClick(image.id)}
        className="relative group cursor-pointer"
      >
        <img src={image.url} alt={image.alt} className="w-full h-auto" />
        {image.isFavorite && (
          <div className="absolute top-2 right-2">
            <Heart className="fill-red-500 text-red-500" />
          </div>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison - only re-render if these specific props change
    return (
      prevProps.image.id === nextProps.image.id &&
      prevProps.image.url === nextProps.image.url &&
      prevProps.image.isFavorite === nextProps.image.isFavorite
    );
  }
);
```

### 2. useMemo for Expensive Computations

```typescript
// src/hooks/useSortedAndFilteredImages.ts

import { useMemo } from 'react';
import type { Image } from '@/types/image';

interface Filters {
  searchQuery: string;
  onlyFavorites: boolean;
  dateRange?: { startDate?: Date; endDate?: Date };
}

export function useSortedAndFilteredImages(images: Image[], filters: Filters) {
  const filteredAndSorted = useMemo(() => {
    let result = [...images];

    // Filter by search query
    if (filters.searchQuery) {
      result = result.filter((img) =>
        img.alt.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }

    // Filter by favorites
    if (filters.onlyFavorites) {
      result = result.filter((img) => img.isFavorite);
    }

    // Filter by date range
    if (filters.dateRange?.startDate || filters.dateRange?.endDate) {
      result = result.filter((img) => {
        if (!img.takenAt) return false;
        const date = new Date(img.takenAt);
        if (filters.dateRange.startDate && date < filters.dateRange.startDate) {
          return false;
        }
        if (filters.dateRange.endDate && date > filters.dateRange.endDate) {
          return false;
        }
        return true;
      });
    }

    // Sort by date (newest first)
    result.sort((a, b) => {
      const dateA = a.takenAt ? new Date(a.takenAt).getTime() : 0;
      const dateB = b.takenAt ? new Date(b.takenAt).getTime() : 0;
      return dateB - dateA;
    });

    return result;
  }, [images, filters.searchQuery, filters.onlyFavorites, filters.dateRange]);

  return filteredAndSorted;
}
```

### 3. useCallback for Stable Functions

```typescript
// src/components/gallery/BentoGrid.tsx

import { useCallback, useState } from 'react';

export function BentoGrid({ images }: { images: Image[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Stable function reference
  const handleImageClick = useCallback((id: string) => {
    setSelectedId(id);
    // Analytics tracking
    trackEvent('image_view', { imageId: id });
  }, []);

  const handleFavoriteToggle = useCallback(
    async (id: string, isFavorite: boolean) => {
      try {
        await toggleFavorite(id, isFavorite);
        // Refresh data
      } catch (error) {
        console.error('Failed to toggle favorite:', error);
      }
    },
    []
  );

  return (
    <div className="grid grid-cols-4 gap-4">
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          onClick={handleImageClick}
          onFavoriteToggle={handleFavoriteToggle}
        />
      ))}
    </div>
  );
}
```

### 4. Code Splitting with Dynamic Imports

```typescript
// src/app/page.tsx

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load heavy components
const ImageGallery = dynamic(() => import('@/components/gallery/ImageGallery'), {
  loading: () => <div>Loading gallery...</div>,
  ssr: false,
});

const ThemePanel = dynamic(() => import('@/components/themes/ThemePanel'), {
  loading: () => null,
  ssr: false,
});

const SmartAlbumCreator = dynamic(
  () => import('@/components/albums/SmartAlbumCreator'),
  {
    loading: () => <div>Loading creator...</div>,
    ssr: false,
  }
);

export default function HomePage() {
  const [showGallery, setShowGallery] = useState(false);

  return (
    <div>
      <BentoGrid images={images} onImageClick={() => setShowGallery(true)} />

      {showGallery && (
        <Suspense fallback={<div>Loading...</div>}>
          <ImageGallery images={images} onClose={() => setShowGallery(false)} />
        </Suspense>
      )}
    </div>
  );
}
```

### 5. Virtualization for Large Lists

```typescript
// src/components/timeline/VirtualizedTimeline.tsx

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import type { Image } from '@/types/image';

export function VirtualizedTimeline({ images }: { images: Image[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: images.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300,
    overscan: 5,
  });

  return (
    <div
      ref={parentRef}
      className="h-screen overflow-auto"
      style={{ contain: 'strict' }}
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const image = images[virtualRow.index];
          return (
            <div
              key={virtualRow.key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              <ImageCard image={image} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

---

## 🎨 ANIMATION PATTERNS

### 1. Framer Motion Variants

```typescript
// src/components/animations/variants.ts

export const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
  exit: { opacity: 0, y: 20 },
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

export const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 15,
      stiffness: 100,
    },
  },
};

export const slideIn = {
  left: {
    hidden: { x: -100, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  },
  right: {
    hidden: { x: 100, opacity: 0 },
    visible: { x: 0, opacity: 1 },
  },
  up: {
    hidden: { y: 100, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  },
  down: {
    hidden: { y: -100, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  },
};
```

```typescript
// src/components/gallery/BentoGrid.tsx (WITH ANIMATIONS)

import { motion } from 'framer-motion';
import { fadeInUp, staggerContainer } from '@/components/animations/variants';

export function BentoGrid({ images }: { images: Image[] }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-4 gap-4"
    >
      {images.map((image, index) => (
        <motion.div key={image.id} variants={fadeInUp}>
          <ImageCard image={image} />
        </motion.div>
      ))}
    </motion.div>
  );
}
```

### 2. Layout Animations

```typescript
// src/components/ui/ExpandableCard.tsx

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export function ExpandableCard({ title, children }: { title: string; children: ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div layout className="rounded-lg bg-white p-4 shadow-lg">
      <motion.div
        layout
        onClick={() => setIsExpanded(!isExpanded)}
        className="cursor-pointer"
      >
        <h3 className="text-lg font-bold">{title}</h3>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            layout
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

### 3. Shared Layout Animations

```typescript
// src/components/gallery/ImageGrid.tsx

import { motion, AnimateSharedLayout } from 'framer-motion';

export function ImageGrid({ images, selectedId, onSelect }: any) {
  return (
    <motion.div layout className="grid grid-cols-4 gap-4">
      {images.map((image) => (
        <motion.div
          key={image.id}
          layoutId={`image-${image.id}`}
          onClick={() => onSelect(image.id)}
          whileHover={{ scale: 1.05 }}
          className="cursor-pointer"
        >
          <img src={image.url} alt={image.alt} />
        </motion.div>
      ))}
    </motion.div>
  );
}

export function ImageModal({ image, onClose }: any) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/90 z-50"
    >
      <motion.div layoutId={`image-${image.id}`} className="max-w-4xl mx-auto mt-20">
        <img src={image.url} alt={image.alt} />
      </motion.div>
    </motion.div>
  );
}
```

---

## 🔐 ERROR HANDLING PATTERNS

### 1. Error Boundaries

```typescript
// src/components/errors/ErrorBoundary.tsx

'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // Log to error reporting service
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-bold text-red-600">Something went wrong</h2>
            <p className="mt-2 text-gray-600">{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

### 2. Query Error Handling

```typescript
// src/hooks/useImages.ts

import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export function useImages() {
  return useQuery({
    queryKey: ['images'],
    queryFn: async () => {
      const response = await fetch('/api/images');
      if (!response.ok) {
        throw new Error('Failed to fetch images');
      }
      return response.json();
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    onError: (error) => {
      toast.error(`Failed to load images: ${error.message}`);
    },
  });
}
```

---

## 📊 PATTERNS SUMMARY

### React 19 Features to Use
- ✅ useActionState for form handling
- ✅ useOptimistic for optimistic updates
- ✅ Server Components for data fetching
- ✅ Streaming with Suspense
- ✅ use() hook for promises

### Performance Optimizations
- ✅ React.memo with custom comparison
- ✅ useMemo for expensive computations
- ✅ useCallback for stable functions
- ✅ Code splitting with dynamic imports
- ✅ Virtualization for large lists

### Composition Patterns
- ✅ Compound components
- ✅ Render props
- ✅ Polymorphic components

### Animation Best Practices
- ✅ Framer Motion variants
- ✅ Layout animations
- ✅ Shared layout transitions

---

**Last Updated**: 2026-01-18
**Author**: Claude Sonnet 4.5
