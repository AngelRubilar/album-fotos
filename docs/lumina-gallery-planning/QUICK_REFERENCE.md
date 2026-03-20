# ⚡ QUICK REFERENCE - LUMINA GALLERY

> Snippets listos para copiar y pegar

---

## 📦 INSTALACIÓN RÁPIDA

```bash
# Navegar al proyecto
cd album-fotos

# Instalar todas las dependencias
npm install \
  @tanstack/react-query \
  @tanstack/react-query-devtools \
  @tanstack/react-virtual \
  framer-motion \
  zustand \
  react-masonry-css \
  exifr \
  lucide-react \
  focus-trap-react \
  sonner

# Dev dependencies
npm install -D \
  @storybook/nextjs \
  @storybook/addon-a11y \
  @testing-library/react \
  @testing-library/jest-dom \
  @playwright/test
```

---

## 🎨 TAILWIND GLASSMORPHISM UTILITIES

```css
/* Add to globals.css */

.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.glass-dark {
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.glass-strong {
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Gradient backgrounds */
.gradient-purple-pink {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.gradient-blue-purple {
  background: linear-gradient(135deg, #667eea 0%, #f093fb 100%);
}

.gradient-orange-pink {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}
```

---

## 🧩 COMPONENT SNIPPETS

### Button with Loading State

```tsx
<Button
  onClick={handleSubmit}
  isLoading={isPending}
  icon={<Upload size={20} />}
>
  Upload Photos
</Button>
```

### Image with Optimistic Favorite

```tsx
import { useFavoriteOptimistic } from '@/hooks/useFavorites';

function ImageCard({ image }) {
  const { isFavorite, toggleFavorite } = useFavoriteOptimistic(
    image.id,
    image.isFavorite
  );

  return (
    <div className="relative group">
      <img src={image.url} alt={image.alt} />
      <FavoriteButton
        imageId={image.id}
        isFavorite={isFavorite}
        onToggle={toggleFavorite}
      />
    </div>
  );
}
```

### Server Component with Data Fetching

```tsx
import { prisma } from '@/lib/prisma';

export default async function AlbumsPage() {
  const albums = await prisma.album.findMany({
    include: {
      _count: {
        select: { images: true },
      },
    },
    orderBy: { year: 'desc' },
  });

  return (
    <div>
      <h1>Albums</h1>
      <AlbumGrid albums={albums} />
    </div>
  );
}
```

### Client Component with Query

```tsx
'use client';

import { useQuery } from '@tanstack/react-query';

export function FavoritesGrid() {
  const { data: images, isLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const res = await fetch('/api/favorites');
      return res.json();
    },
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="grid grid-cols-4 gap-4">
      {images.map((img) => (
        <ImageCard key={img.id} image={img} />
      ))}
    </div>
  );
}
```

### Infinite Scroll Hook Usage

```tsx
import { useInfiniteTimeline } from '@/hooks/useInfiniteTimeline';

export function TimelinePage() {
  const {
    images,
    isLoading,
    isFetchingNextPage,
    sentinelRef,
  } = useInfiniteTimeline();

  return (
    <div>
      <TimelineGrid images={images} />
      <div ref={sentinelRef} className="h-10" />
      {isFetchingNextPage && <LoadingSpinner />}
    </div>
  );
}
```

### Form with Server Action

```tsx
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
      <input type="file" name="images" multiple accept="image/*" />
      <Button type="submit" isLoading={isPending}>
        Upload
      </Button>
      {state.errors && <p className="text-red-500">{state.errors}</p>}
    </form>
  );
}
```

---

## 🎭 FRAMER MOTION SNIPPETS

### Fade In Up

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content here
</motion.div>
```

### Stagger Children

```tsx
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

<motion.div variants={container} initial="hidden" animate="visible">
  {items.map((item) => (
    <motion.div key={item.id} variants={item}>
      {item.name}
    </motion.div>
  ))}
