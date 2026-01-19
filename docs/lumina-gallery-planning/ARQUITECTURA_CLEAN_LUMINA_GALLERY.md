# Clean Architecture para Lumina Gallery

> Arquitectura completa con principios SOLID, Clean Architecture y mejores prácticas para Next.js 15

**Fecha**: 2026-01-18
**Stack**: Next.js 15 + React 19 + TypeScript + Tailwind CSS 4 + Prisma + PostgreSQL
**Objetivo**: Transformar el álbum de fotos a diseño Lumina Gallery con arquitectura escalable

---

## Tabla de Contenidos

1. [Visión General de la Arquitectura](#1-visión-general-de-la-arquitectura)
2. [Principios SOLID Aplicados](#2-principios-solid-aplicados)
3. [Patrones de Diseño](#3-patrones-de-diseño)
4. [Estructura de Carpetas Completa](#4-estructura-de-carpetas-completa)
5. [Capas de la Arquitectura](#5-capas-de-la-arquitectura)
6. [APIs y Servicios](#6-apis-y-servicios)
7. [Gestión de Estado](#7-gestión-de-estado)
8. [Componentes Reutilizables](#8-componentes-reutilizables)
9. [Testing Strategy](#9-testing-strategy)
10. [Error Handling](#10-error-handling)
11. [Performance](#11-performance)
12. [Checklist de Mejores Prácticas](#12-checklist-de-mejores-prácticas)

---

## 1. Visión General de la Arquitectura

### 1.1. Diagrama de Arquitectura de Capas

```
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Pages      │  │  Components  │  │    Hooks     │         │
│  │  (Routes)    │  │   (UI/UX)    │  │  (Logic)     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                  │                  │                 │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Use Cases   │  │   Services   │  │     DTOs     │         │
│  │ (Business)   │  │  (Actions)   │  │ (Validation) │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                  │                  │                 │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DOMAIN LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Entities   │  │  Interfaces  │  │   Models     │         │
│  │  (Types)     │  │ (Contracts)  │  │  (Domain)    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│         │                  │                  │                 │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Repositories │  │   Database   │  │  External    │         │
│  │ (Data Access)│  │   (Prisma)   │  │   APIs       │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2. Flujo de Datos

```
User Action (UI)
    ↓
Component (Presentation)
    ↓
Custom Hook (State Management)
    ↓
Service/Use Case (Application)
    ↓
Repository (Domain Interface)
    ↓
Prisma Client (Infrastructure)
    ↓
PostgreSQL Database
    ↓
Response → DTO → Component → UI Update
```

### 1.3. Dependencias entre Capas

- **Presentation** depende de **Application**
- **Application** depende de **Domain**
- **Infrastructure** implementa interfaces de **Domain**
- **Domain** NO depende de nadie (core de la aplicación)

---

## 2. Principios SOLID Aplicados

### 2.1. Single Responsibility Principle (SRP)

**Cada módulo tiene UNA sola razón para cambiar.**

#### Problema Actual

```typescript
// ❌ BAD: src/app/page.tsx (hace DEMASIADO)
export default function Home() {
  const [years, setYears] = useState<Year[]>([]);
  const [loading, setLoading] = useState(true);

  // Lógica de negocio mezclada con presentación
  useEffect(() => {
    const fetchYears = async () => {
      const response = await fetch('/api/years');
      const data = await response.json();
      setYears(data.data);
    };
    fetchYears();
  }, []);

  // Renderizado mezclado con lógica de gradientes
  const gradients = useMemo(() => { /* ... */ }, [currentTheme]);

  return <div>{/* Muchas líneas de JSX */}</div>;
}
```

#### Solución con SRP

```typescript
// ✅ GOOD: Separación de responsabilidades

// 1. Custom Hook (Business Logic)
// src/hooks/useYears.ts
export function useYears() {
  const [years, setYears] = useState<Year[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    YearService.getAll()
      .then(setYears)
      .catch(setError)
      .finally(() => setLoading(false));
  }, []);

  return { years, loading, error };
}

// 2. Service (Application Layer)
// src/services/year.service.ts
export class YearService {
  static async getAll(): Promise<Year[]> {
    const response = await fetch('/api/years');
    if (!response.ok) throw new Error('Failed to fetch years');
    const data = await response.json();
    return data.data;
  }
}

// 3. Component (Presentation Only)
// src/app/page.tsx
export default function Home() {
  const { years, loading, error } = useYears();
  const gradients = useThemeGradients();

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} />;

  return <YearGrid years={years} gradients={gradients} />;
}
```

**Beneficios**:
- `useYears` → Solo gestiona estado de años
- `YearService` → Solo maneja comunicación con API
- `Home` → Solo renderiza UI
- Cada parte es testeable independientemente

---

### 2.2. Open/Closed Principle (OCP)

**Abierto a extensión, cerrado a modificación.**

#### Problema: Sistema de Temas Hard-coded

```typescript
// ❌ BAD: Cada vez que agregamos un tema, modificamos el componente
function ThemeSelector() {
  return (
    <select onChange={handleChange}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="ocean">Ocean</option>
      {/* Agregar nuevo tema = modificar código */}
    </select>
  );
}
```

#### Solución con OCP

```typescript
// ✅ GOOD: Configuración extensible

// src/config/themes.config.ts
export interface ThemeConfig {
  id: string;
  name: string;
  displayName: string;
  icon: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
  };
  gradients: string[];
}

export const THEMES: ThemeConfig[] = [
  {
    id: 'light',
    name: 'Light',
    displayName: 'Modo Claro',
    icon: '☀️',
    colors: { /* ... */ },
    gradients: ['from-blue-400...', /* ... */]
  },
  {
    id: 'dark',
    name: 'Dark',
    displayName: 'Modo Oscuro',
    icon: '🌙',
    colors: { /* ... */ },
    gradients: ['from-blue-500...', /* ... */]
  },
  // Agregar nuevo tema = solo agregar objeto, sin modificar componente
];

// src/components/themes/ThemeSelector.tsx
export function ThemeSelector() {
  const { setTheme } = useTheme();

  return (
    <div className="grid grid-cols-2 gap-4">
      {THEMES.map(theme => (
        <ThemePreviewCard
          key={theme.id}
          theme={theme}
          onClick={() => setTheme(theme.id)}
        />
      ))}
    </div>
  );
}
```

**Beneficios**:
- Agregar temas sin tocar componentes
- Facilita testing con temas mock
- Permite cargar temas desde API

---

### 2.3. Liskov Substitution Principle (LSP)

**Los subtipos deben ser sustituibles por sus tipos base.**

#### Aplicación: Repository Pattern

```typescript
// src/domain/repositories/image.repository.interface.ts
export interface IImageRepository {
  findAll(filters?: ImageFilters): Promise<Image[]>;
  findById(id: string): Promise<Image | null>;
  create(data: CreateImageDTO): Promise<Image>;
  update(id: string, data: UpdateImageDTO): Promise<Image>;
  delete(id: string): Promise<void>;
}

// src/infrastructure/repositories/prisma-image.repository.ts
export class PrismaImageRepository implements IImageRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(filters?: ImageFilters): Promise<Image[]> {
    return this.prisma.image.findMany({
      where: this.buildWhereClause(filters),
      orderBy: { uploadedAt: 'desc' }
    });
  }

  // ... otros métodos
}

// src/infrastructure/repositories/mock-image.repository.ts
export class MockImageRepository implements IImageRepository {
  private images: Image[] = [];

  async findAll(filters?: ImageFilters): Promise<Image[]> {
    // Implementación mock para testing
    return this.images.filter(/* ... */);
  }

  // ... otros métodos
}

// Uso: Cualquier implementación funciona
const repository: IImageRepository = process.env.NODE_ENV === 'test'
  ? new MockImageRepository()
  : new PrismaImageRepository(prisma);
```

**Beneficios**:
- Fácil testing con mocks
- Cambiar DB sin afectar lógica de negocio
- Permite múltiples implementaciones

---

### 2.4. Interface Segregation Principle (ISP)

**No forzar a depender de interfaces que no usan.**

#### Problema: Interfaces Gordas

```typescript
// ❌ BAD: Interfaz muy grande
interface IImageService {
  // CRUD básico
  getAll(): Promise<Image[]>;
  getById(id: string): Promise<Image>;
  create(data: CreateImageDTO): Promise<Image>;
  update(id: string, data: UpdateImageDTO): Promise<Image>;
  delete(id: string): Promise<void>;

  // Favoritos
  addToFavorites(id: string): Promise<void>;
  removeFromFavorites(id: string): Promise<void>;
  getFavorites(): Promise<Image[]>;

  // EXIF
  extractExif(file: File): Promise<ExifData>;
  updateExif(id: string, exif: ExifData): Promise<void>;

  // Tags
  addTag(imageId: string, tagId: string): Promise<void>;
  removeTag(imageId: string, tagId: string): Promise<void>;

  // ... más métodos
}
```

#### Solución con ISP

```typescript
// ✅ GOOD: Interfaces pequeñas y específicas

// src/domain/services/image-crud.service.interface.ts
export interface IImageCRUDService {
  getAll(filters?: ImageFilters): Promise<Image[]>;
  getById(id: string): Promise<Image>;
  create(data: CreateImageDTO): Promise<Image>;
  update(id: string, data: UpdateImageDTO): Promise<Image>;
  delete(id: string): Promise<void>;
}

// src/domain/services/image-favorite.service.interface.ts
export interface IImageFavoriteService {
  addToFavorites(imageId: string): Promise<void>;
  removeFromFavorites(imageId: string): Promise<void>;
  getFavorites(userId?: string): Promise<Image[]>;
  isFavorite(imageId: string): Promise<boolean>;
}

// src/domain/services/image-exif.service.interface.ts
export interface IImageExifService {
  extractExif(file: File): Promise<ExifData>;
  updateExif(imageId: string, exif: ExifData): Promise<void>;
  getExif(imageId: string): Promise<ExifData | null>;
}

// src/domain/services/image-tag.service.interface.ts
export interface IImageTagService {
  addTag(imageId: string, tagId: string): Promise<void>;
  removeTag(imageId: string, tagId: string): Promise<void>;
  getTags(imageId: string): Promise<Tag[]>;
  getImagesByTag(tagId: string): Promise<Image[]>;
}

// Uso: Cada componente usa solo lo que necesita
function FavoriteButton({ imageId }: { imageId: string }) {
  // Solo necesita IImageFavoriteService, no toda la interfaz
  const favoriteService = useFavoriteService();

  const handleToggle = () => {
    favoriteService.addToFavorites(imageId);
  };

  return <button onClick={handleToggle}>❤️</button>;
}
```

**Beneficios**:
- Componentes no dependen de métodos que no usan
- Fácil testing (menos mocks)
- Mejor separación de concerns

---

### 2.5. Dependency Inversion Principle (DIP)

**Depender de abstracciones, no de implementaciones concretas.**

#### Problema: Dependencias Hard-coded

```typescript
// ❌ BAD: Componente depende directamente de fetch
export default function Timeline() {
  const [images, setImages] = useState<Image[]>([]);

  useEffect(() => {
    // Acoplamiento directo a fetch API
    fetch('/api/timeline')
      .then(res => res.json())
      .then(data => setImages(data.images));
  }, []);

  return <TimelineGrid images={images} />;
}
```

#### Solución con DIP

```typescript
// ✅ GOOD: Inversión de dependencias

// 1. Definir abstracción (Domain Layer)
// src/domain/repositories/timeline.repository.interface.ts
export interface ITimelineRepository {
  getImages(params: TimelineParams): Promise<TimelineResponse>;
}

// 2. Implementación concreta (Infrastructure Layer)
// src/infrastructure/repositories/api-timeline.repository.ts
export class ApiTimelineRepository implements ITimelineRepository {
  async getImages(params: TimelineParams): Promise<TimelineResponse> {
    const response = await fetch(`/api/timeline?${buildQueryString(params)}`);
    if (!response.ok) throw new Error('Timeline fetch failed');
    return response.json();
  }
}

// 3. Proveedor de dependencias (Application Layer)
// src/providers/repository.provider.tsx
const RepositoryContext = createContext<ITimelineRepository | null>(null);

export function RepositoryProvider({ children }: PropsWithChildren) {
  const repository = new ApiTimelineRepository();

  return (
    <RepositoryContext.Provider value={repository}>
      {children}
    </RepositoryContext.Provider>
  );
}

export function useTimelineRepository(): ITimelineRepository {
  const context = useContext(RepositoryContext);
  if (!context) throw new Error('useTimelineRepository must be used within RepositoryProvider');
  return context;
}

// 4. Componente (Presentation Layer)
export default function Timeline() {
  const repository = useTimelineRepository(); // Inyección de dependencia
  const [images, setImages] = useState<Image[]>([]);

  useEffect(() => {
    repository.getImages({ page: 1, limit: 50 })
      .then(response => setImages(response.images));
  }, [repository]);

  return <TimelineGrid images={images} />;
}

// 5. Testing: Fácil de mockear
const mockRepository: ITimelineRepository = {
  getImages: jest.fn().mockResolvedValue({ images: mockImages, hasMore: false })
};

// En tests
<RepositoryContext.Provider value={mockRepository}>
  <Timeline />
</RepositoryContext.Provider>
```

**Beneficios**:
- Fácil testing con mocks
- Cambiar implementación sin tocar componentes
- Permite múltiples fuentes de datos (API, localStorage, mock)

---

## 3. Patrones de Diseño

### 3.1. Repository Pattern

**Abstrae el acceso a datos, desacoplando la lógica de negocio de la persistencia.**

```typescript
// src/domain/repositories/image.repository.interface.ts
export interface IImageRepository {
  findAll(filters?: ImageFilters): Promise<Image[]>;
  findById(id: string): Promise<Image | null>;
  findByAlbum(albumId: string): Promise<Image[]>;
  create(data: CreateImageDTO): Promise<Image>;
  update(id: string, data: UpdateImageDTO): Promise<Image>;
  delete(id: string): Promise<void>;

  // Métodos específicos del dominio
  findFavorites(userId?: string): Promise<Image[]>;
  findByDateRange(from: Date, to: Date): Promise<Image[]>;
  findByTag(tagId: string): Promise<Image[]>;
}

// src/infrastructure/repositories/prisma-image.repository.ts
export class PrismaImageRepository implements IImageRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(filters?: ImageFilters): Promise<Image[]> {
    return this.prisma.image.findMany({
      where: this.buildWhereClause(filters),
      include: {
        album: true,
        tags: true
      },
      orderBy: { uploadedAt: 'desc' }
    });
  }

  async findById(id: string): Promise<Image | null> {
    return this.prisma.image.findUnique({
      where: { id },
      include: {
        album: true,
        tags: true
      }
    });
  }

  async findFavorites(userId?: string): Promise<Image[]> {
    return this.prisma.image.findMany({
      where: {
        isFavorite: true,
        // userId: userId // Si implementas multi-usuario
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  private buildWhereClause(filters?: ImageFilters): Prisma.ImageWhereInput {
    if (!filters) return {};

    return {
      ...(filters.albumId && { albumId: filters.albumId }),
      ...(filters.isFavorite !== undefined && { isFavorite: filters.isFavorite }),
      ...(filters.searchTerm && {
        OR: [
          { originalName: { contains: filters.searchTerm, mode: 'insensitive' } },
          { description: { contains: filters.searchTerm, mode: 'insensitive' } }
        ]
      }),
      ...(filters.dateFrom && filters.dateTo && {
        uploadedAt: {
          gte: filters.dateFrom,
          lte: filters.dateTo
        }
      })
    };
  }
}

// src/lib/repositories.ts - Singleton para proveer repositorios
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const imageRepository = new PrismaImageRepository(prisma);
export const albumRepository = new PrismaAlbumRepository(prisma);
export const tagRepository = new PrismaTagRepository(prisma);
```

**Uso en API Routes**:

```typescript
// src/app/api/images/route.ts
import { imageRepository } from '@/lib/repositories';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters: ImageFilters = {
      albumId: searchParams.get('albumId') || undefined,
      isFavorite: searchParams.get('favorites') === 'true',
      searchTerm: searchParams.get('q') || undefined
    };

    const images = await imageRepository.findAll(filters);

    return NextResponse.json({ success: true, data: images });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}
```

---

### 3.2. Factory Pattern

**Crea objetos sin especificar la clase exacta.**

```typescript
// src/factories/smart-album.factory.ts
export interface SmartAlbumRule {
  field: 'date' | 'camera' | 'location' | 'favorite' | 'tag';
  operator: 'equals' | 'contains' | 'between' | 'in' | 'not';
  value: any;
}

export interface SmartAlbumConfig {
  title: string;
  description?: string;
  icon?: string;
  rules: SmartAlbumRule[];
  isSystem: boolean;
}

export class SmartAlbumFactory {
  // Factory method para crear álbumes inteligentes predefinidos
  static createSystemAlbum(type: 'thisMonth' | 'lastYear' | 'favorites' | 'camera'): SmartAlbumConfig {
    const now = new Date();

    switch (type) {
      case 'thisMonth':
        return {
          title: 'Este Mes',
          description: 'Fotos del mes actual',
          icon: '📅',
          isSystem: true,
          rules: [
            {
              field: 'date',
              operator: 'between',
              value: {
                from: new Date(now.getFullYear(), now.getMonth(), 1),
                to: new Date(now.getFullYear(), now.getMonth() + 1, 0)
              }
            }
          ]
        };

      case 'lastYear':
        const lastYear = new Date(now);
        lastYear.setFullYear(now.getFullYear() - 1);

        return {
          title: 'Hace 1 Año',
          description: 'Recuerdos del año pasado',
          icon: '🕰️',
          isSystem: true,
          rules: [
            {
              field: 'date',
              operator: 'between',
              value: {
                from: new Date(lastYear.getFullYear(), lastYear.getMonth(), 1),
                to: new Date(lastYear.getFullYear(), lastYear.getMonth() + 1, 0)
              }
            }
          ]
        };

      case 'favorites':
        return {
          title: 'Favoritos',
          description: 'Tus fotos favoritas',
          icon: '⭐',
          isSystem: true,
          rules: [
            {
              field: 'favorite',
              operator: 'equals',
              value: true
            }
          ]
        };

      case 'camera':
        return {
          title: 'Cámara: iPhone',
          description: 'Fotos tomadas con iPhone',
          icon: '📱',
          isSystem: true,
          rules: [
            {
              field: 'camera',
              operator: 'contains',
              value: 'iPhone'
            }
          ]
        };

      default:
        throw new Error(`Unknown system album type: ${type}`);
    }
  }

  // Factory method para crear álbum personalizado
  static createCustomAlbum(config: Partial<SmartAlbumConfig>): SmartAlbumConfig {
    return {
      title: config.title || 'Nuevo Álbum',
      description: config.description,
      icon: config.icon,
      rules: config.rules || [],
      isSystem: false
    };
  }
}

// Uso:
const thisMonthAlbum = SmartAlbumFactory.createSystemAlbum('thisMonth');
const customAlbum = SmartAlbumFactory.createCustomAlbum({
  title: 'Viajes 2024',
  rules: [
    { field: 'tag', operator: 'in', value: ['travel', 'vacation'] },
    { field: 'date', operator: 'between', value: { from: '2024-01-01', to: '2024-12-31' } }
  ]
});
```

---

### 3.3. Strategy Pattern

**Define familia de algoritmos intercambiables.**

```typescript
// src/strategies/image-filter.strategy.ts

export interface IImageFilterStrategy {
  filter(images: Image[], criteria: any): Image[];
}

// Estrategia: Filtrar por fecha
export class DateFilterStrategy implements IImageFilterStrategy {
  filter(images: Image[], criteria: { from: Date; to: Date }): Image[] {
    return images.filter(img => {
      const uploadDate = new Date(img.uploadedAt);
      return uploadDate >= criteria.from && uploadDate <= criteria.to;
    });
  }
}

// Estrategia: Filtrar por cámara
export class CameraFilterStrategy implements IImageFilterStrategy {
  filter(images: Image[], criteria: string): Image[] {
    return images.filter(img =>
      img.cameraMake?.toLowerCase().includes(criteria.toLowerCase()) ||
      img.cameraModel?.toLowerCase().includes(criteria.toLowerCase())
    );
  }
}

// Estrategia: Filtrar por tags
export class TagFilterStrategy implements IImageFilterStrategy {
  filter(images: Image[], criteria: string[]): Image[] {
    return images.filter(img =>
      img.tags?.some(tag => criteria.includes(tag.name))
    );
  }
}

// Estrategia: Filtrar por favoritos
export class FavoriteFilterStrategy implements IImageFilterStrategy {
  filter(images: Image[], criteria: boolean): Image[] {
    return images.filter(img => img.isFavorite === criteria);
  }
}

// Context: Usa estrategias
export class ImageFilterContext {
  private strategy: IImageFilterStrategy;

  constructor(strategy: IImageFilterStrategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy: IImageFilterStrategy): void {
    this.strategy = strategy;
  }

  applyFilter(images: Image[], criteria: any): Image[] {
    return this.strategy.filter(images, criteria);
  }
}

// Uso:
const filterContext = new ImageFilterContext(new DateFilterStrategy());
const filteredByDate = filterContext.applyFilter(images, {
  from: new Date('2024-01-01'),
  to: new Date('2024-12-31')
});

// Cambiar estrategia dinámicamente
filterContext.setStrategy(new CameraFilterStrategy());
const filteredByCamera = filterContext.applyFilter(images, 'Canon');
```

---

### 3.4. Observer Pattern (con React Context)

**Permite notificar a múltiples componentes de cambios de estado.**

```typescript
// src/contexts/FavoriteContext.tsx
import { createContext, useContext, useState, useCallback, PropsWithChildren } from 'react';

interface FavoriteContextValue {
  favorites: Set<string>;
  addFavorite: (imageId: string) => void;
  removeFavorite: (imageId: string) => void;
  toggleFavorite: (imageId: string) => void;
  isFavorite: (imageId: string) => boolean;
  favoriteCount: number;
}

const FavoriteContext = createContext<FavoriteContextValue | null>(null);

export function FavoriteProvider({ children }: PropsWithChildren) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const addFavorite = useCallback((imageId: string) => {
    setFavorites(prev => new Set(prev).add(imageId));

    // Persist to API
    fetch(`/api/images/${imageId}/favorite`, { method: 'PUT' })
      .catch(err => console.error('Failed to add favorite', err));
  }, []);

  const removeFavorite = useCallback((imageId: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });

    // Persist to API
    fetch(`/api/images/${imageId}/favorite`, { method: 'DELETE' })
      .catch(err => console.error('Failed to remove favorite', err));
  }, []);

  const toggleFavorite = useCallback((imageId: string) => {
    if (favorites.has(imageId)) {
      removeFavorite(imageId);
    } else {
      addFavorite(imageId);
    }
  }, [favorites, addFavorite, removeFavorite]);

  const isFavorite = useCallback((imageId: string) => {
    return favorites.has(imageId);
  }, [favorites]);

  return (
    <FavoriteContext.Provider value={{
      favorites,
      addFavorite,
      removeFavorite,
      toggleFavorite,
      isFavorite,
      favoriteCount: favorites.size
    }}>
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoriteContext);
  if (!context) throw new Error('useFavorites must be used within FavoriteProvider');
  return context;
}

// Uso en múltiples componentes (todos se actualizan automáticamente)

// Componente 1: Botón de favorito
function FavoriteButton({ imageId }: { imageId: string }) {
  const { toggleFavorite, isFavorite } = useFavorites();

  return (
    <button onClick={() => toggleFavorite(imageId)}>
      {isFavorite(imageId) ? '❤️' : '🤍'}
    </button>
  );
}

// Componente 2: Contador en sidebar
function SidebarFavoriteCount() {
  const { favoriteCount } = useFavorites();

  return <span>Favoritos ({favoriteCount})</span>;
}

// Componente 3: Lista de favoritos
function FavoritesList() {
  const { favorites } = useFavorites();

  return (
    <div>
      {Array.from(favorites).map(id => (
        <ImageCard key={id} imageId={id} />
      ))}
    </div>
  );
}
```

---

### 3.5. Command Pattern (con React Query)

**Encapsula acciones como objetos.**

```typescript
// src/commands/image.commands.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

// Command: Crear imagen
export function useCreateImageCommand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateImageDTO) => {
      const response = await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Failed to create image');
      return response.json();
    },
    onSuccess: () => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['images'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    }
  });
}

// Command: Actualizar imagen
export function useUpdateImageCommand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateImageDTO }) => {
      const response = await fetch(`/api/images/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Failed to update image');
      return response.json();
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['image', id] });
      queryClient.invalidateQueries({ queryKey: ['images'] });
    }
  });
}

// Command: Eliminar imagen
export function useDeleteImageCommand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/images/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete image');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    }
  });
}

// Uso:
function ImageCard({ image }: { image: Image }) {
  const updateCommand = useUpdateImageCommand();
  const deleteCommand = useDeleteImageCommand();

  const handleUpdateDescription = (description: string) => {
    updateCommand.mutate({
      id: image.id,
      data: { description }
    });
  };

  const handleDelete = () => {
    if (confirm('¿Eliminar imagen?')) {
      deleteCommand.mutate(image.id);
    }
  };

  return (
    <div>
      <img src={image.fileUrl} alt={image.originalName} />
      <input
        defaultValue={image.description}
        onBlur={(e) => handleUpdateDescription(e.target.value)}
      />
      <button onClick={handleDelete}>Eliminar</button>
    </div>
  );
}
```

---

### 3.6. Adapter Pattern

**Convierte una interfaz en otra que el cliente espera.**

```typescript
// src/adapters/exif.adapter.ts
import exifr from 'exifr';
import { ExifData } from '@/domain/models/exif.model';

// Interfaz esperada por la aplicación
export interface ExifData {
  takenAt?: Date;
  cameraMake?: string;
  cameraModel?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: number;
  latitude?: number;
  longitude?: number;
  width?: number;
  height?: number;
}

// Adapter: Convierte formato de exifr a nuestro formato
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

      // Adaptar formato
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
        height: rawExif.ImageHeight
      };
    } catch (error) {
      console.error('Failed to extract EXIF data', error);
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

// Uso:
const exifData = await ExifrAdapter.extractFromFile(file);
```

---

## 4. Estructura de Carpetas Completa

```
album-fotos/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
│
├── public/
│   ├── uploads/
│   └── assets/
│
├── src/
│   ├── app/                          # Next.js 15 App Router
│   │   ├── (auth)/                   # Route group con autenticación
│   │   │   ├── login/
│   │   │   └── register/
│   │   │
│   │   ├── (main)/                   # Route group principal
│   │   │   ├── timeline/
│   │   │   │   └── page.tsx
│   │   │   ├── explore/
│   │   │   │   └── page.tsx
│   │   │   ├── favorites/
│   │   │   │   └── page.tsx
│   │   │   ├── album/
│   │   │   │   └── [year]/
│   │   │   │       └── page.tsx
│   │   │   └── layout.tsx           # Layout con Sidebar
│   │   │
│   │   ├── api/                      # API Routes
│   │   │   ├── albums/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── images/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       ├── favorite/
│   │   │   │       │   └── route.ts
│   │   │   │       └── tags/
│   │   │   │           └── route.ts
│   │   │   ├── timeline/
│   │   │   │   └── route.ts
│   │   │   ├── favorites/
│   │   │   │   └── route.ts
│   │   │   ├── search/
│   │   │   │   └── route.ts
│   │   │   ├── tags/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       └── route.ts
│   │   │   ├── smart-albums/
│   │   │   │   ├── route.ts
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts
│   │   │   │       └── images/
│   │   │   │           └── route.ts
│   │   │   └── upload/
│   │   │       └── route.ts
│   │   │
│   │   ├── layout.tsx                # Root layout
│   │   ├── page.tsx                  # Home
│   │   └── globals.css
│   │
│   ├── components/                   # Atomic Design
│   │   ├── atoms/                    # Componentes básicos
│   │   │   ├── Button/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.test.tsx
│   │   │   │   └── index.ts
│   │   │   ├── Input/
│   │   │   ├── Badge/
│   │   │   ├── Spinner/
│   │   │   └── Icon/
│   │   │
│   │   ├── molecules/                # Componentes compuestos
│   │   │   ├── SearchBar/
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   └── index.ts
│   │   │   ├── FavoriteButton/
│   │   │   ├── FilterChip/
│   │   │   ├── DateSeparator/
│   │   │   ├── ExifDataRow/
│   │   │   └── TagBadge/
│   │   │
│   │   ├── organisms/                # Secciones complejas
│   │   │   ├── Sidebar/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── SidebarItem.tsx
│   │   │   │   ├── MobileMenuButton.tsx
│   │   │   │   └── index.ts
│   │   │   ├── ImageGallery/         # Lightbox
│   │   │   │   ├── ImageGallery.tsx
│   │   │   │   ├── GalleryControls.tsx
│   │   │   │   ├── ThumbnailStrip.tsx
│   │   │   │   └── index.ts
│   │   │   ├── BentoGrid/
│   │   │   │   ├── BentoGrid.tsx
│   │   │   │   ├── BentoGridItem.tsx
│   │   │   │   └── index.ts
│   │   │   ├── TimelineGrid/
│   │   │   ├── ExifPanel/
│   │   │   ├── FilterPanel/
│   │   │   ├── ThemePanel/
│   │   │   └── SmartAlbumCreator/
│   │   │
│   │   ├── templates/                # Layouts de página
│   │   │   ├── MainLayout/
│   │   │   ├── AuthLayout/
│   │   │   └── EmptyLayout/
│   │   │
│   │   └── features/                 # Componentes por feature
│   │       ├── albums/
│   │       │   ├── AlbumPreview.tsx
│   │       │   ├── AlbumCard.tsx
│   │       │   └── AlbumGrid.tsx
│   │       ├── images/
│   │       │   ├── ImageCard.tsx
│   │       │   └── ImageUploader.tsx
│   │       ├── themes/
│   │       │   ├── ThemeSelector.tsx
│   │       │   └── ThemePreviewCard.tsx
│   │       ├── profile/
│   │       │   ├── ProfileAvatar.tsx
│   │       │   └── ProfileEditor.tsx
│   │       └── tags/
│   │           ├── TagInput.tsx
│   │           ├── TagBadge.tsx
│   │           └── TagManager.tsx
│   │
│   ├── domain/                       # Domain Layer (Core)
│   │   ├── models/                   # Entidades de dominio
│   │   │   ├── image.model.ts
│   │   │   ├── album.model.ts
│   │   │   ├── tag.model.ts
│   │   │   ├── exif.model.ts
│   │   │   ├── smart-album.model.ts
│   │   │   └── user.model.ts
│   │   │
│   │   ├── repositories/             # Interfaces de repositorios
│   │   │   ├── image.repository.interface.ts
│   │   │   ├── album.repository.interface.ts
│   │   │   ├── tag.repository.interface.ts
│   │   │   └── smart-album.repository.interface.ts
│   │   │
│   │   └── services/                 # Interfaces de servicios
│   │       ├── image-crud.service.interface.ts
│   │       ├── image-favorite.service.interface.ts
│   │       ├── image-exif.service.interface.ts
│   │       └── image-tag.service.interface.ts
│   │
│   ├── application/                  # Application Layer
│   │   ├── use-cases/                # Casos de uso
│   │   │   ├── images/
│   │   │   │   ├── create-image.use-case.ts
│   │   │   │   ├── update-image.use-case.ts
│   │   │   │   ├── delete-image.use-case.ts
│   │   │   │   ├── toggle-favorite.use-case.ts
│   │   │   │   └── add-tag.use-case.ts
│   │   │   ├── albums/
│   │   │   │   ├── create-album.use-case.ts
│   │   │   │   └── delete-album.use-case.ts
│   │   │   └── smart-albums/
│   │   │       ├── generate-smart-album.use-case.ts
│   │   │       └── evaluate-rules.use-case.ts
│   │   │
│   │   ├── dtos/                     # Data Transfer Objects
│   │   │   ├── image.dto.ts
│   │   │   ├── album.dto.ts
│   │   │   ├── tag.dto.ts
│   │   │   └── smart-album.dto.ts
│   │   │
│   │   └── services/                 # Servicios de aplicación
│   │       ├── image.service.ts
│   │       ├── album.service.ts
│   │       ├── tag.service.ts
│   │       └── smart-album.service.ts
│   │
│   ├── infrastructure/               # Infrastructure Layer
│   │   ├── repositories/             # Implementaciones de repositorios
│   │   │   ├── prisma-image.repository.ts
│   │   │   ├── prisma-album.repository.ts
│   │   │   ├── prisma-tag.repository.ts
│   │   │   ├── prisma-smart-album.repository.ts
│   │   │   └── mock/                 # Mocks para testing
│   │   │       ├── mock-image.repository.ts
│   │   │       └── mock-album.repository.ts
│   │   │
│   │   ├── adapters/                 # Adaptadores externos
│   │   │   ├── exifr.adapter.ts
│   │   │   ├── cloudinary.adapter.ts
│   │   │   └── local-storage.adapter.ts
│   │   │
│   │   └── database/                 # Config de DB
│   │       └── prisma.client.ts
│   │
│   ├── presentation/                 # Presentation Layer
│   │   ├── hooks/                    # Custom hooks
│   │   │   ├── useYears.ts
│   │   │   ├── useImages.ts
│   │   │   ├── useAlbums.ts
│   │   │   ├── useFavorites.ts
│   │   │   ├── useInfiniteTimeline.ts
│   │   │   ├── useBentoLayout.ts
│   │   │   ├── useSidebar.ts
│   │   │   └── useThemeGradients.ts
│   │   │
│   │   └── commands/                 # Commands con React Query
│   │       ├── image.commands.ts
│   │       ├── album.commands.ts
│   │       ├── tag.commands.ts
│   │       └── favorite.commands.ts
│   │
│   ├── contexts/                     # React Contexts
│   │   ├── ThemeContext.tsx
│   │   ├── UserContext.tsx
│   │   ├── FavoriteContext.tsx
│   │   └── SidebarContext.tsx
│   │
│   ├── providers/                    # Providers (DI)
│   │   ├── RepositoryProvider.tsx
│   │   ├── QueryProvider.tsx
│   │   └── AppProviders.tsx
│   │
│   ├── lib/                          # Utilidades y configuración
│   │   ├── repositories.ts           # Singleton de repositorios
│   │   ├── utils.ts
│   │   ├── cn.ts                     # classnames helper
│   │   ├── api-client.ts
│   │   └── validators.ts
│   │
│   ├── config/                       # Configuración
│   │   ├── themes.config.ts
│   │   ├── routes.config.ts
│   │   ├── api.config.ts
│   │   └── constants.ts
│   │
│   ├── factories/                    # Factories
│   │   ├── smart-album.factory.ts
│   │   └── theme.factory.ts
│   │
│   ├── strategies/                   # Strategies
│   │   ├── image-filter.strategy.ts
│   │   └── sort.strategy.ts
│   │
│   ├── validators/                   # Validadores (Zod)
│   │   ├── image.validator.ts
│   │   ├── album.validator.ts
│   │   └── tag.validator.ts
│   │
│   └── types/                        # Type definitions
│       ├── global.d.ts
│       ├── api.types.ts
│       └── prisma.types.ts
│
├── tests/                            # Tests
│   ├── unit/
│   │   ├── components/
│   │   ├── hooks/
│   │   └── services/
│   ├── integration/
│   │   └── api/
│   └── e2e/
│       └── specs/
│
├── docs/                             # Documentación
│   ├── ARCHITECTURE.md
│   ├── API.md
│   ├── SMART_ALBUMS.md
│   └── DEPLOYMENT.md
│
├── .env.example
├── .env.local
├── .eslintrc.json
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```

### Convenciones de Nombres

- **Componentes**: PascalCase (`ImageGallery.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useImages.ts`)
- **Services**: camelCase con sufijo `.service` (`image.service.ts`)
- **Types**: PascalCase (`ImageDTO`, `AlbumModel`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`)
- **Archivos de configuración**: kebab-case (`api.config.ts`)

---

## 5. Capas de la Arquitectura

### 5.1. Presentation Layer

**Responsabilidad**: Renderizar UI, manejar interacciones del usuario, delegar lógica a Application Layer.

#### Ejemplo: Timeline Page

```typescript
// src/app/(main)/timeline/page.tsx
'use client';

import { TimelineGrid } from '@/components/organisms/TimelineGrid';
import { useInfiniteTimeline } from '@/presentation/hooks/useInfiniteTimeline';
import { LoadingState } from '@/components/atoms/LoadingState';
import { ErrorState } from '@/components/atoms/ErrorState';
import { EmptyState } from '@/components/atoms/EmptyState';

export default function TimelinePage() {
  const {
    images,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useInfiniteTimeline();

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState error={error} />;
  if (images.length === 0) return <EmptyState message="No hay fotos aún" />;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Timeline</h1>

      <TimelineGrid
        images={images}
        onLoadMore={fetchNextPage}
        hasMore={hasNextPage}
        isLoadingMore={isFetchingNextPage}
      />
    </div>
  );
}
```

#### Custom Hook

```typescript
// src/presentation/hooks/useInfiniteTimeline.ts
import { useInfiniteQuery } from '@tanstack/react-query';
import { ImageService } from '@/application/services/image.service';
import { Image } from '@/domain/models/image.model';

export function useInfiniteTimeline() {
  const {
    data,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['timeline'],
    queryFn: ({ pageParam = 1 }) => ImageService.getTimeline({ page: pageParam, limit: 50 }),
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length + 1 : undefined;
    },
    initialPageParam: 1
  });

  // Flatten páginas en array único
  const images = data?.pages.flatMap(page => page.images) ?? [];

  return {
    images,
    isLoading,
    isError,
    error,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage
  };
}
```

---

### 5.2. Application Layer

**Responsabilidad**: Orquestar lógica de negocio, coordinar entre repositorios, validar DTOs.

#### Service

```typescript
// src/application/services/image.service.ts
import { imageRepository } from '@/lib/repositories';
import { CreateImageDTO, UpdateImageDTO, ImageFilters } from '@/application/dtos/image.dto';
import { Image } from '@/domain/models/image.model';
import { createImageValidator, updateImageValidator } from '@/validators/image.validator';

export class ImageService {
  static async getAll(filters?: ImageFilters): Promise<Image[]> {
    return imageRepository.findAll(filters);
  }

  static async getById(id: string): Promise<Image | null> {
    return imageRepository.findById(id);
  }

  static async getTimeline(params: { page: number; limit: number }) {
    const skip = (params.page - 1) * params.limit;

    const images = await imageRepository.findAll({
      skip,
      take: params.limit
    });

    const total = await imageRepository.count();
    const hasMore = skip + params.limit < total;

    return {
      images,
      hasMore,
      nextCursor: hasMore ? params.page + 1 : null
    };
  }

  static async create(data: CreateImageDTO): Promise<Image> {
    // Validar DTO
    const validated = createImageValidator.parse(data);

    // Crear imagen
    return imageRepository.create(validated);
  }

  static async update(id: string, data: UpdateImageDTO): Promise<Image> {
    // Validar DTO
    const validated = updateImageValidator.parse(data);

    // Actualizar imagen
    return imageRepository.update(id, validated);
  }

  static async delete(id: string): Promise<void> {
    return imageRepository.delete(id);
  }

  static async toggleFavorite(id: string): Promise<Image> {
    const image = await imageRepository.findById(id);
    if (!image) throw new Error('Image not found');

    return imageRepository.update(id, { isFavorite: !image.isFavorite });
  }
}
```

#### DTOs con Validación (Zod)

```typescript
// src/application/dtos/image.dto.ts
import { z } from 'zod';

export const CreateImageDTOSchema = z.object({
  filename: z.string().min(1),
  originalName: z.string().min(1),
  fileUrl: z.string().url(),
  thumbnailUrl: z.string().url().optional(),
  fileSize: z.number().positive(),
  width: z.number().positive(),
  height: z.number().positive(),
  mimeType: z.string().regex(/^image\//),
  description: z.string().optional(),
  albumId: z.string().optional(),
  exifData: z.record(z.any()).optional()
});

export const UpdateImageDTOSchema = z.object({
  description: z.string().optional(),
  isFavorite: z.boolean().optional(),
  featured: z.boolean().optional(),
  albumId: z.string().optional()
});

export type CreateImageDTO = z.infer<typeof CreateImageDTOSchema>;
export type UpdateImageDTO = z.infer<typeof UpdateImageDTOSchema>;

export interface ImageFilters {
  albumId?: string;
  isFavorite?: boolean;
  searchTerm?: string;
  dateFrom?: Date;
  dateTo?: Date;
  tagIds?: string[];
  skip?: number;
  take?: number;
}
```

---

### 5.3. Domain Layer

**Responsabilidad**: Definir entidades, interfaces, reglas de negocio core.

#### Models

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

  // Campos de Lumina Gallery
  isFavorite: boolean;
  featured: boolean;
  exifData: ExifData | null;
  takenAt: Date | null;
  cameraMake: string | null;
  cameraModel: string | null;
  lens: string | null;
  focalLength: string | null;
  aperture: string | null;
  shutterSpeed: string | null;
  iso: number | null;
  latitude: number | null;
  longitude: number | null;

  // Relaciones
  album?: Album;
  tags?: Tag[];
}

// src/domain/models/exif.model.ts
export interface ExifData {
  takenAt?: Date;
  cameraMake?: string;
  cameraModel?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: number;
  latitude?: number;
  longitude?: number;
  width?: number;
  height?: number;
  raw?: Record<string, any>; // EXIF completo
}

// src/domain/models/smart-album.model.ts
export interface SmartAlbum {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  rules: SmartAlbumRule[];
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SmartAlbumRule {
  field: 'date' | 'camera' | 'location' | 'favorite' | 'tag';
  operator: 'equals' | 'contains' | 'between' | 'in' | 'not';
  value: any;
}
```

#### Repository Interfaces

```typescript
// src/domain/repositories/image.repository.interface.ts
import { Image } from '@/domain/models/image.model';
import { CreateImageDTO, UpdateImageDTO, ImageFilters } from '@/application/dtos/image.dto';

export interface IImageRepository {
  findAll(filters?: ImageFilters): Promise<Image[]>;
  findById(id: string): Promise<Image | null>;
  findByAlbum(albumId: string): Promise<Image[]>;
  findFavorites(userId?: string): Promise<Image[]>;
  findByDateRange(from: Date, to: Date): Promise<Image[]>;
  findByTag(tagId: string): Promise<Image[]>;

  create(data: CreateImageDTO): Promise<Image>;
  update(id: string, data: UpdateImageDTO): Promise<Image>;
  delete(id: string): Promise<void>;

  count(filters?: ImageFilters): Promise<number>;
}
```

---

### 5.4. Infrastructure Layer

**Responsabilidad**: Implementar interfaces de Domain, conectar con sistemas externos (DB, APIs).

#### Repository Implementation

```typescript
// src/infrastructure/repositories/prisma-image.repository.ts
import { PrismaClient, Image as PrismaImage, Prisma } from '@prisma/client';
import { IImageRepository } from '@/domain/repositories/image.repository.interface';
import { Image } from '@/domain/models/image.model';
import { CreateImageDTO, UpdateImageDTO, ImageFilters } from '@/application/dtos/image.dto';

export class PrismaImageRepository implements IImageRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(filters?: ImageFilters): Promise<Image[]> {
    const where = this.buildWhereClause(filters);

    return this.prisma.image.findMany({
      where,
      include: {
        album: true,
        tags: true
      },
      orderBy: { uploadedAt: 'desc' },
      skip: filters?.skip,
      take: filters?.take
    });
  }

  async findById(id: string): Promise<Image | null> {
    return this.prisma.image.findUnique({
      where: { id },
      include: {
        album: true,
        tags: true
      }
    });
  }

  async findByAlbum(albumId: string): Promise<Image[]> {
    return this.prisma.image.findMany({
      where: { albumId },
      include: { tags: true },
      orderBy: { uploadedAt: 'desc' }
    });
  }

  async findFavorites(userId?: string): Promise<Image[]> {
    return this.prisma.image.findMany({
      where: {
        isFavorite: true
        // userId: userId // Si multi-usuario
      },
      include: {
        album: true,
        tags: true
      },
      orderBy: { updatedAt: 'desc' }
    });
  }

  async findByDateRange(from: Date, to: Date): Promise<Image[]> {
    return this.prisma.image.findMany({
      where: {
        OR: [
          {
            takenAt: {
              gte: from,
              lte: to
            }
          },
          {
            uploadedAt: {
              gte: from,
              lte: to
            }
          }
        ]
      },
      include: { album: true, tags: true },
      orderBy: { takenAt: 'desc' }
    });
  }

  async findByTag(tagId: string): Promise<Image[]> {
    return this.prisma.image.findMany({
      where: {
        tags: {
          some: { id: tagId }
        }
      },
      include: { album: true, tags: true },
      orderBy: { uploadedAt: 'desc' }
    });
  }

  async create(data: CreateImageDTO): Promise<Image> {
    return this.prisma.image.create({
      data,
      include: {
        album: true,
        tags: true
      }
    });
  }

  async update(id: string, data: UpdateImageDTO): Promise<Image> {
    return this.prisma.image.update({
      where: { id },
      data,
      include: {
        album: true,
        tags: true
      }
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.image.delete({
      where: { id }
    });
  }

  async count(filters?: ImageFilters): Promise<number> {
    const where = this.buildWhereClause(filters);
    return this.prisma.image.count({ where });
  }

  private buildWhereClause(filters?: ImageFilters): Prisma.ImageWhereInput {
    if (!filters) return {};

    return {
      ...(filters.albumId && { albumId: filters.albumId }),
      ...(filters.isFavorite !== undefined && { isFavorite: filters.isFavorite }),
      ...(filters.searchTerm && {
        OR: [
          { originalName: { contains: filters.searchTerm, mode: 'insensitive' } },
          { description: { contains: filters.searchTerm, mode: 'insensitive' } }
        ]
      }),
      ...(filters.dateFrom && filters.dateTo && {
        OR: [
          {
            takenAt: {
              gte: filters.dateFrom,
              lte: filters.dateTo
            }
          },
          {
            uploadedAt: {
              gte: filters.dateFrom,
              lte: filters.dateTo
            }
          }
        ]
      }),
      ...(filters.tagIds && filters.tagIds.length > 0 && {
        tags: {
          some: {
            id: { in: filters.tagIds }
          }
        }
      })
    };
  }
}
```

#### Singleton de Repositorios

```typescript
// src/lib/repositories.ts
import { PrismaClient } from '@prisma/client';
import { PrismaImageRepository } from '@/infrastructure/repositories/prisma-image.repository';
import { PrismaAlbumRepository } from '@/infrastructure/repositories/prisma-album.repository';
import { PrismaTagRepository } from '@/infrastructure/repositories/prisma-tag.repository';
import { PrismaSmartAlbumRepository } from '@/infrastructure/repositories/prisma-smart-album.repository';

// Singleton de Prisma Client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Singleton de Repositorios
export const imageRepository = new PrismaImageRepository(prisma);
export const albumRepository = new PrismaAlbumRepository(prisma);
export const tagRepository = new PrismaTagRepository(prisma);
export const smartAlbumRepository = new PrismaSmartAlbumRepository(prisma);
```

---

## 6. APIs y Servicios

### 6.1. Diseño de API RESTful

#### Principios REST

- **Recursos** como sustantivos (`/images`, `/albums`)
- **Verbos HTTP** para acciones (GET, POST, PUT, DELETE)
- **Códigos de estado** correctos (200, 201, 400, 404, 500)
- **Paginación** para listas grandes
- **Filtros** via query params
- **Versionado** si es necesario (`/api/v1/`)

#### Endpoints Completos

```
# Images
GET    /api/images                     # Listar todas las imágenes (con filtros)
GET    /api/images/:id                 # Obtener imagen por ID
POST   /api/images                     # Crear nueva imagen
PUT    /api/images/:id                 # Actualizar imagen
DELETE /api/images/:id                 # Eliminar imagen

# Image - Favorites
PUT    /api/images/:id/favorite        # Marcar como favorito
DELETE /api/images/:id/favorite        # Quitar de favoritos

# Image - Tags
POST   /api/images/:id/tags            # Agregar tag a imagen
DELETE /api/images/:id/tags/:tagId     # Quitar tag de imagen
GET    /api/images/:id/tags            # Obtener tags de imagen

# Timeline
GET    /api/timeline                   # Timeline con paginación

# Favorites
GET    /api/favorites                  # Todas las fotos favoritas

# Search
GET    /api/search                     # Búsqueda avanzada

# Albums
GET    /api/albums                     # Listar álbumes
GET    /api/albums/:id                 # Obtener álbum
POST   /api/albums                     # Crear álbum
PUT    /api/albums/:id                 # Actualizar álbum
DELETE /api/albums/:id                 # Eliminar álbum
GET    /api/albums/:id/images          # Imágenes del álbum

# Tags
GET    /api/tags                       # Listar tags
GET    /api/tags/:id                   # Obtener tag
POST   /api/tags                       # Crear tag
PUT    /api/tags/:id                   # Actualizar tag
DELETE /api/tags/:id                   # Eliminar tag
GET    /api/tags/:id/images            # Imágenes con tag

# Smart Albums
GET    /api/smart-albums               # Listar smart albums
GET    /api/smart-albums/:id           # Obtener smart album
POST   /api/smart-albums               # Crear smart album
PUT    /api/smart-albums/:id           # Actualizar smart album
DELETE /api/smart-albums/:id           # Eliminar smart album
GET    /api/smart-albums/:id/images    # Imágenes del smart album

# Upload
POST   /api/upload                     # Subir archivo(s)
```

### 6.2. Ejemplo Completo: API Route

```typescript
// src/app/api/images/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ImageService } from '@/application/services/image.service';
import { CreateImageDTOSchema, ImageFilters } from '@/application/dtos/image.dto';
import { z } from 'zod';

// GET /api/images - Listar imágenes con filtros
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parsear filtros de query params
    const filters: ImageFilters = {
      albumId: searchParams.get('albumId') || undefined,
      isFavorite: searchParams.get('favorites') === 'true' ? true : undefined,
      searchTerm: searchParams.get('q') || undefined,
      dateFrom: searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined,
      dateTo: searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined,
      tagIds: searchParams.get('tags')?.split(','),
      skip: parseInt(searchParams.get('skip') || '0'),
      take: parseInt(searchParams.get('limit') || '50')
    };

    const images = await ImageService.getAll(filters);

    return NextResponse.json({
      success: true,
      data: images,
      count: images.length
    });
  } catch (error) {
    console.error('GET /api/images error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}

// POST /api/images - Crear nueva imagen
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar con Zod
    const validatedData = CreateImageDTOSchema.parse(body);

    const image = await ImageService.create(validatedData);

    return NextResponse.json({
      success: true,
      data: image
    }, { status: 201 });
  } catch (error) {
    console.error('POST /api/images error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to create image' },
      { status: 500 }
    );
  }
}
```

```typescript
// src/app/api/images/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ImageService } from '@/application/services/image.service';
import { UpdateImageDTOSchema } from '@/application/dtos/image.dto';
import { z } from 'zod';

// GET /api/images/:id - Obtener imagen por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const image = await ImageService.getById(params.id);

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Image not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: image
    });
  } catch (error) {
    console.error(`GET /api/images/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch image' },
      { status: 500 }
    );
  }
}

