# Ejemplos de Código - Clean Architecture para Lumina Gallery

> Ejemplos concretos de implementación siguiendo Clean Architecture y SOLID

---

## Tabla de Contenidos

1. [Estructura de Carpetas Implementada](#1-estructura-de-carpetas-implementada)
2. [Schema Prisma Completo](#2-schema-prisma-completo)
3. [Domain Layer - Modelos e Interfaces](#3-domain-layer---modelos-e-interfaces)
4. [Infrastructure Layer - Repositorios](#4-infrastructure-layer---repositorios)
5. [Application Layer - Servicios y DTOs](#5-application-layer---servicios-y-dtos)
6. [Presentation Layer - Hooks y Commands](#6-presentation-layer---hooks-y-commands)
7. [Components - Atomic Design](#7-components---atomic-design)
8. [API Routes - Next.js](#8-api-routes---nextjs)
9. [Contexts y Providers](#9-contexts-y-providers)
10. [Factories y Strategies](#10-factories-y-strategies)

---

## 1. Estructura de Carpetas Implementada

```
src/
├── app/
│   ├── (main)/
│   │   ├── timeline/
│   │   │   └── page.tsx
│   │   ├── explore/
│   │   │   └── page.tsx
│   │   ├── favorites/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── api/
│   │   ├── images/
│   │   │   ├── route.ts
│   │   │   └── [id]/
│   │   │       ├── route.ts
│   │   │       └── favorite/
│   │   │           └── route.ts
│   │   ├── timeline/
│   │   │   └── route.ts
│   │   ├── favorites/
│   │   │   └── route.ts
│   │   └── smart-albums/
│   │       ├── route.ts
│   │       └── [id]/
│   │           └── images/
│   │               └── route.ts
│   │
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── atoms/
│   │   ├── Button/
│   │   ├── Input/
│   │   └── Spinner/
│   ├── molecules/
│   │   ├── SearchBar/
│   │   ├── FavoriteButton/
│   │   └── DateSeparator/
│   └── organisms/
│       ├── Sidebar/
│       ├── BentoGrid/
│       ├── TimelineGrid/
│       └── ImageGallery/
│
├── domain/
│   ├── models/
│   │   ├── image.model.ts
│   │   ├── album.model.ts
│   │   ├── tag.model.ts
│   │   ├── exif.model.ts
│   │   └── smart-album.model.ts
│   │
│   └── repositories/
│       ├── image.repository.interface.ts
│       ├── album.repository.interface.ts
│       └── smart-album.repository.interface.ts
│
├── application/
│   ├── services/
│   │   ├── image.service.ts
│   │   ├── album.service.ts
│   │   └── smart-album.service.ts
│   │
│   └── dtos/
│       ├── image.dto.ts
│       ├── album.dto.ts
│       └── smart-album.dto.ts
│
├── infrastructure/
│   ├── repositories/
│   │   ├── prisma-image.repository.ts
│   │   ├── prisma-album.repository.ts
│   │   └── prisma-smart-album.repository.ts
│   │
│   └── adapters/
│       └── exifr.adapter.ts
│
├── presentation/
│   ├── hooks/
│   │   ├── useImages.ts
│   │   ├── useInfiniteTimeline.ts
│   │   └── useFavorites.ts
│   │
│   └── commands/
│       ├── image.commands.ts
│       └── favorite.commands.ts
│
├── contexts/
│   ├── ThemeContext.tsx
│   ├── FavoriteContext.tsx
│   └── SidebarContext.tsx
│
├── providers/
│   ├── QueryProvider.tsx
│   └── AppProviders.tsx
│
├── factories/
│   └── smart-album.factory.ts
│
├── strategies/
│   └── image-filter.strategy.ts
│
├── validators/
│   ├── image.validator.ts
│   └── album.validator.ts
│
├── lib/
│   ├── repositories.ts
│   ├── prisma.ts
│   ├── utils.ts
│   └── cn.ts
│
└── config/
    ├── themes.config.ts
    └── constants.ts
```

---

## 2. Schema Prisma Completo

```prisma
// prisma/schema.prisma

generator client {
  provider   = "prisma-client-js"
  engineType = "binary"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// ÁLBUMES
// ============================================
model Album {
  id            String   @id @default(cuid())
  year          Int
  title         String
  description   String?
  subAlbum      String?
  coverImageUrl String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  // Relaciones
  images Image[]

  // Índices
  @@unique([year, title, subAlbum])
  @@index([year])
  @@index([createdAt])
  @@map("albums")
}

// ============================================
// IMÁGENES
// ============================================
model Image {
  id           String   @id @default(cuid())
  albumId      String?
  filename     String
  originalName String
  fileUrl      String
  thumbnailUrl String?
  fileSize     Int
  width        Int
  height       Int
  mimeType     String
  description  String?
  uploadedAt   DateTime @default(now())
  updatedAt    DateTime @updatedAt

  // CAMPOS LUMINA GALLERY
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

  // Relaciones
  album Album? @relation(fields: [albumId], references: [id], onDelete: Cascade)
  tags  Tag[]  @relation("ImageTags")

  // Índices
  @@index([albumId])
  @@index([uploadedAt])
  @@index([takenAt])
  @@index([isFavorite])
  @@index([featured])
  @@index([cameraMake])
  @@index([albumId, uploadedAt])
  @@map("images")
}

// ============================================
// TAGS
// ============================================
model Tag {
  id        String   @id @default(cuid())
  name      String   @unique
  category  String   // 'location', 'object', 'person', 'event'
  color     String?
  createdAt DateTime @default(now())

  // Relaciones
  images Image[] @relation("ImageTags")

  // Índices
  @@index([category])
  @@index([name])
  @@map("tags")
}

// ============================================
// SMART ALBUMS
// ============================================
model SmartAlbum {
  id          String   @id @default(cuid())
  title       String
  description String?
  icon        String?
  rules       Json     // Array de SmartAlbumRule
  isSystem    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Índices
  @@index([isSystem])
  @@map("smart_albums")
}
```

---

## 3. Domain Layer - Modelos e Interfaces

### 3.1. Image Model

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

  // Lumina Gallery fields
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

  // Relations
  album?: Album;
  tags?: Tag[];
}

export interface ExifData {
  raw?: Record<string, any>;
  cameraMake?: string;
  cameraModel?: string;
  lens?: string;
  focalLength?: string;
  aperture?: string;
  shutterSpeed?: string;
  iso?: number;
  takenAt?: Date;
  latitude?: number;
  longitude?: number;
  width?: number;
  height?: number;
}
```

### 3.2. Tag Model

```typescript
// src/domain/models/tag.model.ts

export type TagCategory = 'location' | 'object' | 'person' | 'event';

export interface Tag {
  id: string;
  name: string;
  category: TagCategory;
  color: string | null;
  createdAt: Date;
  images?: Image[];
}
```

### 3.3. Smart Album Model

```typescript
// src/domain/models/smart-album.model.ts

export type SmartAlbumRuleField = 'date' | 'camera' | 'location' | 'favorite' | 'tag';
export type SmartAlbumRuleOperator = 'equals' | 'contains' | 'between' | 'in' | 'not';

export interface SmartAlbumRule {
  field: SmartAlbumRuleField;
  operator: SmartAlbumRuleOperator;
  value: any;
}

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
```

### 3.4. Repository Interface

```typescript
// src/domain/repositories/image.repository.interface.ts

import { Image } from '@/domain/models/image.model';
import { CreateImageDTO, UpdateImageDTO, ImageFilters } from '@/application/dtos/image.dto';

export interface IImageRepository {
  // Read
  findAll(filters?: ImageFilters): Promise<Image[]>;
  findById(id: string): Promise<Image | null>;
  findByAlbum(albumId: string): Promise<Image[]>;
  findFavorites(userId?: string): Promise<Image[]>;
  findByDateRange(from: Date, to: Date): Promise<Image[]>;
  findByTag(tagId: string): Promise<Image[]>;

  // Write
  create(data: CreateImageDTO): Promise<Image>;
  update(id: string, data: UpdateImageDTO): Promise<Image>;
  delete(id: string): Promise<void>;

  // Aggregations
  count(filters?: ImageFilters): Promise<number>;
}
```

---

## 4. Infrastructure Layer - Repositorios

### 4.1. Prisma Image Repository

```typescript
// src/infrastructure/repositories/prisma-image.repository.ts

import { PrismaClient, Prisma } from '@prisma/client';
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
      orderBy: this.buildOrderBy(filters?.sortBy, filters?.sortOrder),
      skip: filters?.skip,
      take: filters?.take
    }) as Promise<Image[]>;
  }

  async findById(id: string): Promise<Image | null> {
    return this.prisma.image.findUnique({
      where: { id },
      include: {
        album: true,
        tags: true
      }
    }) as Promise<Image | null>;
  }

  async findByAlbum(albumId: string): Promise<Image[]> {
    return this.prisma.image.findMany({
      where: { albumId },
      include: { tags: true },
      orderBy: { uploadedAt: 'desc' }
    }) as Promise<Image[]>;
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
    }) as Promise<Image[]>;
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
      orderBy: [
        { takenAt: 'desc' },
        { uploadedAt: 'desc' }
      ]
    }) as Promise<Image[]>;
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
    }) as Promise<Image[]>;
  }

  async create(data: CreateImageDTO): Promise<Image> {
    return this.prisma.image.create({
      data: {
        ...data,
        exifData: data.exifData as Prisma.JsonValue
      },
      include: {
        album: true,
        tags: true
      }
    }) as Promise<Image>;
  }

  async update(id: string, data: UpdateImageDTO): Promise<Image> {
    return this.prisma.image.update({
      where: { id },
      data: {
        ...data,
        exifData: data.exifData ? (data.exifData as Prisma.JsonValue) : undefined
      },
      include: {
        album: true,
        tags: true
      }
    }) as Promise<Image>;
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

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private buildWhereClause(filters?: ImageFilters): Prisma.ImageWhereInput {
    if (!filters) return {};

    return {
      ...(filters.albumId && { albumId: filters.albumId }),
      ...(filters.isFavorite !== undefined && { isFavorite: filters.isFavorite }),
      ...(filters.featured !== undefined && { featured: filters.featured }),
      ...(filters.searchTerm && {
        OR: [
          { originalName: { contains: filters.searchTerm, mode: 'insensitive' } },
          { description: { contains: filters.searchTerm, mode: 'insensitive' } },
          { location: { contains: filters.searchTerm, mode: 'insensitive' } }
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
      ...(filters.cameraMake && {
        cameraMake: { contains: filters.cameraMake, mode: 'insensitive' }
      }),
      ...(filters.cameraModel && {
        cameraModel: { contains: filters.cameraModel, mode: 'insensitive' }
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

  private buildOrderBy(
    sortBy: string = 'uploadedAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Prisma.ImageOrderByWithRelationInput {
    return {
      [sortBy]: sortOrder
    };
  }
}
```

### 4.2. Singleton de Repositorios

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

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});

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

## 5. Application Layer - Servicios y DTOs

### 5.1. DTOs con Validación (Zod)

```typescript
// src/application/dtos/image.dto.ts

import { z } from 'zod';
import { ExifData } from '@/domain/models/image.model';

// ============================================
// CREATE IMAGE DTO
// ============================================
export const CreateImageDTOSchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  originalName: z.string().min(1, 'Original name is required'),
  fileUrl: z.string().url('Invalid file URL'),
  thumbnailUrl: z.string().url().optional(),
  fileSize: z.number().positive('File size must be positive'),
  width: z.number().positive('Width must be positive'),
  height: z.number().positive('Height must be positive'),
  mimeType: z.string().regex(/^image\//, 'Must be an image MIME type'),
  description: z.string().optional(),
  albumId: z.string().optional(),

  // EXIF data
  exifData: z.record(z.any()).optional(),
  takenAt: z.coerce.date().optional(),
  location: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  cameraMake: z.string().optional(),
  cameraModel: z.string().optional(),
  lens: z.string().optional(),
  focalLength: z.string().optional(),
  aperture: z.string().optional(),
  shutterSpeed: z.string().optional(),
  iso: z.number().int().positive().optional()
});

export type CreateImageDTO = z.infer<typeof CreateImageDTOSchema>;

// ============================================
// UPDATE IMAGE DTO
// ============================================
export const UpdateImageDTOSchema = z.object({
  description: z.string().optional(),
  isFavorite: z.boolean().optional(),
  featured: z.boolean().optional(),
  albumId: z.string().optional(),
  location: z.string().optional(),
  exifData: z.record(z.any()).optional()
});

export type UpdateImageDTO = z.infer<typeof UpdateImageDTOSchema>;

// ============================================
// IMAGE FILTERS
// ============================================
export interface ImageFilters {
  albumId?: string;
  isFavorite?: boolean;
  featured?: boolean;
  searchTerm?: string;
  dateFrom?: Date;
  dateTo?: Date;
  cameraMake?: string;
  cameraModel?: string;
  tagIds?: string[];

  // Pagination
  skip?: number;
  take?: number;

  // Sorting
  sortBy?: 'uploadedAt' | 'takenAt' | 'originalName' | 'fileSize';
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// TIMELINE RESPONSE
// ============================================
export interface TimelineResponse {
  images: Image[];
  hasMore: boolean;
  nextCursor: number | null;
  total: number;
}
```

### 5.2. Image Service

```typescript
// src/application/services/image.service.ts

import { imageRepository } from '@/lib/repositories';
import { CreateImageDTO, UpdateImageDTO, ImageFilters, TimelineResponse } from '@/application/dtos/image.dto';
import { Image } from '@/domain/models/image.model';
import { CreateImageDTOSchema, UpdateImageDTOSchema } from '@/validators/image.validator';

export class ImageService {
  // ============================================
  // READ OPERATIONS
  // ============================================

  static async getAll(filters?: ImageFilters): Promise<Image[]> {
    return imageRepository.findAll(filters);
  }

  static async getById(id: string): Promise<Image | null> {
    return imageRepository.findById(id);
  }

  static async getByAlbum(albumId: string): Promise<Image[]> {
    return imageRepository.findByAlbum(albumId);
  }

  static async getFavorites(userId?: string): Promise<Image[]> {
    return imageRepository.findFavorites(userId);
  }

  static async getByDateRange(from: Date, to: Date): Promise<Image[]> {
    return imageRepository.findByDateRange(from, to);
  }

  static async getByTag(tagId: string): Promise<Image[]> {
    return imageRepository.findByTag(tagId);
  }

  // ============================================
  // TIMELINE (Paginación)
  // ============================================

  static async getTimeline(params: {
    page: number;
    limit: number;
    filters?: ImageFilters;
  }): Promise<TimelineResponse> {
    const skip = (params.page - 1) * params.limit;

    const [images, total] = await Promise.all([
      imageRepository.findAll({
        ...params.filters,
        skip,
        take: params.limit,
        sortBy: 'takenAt',
        sortOrder: 'desc'
      }),
      imageRepository.count(params.filters)
    ]);

    const hasMore = skip + params.limit < total;

    return {
      images,
      hasMore,
      nextCursor: hasMore ? params.page + 1 : null,
      total
    };
  }

  // ============================================
  // WRITE OPERATIONS
  // ============================================

  static async create(data: CreateImageDTO): Promise<Image> {
    // Validar DTO
    const validated = CreateImageDTOSchema.parse(data);

    // Crear imagen
    return imageRepository.create(validated);
  }

  static async update(id: string, data: UpdateImageDTO): Promise<Image> {
    // Validar DTO
    const validated = UpdateImageDTOSchema.parse(data);

    // Verificar que imagen existe
    const existing = await imageRepository.findById(id);
    if (!existing) {
      throw new Error('Image not found');
    }

    // Actualizar
    return imageRepository.update(id, validated);
  }

  static async delete(id: string): Promise<void> {
    // Verificar que imagen existe
    const existing = await imageRepository.findById(id);
    if (!existing) {
      throw new Error('Image not found');
    }

    return imageRepository.delete(id);
  }

  // ============================================
  // BUSINESS LOGIC
  // ============================================

  static async toggleFavorite(id: string): Promise<Image> {
    const image = await imageRepository.findById(id);
    if (!image) {
      throw new Error('Image not found');
    }

    return imageRepository.update(id, { isFavorite: !image.isFavorite });
  }

  static async toggleFeatured(id: string): Promise<Image> {
    const image = await imageRepository.findById(id);
    if (!image) {
      throw new Error('Image not found');
    }

    return imageRepository.update(id, { featured: !image.featured });
  }

  static async addToAlbum(imageId: string, albumId: string): Promise<Image> {
    return imageRepository.update(imageId, { albumId });
  }

  static async removeFromAlbum(imageId: string): Promise<Image> {
    return imageRepository.update(imageId, { albumId: null });
  }

  // ============================================
  // SEARCH
  // ============================================

  static async search(query: string, filters?: Omit<ImageFilters, 'searchTerm'>): Promise<Image[]> {
    return imageRepository.findAll({
      ...filters,
      searchTerm: query
    });
  }
}
```

---

## 6. Presentation Layer - Hooks y Commands

### 6.1. Custom Hooks con React Query

```typescript
// src/presentation/hooks/useImages.ts

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { ImageService } from '@/application/services/image.service';
import { Image } from '@/domain/models/image.model';
import { ImageFilters } from '@/application/dtos/image.dto';

export function useImages(
  filters?: ImageFilters,
  options?: Omit<UseQueryOptions<Image[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Image[], Error>({
    queryKey: ['images', filters],
    queryFn: () => ImageService.getAll(filters),
    staleTime: 60 * 1000, // 1 minuto
    ...options
  });
}

export function useImage(id: string) {
  return useQuery<Image | null, Error>({
    queryKey: ['image', id],
    queryFn: () => ImageService.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000 // 5 minutos
  });
}

export function useFavoriteImages() {
  return useQuery<Image[], Error>({
    queryKey: ['favorites'],
    queryFn: () => ImageService.getFavorites(),
    staleTime: 30 * 1000 // 30 segundos
  });
}
```

```typescript
// src/presentation/hooks/useInfiniteTimeline.ts

import { useInfiniteQuery } from '@tanstack/react-query';
import { ImageService } from '@/application/services/image.service';
import { ImageFilters } from '@/application/dtos/image.dto';

export function useInfiniteTimeline(filters?: ImageFilters) {
  const query = useInfiniteQuery({
    queryKey: ['timeline', filters],
    queryFn: ({ pageParam = 1 }) =>
      ImageService.getTimeline({
        page: pageParam,
        limit: 50,
        filters
      }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: 1,
    staleTime: 60 * 1000
  });

  // Flatten páginas en array único
  const images = query.data?.pages.flatMap(page => page.images) ?? [];

  return {
    images,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    refetch: query.refetch
  };
}
```

### 6.2. Commands (Mutations)

```typescript
// src/presentation/commands/image.commands.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ImageService } from '@/application/services/image.service';
import { CreateImageDTO, UpdateImageDTO } from '@/application/dtos/image.dto';
import { toast } from 'sonner'; // Para notificaciones

// ============================================
// CREATE IMAGE
// ============================================
export function useCreateImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateImageDTO) => ImageService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
      toast.success('Imagen creada exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear imagen: ${error.message}`);
    }
  });
}

// ============================================
// UPDATE IMAGE
// ============================================
export function useUpdateImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateImageDTO }) =>
      ImageService.update(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['image', id] });

      // Snapshot previous value
      const previousImage = queryClient.getQueryData(['image', id]);

      // Optimistic update
      queryClient.setQueryData(['image', id], (old: any) => ({
        ...old,
        ...data
      }));

      return { previousImage };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      queryClient.setQueryData(['image', id], context?.previousImage);
      toast.error('Error al actualizar imagen');
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['image', id] });
      queryClient.invalidateQueries({ queryKey: ['images'] });
      toast.success('Imagen actualizada');
    }
  });
}

