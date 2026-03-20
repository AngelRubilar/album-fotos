# 🎨 ARQUITECTURA DE COMPONENTES REACT - LUMINA GALLERY

> Diseño completo siguiendo Atomic Design, React 19, TypeScript y mejores prácticas

**Stack**: React 19 + TypeScript + Next.js 15 App Router + Tailwind CSS 4 + Framer Motion + TanStack Query

---

## 📋 ÍNDICE

1. [Atomic Design Breakdown](#atomic-design-breakdown)
2. [Props Interfaces TypeScript](#props-interfaces-typescript)
3. [Custom Hooks](#custom-hooks)
4. [Composición de Componentes](#composición-de-componentes)
5. [Estado y Lógica](#estado-y-lógica)
6. [Performance Optimizations](#performance-optimizations)
7. [Accesibilidad](#accesibilidad)
8. [Ejemplos de Código Completos](#ejemplos-de-código-completos)
9. [Testing Approach](#testing-approach)
10. [Storybook Configuration](#storybook-configuration)

---

## 🔬 ATOMIC DESIGN BREAKDOWN

### 📌 ATOMS (Elementos Básicos)

#### 1. Button
```
- PrimaryButton
- SecondaryButton
- IconButton
- FavoriteButton
- CloseButton
```

#### 2. Input
```
- TextInput
- SearchInput
- DateInput
- FileInput
```

#### 3. Badge
```
- TagBadge
- CountBadge
- StatusBadge
```

#### 4. Icon
```
- Icon (wrapper para SVG)
- AnimatedIcon
```

#### 5. Typography
```
- Heading
- Text
- Caption
- Label
```

#### 6. Image
```
- OptimizedImage
- Thumbnail
- Avatar
```

#### 7. Spinner
```
- LoadingSpinner
- SkeletonLoader
```

### 📦 MOLECULES (Combinaciones Simples)

#### 1. Navigation
```
- SidebarItem (icon + label + badge)
- NavLink
- Breadcrumb
```

#### 2. Search
```
- SearchBar (input + icon + clear button)
- SearchSuggestion
```

#### 3. Filter
```
- FilterChip (label + remove button)
- FilterToggle
- DateRangePicker
```

#### 4. Card
```
- ImageCard (image + overlay + actions)
- AlbumCard (cover + title + count)
- StatCard
```

#### 5. Form
```
- FormField (label + input + error)
- TagInput (input + tag list)
```

#### 6. Media
```
- ImageWithCaption
- VideoPlayer
```

#### 7. Feedback
```
- Toast
- Alert
- EmptyState
```

### 🏗️ ORGANISMS (Secciones Complejas)

#### 1. Navigation
```
- Sidebar (profile + nav items + theme button)
- TopBar (breadcrumb + search + actions)
- MobileMenu
```

#### 2. Gallery
```
- BentoGrid (masonry layout + items)
- TimelineGrid (date groups + images)
- ImageGallery/Lightbox (viewer + controls + exif panel)
```

#### 3. Panels
```
- FilterPanel (search + filters + chips)
- ExifPanel (metadata display)
- ThemePanel (theme previews + selector)
```

#### 4. Album
```
- SmartAlbumCreator (rule builder)
- AlbumGrid (album cards)
```

#### 5. Forms
```
- UploadForm (drag-drop + previews)
- ImageMetadataForm
```

### 📄 TEMPLATES (Layouts de Página)

#### 1. MainLayout
```
- Sidebar + Content Area
- Mobile responsive
```

#### 2. GalleryLayout
```
- Grid container + Filters
```

#### 3. DetailLayout
```
- Image viewer + Sidebar
```

### 🖼️ PAGES (Vistas Completas)

```
- HomePage (Bento Grid + Smart Albums)
- TimelinePage (Infinite scroll timeline)
- ExplorePage (Search + Filters + Results)
- FavoritesPage (Favorite images grid)
- AlbumPage (Album detail view)
- SettingsPage (User settings)
```

---

## 📝 PROPS INTERFACES TYPESCRIPT

### Atoms

```typescript
// ============================================
// BUTTONS
// ============================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string; // for accessibility
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'solid';
}

interface FavoriteButtonProps {
  imageId: string;
  isFavorite: boolean;
  onToggle: (isFavorite: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

// ============================================
// INPUTS
// ============================================

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

interface SearchInputProps extends Omit<TextInputProps, 'type'> {
  onSearch: (query: string) => void;
  onClear?: () => void;
  suggestions?: string[];
  isLoading?: boolean;
}

// ============================================
// BADGES
// ============================================

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
}

interface TagBadgeProps {
  tag: {
    id: string;
    name: string;
    category: string;
    color?: string;
  };
  onRemove?: (tagId: string) => void;
  isRemovable?: boolean;
}

// ============================================
// IMAGES
// ============================================

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
}

interface ThumbnailProps {
  src: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  aspectRatio?: '1:1' | '4:3' | '16:9' | 'auto';
  objectFit?: 'cover' | 'contain';
}

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away';
}

// ============================================
// TYPOGRAPHY
// ============================================

interface HeadingProps {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  children: React.ReactNode;
  className?: string;
}

interface TextProps {
  variant?: 'body' | 'caption' | 'small';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'primary' | 'secondary' | 'muted' | 'danger';
  children: React.ReactNode;
  className?: string;
}
```

### Molecules

```typescript
// ============================================
// NAVIGATION
// ============================================

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  badge?: number;
  isCollapsed?: boolean;
}

interface BreadcrumbProps {
  items: Array<{
    label: string;
    href?: string;
  }>;
}

// ============================================
// CARDS
// ============================================

interface ImageCardProps {
  image: {
    id: string;
    url: string;
    thumbnailUrl: string;
    alt: string;
    width: number;
    height: number;
    isFavorite?: boolean;
  };
  onClick?: (imageId: string) => void;
  onFavoriteToggle?: (imageId: string, isFavorite: boolean) => void;
  showOverlay?: boolean;
  className?: string;
}

interface AlbumCardProps {
  album: {
    id: string;
    year: number;
    title: string;
    description?: string;
    coverImageUrl: string;
    imageCount: number;
  };
  onClick?: (albumId: string) => void;
  variant?: 'default' | 'compact';
}

interface SmartAlbumCardProps {
  smartAlbum: {
    id: string;
    title: string;
    description?: string;
    icon: string;
    imageCount: number;
    coverImages: string[]; // max 4
    isSystem: boolean;
  };
  onClick?: (albumId: string) => void;
}

// ============================================
// FILTERS
// ============================================

interface FilterChipProps {
  label: string;
  value: string;
  onRemove: (value: string) => void;
  icon?: React.ReactNode;
}

interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onChange: (range: { startDate?: Date; endDate?: Date }) => void;
  label?: string;
}

// ============================================
// FORM
// ============================================

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  helperText?: string;
  children: React.ReactNode;
}

interface TagInputProps {
  tags: Array<{ id: string; name: string; color?: string }>;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tagId: string) => void;
  suggestions?: string[];
  placeholder?: string;
}
```

### Organisms

```typescript
// ============================================
// SIDEBAR
// ============================================

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  user?: {
    name: string;
    avatar?: string;
  };
  navItems: Array<{
    id: string;
    icon: React.ReactNode;
    label: string;
    href: string;
    badge?: number;
  }>;
}

// ============================================
// GRIDS
// ============================================

interface BentoGridProps {
  images: Array<{
    id: string;
    url: string;
    thumbnailUrl: string;
    alt: string;
    width: number;
    height: number;
    isFavorite?: boolean;
    featured?: boolean;
  }>;
  onImageClick: (imageId: string) => void;
  onFavoriteToggle?: (imageId: string, isFavorite: boolean) => void;
  isLoading?: boolean;
  columns?: number;
}

interface TimelineGridProps {
  images: Array<{
    id: string;
    url: string;
    thumbnailUrl: string;
    alt: string;
    width: number;
    height: number;
    takenAt: Date;
    isFavorite?: boolean;
  }>;
  onImageClick: (imageId: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoading?: boolean;
}

// ============================================
// LIGHTBOX
// ============================================

interface ImageGalleryProps {
  images: Array<{
    id: string;
    url: string;
    alt: string;
    width: number;
    height: number;
    isFavorite?: boolean;
    exifData?: ExifData;
  }>;
  initialIndex?: number;
  onClose: () => void;
  onFavoriteToggle?: (imageId: string, isFavorite: boolean) => void;
  showExifPanel?: boolean;
}

interface ExifData {
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

interface ExifPanelProps {
  exifData: ExifData;
  isOpen: boolean;
  onToggle: () => void;
}

// ============================================
// FILTER PANEL
// ============================================

interface FilterPanelProps {
  filters: {
    searchQuery: string;
    dateRange?: { startDate?: Date; endDate?: Date };
    albums: string[];
    cameras: string[];
    tags: string[];
    onlyFavorites: boolean;
  };
  onFilterChange: (filters: FilterPanelProps['filters']) => void;
  onClearFilters: () => void;
  availableAlbums: Array<{ id: string; title: string }>;
  availableCameras: string[];
  availableTags: Array<{ id: string; name: string; color?: string }>;
}

// ============================================
// THEME PANEL
// ============================================

interface ThemePanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  onThemeChange: (themeId: string) => void;
  themes: Array<{
    id: string;
    name: string;
    description: string;
    preview: string; // background gradient or image
    category: 'light' | 'dark' | 'glass';
  }>;
}

// ============================================
// SMART ALBUM CREATOR
// ============================================

interface SmartAlbumRule {
  field: 'date' | 'camera' | 'location' | 'favorite' | 'tag';
  operator: 'equals' | 'contains' | 'between' | 'in' | 'exists';
  value: any;
}

interface SmartAlbumCreatorProps {
  onSave: (album: {
    title: string;
    description?: string;
    icon?: string;
    rules: SmartAlbumRule[];
  }) => void;
  onCancel: () => void;
  initialData?: {
    title: string;
    description?: string;
    icon?: string;
    rules: SmartAlbumRule[];
  };
}
```

---

## 🎣 CUSTOM HOOKS

### 1. useSidebar

```typescript
// src/hooks/useSidebar.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SidebarState {
  isOpen: boolean;
  isCollapsed: boolean;
  toggle: () => void;
  collapse: () => void;
  expand: () => void;
  close: () => void;
  open: () => void;
}

export const useSidebar = create<SidebarState>()(
  persist(
    (set) => ({
      isOpen: true,
      isCollapsed: false,
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
      collapse: () => set({ isCollapsed: true }),
      expand: () => set({ isCollapsed: false }),
      close: () => set({ isOpen: false }),
      open: () => set({ isOpen: true }),
    }),
    {
      name: 'sidebar-storage',
    }
  )
);

// Usage:
// const { isOpen, toggle } = useSidebar();
```

### 2. useInfiniteTimeline

```typescript
// src/hooks/useInfiniteTimeline.ts

import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

interface TimelineImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  alt: string;
  width: number;
  height: number;
  takenAt: Date;
  isFavorite: boolean;
}

interface TimelineResponse {
  images: TimelineImage[];
  nextCursor?: string;
  hasMore: boolean;
}

async function fetchTimelineImages(
  cursor?: string,
  limit = 50
): Promise<TimelineResponse> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    ...(cursor && { cursor }),
  });

  const response = await fetch(`/api/timeline?${params}`);
  if (!response.ok) throw new Error('Failed to fetch timeline');
  return response.json();
}

export function useInfiniteTimeline(limit = 50) {
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false,
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['timeline'],
    queryFn: ({ pageParam }) => fetchTimelineImages(pageParam, limit),
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
    initialPageParam: undefined as string | undefined,
  });

  // Auto-load more when sentinel is in view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten pages into single array
  const images = data?.pages.flatMap((page) => page.images) ?? [];

  return {
    images,
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,
    sentinelRef: ref,
  };
}

// Usage:
// const { images, isLoading, sentinelRef } = useInfiniteTimeline();
```

### 3. useBentoLayout

```typescript
// src/hooks/useBentoLayout.ts

import { useMemo } from 'react';

interface BentoImage {
  id: string;
  width: number;
  height: number;
  featured?: boolean;
}

interface BentoLayoutItem extends BentoImage {
  span: 1 | 2;
  aspectRatio: number;
}

export function useBentoLayout(images: BentoImage[], columns = 4) {
  return useMemo(() => {
    const layoutItems: BentoLayoutItem[] = [];
    let currentColumn = 0;

    images.forEach((image) => {
      // Featured images take 2x2
      const isFeatured = image.featured || false;
      const span = isFeatured ? 2 : 1;

      // Check if featured image fits in current row
      if (isFeatured && currentColumn + span > columns) {
        // Move to next row
        currentColumn = 0;
      }

      layoutItems.push({
        ...image,
        span,
        aspectRatio: image.width / image.height,
      });

      currentColumn = (currentColumn + span) % columns;
    });

    return layoutItems;
  }, [images, columns]);
}

// Usage:
// const layoutItems = useBentoLayout(images, 4);
```

### 4. useFavorites

```typescript
// src/hooks/useFavorites.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

async function toggleFavorite(imageId: string, isFavorite: boolean) {
  const method = isFavorite ? 'PUT' : 'DELETE';
  const response = await fetch(`/api/images/${imageId}/favorite`, { method });
  if (!response.ok) throw new Error('Failed to toggle favorite');
  return response.json();
}

export function useFavorites() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ imageId, isFavorite }: { imageId: string; isFavorite: boolean }) =>
      toggleFavorite(imageId, isFavorite),
    onMutate: async ({ imageId, isFavorite }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['timeline'] });
      await queryClient.cancelQueries({ queryKey: ['favorites'] });

      // Snapshot previous value
      const previousTimeline = queryClient.getQueryData(['timeline']);
      const previousFavorites = queryClient.getQueryData(['favorites']);

      // Optimistically update
      queryClient.setQueryData(['timeline'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            images: page.images.map((img: any) =>
              img.id === imageId ? { ...img, isFavorite } : img
            ),
          })),
        };
      });

      return { previousTimeline, previousFavorites };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousTimeline) {
        queryClient.setQueryData(['timeline'], context.previousTimeline);
      }
      if (context?.previousFavorites) {
        queryClient.setQueryData(['favorites'], context.previousFavorites);
      }
      toast.error('Failed to update favorite');
    },
    onSuccess: (data, variables) => {
      toast.success(variables.isFavorite ? 'Added to favorites' : 'Removed from favorites');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  return {
    toggleFavorite: (imageId: string, isFavorite: boolean) =>
      mutation.mutate({ imageId, isFavorite }),
    isLoading: mutation.isPending,
  };
}

// Usage:
// const { toggleFavorite, isLoading } = useFavorites();
```

### 5. useSmartAlbums

```typescript
// src/hooks/useSmartAlbums.ts

import { useQuery } from '@tanstack/react-query';

interface SmartAlbum {
  id: string;
  title: string;
  description?: string;
  icon: string;
  imageCount: number;
  coverImages: string[];
  isSystem: boolean;
  rules: any;
}

async function fetchSmartAlbums(): Promise<SmartAlbum[]> {
  const response = await fetch('/api/smart-albums');
  if (!response.ok) throw new Error('Failed to fetch smart albums');
  return response.json();
}

export function useSmartAlbums() {
  return useQuery({
    queryKey: ['smart-albums'],
    queryFn: fetchSmartAlbums,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Usage:
// const { data: smartAlbums, isLoading } = useSmartAlbums();
```

### 6. useTheme

```typescript
// src/hooks/useTheme.ts

import { useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

// Usage:
// const { theme, setTheme, themes } = useTheme();
```

### 7. useKeyboardNavigation

```typescript
// src/hooks/useKeyboardNavigation.ts

import { useEffect } from 'react';

interface UseKeyboardNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  onClose: () => void;
  onToggleFavorite?: () => void;
  enabled?: boolean;
}

export function useKeyboardNavigation({
  onPrevious,
  onNext,
  onClose,
  onToggleFavorite,
  enabled = true,
}: UseKeyboardNavigationProps) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          onPrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          onNext();
          break;
        case 'Escape':
          event.preventDefault();
          onClose();
          break;
        case 'f':
        case 'F':
          if (onToggleFavorite) {
            event.preventDefault();
            onToggleFavorite();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onPrevious, onNext, onClose, onToggleFavorite, enabled]);
}

// Usage:
// useKeyboardNavigation({
//   onPrevious: () => setIndex(i => i - 1),
//   onNext: () => setIndex(i => i + 1),
//   onClose: () => setIsOpen(false),
// });
```

### 8. useMediaQuery

```typescript
// src/hooks/useMediaQuery.ts

import { useState, useEffect } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // Set initial value
    setMatches(media.matches);

    // Create event listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener
    media.addEventListener('change', listener);

    // Cleanup
    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// Preset breakpoints
export function useIsMobile() {
  return useMediaQuery('(max-width: 768px)');
}

export function useIsTablet() {
  return useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
}

export function useIsDesktop() {
  return useMediaQuery('(min-width: 1025px)');
}

// Usage:
// const isMobile = useIsMobile();
```

---

## 🧩 COMPOSICIÓN DE COMPONENTES

### Compound Components Pattern

```typescript
// src/components/ui/Card.tsx

import React, { createContext, useContext } from 'react';

const CardContext = createContext<{ variant: 'default' | 'glass' }>({ variant: 'default' });

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'glass';
  className?: string;
}

export function Card({ children, variant = 'default', className = '' }: CardProps) {
  return (
    <CardContext.Provider value={{ variant }}>
      <div
        className={`
          rounded-lg overflow-hidden
          ${variant === 'glass' ? 'backdrop-blur-md bg-white/10' : 'bg-white dark:bg-gray-800'}
          ${className}
        `}
      >
        {children}
      </div>
    </CardContext.Provider>
  );
}

Card.Header = function CardHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { variant } = useContext(CardContext);
  return (
    <div
      className={`
        p-4 border-b
        ${variant === 'glass' ? 'border-white/20' : 'border-gray-200 dark:border-gray-700'}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

Card.Body = function CardBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
};

Card.Footer = function CardFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { variant } = useContext(CardContext);
  return (
    <div
      className={`
        p-4 border-t
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
//   <Card.Header>Title</Card.Header>
//   <Card.Body>Content</Card.Body>
//   <Card.Footer>Actions</Card.Footer>
// </Card>
```

### Render Props Pattern

```typescript
// src/components/ui/VirtualList.tsx

import { ReactNode } from 'react';
import { useVirtual } from '@tanstack/react-virtual';

interface VirtualListProps<T> {
  items: T[];
  estimateSize: number;
  children: (item: T, index: number) => ReactNode;
  className?: string;
}

export function VirtualList<T>({
  items,
  estimateSize,
  children,
  className = '',
}: VirtualListProps<T>) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtual({
    size: items.length,
    parentRef,
    estimateSize: () => estimateSize,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className={`overflow-auto ${className}`}>
      <div
        style={{
          height: `${virtualizer.totalSize}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.virtualItems.map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {children(items[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// Usage:
// <VirtualList items={images} estimateSize={200}>
//   {(image, index) => <ImageCard key={image.id} image={image} />}
// </VirtualList>
```

### Higher-Order Component (HOC)

```typescript
// src/components/hoc/withLoading.tsx

import React from 'react';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

interface WithLoadingProps {
  isLoading: boolean;
}

export function withLoading<P extends object>(
  Component: React.ComponentType<P>
) {
  return function WithLoadingComponent(
    props: P & WithLoadingProps
  ) {
    const { isLoading, ...restProps } = props;

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    return <Component {...(restProps as P)} />;
  };
}

// Usage:
// const AlbumGridWithLoading = withLoading(AlbumGrid);
// <AlbumGridWithLoading albums={albums} isLoading={isLoading} />
```

---

## 🏪 ESTADO Y LÓGICA

### Local State (useState)

```typescript
// Simple component state
const [isOpen, setIsOpen] = useState(false);
const [searchQuery, setSearchQuery] = useState('');
const [selectedImage, setSelectedImage] = useState<string | null>(null);
```

### Global State (Zustand)

```typescript
// src/store/useAppStore.ts

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppState {
  // Sidebar
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;

  // Filters
  filters: {
    searchQuery: string;
    dateRange?: { startDate?: Date; endDate?: Date };
    albums: string[];
    cameras: string[];
    tags: string[];
    onlyFavorites: boolean;
  };

  // User
  user?: {
    name: string;
    avatar?: string;
  };

  // Actions
  toggleSidebar: () => void;
  collapseSidebar: () => void;
  setFilters: (filters: Partial<AppState['filters']>) => void;
  clearFilters: () => void;
  setUser: (user: AppState['user']) => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
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

        toggleSidebar: () =>
          set((state) => ({ sidebarOpen: !state.sidebarOpen })),

        collapseSidebar: () =>
          set({ sidebarCollapsed: true }),

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
    )
  )
);

// Usage:
// const { filters, setFilters } = useAppStore();
```

### Server State (TanStack Query)

```typescript
// src/app/page.tsx

'use client';

import { useQuery } from '@tanstack/react-query';

export default function HomePage() {
  // Fetch albums
  const { data: albums, isLoading } = useQuery({
    queryKey: ['albums'],
    queryFn: async () => {
      const res = await fetch('/api/albums');
      if (!res.ok) throw new Error('Failed to fetch albums');
      return res.json();
    },
  });

  // Fetch smart albums
  const { data: smartAlbums } = useQuery({
    queryKey: ['smart-albums'],
    queryFn: async () => {
      const res = await fetch('/api/smart-albums');
      if (!res.ok) throw new Error('Failed to fetch smart albums');
      return res.json();
    },
  });

  return (
    <div>
      {/* Render content */}
    </div>
  );
}
```

### Context API (for Theme)

```typescript
// src/contexts/ThemeContext.tsx

'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';

export interface Theme {
  id: string;
  name: string;
  description: string;
  category: 'light' | 'dark' | 'glass';
  cssVariables: Record<string, string>;
}

interface ThemeContextValue {
  theme: string;
  setTheme: (themeId: string) => void;
  themes: Theme[];
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const THEMES: Theme[] = [
  {
    id: 'light',
    name: 'Light',
    description: 'Clean and bright',
    category: 'light',
    cssVariables: {
      '--bg-primary': '#ffffff',
      '--bg-secondary': '#f3f4f6',
      '--text-primary': '#111827',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    description: 'Easy on the eyes',
    category: 'dark',
    cssVariables: {
      '--bg-primary': '#111827',
      '--bg-secondary': '#1f2937',
      '--text-primary': '#f9fafb',
    },
  },
  {
    id: 'glass',
    name: 'Glassmorphism',
    description: 'Modern and translucent',
    category: 'glass',
    cssVariables: {
      '--bg-primary': 'rgba(255, 255, 255, 0.1)',
      '--backdrop-blur': '12px',
    },
  },
];

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('lumina-theme');
    if (savedTheme) setThemeState(savedTheme);
  }, []);

  const setTheme = (themeId: string) => {
    setThemeState(themeId);
    localStorage.setItem('lumina-theme', themeId);

    // Apply CSS variables
    const selectedTheme = THEMES.find((t) => t.id === themeId);
    if (selectedTheme) {
      Object.entries(selectedTheme.cssVariables).forEach(([key, value]) => {
        document.documentElement.style.setProperty(key, value);
      });
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

---

## ⚡ PERFORMANCE OPTIMIZATIONS

### 1. React.memo

```typescript
// src/components/gallery/ImageCard.tsx

import React, { memo } from 'react';

interface ImageCardProps {
  image: {
    id: string;
    url: string;
    alt: string;
  };
  onClick: (id: string) => void;
}

export const ImageCard = memo(function ImageCard({ image, onClick }: ImageCardProps) {
  return (
    <div
      onClick={() => onClick(image.id)}
      className="cursor-pointer hover:opacity-90 transition-opacity"
    >
      <img src={image.url} alt={image.alt} />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison - only re-render if image.id changes
  return prevProps.image.id === nextProps.image.id;
});
```

### 2. useMemo

```typescript
// Expensive computation
const sortedImages = useMemo(() => {
  return images.sort((a, b) =>
    new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime()
  );
}, [images]);

// Filtered data
const filteredImages = useMemo(() => {
  return images.filter((img) => {
    if (filters.onlyFavorites && !img.isFavorite) return false;
    if (filters.searchQuery && !img.alt.includes(filters.searchQuery)) return false;
    return true;
  });
}, [images, filters]);
```

### 3. useCallback

```typescript
// Stable function reference
const handleImageClick = useCallback((imageId: string) => {
  setSelectedImage(imageId);
  router.push(`/image/${imageId}`);
}, [router]);

const handleFavoriteToggle = useCallback((imageId: string, isFavorite: boolean) => {
  toggleFavorite(imageId, isFavorite);
}, [toggleFavorite]);
```

### 4. Code Splitting

```typescript
// src/app/page.tsx

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

// Lazy load heavy components
const BentoGrid = dynamic(() => import('@/components/gallery/BentoGrid'), {
  loading: () => <GridSkeleton />,
  ssr: false,
});

const ThemePanel = dynamic(() => import('@/components/themes/ThemePanel'), {
  loading: () => null,
});

export default function HomePage() {
  return (
    <div>
      <Suspense fallback={<GridSkeleton />}>
        <BentoGrid images={images} />
      </Suspense>
    </div>
  );
}
```

### 5. Virtualization

```typescript
// src/components/timeline/TimelineGrid.tsx

import { useVirtualizer } from '@tanstack/react-virtual';

export function TimelineGrid({ images }: { images: any[] }) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: images.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <ImageCard image={images[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 6. Image Optimization

```typescript
// src/components/ui/OptimizedImage.tsx

import Image from 'next/image';
import { useState } from 'react';

export function OptimizedImage({ src, alt, ...props }: any) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative">
      <Image
        src={src}
        alt={alt}
        {...props}
        onLoad={() => setIsLoading(false)}
        className={`
          duration-700 ease-in-out
          ${isLoading ? 'scale-110 blur-2xl grayscale' : 'scale-100 blur-0 grayscale-0'}
        `}
      />
    </div>
  );
}
```

---

## ♿ ACCESIBILIDAD

### 1. ARIA Labels

```typescript
// src/components/ui/IconButton.tsx

export function IconButton({ icon, label, onClick }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="p-2 rounded-full hover:bg-gray-100"
    >
      {icon}
    </button>
  );
}
```

### 2. Keyboard Navigation

```typescript
// src/components/gallery/ImageGallery.tsx

export function ImageGallery({ images, onClose }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useKeyboardNavigation({
    onPrevious: () => setCurrentIndex((i) => Math.max(0, i - 1)),
    onNext: () => setCurrentIndex((i) => Math.min(images.length - 1, i + 1)),
    onClose,
  });

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      tabIndex={-1}
    >
      {/* Content */}
    </div>
  );
}
```

### 3. Focus Management

```typescript
// src/components/ui/Modal.tsx

import { useEffect, useRef } from 'react';
import FocusTrap from 'focus-trap-react';

export function Modal({ isOpen, onClose, children }: ModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <FocusTrap>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50"
      >
        <button
          ref={closeButtonRef}
          onClick={onClose}
          aria-label="Close dialog"
        >
          Close
        </button>
        {children}
      </div>
    </FocusTrap>
  );
}
```

### 4. Semantic HTML

```typescript
// Use semantic elements
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/timeline">Timeline</a></li>
  </ul>
</nav>

<main id="main-content">
  <h1>Lumina Gallery</h1>
  <section aria-labelledby="albums-heading">
    <h2 id="albums-heading">Albums</h2>
    {/* Content */}
  </section>
</main>
```

### 5. Screen Reader Announcements

```typescript
// src/components/ui/LiveRegion.tsx

export function LiveRegion({ message, politeness = 'polite' }: {
  message: string;
  politeness?: 'polite' | 'assertive';
}) {
  return (
    <div
      role="status"
      aria-live={politeness}
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}

// Usage in parent component
const [announcement, setAnnouncement] = useState('');

const handleFavorite = () => {
  toggleFavorite();
  setAnnouncement('Image added to favorites');
};

return (
  <>
    <button onClick={handleFavorite}>Favorite</button>
    <LiveRegion message={announcement} />
  </>
);
```

---

## 📚 EJEMPLOS DE CÓDIGO COMPLETOS

### Complete Component: Sidebar

```typescript
// src/components/layout/Sidebar.tsx

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '@/hooks/useSidebar';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
  Home,
  Timeline,
  Search,
  Folder,
  Heart,
  Palette,
  Settings,
  Menu,
  X,
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'timeline', icon: Timeline, label: 'Timeline', href: '/timeline' },
  { id: 'explore', icon: Search, label: 'Explore', href: '/explore' },
  { id: 'albums', icon: Folder, label: 'Albums', href: '/albums' },
  { id: 'favorites', icon: Heart, label: 'Favorites', href: '/favorites', badge: 12 },
  { id: 'themes', icon: Palette, label: 'Themes', href: '/themes' },
  { id: 'settings', icon: Settings, label: 'Settings', href: '/settings' },
];

export function Sidebar() {
  const pathname = usePathname();
  const { isOpen, toggle, isCollapsed } = useSidebar();
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <>
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={toggle}
          className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/10 backdrop-blur-md"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Overlay */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggle}
            className="fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {(!isMobile || isOpen) && (
          <motion.aside
            initial={{ x: isMobile ? -300 : 0 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`
              fixed left-0 top-0 h-screen z-40
              ${isCollapsed ? 'w-20' : 'w-64'}
              bg-white/10 backdrop-blur-xl
              border-r border-white/20
              flex flex-col
              transition-all duration-300
            `}
          >
            {/* Profile Section */}
            <div className="p-4 border-b border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
                {!isCollapsed && (
                  <div className="flex-1">
                    <p className="font-semibold text-white">John Doe</p>
                    <p className="text-sm text-white/60">Photographer</p>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2" aria-label="Main navigation">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2 rounded-lg
                      transition-all duration-200
                      ${isActive
                        ? 'bg-white/20 text-white'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }
                    `}
                  >
                    <Icon size={20} />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-red-500 text-white">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/20">
              <button
                onClick={() => useSidebar.getState().collapse()}
                className="w-full px-3 py-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                {isCollapsed ? '→' : '← Collapse'}
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
```

### Complete Component: BentoGrid

```typescript
// src/components/gallery/BentoGrid.tsx

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Masonry from 'react-masonry-css';
import { OptimizedImage } from '@/components/ui/OptimizedImage';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { useFavorites } from '@/hooks/useFavorites';
import { useBentoLayout } from '@/hooks/useBentoLayout';

interface BentoGridProps {
  images: Array<{
    id: string;
    url: string;
    thumbnailUrl: string;
    alt: string;
    width: number;
    height: number;
    isFavorite?: boolean;
    featured?: boolean;
  }>;
  onImageClick: (imageId: string) => void;
  columns?: number;
}

export function BentoGrid({ images, onImageClick, columns = 4 }: BentoGridProps) {
  const { toggleFavorite } = useFavorites();
  const layoutItems = useBentoLayout(images, columns);

  const breakpointColumns = {
    default: columns,
    1536: 4,
    1280: 3,
    1024: 2,
    768: 1,
  };

  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="flex -ml-4 w-auto"
      columnClassName="pl-4 bg-clip-padding"
    >
      {layoutItems.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          className={`
            relative mb-4 group cursor-pointer
            ${item.featured ? 'row-span-2 col-span-2' : ''}
          `}
          onClick={() => onImageClick(item.id)}
        >
          {/* Image */}
          <div className="relative overflow-hidden rounded-lg">
            <OptimizedImage
              src={item.thumbnailUrl}
              alt={item.alt}
              width={item.width}
              height={item.height}
              className="w-full h-auto transition-transform duration-300 group-hover:scale-105"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              {/* Favorite Button */}
              <div className="absolute top-3 right-3">
                <FavoriteButton
                  imageId={item.id}
                  isFavorite={item.isFavorite || false}
                  onToggle={(isFavorite) => toggleFavorite(item.id, isFavorite)}
                  size="md"
                />
              </div>

              {/* Info */}
              <div className="absolute bottom-3 left-3 right-3">
                <p className="text-white font-medium truncate">{item.alt}</p>
              </div>
            </div>

            {/* Featured Badge */}
            {item.featured && (
              <div className="absolute top-3 left-3">
                <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-500 text-white">
                  Featured
                </span>
              </div>
            )}
          </div>
        </motion.div>
      ))}
    </Masonry>
  );
}
```

### Complete Component: ImageGallery (Lightbox)

```typescript
// src/components/gallery/ImageGallery.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Info } from 'lucide-react';
import { ExifPanel } from './ExifPanel';
import { FavoriteButton } from '@/components/ui/FavoriteButton';
import { useFavorites } from '@/hooks/useFavorites';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';

interface ImageGalleryProps {
  images: Array<{
    id: string;
    url: string;
    alt: string;
    width: number;
    height: number;
    isFavorite?: boolean;
    exifData?: any;
  }>;
  initialIndex?: number;
  onClose: () => void;
  showExifPanel?: boolean;
}

export function ImageGallery({
  images,
  initialIndex = 0,
  onClose,
  showExifPanel = true,
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [showExif, setShowExif] = useState(false);
  const { toggleFavorite } = useFavorites();

  const currentImage = images[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < images.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (hasNext) setCurrentIndex(currentIndex + 1);
  };

  const handleToggleFavorite = () => {
    toggleFavorite(currentImage.id, !currentImage.isFavorite);
  };

  useKeyboardNavigation({
    onPrevious: handlePrevious,
    onNext: handleNext,
    onClose,
    onToggleFavorite: handleToggleFavorite,
  });

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/95"
      >
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close gallery"
            >
              <X size={24} className="text-white" />
            </button>
            <div className="text-white">
              <p className="font-medium">{currentImage.alt}</p>
              <p className="text-sm text-white/60">
                {currentIndex + 1} / {images.length}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <FavoriteButton
              imageId={currentImage.id}
              isFavorite={currentImage.isFavorite || false}
              onToggle={(isFavorite) => toggleFavorite(currentImage.id, isFavorite)}
              showLabel
            />
            {showExifPanel && currentImage.exifData && (
              <button
                onClick={() => setShowExif(!showExif)}
                className={`
                  p-2 rounded-full transition-colors
                  ${showExif ? 'bg-white/20' : 'hover:bg-white/10'}
                `}
                aria-label="Toggle EXIF data"
              >
                <Info size={20} className="text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Main Image */}
        <div className="absolute inset-0 flex items-center justify-center p-20">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImage.id}
              src={currentImage.url}
              alt={currentImage.alt}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="max-w-full max-h-full object-contain"
            />
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        {hasPrevious && (
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft size={24} className="text-white" />
          </button>
        )}

        {hasNext && (
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-colors"
            aria-label="Next image"
          >
            <ChevronRight size={24} className="text-white" />
          </button>
        )}

        {/* EXIF Panel */}
        {showExifPanel && currentImage.exifData && (
          <ExifPanel
            exifData={currentImage.exifData}
            isOpen={showExif}
            onToggle={() => setShowExif(!showExif)}
          />
        )}

        {/* Thumbnail Strip (optional) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 overflow-x-auto bg-gradient-to-t from-black/80 to-transparent">
          <div className="flex gap-2 justify-center">
            {images.map((img, index) => (
              <button
                key={img.id}
                onClick={() => setCurrentIndex(index)}
                className={`
                  flex-shrink-0 w-16 h-16 rounded overflow-hidden
                  transition-all duration-200
                  ${index === currentIndex
                    ? 'ring-2 ring-white scale-110'
                    : 'opacity-50 hover:opacity-100'
                  }
                `}
              >
                <img
                  src={img.url}
                  alt={img.alt}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
```

### Complete Component: ExifPanel

```typescript
// src/components/gallery/ExifPanel.tsx

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Camera,
  Aperture,
  Gauge,
  Image as ImageIcon,
  MapPin,
} from 'lucide-react';

interface ExifData {
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

interface ExifPanelProps {
  exifData: ExifData;
  isOpen: boolean;
  onToggle: () => void;
}

export function ExifPanel({ exifData, isOpen, onToggle }: ExifPanelProps) {
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: 400 }}
          animate={{ x: 0 }}
          exit={{ x: 400 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 bottom-0 w-80 bg-black/80 backdrop-blur-xl border-l border-white/20 overflow-y-auto"
        >
          <div className="p-6 space-y-6">
            <h2 className="text-xl font-bold text-white">Image Details</h2>

            {/* Camera Info */}
            {(exifData.cameraMake || exifData.cameraModel) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white/60">
                  <Camera size={16} />
                  <span className="text-sm font-medium">Camera</span>
                </div>
                <p className="text-white">
                  {exifData.cameraMake} {exifData.cameraModel}
                </p>
                {exifData.lens && (
                  <p className="text-sm text-white/60">{exifData.lens}</p>
                )}
              </div>
            )}

            {/* Settings */}
            {(exifData.focalLength || exifData.aperture || exifData.shutterSpeed || exifData.iso) && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-white/60">
                  <Aperture size={16} />
                  <span className="text-sm font-medium">Settings</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {exifData.focalLength && (
                    <div>
                      <p className="text-xs text-white/60">Focal Length</p>
                      <p className="text-white">{exifData.focalLength}</p>
                    </div>
                  )}
                  {exifData.aperture && (
                    <div>
                      <p className="text-xs text-white/60">Aperture</p>
                      <p className="text-white">f/{exifData.aperture}</p>
                    </div>
                  )}
                  {exifData.shutterSpeed && (
                    <div>
                      <p className="text-xs text-white/60">Shutter</p>
                      <p className="text-white">{exifData.shutterSpeed}</p>
                    </div>
                  )}
                  {exifData.iso && (
                    <div>
                      <p className="text-xs text-white/60">ISO</p>
                      <p className="text-white">{exifData.iso}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Date */}
            {exifData.takenAt && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white/60">
                  <Calendar size={16} />
                  <span className="text-sm font-medium">Taken</span>
                </div>
                <p className="text-white">{formatDate(exifData.takenAt)}</p>
              </div>
            )}

            {/* Dimensions */}
            {(exifData.width || exifData.height || exifData.fileSize) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white/60">
                  <ImageIcon size={16} />
                  <span className="text-sm font-medium">File Info</span>
                </div>
                {(exifData.width && exifData.height) && (
                  <p className="text-white">
                    {exifData.width} × {exifData.height}
                  </p>
                )}
                {exifData.fileSize && (
                  <p className="text-white/60 text-sm">
                    {formatFileSize(exifData.fileSize)}
                  </p>
                )}
              </div>
            )}

            {/* Location */}
            {(exifData.location || (exifData.latitude && exifData.longitude)) && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-white/60">
                  <MapPin size={16} />
                  <span className="text-sm font-medium">Location</span>
                </div>
                {exifData.location && (
                  <p className="text-white">{exifData.location}</p>
                )}
                {exifData.latitude && exifData.longitude && (
                  <p className="text-white/60 text-sm font-mono">
                    {exifData.latitude.toFixed(6)}, {exifData.longitude.toFixed(6)}
                  </p>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### Complete Component: FavoriteButton

```typescript
// src/components/ui/FavoriteButton.tsx

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface FavoriteButtonProps {
  imageId: string;
  isFavorite: boolean;
  onToggle: (isFavorite: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function FavoriteButton({
  imageId,
  isFavorite,
  onToggle,
  size = 'md',
  showLabel = false,
}: FavoriteButtonProps) {
  const sizeClasses = {
    sm: 'p-1.5',
    md: 'p-2',
    lg: 'p-3',
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 24,
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(!isFavorite);
  };

  return (
    <motion.button
      onClick={handleClick}
      whileTap={{ scale: 0.9 }}
      className={`
        ${sizeClasses[size]}
        rounded-full
        bg-white/10 backdrop-blur-md
        hover:bg-white/20
        transition-colors
        flex items-center gap-2
      `}
      aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <motion.div
        animate={{
          scale: isFavorite ? [1, 1.3, 1] : 1,
        }}
        transition={{ duration: 0.3 }}
      >
        <Heart
          size={iconSizes[size]}
          className={`
            transition-colors
            ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}
          `}
        />
      </motion.div>
      {showLabel && (
        <span className="text-sm text-white pr-2">
          {isFavorite ? 'Favorited' : 'Favorite'}
        </span>
      )}
    </motion.button>
  );
}
```

---

## 🧪 TESTING APPROACH

### Unit Tests (Jest + React Testing Library)

```typescript
// src/components/ui/__tests__/FavoriteButton.test.tsx

import { render, screen, fireEvent } from '@testing-library/react';
import { FavoriteButton } from '../FavoriteButton';

describe('FavoriteButton', () => {
  it('renders correctly', () => {
    const onToggle = jest.fn();
    render(
      <FavoriteButton
        imageId="123"
        isFavorite={false}
        onToggle={onToggle}
      />
    );

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('shows correct aria-label when not favorited', () => {
    const onToggle = jest.fn();
    render(
      <FavoriteButton
        imageId="123"
        isFavorite={false}
        onToggle={onToggle}
      />
    );

    expect(screen.getByLabelText('Add to favorites')).toBeInTheDocument();
  });

  it('calls onToggle when clicked', () => {
    const onToggle = jest.fn();
    render(
      <FavoriteButton
        imageId="123"
        isFavorite={false}
        onToggle={onToggle}
      />
    );

    fireEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it('shows label when showLabel is true', () => {
    const onToggle = jest.fn();
    render(
      <FavoriteButton
        imageId="123"
        isFavorite={false}
        onToggle={onToggle}
        showLabel
      />
    );

    expect(screen.getByText('Favorite')).toBeInTheDocument();
  });
});
```

### Integration Tests

```typescript
// src/components/gallery/__tests__/BentoGrid.test.tsx

import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BentoGrid } from '../BentoGrid';

const queryClient = new QueryClient();

const mockImages = [
  {
    id: '1',
    url: '/test1.jpg',
    thumbnailUrl: '/thumb1.jpg',
    alt: 'Test Image 1',
    width: 800,
    height: 600,
    isFavorite: false,
    featured: false,
  },
  // ... more images
];

describe('BentoGrid', () => {
  it('renders all images', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <BentoGrid images={mockImages} onImageClick={jest.fn()} />
      </QueryClientProvider>
    );

    expect(screen.getAllByRole('img')).toHaveLength(mockImages.length);
  });

  it('calls onImageClick when image is clicked', () => {
    const onImageClick = jest.fn();
    render(
      <QueryClientProvider client={queryClient}>
        <BentoGrid images={mockImages} onImageClick={onImageClick} />
      </QueryClientProvider>
    );

    fireEvent.click(screen.getAllByRole('img')[0]);
    expect(onImageClick).toHaveBeenCalledWith('1');
  });
});
```

### E2E Tests (Playwright)

```typescript
// e2e/gallery.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Image Gallery', () => {
  test('should open lightbox when image is clicked', async ({ page }) => {
    await page.goto('/');

    // Click first image
    await page.click('[data-testid="image-card"]:first-child');

    // Lightbox should be visible
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    // Image should be displayed
    await expect(page.locator('[role="dialog"] img')).toBeVisible();
  });

  test('should navigate between images with keyboard', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="image-card"]:first-child');

    // Press right arrow
    await page.keyboard.press('ArrowRight');

    // Counter should update
    await expect(page.locator('text=/2 \\/ \\d+/')).toBeVisible();
  });

  test('should close lightbox with Escape key', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="image-card"]:first-child');

    await page.keyboard.press('Escape');

    // Lightbox should be hidden
    await expect(page.locator('[role="dialog"]')).not.toBeVisible();
  });

  test('should toggle favorite', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="image-card"]:first-child');

    // Click favorite button
    await page.click('[aria-label="Add to favorites"]');

    // Button should update
    await expect(page.locator('[aria-label="Remove from favorites"]')).toBeVisible();
  });
});
```

---

## 📖 STORYBOOK CONFIGURATION

### Setup

```typescript
// .storybook/main.ts

import type { StorybookConfig } from '@storybook/nextjs';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/nextjs',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
};

export default config;
```

### Story Example

```typescript
// src/components/ui/FavoriteButton.stories.tsx

import type { Meta, StoryObj } from '@storybook/react';
import { FavoriteButton } from './FavoriteButton';

const meta: Meta<typeof FavoriteButton> = {
  title: 'UI/FavoriteButton',
  component: FavoriteButton,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    isFavorite: {
      control: 'boolean',
    },
    showLabel: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof FavoriteButton>;

export const Default: Story = {
  args: {
    imageId: '123',
    isFavorite: false,
    onToggle: (isFavorite) => console.log('Toggled:', isFavorite),
  },
};

export const Favorited: Story = {
  args: {
    imageId: '123',
    isFavorite: true,
    onToggle: (isFavorite) => console.log('Toggled:', isFavorite),
  },
};

export const WithLabel: Story = {
  args: {
    imageId: '123',
    isFavorite: false,
    showLabel: true,
    onToggle: (isFavorite) => console.log('Toggled:', isFavorite),
  },
};

export const Small: Story = {
  args: {
    imageId: '123',
    isFavorite: false,
    size: 'sm',
    onToggle: (isFavorite) => console.log('Toggled:', isFavorite),
  },
};

export const Large: Story = {
  args: {
    imageId: '123',
    isFavorite: false,
    size: 'lg',
    onToggle: (isFavorite) => console.log('Toggled:', isFavorite),
  },
};
```

---

## 📁 ESTRUCTURA DE ARCHIVOS COMPLETA

```
src/
├── app/
│   ├── layout.tsx                 # Main layout with Sidebar
│   ├── page.tsx                   # Home page (Bento Grid)
│   ├── timeline/
│   │   └── page.tsx              # Timeline view
│   ├── explore/
│   │   └── page.tsx              # Explore view
│   ├── favorites/
│   │   └── page.tsx              # Favorites view
│   ├── albums/
│   │   ├── page.tsx              # Albums list
│   │   └── [id]/
│   │       └── page.tsx          # Album detail
│   └── api/
│       ├── timeline/
│       │   └── route.ts          # Timeline API
│       ├── favorites/
│       │   └── route.ts          # Favorites API
│       ├── search/
│       │   └── route.ts          # Search API
│       ├── smart-albums/
│       │   └── route.ts          # Smart Albums API
│       └── images/
│           └── [id]/
│               └── favorite/
│                   └── route.ts  # Toggle favorite
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── SidebarItem.tsx
│   │   ├── TopBar.tsx
│   │   └── MobileMenu.tsx
│   │
│   ├── gallery/
│   │   ├── BentoGrid.tsx
│   │   ├── BentoGridItem.tsx
│   │   ├── TimelineGrid.tsx
│   │   ├── ImageGallery.tsx       # Lightbox
│   │   ├── ExifPanel.tsx
│   │   └── ImageCard.tsx
│   │
│   ├── explore/
│   │   ├── SearchBar.tsx
│   │   ├── FilterPanel.tsx
│   │   └── FilterChip.tsx
│   │
│   ├── albums/
│   │   ├── AlbumCard.tsx
│   │   ├── SmartAlbumCard.tsx
│   │   └── SmartAlbumCreator.tsx
│   │
│   ├── themes/
│   │   ├── ThemePanel.tsx
│   │   └── ThemePreviewCard.tsx
│   │
│   └── ui/
│       ├── Button.tsx
│       ├── IconButton.tsx
│       ├── FavoriteButton.tsx
│       ├── TextInput.tsx
│       ├── SearchInput.tsx
│       ├── Badge.tsx
│       ├── TagBadge.tsx
│       ├── OptimizedImage.tsx
│       ├── Thumbnail.tsx
│       ├── Avatar.tsx
│       ├── LoadingSpinner.tsx
│       ├── SkeletonLoader.tsx
│       ├── Modal.tsx
│       ├── Card.tsx
│       └── VirtualList.tsx
│
├── hooks/
│   ├── useSidebar.ts
│   ├── useInfiniteTimeline.ts
│   ├── useBentoLayout.ts
│   ├── useFavorites.ts
│   ├── useSmartAlbums.ts
│   ├── useTheme.ts
│   ├── useKeyboardNavigation.ts
│   └── useMediaQuery.ts
│
├── contexts/
│   ├── ThemeContext.tsx
│   └── UserContext.tsx
│
├── store/
│   └── useAppStore.ts             # Zustand store
│
├── lib/
│   ├── api.ts                     # API client
│   └── utils.ts                   # Utilities
│
└── types/
    ├── image.ts
    ├── album.ts
    ├── exif.ts
    └── theme.ts
```

---

## 🎯 PRÓXIMOS PASOS

1. Copiar interfaces TypeScript a archivos correspondientes
2. Implementar custom hooks uno por uno
3. Crear componentes atoms primero
4. Componer molecules con atoms
5. Construir organisms con molecules
6. Integrar con APIs
7. Agregar tests
8. Configurar Storybook
9. Optimizar performance
10. Auditoría de accesibilidad

---

**Documento creado**: 2026-01-18
**Autor**: Claude Sonnet 4.5
**Versión**: 1.0.0