// PUT /api/images/:id - Actualizar imagen
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    // Validar con Zod
    const validatedData = UpdateImageDTOSchema.parse(body);

    const image = await ImageService.update(params.id, validatedData);

    return NextResponse.json({
      success: true,
      data: image
    });
  } catch (error) {
    console.error(`PUT /api/images/${params.id} error:`, error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update image' },
      { status: 500 }
    );
  }
}

// DELETE /api/images/:id - Eliminar imagen
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ImageService.delete(params.id);

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error(`DELETE /api/images/${params.id} error:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete image' },
      { status: 500 }
    );
  }
}
```

```typescript
// src/app/api/images/[id]/favorite/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ImageService } from '@/application/services/image.service';

// PUT /api/images/:id/favorite - Marcar como favorito
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const image = await ImageService.update(params.id, { isFavorite: true });

    return NextResponse.json({
      success: true,
      data: image
    });
  } catch (error) {
    console.error(`PUT /api/images/${params.id}/favorite error:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to add to favorites' },
      { status: 500 }
    );
  }
}

// DELETE /api/images/:id/favorite - Quitar de favoritos
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const image = await ImageService.update(params.id, { isFavorite: false });

    return NextResponse.json({
      success: true,
      data: image
    });
  } catch (error) {
    console.error(`DELETE /api/images/${params.id}/favorite error:`, error);
    return NextResponse.json(
      { success: false, error: 'Failed to remove from favorites' },
      { status: 500 }
    );
  }
}
```

---

## 7. Gestión de Estado

### 7.1. Estado Global vs Local

#### Cuando usar Estado Global (Context + React Query)

- Datos del usuario autenticado
- Tema actual
- Favoritos (compartido entre muchos componentes)
- Sidebar (colapsado/expandido)
- Notificaciones/Toasts

#### Cuando usar Estado Local (useState)

- Estado de formularios
- Visibilidad de modales/dropdowns
- Hover effects
- Inputs temporales

### 7.2. React Query (TanStack Query)

**Gestión de estado del servidor (cache, revalidación, sincronización).**

#### Configuración

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
        staleTime: 60 * 1000, // 1 minuto
        cacheTime: 5 * 60 * 1000, // 5 minutos
        refetchOnWindowFocus: false,
        retry: 1
      }
    }
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

#### Queries

```typescript
// src/presentation/hooks/useImages.ts
import { useQuery } from '@tanstack/react-query';
import { ImageService } from '@/application/services/image.service';
import { ImageFilters } from '@/application/dtos/image.dto';