</motion.div>
```

### Modal with Backdrop

```tsx
<AnimatePresence>
  {isOpen && (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 z-40"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div className="bg-white p-8 rounded-xl">
          Modal content
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
```

### Layout Animation

```tsx
<motion.div layout className="card">
  <motion.h2 layout="position">Title</motion.h2>
  <motion.p layout="position">Description</motion.p>
</motion.div>
```

### Hover Scale

```tsx
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="px-4 py-2 bg-blue-500 text-white rounded"
>
  Click me
</motion.button>
```

---

## 🔍 REACT QUERY SNIPPETS

### Basic Query

```tsx
const { data, isLoading, isError, error } = useQuery({
  queryKey: ['images'],
  queryFn: async () => {
    const res = await fetch('/api/images');
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
  },
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### Mutation with Optimistic Update

```tsx
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: (data) => fetch('/api/images', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  onMutate: async (newImage) => {
    await queryClient.cancelQueries({ queryKey: ['images'] });
    const previousImages = queryClient.getQueryData(['images']);

    queryClient.setQueryData(['images'], (old) => [...old, newImage]);

    return { previousImages };
  },
  onError: (err, newImage, context) => {
    queryClient.setQueryData(['images'], context.previousImages);
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['images'] });
  },
});
```

### Infinite Query

```tsx
const {
  data,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
} = useInfiniteQuery({
  queryKey: ['timeline'],
  queryFn: ({ pageParam }) => fetchPage(pageParam),
  getNextPageParam: (lastPage) =>
    lastPage.hasMore ? lastPage.nextCursor : undefined,
  initialPageParam: undefined,
});

const allImages = data?.pages.flatMap((page) => page.images) ?? [];
```

### Prefetch Query

```tsx
const queryClient = useQueryClient();

// Prefetch on hover
const handleMouseEnter = () => {
  queryClient.prefetchQuery({
    queryKey: ['album', albumId],
    queryFn: () => fetchAlbum(albumId),
  });
};

<div onMouseEnter={handleMouseEnter}>
  Album card
</div>
```

---

## 🗄️ ZUSTAND STORE SNIPPETS

### Create Store

```tsx
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';

interface State {
  count: number;
  increment: () => void;
  decrement: () => void;
}

export const useStore = create<State>()(
  devtools(
    persist(
      (set) => ({
        count: 0,
        increment: () => set((state) => ({ count: state.count + 1 })),
        decrement: () => set((state) => ({ count: state.count - 1 })),
      }),
      {
        name: 'my-store',
      }
    )
  )
);
```

### Use Store

```tsx
// Get all state
const { count, increment, decrement } = useStore();

// Get specific state (prevents unnecessary re-renders)
const count = useStore((state) => state.count);
const increment = useStore((state) => state.increment);
```

### Store Selector

```tsx
// Only re-render when count changes
const count = useStore((state) => state.count);

// Custom equality function
const user = useStore(
  (state) => state.user,
  (a, b) => a.id === b.id
);
```

---

## 🎯 PRISMA QUERIES

### Find Many with Relations

```tsx
const images = await prisma.image.findMany({
  where: {
    albumId: albumId,
    isFavorite: true,
  },
  include: {
    album: true,
    tags: true,
  },
  orderBy: {
    takenAt: 'desc',
  },
  take: 50,
});
```

### Pagination with Cursor

```tsx
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
});

const hasMore = images.length > limit;
const items = hasMore ? images.slice(0, -1) : images;
const nextCursor = hasMore ? items[items.length - 1].id : undefined;
```

### Aggregation

```tsx
const stats = await prisma.image.groupBy({
  by: ['cameraMake'],
  _count: {
    id: true,
  },
  orderBy: {
    _count: {
      id: 'desc',
    },
  },
});
```

### Transaction

```tsx
const result = await prisma.$transaction(async (tx) => {
  const album = await tx.album.create({
    data: { year: 2024, title: 'Summer' },
  });

  const images = await tx.image.createMany({
    data: imageData.map((img) => ({
      ...img,
      albumId: album.id,
    })),
  });

  return { album, images };
});
```

---

## 🎨 TAILWIND COMMON PATTERNS

### Glassmorphism Card

```tsx
<div className="rounded-xl bg-white/10 backdrop-blur-xl border border-white/20 p-6">
  Content
</div>
```

### Centered Container

```tsx
<div className="flex items-center justify-center min-h-screen">
  <div className="max-w-2xl w-full">
    Content
  </div>
</div>
```

### Grid Responsive

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => <Card key={item.id} />)}
</div>
```

### Hover Effects

```tsx
<div className="group relative overflow-hidden rounded-lg">
  <img src={url} className="transition-transform duration-300 group-hover:scale-110" />
  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
    Overlay content
  </div>
</div>
```

### Gradient Text

```tsx
<h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
  Gradient Title
</h1>
```

---

## 🧪 TESTING SNIPPETS

### Component Test

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state', () => {
    render(<Button isLoading>Click me</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
```

### Hook Test

```tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFavorites } from './useFavorites';

const createWrapper = () => {
  const queryClient = new QueryClient();
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

test('toggles favorite', async () => {
  const { result } = renderHook(() => useFavorites(), {
    wrapper: createWrapper(),
  });

  result.current.toggleFavorite('img-1', true);

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });
});
```

### E2E Test (Playwright)

```tsx
import { test, expect } from '@playwright/test';

test('should favorite an image', async ({ page }) => {
  await page.goto('/');

  // Click first image
  await page.click('[data-testid="image-card"]:first-child');

  // Lightbox should open
  await expect(page.locator('[role="dialog"]')).toBeVisible();

  // Click favorite button
  await page.click('[aria-label="Add to favorites"]');

  // Toast should appear
  await expect(page.locator('text=Added to favorites')).toBeVisible();

  // Close lightbox
  await page.keyboard.press('Escape');

  // Navigate to favorites
  await page.click('text=Favorites');

  // Image should be in favorites
  await expect(page.locator('[data-testid="image-card"]')).toHaveCount(1);
});
```

---

## 🔧 UTILITY FUNCTIONS

### Format File Size

```tsx
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}
```

### Format Date

```tsx
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}
```

### Debounce

```tsx
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
```

### Group By Date

```tsx
export function groupByDate(images: Image[]): Record<string, Image[]> {
  return images.reduce((groups, image) => {
    const date = new Date(image.takenAt);
    const key = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    if (!groups[key]) groups[key] = [];
    groups[key].push(image);

    return groups;
  }, {} as Record<string, Image[]>);
}
```

### Class Names Helper

```tsx
export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

// Usage
<div className={cn(
  'base-class',
  isActive && 'active-class',
  isPending && 'pending-class'
)}>
```

---

## 📱 RESPONSIVE UTILITIES

### useMediaQuery Hook

```tsx
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    setMatches(media.matches);

    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);

    return () => media.removeEventListener('change', listener);
  }, [query]);

  return matches;
}

// Presets
export const useIsMobile = () => useMediaQuery('(max-width: 768px)');
export const useIsTablet = () => useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1025px)');
```

---

## 🎯 KEYBOARD SHORTCUTS

```tsx
export function useKeyboardShortcuts(shortcuts: Record<string, () => void>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const callback = shortcuts[key];

      if (callback) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

// Usage
useKeyboardShortcuts({
  'arrowleft': () => navigatePrevious(),
  'arrowright': () => navigateNext(),
  'escape': () => closeModal(),
  'f': () => toggleFavorite(),
});
```

---

## 🚀 PERFORMANCE TIPS

### Image Loading Priority

```tsx
// Above the fold - priority
<OptimizedImage src={url} alt={alt} priority />

// Below the fold - lazy
<OptimizedImage src={url} alt={alt} loading="lazy" />
```

### Memoize Expensive Calculations

```tsx
const sortedData = useMemo(() => {
  return data.sort((a, b) => b.date - a.date);
}, [data]);
```

### Debounce Search Input

```tsx
const [query, setQuery] = useState('');
const debouncedQuery = useDebouncedValue(query, 300);

useEffect(() => {
  if (debouncedQuery) {
    performSearch(debouncedQuery);
  }
}, [debouncedQuery]);
```

### Virtual Scrolling for Long Lists

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

const parentRef = useRef<HTMLDivElement>(null);

const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 200,
});
```

---

## 📚 STORYBOOK STORY TEMPLATE

```tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

const meta: Meta<typeof Button> = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
  },
};

export const WithIcon: Story = {
  args: {
    children: 'Upload',
    icon: <Upload size={20} />,
    variant: 'primary',
  },
};

export const Loading: Story = {
  args: {
    children: 'Loading',
    isLoading: true,
  },
};
```

---

**Quick Reference Updated**: 2026-01-18
**Keep this handy for rapid development**
