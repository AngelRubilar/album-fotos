# Fase 4: Mejoras de UX

## Resumen
Skeleton loaders con shimmer, busqueda y filtros, mejores empty states, tooltips, y mejoras generales de experiencia de usuario.

## Dependencia
- **Requiere**: Fase 1 completada (glassmorphism para los estilos)

---

## Paso 4.1: Skeleton Loaders con Shimmer Glass

### 4.1.1 Crear componente Skeleton

**Archivo nuevo**: `src/components/Skeleton.tsx`

```typescript
'use client';

interface SkeletonProps {
  className?: string;
  variant?: 'card' | 'image' | 'text' | 'circle';
}

export function Skeleton({ className = '', variant = 'text' }: SkeletonProps) {
  const baseClass = 'animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:400%_100%] rounded-xl';

  const variants = {
    card: `${baseClass} w-full h-64`,
    image: `${baseClass} w-full aspect-square`,
    text: `${baseClass} h-4 w-3/4`,
    circle: `${baseClass} w-10 h-10 rounded-full`,
  };

  return <div className={`${variants[variant]} ${className}`} />;
}

// Skeleton para una card de album completa
export function AlbumCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-white/5 backdrop-blur-xl border border-white/[0.08]">
      <Skeleton variant="card" className="aspect-[4/3]" />
      <div className="px-5 py-4 space-y-2">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}

// Skeleton para el grid de fotos
export function PhotoGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} variant="image" />
      ))}
    </div>
  );
}
```

### 4.1.2 Agregar animacion shimmer al CSS

**Archivo**: `src/app/globals.css`

```css
/* ===== SHIMMER SKELETON ===== */
@keyframes shimmer {
  0% { background-position: -400% 0; }
  100% { background-position: 400% 0; }
}

.animate-shimmer {
  animation: shimmer 2s ease-in-out infinite;
}
```

### 4.1.3 Usar Skeletons en las paginas

**Archivo**: `src/app/page.tsx` - Reemplazar el spinner de loading:

```tsx
// ANTES:
if (loading) {
  return (
    <div className={`min-h-screen flex items-center justify-center ${t.bg}`}>
      <div className={`animate-spin rounded-full ...`} />
    </div>
  );
}

// DESPUES:
if (loading) {
  return (
    <div className={`min-h-screen ${t.gradientBg}`}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="mb-10">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <AlbumCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## Paso 4.2: Busqueda de Albums

### 4.2.1 Crear componente SearchBar

**Archivo nuevo**: `src/components/SearchBar.tsx`

```typescript
'use client';