export function useImages(filters?: ImageFilters) {
  return useQuery({
    queryKey: ['images', filters],
    queryFn: () => ImageService.getAll(filters),
    staleTime: 60 * 1000
  });
}

export function useImage(id: string) {
  return useQuery({
    queryKey: ['image', id],
    queryFn: () => ImageService.getById(id),
    enabled: !!id
  });
}

export function useFavorites() {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: () => ImageService.getFavorites(),
    staleTime: 30 * 1000
  });
}
```

#### Mutations

```typescript
// src/presentation/commands/image.commands.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImageService } from '@/application/services/image.service';
import { CreateImageDTO, UpdateImageDTO } from '@/application/dtos/image.dto';

export function useCreateImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateImageDTO) => ImageService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    }
  });
}

export function useUpdateImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateImageDTO }) =>
      ImageService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['image', id] });
      queryClient.invalidateQueries({ queryKey: ['images'] });
    }
  });
}

export function useDeleteImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ImageService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    }
  });
}

export function useToggleFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ImageService.toggleFavorite(id),
    onMutate: async (id) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['image', id] });

      const previousImage = queryClient.getQueryData(['image', id]);

      queryClient.setQueryData(['image', id], (old: any) => ({
        ...old,
        isFavorite: !old.isFavorite
      }));

      return { previousImage };
    },
    onError: (err, id, context) => {
      // Revert on error
      queryClient.setQueryData(['image', id], context?.previousImage);
    },
    onSettled: (_, __, id) => {
      queryClient.invalidateQueries({ queryKey: ['image', id] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    }
  });
}
```

### 7.3. Context API

```typescript
// src/contexts/ThemeContext.tsx
'use client';

import { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';

type Theme = 'light' | 'dark' | 'ocean' | 'sunset' | 'forest' | 'cosmic';

interface ThemeContextValue {
  currentTheme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [currentTheme, setCurrentTheme] = useState<Theme>('light');

  // Cargar tema desde localStorage
  useEffect(() => {
    const saved = localStorage.getItem('theme') as Theme | null;
    if (saved) {
      setCurrentTheme(saved);
    }
  }, []);

  // Guardar tema en localStorage
  const setTheme = (theme: Theme) => {
    setCurrentTheme(theme);
    localStorage.setItem('theme', theme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
```

---

## 8. Componentes Reutilizables (Atomic Design)

### 8.1. Atoms (Componentes Básicos)

```typescript
// src/components/atoms/Button/Button.tsx
import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '@/lib/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  children,
  disabled,
  ...props
}: PropsWithChildren<ButtonProps>) {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 shadow-md hover:shadow-lg',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-md hover:shadow-lg'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner className="mr-2" size="sm" />
          Cargando...
        </>
      ) : (
        children
      )}
    </button>
  );
}
```

```typescript
// src/components/atoms/Spinner/Spinner.tsx
import { cn } from '@/lib/cn';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizeStyles = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div
      className={cn(
        'animate-spin rounded-full border-b-transparent border-current',
        sizeStyles[size],
        className
      )}
    />
  );
}
```

### 8.2. Molecules (Componentes Compuestos)

```typescript
// src/components/molecules/SearchBar/SearchBar.tsx
'use client';