// ============================================
// DELETE IMAGE
// ============================================
export function useDeleteImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ImageService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
      toast.success('Imagen eliminada');
    },
    onError: () => {
      toast.error('Error al eliminar imagen');
    }
  });
}

// ============================================
// TOGGLE FAVORITE
// ============================================
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
      queryClient.setQueryData(['image', id], context?.previousImage);
      toast.error('Error al cambiar favorito');
    },
    onSettled: (_, __, id) => {
      queryClient.invalidateQueries({ queryKey: ['image', id] });
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    }
  });
}
```

---

## 7. Components - Atomic Design

### 7.1. Atoms - Button

```typescript
// src/components/atoms/Button/Button.tsx

import { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { cn } from '@/lib/cn';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  ...props
}: PropsWithChildren<ButtonProps>) {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';

  const variantStyles = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md hover:shadow-lg',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 shadow-md hover:shadow-lg',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-md hover:shadow-lg'
  };

  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Cargando...
        </>
      ) : (
        children
      )}
    </button>
  );
}
```

### 7.2. Molecules - FavoriteButton

```typescript
// src/components/molecules/FavoriteButton/FavoriteButton.tsx

'use client';

import { useToggleFavorite } from '@/presentation/commands/image.commands';
import { cn } from '@/lib/cn';
import { motion } from 'framer-motion';