import { useState, useCallback } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = 'Buscar...' }: SearchBarProps) {
  const { t } = useTheme();
  const [query, setQuery] = useState('');

  const handleChange = useCallback((value: string) => {
    setQuery(value);
    onSearch(value);
  }, [onSearch]);

  return (
    <div className={`relative`}>
      <svg
        className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${t.textMuted}`}
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input
        type="text"
        value={query}
        onChange={e => handleChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-10 pr-4 py-2.5 rounded-xl ${t.inputBg} ${t.inputBorder} ${t.text} border backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:outline-none text-sm transition-all`}
      />
      {query && (
        <button
          onClick={() => handleChange('')}
          className={`absolute right-3 top-1/2 -translate-y-1/2 ${t.textMuted} hover:${t.text}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
```

### 4.2.2 Integrar en Home page

**Archivo**: `src/app/page.tsx`

```tsx
import SearchBar from '@/components/SearchBar';

// Agregar estado de filtro:
const [searchQuery, setSearchQuery] = useState('');

// Filtrar years:
const filteredYears = years.filter(y =>
  String(y.year).includes(searchQuery)
);

// Agregar SearchBar despues del header:
<SearchBar
  onSearch={setSearchQuery}
  placeholder="Buscar por año..."
/>
```

### 4.2.3 Integrar en Album page

**Archivo**: `src/app/album/[year]/page.tsx`

Filtrar sub-albums por nombre:
```tsx
const [searchQuery, setSearchQuery] = useState('');

const filteredAlbums = subAlbums.filter(a =>
  a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
  (a.description || '').toLowerCase().includes(searchQuery.toLowerCase())
);
```

---

## Paso 4.3: Filtros de imagenes

### 4.3.1 Agregar filtro por tipo de archivo

Dentro de la action bar del album page, agregar filtro:

```tsx
<select
  value={filterType}
  onChange={e => setFilterType(e.target.value)}
  className={`px-3 py-1.5 rounded-xl text-sm ${t.inputBg} ${t.inputBorder} ${t.text} border backdrop-blur-sm`}
>
  <option value="all">Todas</option>
  <option value="jpg">JPG</option>
  <option value="png">PNG</option>
  <option value="webp">WebP</option>
</select>
```

### 4.3.2 Filtro por ordenamiento

```tsx
<select
  value={sortBy}
  onChange={e => setSortBy(e.target.value)}
  className={...}
>
  <option value="newest">Mas recientes</option>
  <option value="oldest">Mas antiguas</option>
  <option value="name">Por nombre</option>
  <option value="size">Por tamaño</option>
</select>
```

---

## Paso 4.4: Mejores Empty States

### Rediseñar los estados vacios con ilustraciones glass

```tsx
// Empty state con efecto glass:
<div className="text-center py-20">
  <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl ${t.glassCard} mb-6`}>
    <svg className={`w-10 h-10 ${t.textMuted}`} ...>
      {/* icon */}
    </svg>
  </div>
  <h3 className={`text-xl font-semibold ${t.text} mb-2`}>Sin fotos todavia</h3>
  <p className={`${t.textMuted} mb-6 max-w-sm mx-auto`}>
    Sube tus primeras fotos para comenzar a crear tu galeria de recuerdos.
  </p>
  <Link href="/upload">
    <button className="btn-glass-accent px-6 py-3 rounded-xl text-white font-medium">
      Subir Fotos
    </button>
  </Link>
</div>
```

---

## Paso 4.5: Notificaciones Toast

### 4.5.1 Crear componente Toast

**Archivo nuevo**: `src/components/Toast.tsx`

```typescript
'use client';

import { useState, useEffect, createContext, useContext } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastContextType {
  addToast: (message: string, type?: Toast['type']) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
  };

  useEffect(() => {
    if (toasts.length === 0) return;
    const timer = setTimeout(() => {
      setToasts(prev => prev.slice(1));
    }, 3000);
    return () => clearTimeout(timer);
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-6 right-6 z-[100] space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`px-4 py-3 rounded-xl backdrop-blur-xl border text-sm font-medium animate-slide-up ${
              toast.type === 'success'
                ? 'bg-green-500/20 border-green-500/30 text-green-400'
                : toast.type === 'error'
                ? 'bg-red-500/20 border-red-500/30 text-red-400'
                : 'bg-white/10 border-white/20 text-white'
            }`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within ToastProvider');
  return context;
}
```

### 4.5.2 Reemplazar alerts por toasts

Buscar todos los `alert(...)` en:
- `src/app/upload/page.tsx`
- `src/app/admin/page.tsx`
- `src/app/album/[year]/page.tsx`

Y reemplazar por:
```tsx
const { addToast } = useToast();

// ANTES:
alert('Se subieron 5 imagenes');

// DESPUES:
addToast('Se subieron 5 imagenes', 'success');
```

---

## Paso 4.6: Preview en hover de album cards

### Concepto
Al hacer hover sobre una card de album, las 4 imagenes de preview hacen un mini-slideshow automatico.

**Archivo**: `src/components/AlbumPreview.tsx`

```tsx
// Agregar estado de hover y auto-cycle:
const [hovered, setHovered] = useState(false);
const [activeIndex, setActiveIndex] = useState(0);

useEffect(() => {
  if (!hovered || previewImages.length <= 1) return;
  const interval = setInterval(() => {
    setActiveIndex(prev => (prev + 1) % previewImages.length);
  }, 1500);
  return () => clearInterval(interval);
}, [hovered, previewImages.length]);

// Cambiar el render para mostrar imagen activa:
// En lugar del grid de 4 imagenes, mostrar una sola con crossfade:
return (
  <div
    className={`relative overflow-hidden ${className}`}
    onMouseEnter={() => setHovered(true)}
    onMouseLeave={() => { setHovered(false); setActiveIndex(0); }}
  >
    {previewImages.map((src, i) => (
      <Image
        key={src}
        src={src}
        alt=""
        fill
        className={`object-cover transition-opacity duration-700 ${
          i === activeIndex ? 'opacity-100' : 'opacity-0'
        }`}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    ))}
    {/* Indicadores */}
    {hovered && previewImages.length > 1 && (
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        {previewImages.map((_, i) => (
          <div
            key={i}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              i === activeIndex ? 'bg-white w-4' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    )}
  </div>
);
```

---

## Paso 4.7: Contador de fotos seleccionadas en upload

**Archivo**: `src/app/upload/page.tsx`

Agregar barra de progreso visual del tamaño total:

```tsx
// Calcular tamaño total:
const totalSize = selectedFiles.reduce((acc, f) => acc + f.size, 0);
const maxSize = 100 * 1024 * 1024; // 100MB limite sugerido

// Mostrar barra de tamaño:
<div className="flex items-center gap-3 mb-4">
  <span className={`text-sm font-medium ${t.text}`}>
    {selectedFiles.length} archivo(s) - {(totalSize / 1024 / 1024).toFixed(1)} MB
  </span>
  <div className={`flex-1 h-1.5 rounded-full ${t.inputBg}`}>
    <div
      className={`h-full rounded-full transition-all ${
        totalSize > maxSize ? 'bg-red-500' : 'bg-blue-500'
      }`}
      style={{ width: `${Math.min((totalSize / maxSize) * 100, 100)}%` }}
    />
  </div>
</div>
```

---

## Checklist de Implementacion

- [ ] 4.1.1 Crear componente Skeleton
- [ ] 4.1.2 Agregar CSS shimmer
- [ ] 4.1.3 Usar Skeletons en paginas
- [ ] 4.2.1 Crear SearchBar
- [ ] 4.2.2 Integrar busqueda en Home
- [ ] 4.2.3 Integrar busqueda en Album page
- [ ] 4.3 Filtros de tipo y ordenamiento
- [ ] 4.4 Rediseñar empty states
- [ ] 4.5.1 Crear Toast component
- [ ] 4.5.2 Reemplazar alerts por toasts
- [ ] 4.6 Preview slideshow en hover
- [ ] 4.7 Contador de tamaño en upload
- [ ] Probar todos los estados vacios
- [ ] Probar busqueda con texto especial

## Dependencias
**Ninguna nueva** - Todo es React + CSS puro.