import { useState, useCallback } from 'react';
import { Input } from '@/components/atoms/Input';
import { Icon } from '@/components/atoms/Icon';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchBar({
  onSearch,
  placeholder = 'Buscar...',
  debounceMs = 300
}: SearchBarProps) {
  const [query, setQuery] = useState('');

  // Debounce search
  useDebounce(() => {
    onSearch(query);
  }, debounceMs, [query]);

  const handleClear = useCallback(() => {
    setQuery('');
    onSearch('');
  }, [onSearch]);

  return (
    <div className="relative">
      <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10"
      />

      {query && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <Icon name="x" />
        </button>
      )}
    </div>
  );
}
```

### 8.3. Organisms (Secciones Complejas)

```typescript
// src/components/organisms/BentoGrid/BentoGrid.tsx
'use client';

import { Image } from '@/domain/models/image.model';
import { BentoGridItem } from './BentoGridItem';
import Masonry from 'react-masonry-css';
import { motion } from 'framer-motion';

interface BentoGridProps {
  images: Image[];
  onImageClick: (index: number) => void;
}

export function BentoGrid({ images, onImageClick }: BentoGridProps) {
  const breakpointColumns = {
    default: 4,
    1536: 4, // 2xl
    1280: 3, // xl
    1024: 3, // lg
    768: 2,  // md
    640: 1   // sm
  };

  return (
    <Masonry
      breakpointCols={breakpointColumns}
      className="flex -ml-4 w-auto"
      columnClassName="pl-4 bg-clip-padding"
    >
      {images.map((image, index) => (
        <motion.div
          key={image.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
        >
          <BentoGridItem
            image={image}
            onClick={() => onImageClick(index)}
            isFeatured={image.featured}
          />
        </motion.div>
      ))}
    </Masonry>
  );
}
```

---

## 9. Testing Strategy

### 9.1. Pirámide de Testing

```
          /\
         /  \        E2E Tests (10%)
        /    \       - Cypress/Playwright
       /------\      - User flows completos
      /        \
     /          \    Integration Tests (30%)
    /            \   - Testing Library
   /--------------\  - APIs + Components
  /                \
 /                  \ Unit Tests (60%)
/____________________\ - Jest
                       - Hooks, Utils, Services
```

### 9.2. Unit Tests

```typescript
// tests/unit/services/image.service.test.ts
import { ImageService } from '@/application/services/image.service';
import { imageRepository } from '@/lib/repositories';
import { CreateImageDTO } from '@/application/dtos/image.dto';

jest.mock('@/lib/repositories');

describe('ImageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all images', async () => {
      const mockImages = [
        { id: '1', originalName: 'test1.jpg' },
        { id: '2', originalName: 'test2.jpg' }
      ];

      (imageRepository.findAll as jest.Mock).mockResolvedValue(mockImages);

      const result = await ImageService.getAll();

      expect(result).toEqual(mockImages);
      expect(imageRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('should apply filters correctly', async () => {
      const filters = { albumId: 'album-1', isFavorite: true };

      await ImageService.getAll(filters);

      expect(imageRepository.findAll).toHaveBeenCalledWith(filters);
    });
  });

  describe('create', () => {
    it('should create a new image', async () => {
      const dto: CreateImageDTO = {
        filename: 'test.jpg',
        originalName: 'test.jpg',
        fileUrl: 'https://example.com/test.jpg',
        fileSize: 1024,
        width: 800,
        height: 600,
        mimeType: 'image/jpeg'
      };

      const mockImage = { id: '1', ...dto };

      (imageRepository.create as jest.Mock).mockResolvedValue(mockImage);

      const result = await ImageService.create(dto);

      expect(result).toEqual(mockImage);
      expect(imageRepository.create).toHaveBeenCalledWith(dto);
    });

    it('should throw error on validation failure', async () => {
      const invalidDTO = { filename: '' }; // Invalid

      await expect(ImageService.create(invalidDTO as any)).rejects.toThrow();
    });
  });
});
```

```typescript
// tests/unit/hooks/useImages.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useImages } from '@/presentation/hooks/useImages';
import { ImageService } from '@/application/services/image.service';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