interface FavoriteButtonProps {
  imageId: string;
  isFavorite: boolean;
  className?: string;
}

export function FavoriteButton({ imageId, isFavorite, className }: FavoriteButtonProps) {
  const toggleFavorite = useToggleFavorite();

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // No propagar click al padre
    toggleFavorite.mutate(imageId);
  };

  return (
    <motion.button
      onClick={handleClick}
      disabled={toggleFavorite.isPending}
      className={cn(
        'p-2 rounded-full backdrop-blur-sm bg-white/20 hover:bg-white/30 transition-all duration-200',
        'focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2',
        className
      )}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <motion.svg
        className="w-6 h-6"
        fill={isFavorite ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        initial={false}
        animate={{
          fill: isFavorite ? '#ec4899' : 'none',
          stroke: isFavorite ? '#ec4899' : 'currentColor'
        }}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </motion.svg>
    </motion.button>
  );
}
```

### 7.3. Organisms - BentoGrid

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
          transition={{
            delay: index * 0.05,
            duration: 0.3,
            ease: 'easeOut'
          }}
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

```typescript
// src/components/organisms/BentoGrid/BentoGridItem.tsx

'use client';

import { memo } from 'react';
import Image from 'next/image';
import { Image as ImageModel } from '@/domain/models/image.model';
import { FavoriteButton } from '@/components/molecules/FavoriteButton';
import { cn } from '@/lib/cn';