jest.mock('@/application/services/image.service');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useImages', () => {
  it('should fetch images successfully', async () => {
    const mockImages = [
      { id: '1', originalName: 'test1.jpg' },
      { id: '2', originalName: 'test2.jpg' }
    ];

    (ImageService.getAll as jest.Mock).mockResolvedValue(mockImages);

    const { result } = renderHook(() => useImages(), {
      wrapper: createWrapper()
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockImages);
  });
});
```

### 9.3. Integration Tests

```typescript
// tests/integration/components/BentoGrid.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BentoGrid } from '@/components/organisms/BentoGrid';
import { Image } from '@/domain/models/image.model';

const mockImages: Image[] = [
  {
    id: '1',
    originalName: 'test1.jpg',
    fileUrl: 'https://example.com/test1.jpg',
    featured: true
    // ... otros campos
  },
  {
    id: '2',
    originalName: 'test2.jpg',
    fileUrl: 'https://example.com/test2.jpg',
    featured: false
  }
];

describe('BentoGrid Integration', () => {
  it('should render all images', () => {
    render(<BentoGrid images={mockImages} onImageClick={jest.fn()} />);

    expect(screen.getByAltText('test1.jpg')).toBeInTheDocument();
    expect(screen.getByAltText('test2.jpg')).toBeInTheDocument();
  });

  it('should call onImageClick when image is clicked', () => {
    const handleClick = jest.fn();

    render(<BentoGrid images={mockImages} onImageClick={handleClick} />);

    fireEvent.click(screen.getByAltText('test1.jpg'));

    expect(handleClick).toHaveBeenCalledWith(0);
  });

  it('should render featured images with correct styling', () => {
    const { container } = render(
      <BentoGrid images={mockImages} onImageClick={jest.fn()} />
    );

    // Verificar que imagen featured tiene clase especial
    const featuredImage = container.querySelector('[data-featured="true"]');
    expect(featuredImage).toBeInTheDocument();
  });
});
```

### 9.4. API Tests

```typescript
// tests/integration/api/images.test.ts
import { GET, POST, PUT, DELETE } from '@/app/api/images/route';
import { NextRequest } from 'next/server';
import { imageRepository } from '@/lib/repositories';

jest.mock('@/lib/repositories');

describe('Images API', () => {
  describe('GET /api/images', () => {
    it('should return all images', async () => {
      const mockImages = [
        { id: '1', originalName: 'test1.jpg' },
        { id: '2', originalName: 'test2.jpg' }
      ];

      (imageRepository.findAll as jest.Mock).mockResolvedValue(mockImages);

      const request = new NextRequest('http://localhost:3000/api/images');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(mockImages);
    });

    it('should apply filters from query params', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/images?favorites=true&albumId=album-1'
      );

      await GET(request);

      expect(imageRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          isFavorite: true,
          albumId: 'album-1'
        })
      );
    });
  });

  describe('POST /api/images', () => {
    it('should create a new image', async () => {
      const newImage = {
        filename: 'test.jpg',
        originalName: 'test.jpg',
        fileUrl: 'https://example.com/test.jpg',
        fileSize: 1024,
        width: 800,
        height: 600,
        mimeType: 'image/jpeg'
      };

      (imageRepository.create as jest.Mock).mockResolvedValue({
        id: '1',
        ...newImage
      });

      const request = new NextRequest('http://localhost:3000/api/images', {
        method: 'POST',
        body: JSON.stringify(newImage)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.id).toBe('1');
    });

    it('should return 400 on validation error', async () => {
      const invalidImage = {
        filename: '' // Invalid
      };

      const request = new NextRequest('http://localhost:3000/api/images', {
        method: 'POST',
        body: JSON.stringify(invalidImage)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Validation failed');
    });
  });
});
```

### 9.5. E2E Tests (Playwright)

```typescript
// tests/e2e/timeline.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Timeline Flow', () => {
  test('should display timeline and open lightbox', async ({ page }) => {
    await page.goto('/timeline');

    // Verificar que carga timeline
    await expect(page.locator('h1')).toContainText('Timeline');

    // Esperar a que carguen imágenes
    await page.waitForSelector('[data-testid="timeline-grid"]');

    // Verificar que hay imágenes
    const images = page.locator('[data-testid="image-card"]');
    await expect(images).toHaveCount(await images.count());

    // Click en primera imagen
    await images.first().click();

    // Verificar que abre lightbox
    await expect(page.locator('[data-testid="lightbox"]')).toBeVisible();

    // Navegar a siguiente imagen con teclado
    await page.keyboard.press('ArrowRight');

    // Cerrar lightbox con ESC
    await page.keyboard.press('Escape');

    // Verificar que cierra
    await expect(page.locator('[data-testid="lightbox"]')).not.toBeVisible();
  });

  test('should add image to favorites', async ({ page }) => {
    await page.goto('/timeline');

    // Click en imagen
    await page.locator('[data-testid="image-card"]').first().click();

    // Click en botón de favorito
    await page.locator('[data-testid="favorite-button"]').click();

    // Verificar que cambia a favorito
    await expect(page.locator('[data-testid="favorite-button"]')).toContainText('❤️');

    // Ir a vista de favoritos
    await page.goto('/favorites');

    // Verificar que aparece la imagen
    await expect(page.locator('[data-testid="image-card"]')).toHaveCount(1);
  });
});
```

---

## 10. Error Handling

### 10.1. Error Boundaries

```typescript
// src/components/ErrorBoundary.tsx
'use client';