interface BentoGridItemProps {
  image: ImageModel;
  onClick: () => void;
  isFeatured: boolean;
}

export const BentoGridItem = memo(function BentoGridItem({
  image,
  onClick,
  isFeatured
}: BentoGridItemProps) {
  return (
    <div
      className={cn(
        'relative mb-4 group cursor-pointer rounded-xl overflow-hidden',
        'transition-all duration-300 hover:shadow-2xl',
        isFeatured && 'row-span-2'
      )}
      onClick={onClick}
      data-featured={isFeatured}
    >
      {/* Imagen */}
      <div className="relative aspect-[4/3]">
        <Image
          src={image.fileUrl}
          alt={image.originalName}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Favorite Button */}
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <FavoriteButton imageId={image.id} isFavorite={image.isFavorite} />
        </div>

        {/* Información */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <h3 className="font-semibold text-sm truncate">{image.originalName}</h3>
          {image.description && (
            <p className="text-xs text-gray-200 line-clamp-2 mt-1">{image.description}</p>
          )}
        </div>

        {/* Badge de Featured */}
        {isFeatured && (
          <div className="absolute top-2 left-2 px-2 py-1 rounded-full bg-yellow-500 text-white text-xs font-semibold">
            Destacada
          </div>
        )}
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison para evitar re-renders innecesarios
  return (
    prevProps.image.id === nextProps.image.id &&
    prevProps.image.isFavorite === nextProps.image.isFavorite &&
    prevProps.isFeatured === nextProps.isFeatured
  );
});
```

---

## 8. API Routes - Next.js

### 8.1. Images API

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
      featured: searchParams.get('featured') === 'true' ? true : undefined,
      searchTerm: searchParams.get('q') || undefined,
      dateFrom: searchParams.get('from') ? new Date(searchParams.get('from')!) : undefined,
      dateTo: searchParams.get('to') ? new Date(searchParams.get('to')!) : undefined,
      cameraMake: searchParams.get('camera') || undefined,
      tagIds: searchParams.get('tags')?.split(','),
      skip: parseInt(searchParams.get('skip') || '0'),
      take: parseInt(searchParams.get('limit') || '50'),
      sortBy: (searchParams.get('sortBy') as any) || 'uploadedAt',
      sortOrder: (searchParams.get('sortOrder') as any) || 'desc'
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
        {
          success: false,
          error: 'Validation failed',
          details: error.errors
        },
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

### 8.2. Timeline API

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

    return NextResponse.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('GET /api/timeline error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch timeline' },
      { status: 500 }
    );
  }
}
```

---

## 9. Contexts y Providers

### 9.1. FavoriteContext (Observer Pattern)

```typescript
// src/contexts/FavoriteContext.tsx

'use client';

import { createContext, useContext, useState, useCallback, useEffect, PropsWithChildren } from 'react';
import { ImageService } from '@/application/services/image.service';

interface FavoriteContextValue {
  favorites: Set<string>;
  addFavorite: (imageId: string) => Promise<void>;
  removeFavorite: (imageId: string) => Promise<void>;
  toggleFavorite: (imageId: string) => Promise<void>;
  isFavorite: (imageId: string) => boolean;
  favoriteCount: number;
  isLoading: boolean;
}

const FavoriteContext = createContext<FavoriteContextValue | null>(null);

export function FavoriteProvider({ children }: PropsWithChildren) {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Cargar favoritos al montar
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const favoriteImages = await ImageService.getFavorites();
      const favoriteIds = new Set(favoriteImages.map(img => img.id));
      setFavorites(favoriteIds);
    } catch (error) {
      console.error('Failed to load favorites', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addFavorite = useCallback(async (imageId: string) => {
    setFavorites(prev => new Set(prev).add(imageId));

    try {
      await ImageService.update(imageId, { isFavorite: true });
    } catch (error) {
      console.error('Failed to add favorite', error);
      // Rollback on error
      setFavorites(prev => {
        const newSet = new Set(prev);
        newSet.delete(imageId);
        return newSet;
      });
    }
  }, []);

  const removeFavorite = useCallback(async (imageId: string) => {
    setFavorites(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageId);
      return newSet;
    });

    try {
      await ImageService.update(imageId, { isFavorite: false });
    } catch (error) {
      console.error('Failed to remove favorite', error);
      // Rollback on error
      setFavorites(prev => new Set(prev).add(imageId));
    }
  }, []);

  const toggleFavorite = useCallback(async (imageId: string) => {
    if (favorites.has(imageId)) {
      await removeFavorite(imageId);
    } else {
      await addFavorite(imageId);
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
      favoriteCount: favorites.size,
      isLoading
    }}>
      {children}
    </FavoriteContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoriteContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoriteProvider');
  }
  return context;
}
```

### 9.2. App Providers

```typescript
// src/providers/AppProviders.tsx

'use client';

import { PropsWithChildren } from 'react';
import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { FavoriteProvider } from '@/contexts/FavoriteContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { Toaster } from 'sonner';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <QueryProvider>
      <ThemeProvider>
        <FavoriteProvider>
          <SidebarProvider>
            {children}
            <Toaster position="top-right" richColors />
          </SidebarProvider>
        </FavoriteProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
```

---

## 10. Factories y Strategies

### 10.1. Smart Album Factory

```typescript
// src/factories/smart-album.factory.ts

import { SmartAlbum, SmartAlbumRule } from '@/domain/models/smart-album.model';

export interface SmartAlbumConfig {
  title: string;
  description?: string;
  icon?: string;
  rules: SmartAlbumRule[];
  isSystem: boolean;
}

export type SystemAlbumType = 'thisMonth' | 'lastYear' | 'favorites' | 'iphone' | 'canon' | 'travels';

export class SmartAlbumFactory {
  static createSystemAlbum(type: SystemAlbumType): SmartAlbumConfig {
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

      case 'iphone':
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

      case 'canon':
        return {
          title: 'Cámara: Canon',
          description: 'Fotos tomadas con cámara Canon',
          icon: '📷',
          isSystem: true,
          rules: [
            {
              field: 'camera',
              operator: 'contains',
              value: 'Canon'
            }
          ]
        };

      case 'travels':
        // TODO: Implementar detección de viajes via GPS
        return {
          title: 'Viajes',
          description: 'Fotos tomadas lejos de casa',
          icon: '✈️',
          isSystem: true,
          rules: [
            {
              field: 'location',
              operator: 'not',
              value: null // Fotos con ubicación GPS
            }
          ]
        };

      default:
        throw new Error(`Unknown system album type: ${type}`);
    }
  }

  static createCustomAlbum(config: Partial<SmartAlbumConfig>): SmartAlbumConfig {
    return {
      title: config.title || 'Nuevo Álbum Inteligente',
      description: config.description,
      icon: config.icon,
      rules: config.rules || [],
      isSystem: false
    };
  }

  static getAllSystemAlbums(): SmartAlbumConfig[] {
    const types: SystemAlbumType[] = [
      'thisMonth',
      'lastYear',
      'favorites',
      'iphone',
      'canon',
      'travels'
    ];

    return types.map(type => this.createSystemAlbum(type));
  }
}
```

---

Esta documentación proporciona ejemplos concretos y completos de cómo implementar la arquitectura Clean con SOLID para el proyecto Lumina Gallery. Cada componente, servicio y hook sigue los principios establecidos y está listo para ser implementado.