import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);

    // Enviar a servicio de logging (Sentry, LogRocket, etc.)
    // logErrorToService(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Algo salió mal
            </h2>
            <p className="text-gray-600 mb-6">
              {this.state.error?.message || 'Error inesperado'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 10.2. API Error Handling

```typescript
// src/lib/api-client.ts
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiClient<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        response.statusText,
        errorData.error || `HTTP Error ${response.status}`
      );
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network error
    throw new Error('Network error. Please check your connection.');
  }
}

// Uso:
try {
  const data = await apiClient<{ success: boolean; data: Image[] }>('/api/images');
  console.log(data.data);
} catch (error) {
  if (error instanceof ApiError) {
    if (error.status === 404) {
      console.error('Not found');
    } else if (error.status === 500) {
      console.error('Server error');
    }
  } else {
    console.error('Unknown error', error);
  }
}
```

### 10.3. Logging y Monitoring

```typescript
// src/lib/logger.ts
type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: Date;
}

class Logger {
  private logs: LogEntry[] = [];

  private log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date()
    };

    this.logs.push(entry);

    // Console log
    console[level](message, data);

    // Enviar a servicio externo (Sentry, LogRocket, etc.)
    if (level === 'error' && process.env.NODE_ENV === 'production') {
      // this.sendToExternalService(entry);
    }
  }

  info(message: string, data?: any) {
    this.log('info', message, data);
  }

  warn(message: string, data?: any) {
    this.log('warn', message, data);
  }

  error(message: string, data?: any) {
    this.log('error', message, data);
  }

  getLogs() {
    return this.logs;
  }
}

export const logger = new Logger();
```

---

## 11. Performance

### 11.1. Code Splitting

```typescript
// src/app/(main)/timeline/page.tsx
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import { LoadingState } from '@/components/atoms/LoadingState';

// Lazy load componentes pesados
const TimelineGrid = dynamic(
  () => import('@/components/organisms/TimelineGrid').then(mod => mod.TimelineGrid),
  { loading: () => <LoadingState /> }
);

const ImageGallery = dynamic(
  () => import('@/components/organisms/ImageGallery').then(mod => mod.ImageGallery),
  { ssr: false }
);

export default function TimelinePage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <TimelineGrid />
    </Suspense>
  );
}
```

### 11.2. Memoization

```typescript
// src/components/organisms/BentoGrid/BentoGridItem.tsx
import { memo } from 'react';
import { Image } from '@/domain/models/image.model';

interface BentoGridItemProps {
  image: Image;
  onClick: () => void;
  isFeatured: boolean;
}

// Memoize para evitar re-renders innecesarios
export const BentoGridItem = memo(function BentoGridItem({
  image,
  onClick,
  isFeatured
}: BentoGridItemProps) {
  return (
    <div
      onClick={onClick}
      className={`cursor-pointer ${isFeatured ? 'col-span-2 row-span-2' : ''}`}
    >
      <img src={image.fileUrl} alt={image.originalName} />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison
  return (
    prevProps.image.id === nextProps.image.id &&
    prevProps.isFeatured === nextProps.isFeatured
  );
});
```

### 11.3. Virtualización

```typescript
// src/components/organisms/TimelineGrid/TimelineGrid.tsx
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { Image } from '@/domain/models/image.model';

interface TimelineGridProps {
  images: Image[];
  onImageClick: (index: number) => void;
}

export function TimelineGrid({ images, onImageClick }: TimelineGridProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: Math.ceil(images.length / 4),
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300,
    overscan: 5
  });

  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {rowVirtualizer.getVirtualItems().map(virtualRow => {
          const startIndex = virtualRow.index * 4;
          const rowImages = images.slice(startIndex, startIndex + 4);

          return (
            <div
              key={virtualRow.key}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`
              }}
            >
              <div className="grid grid-cols-4 gap-4">
                {rowImages.map((image, idx) => (
                  <ImageCard
                    key={image.id}
                    image={image}
                    onClick={() => onImageClick(startIndex + idx)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### 11.4. Image Optimization

```typescript
// src/components/atoms/OptimizedImage/OptimizedImage.tsx
import Image from 'next/image';
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className,
  priority = false
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
      )}

      <Image
        src={src}
        alt={alt}
        width={width || 800}
        height={height || 600}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        } ${className}`}
        onLoad={() => setIsLoading(false)}
        priority={priority}
        quality={85}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRg..." // Placeholder base64
      />
    </div>
  );
}
```

---

## 12. Checklist de Mejores Prácticas

### Arquitectura

- [ ] Capas bien definidas (Presentation, Application, Domain, Infrastructure)
- [ ] Dependencias correctas (Domain no depende de nadie)
- [ ] Repositorios implementan interfaces de Domain
- [ ] Servicios usan repositorios, no acceso directo a DB

### SOLID

- [ ] Cada componente tiene una responsabilidad
- [ ] Configuración extensible (themes, routes)
- [ ] Interfaces segregadas (pequeñas y específicas)
- [ ] Inyección de dependencias (Context, Providers)

### Componentes

- [ ] Atomic Design aplicado (atoms, molecules, organisms)
- [ ] Componentes memoizados cuando es necesario
- [ ] Props tipadas con TypeScript
- [ ] Accesibilidad (ARIA labels, keyboard navigation)

### Estado

- [ ] React Query para estado del servidor
- [ ] Context para estado global (tema, user, sidebar)
- [ ] useState para estado local (formularios, UI)
- [ ] Optimistic updates donde aplica

### APIs

- [ ] RESTful design (recursos como sustantivos)
- [ ] Validación con Zod
- [ ] Error handling consistente
- [ ] Paginación en listados
- [ ] Filtros via query params

### Testing

- [ ] Unit tests para hooks, services, utils
- [ ] Integration tests para componentes complejos
- [ ] API tests para endpoints
- [ ] E2E tests para flujos críticos
- [ ] Coverage > 70%

### Performance

- [ ] Code splitting (dynamic imports)
- [ ] Lazy loading de imágenes
- [ ] Virtualización para listas largas
- [ ] Memoización de cálculos pesados
- [ ] Debounce en búsquedas

### Error Handling

- [ ] Error Boundaries en rutas principales
- [ ] Manejo de errores en API
- [ ] Logging centralizado
- [ ] Mensajes de error claros al usuario

### Seguridad

- [ ] Validación de inputs (Zod)
- [ ] Sanitización de datos
- [ ] Rate limiting (futuro)
- [ ] CORS configurado
- [ ] Variables de entorno seguras

### Documentación

- [ ] README actualizado
- [ ] Comentarios en código complejo
- [ ] JSDoc en funciones públicas
- [ ] Arquitectura documentada
- [ ] ADRs para decisiones importantes

---

## Guías de Implementación por Issue

### ISSUE #1: Migración de BD

**Arquitectura aplicada**:
- Domain Layer: Modelos actualizados (`image.model.ts`, `tag.model.ts`, `smart-album.model.ts`)
- Infrastructure Layer: Migración de Prisma

**Pasos**:
1. Actualizar `prisma/schema.prisma`
2. Crear migración: `npx prisma migrate dev --name add_lumina_fields`
3. Actualizar modelos en `src/domain/models/`
4. Regenerar Prisma Client: `npx prisma generate`

---

### ISSUE #2: Sidebar

**Arquitectura aplicada**:
- Presentation Layer: Componente `Sidebar` (organism)
- Context API: `SidebarContext` para estado colapsado/expandido
- Atomic Design: `SidebarItem`, `MobileMenuButton` (molecules)

**Pasos**:
1. Crear `src/components/organisms/Sidebar/Sidebar.tsx`
2. Crear `src/contexts/SidebarContext.tsx`
3. Crear `src/components/molecules/SidebarItem.tsx`
4. Integrar en layout principal

---

### ISSUE #5: Timeline

**Arquitectura aplicada**:
- Presentation Layer: `TimelinePage`, `TimelineGrid`
- Application Layer: `ImageService.getTimeline()`
- Custom Hook: `useInfiniteTimeline` con React Query
- Performance: Virtualización para > 1000 fotos

**Pasos**:
1. Crear `src/app/(main)/timeline/page.tsx`
2. Crear `src/app/api/timeline/route.ts`
3. Crear `src/presentation/hooks/useInfiniteTimeline.ts`
4. Crear `src/components/organisms/TimelineGrid.tsx`
5. Implementar virtualización si es necesario

---

### ISSUE #6: Favoritos

**Arquitectura aplicada**:
- Application Layer: `ImageService.toggleFavorite()`
- Context API: `FavoriteContext` (Observer Pattern)
- Commands: `useToggleFavorite` con React Query
- Optimistic Updates para UX instantánea

**Pasos**:
1. Crear `src/contexts/FavoriteContext.tsx`
2. Crear `src/app/api/images/[id]/favorite/route.ts`
3. Crear `src/presentation/commands/favorite.commands.ts`
4. Crear `src/components/molecules/FavoriteButton.tsx`
5. Integrar en ImageGallery y grids

---

### ISSUE #9: Bento Grid

**Arquitectura aplicada**:
- Presentation Layer: `BentoGrid` (organism)
- Performance: Memoización, lazy loading
- Framer Motion: Animaciones stagger

**Pasos**:
1. Instalar `react-masonry-css`
2. Crear `src/components/organisms/BentoGrid/BentoGrid.tsx`
3. Crear `src/components/organisms/BentoGrid/BentoGridItem.tsx`
4. Implementar lógica de featured (Factory Pattern)
5. Integrar en home y album pages

---

### ISSUE #12: Smart Albums

**Arquitectura aplicada**:
- Domain Layer: `SmartAlbumRule` interface
- Factory Pattern: `SmartAlbumFactory.createSystemAlbum()`
- Strategy Pattern: `SmartAlbumRuleEvaluator`
- Application Layer: `SmartAlbumService`

**Pasos**:
1. Crear `src/domain/models/smart-album.model.ts`
2. Crear `src/factories/smart-album.factory.ts`
3. Crear `src/strategies/smart-album-rule.strategy.ts`
4. Crear `src/application/services/smart-album.service.ts`
5. Crear API endpoints
6. Crear UI de creación

---

## Conclusión

Esta arquitectura proporciona:

- **Escalabilidad**: Fácil agregar nuevas features sin romper existentes
- **Mantenibilidad**: Código organizado y fácil de entender
- **Testabilidad**: Cada capa es testeable independientemente
- **Flexibilidad**: Cambiar implementaciones sin afectar lógica de negocio
- **Performance**: Optimizaciones desde el diseño
- **Clean Code**: Principios SOLID y patrones de diseño

Cada issue debe seguir estos principios y patrones para mantener la consistencia arquitectónica del proyecto.
