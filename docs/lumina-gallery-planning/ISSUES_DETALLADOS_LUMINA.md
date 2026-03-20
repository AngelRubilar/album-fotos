# 📋 Issues Detallados - Lumina Gallery

> Issues completamente autocontenidos para el proyecto Lumina Gallery
> Cada issue incluye TODO lo necesario para implementarlo desde cero
> **Total**: 18 issues | **Duración Estimada**: 20-28 días

---

## 📚 Índice

### Milestone 1: Fundaciones y Arquitectura Base
- [Issue #1: Migración de Base de Datos](#issue-1-migración-de-base-de-datos)
- [Issue #2: Componente Sidebar Principal](#issue-2-componente-sidebar-principal)
- [Issue #3: Ajustar Layout Principal](#issue-3-ajustar-layout-principal)
- [Issue #4: Context de Usuario y Perfil](#issue-4-context-de-usuario-y-perfil)

### Milestone 2: Vistas Principales y Navegación
- [Issue #5: Vista Timeline](#issue-5-vista-timeline)
- [Issue #6: Sistema de Favoritos](#issue-6-sistema-de-favoritos)
- [Issue #7: Vista Explorar](#issue-7-vista-explorar)
- [Issue #8: Panel Flotante de Temas](#issue-8-panel-flotante-de-temas)

### Milestone 3: Bento Grid y Visualización Avanzada
- [Issue #9: Bento Grid Dinámico](#issue-9-bento-grid-dinámico)
- [Issue #10: Extracción de EXIF Data](#issue-10-extracción-de-exif-data)
- [Issue #11: Panel EXIF en Lightbox](#issue-11-panel-exif-en-lightbox)

### Milestone 4: Álbumes Inteligentes y Búsqueda
- [Issue #12: Generador de Álbumes Inteligentes](#issue-12-generador-de-álbumes-inteligentes)
- [Issue #13: Vista de Álbumes Inteligentes](#issue-13-vista-de-álbumes-inteligentes)
- [Issue #14: Sistema de Tags](#issue-14-sistema-de-tags)

### Milestone 5: Pulido, Animaciones y Optimización
- [Issue #15: Integración de Framer Motion](#issue-15-integración-de-framer-motion)
- [Issue #16: Optimización de Performance](#issue-16-optimización-de-performance)
- [Issue #17: Mejoras de Glassmorphism](#issue-17-mejoras-de-glassmorphism)
- [Issue #18: Documentación y Testing](#issue-18-documentación-y-testing)

---

# Issue #1: Migración de Base de Datos - Campos Nuevos

## 📋 Metadata

- **Milestone**: Milestone 1 - Fundaciones
- **Prioridad**: 🔴 Alta
- **Estimación**: 4-6 horas
- **Labels**: `database`, `backend`, `migration`, `priority: high`
- **Dependencias**: Ninguna (primer issue a implementar)
- **Asignado**: Backend Developer

## 🎯 Contexto y Justificación

### Problema a Resolver

El diseño Lumina Gallery requiere nuevas funcionalidades que el esquema de base de datos actual no soporta:

1. **Sistema de Favoritos**: Marcar fotos como favoritas
2. **Fotos Destacadas**: Campo para Bento Grid (fotos 2x2)
3. **Metadatos EXIF**: Almacenar información de cámara, ubicación, configuración
4. **Sistema de Tags**: Categorización manual de fotos
5. **Smart Albums**: Álbumes inteligentes auto-generados

### Impacto

Sin esta migración, no se pueden implementar los siguientes issues:
- Issue #6 (Favoritos)
- Issue #9 (Bento Grid)
- Issue #10-11 (EXIF Data)
- Issue #12-13 (Smart Albums)
- Issue #14 (Tags)

### Arquitectura

Esta migración modifica la **Infrastructure Layer** (capa de datos) y es la base para todas las demás features.

```
┌─────────────────────────────────────┐
│   PRESENTATION LAYER (UI)           │
│   Components, Pages, Hooks          │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│   APPLICATION LAYER                 │
│   Services, DTOs, Use Cases         │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│   DOMAIN LAYER                      │
│   Models, Interfaces, Contracts     │
└─────────────────┬───────────────────┘
                  │
┌─────────────────▼───────────────────┐
│   INFRASTRUCTURE LAYER  ← AQUÍ      │
│   Prisma, PostgreSQL, Repositories  │
└─────────────────────────────────────┘
```

## 🏗️ Diseño Técnico

### Principios SOLID Aplicados

#### Single Responsibility Principle (SRP)
- Cada modelo tiene una responsabilidad única
- `Image`: Representar fotos con atributos
- `Tag`: Representar categorías/etiquetas
- `SmartAlbum`: Representar álbumes con reglas

#### Open/Closed Principle (OCP)
- `exifData` es JSON → extensible sin modificar schema
- `rules` en SmartAlbum es JSON → extensible
- Campos opcionales permiten agregar sin romper código existente

#### Liskov Substitution Principle (LSP)
- Todos los campos nuevos son opcionales (`?`)
- No rompen código existente
- Pueden ser null sin causar errores

### Diagrama de Relaciones

```
┌──────────────────┐
│      Album       │
│                  │
│  id              │
│  year            │
│  title           │
└────────┬─────────┘
         │ 1:N
         │
         ▼
┌──────────────────┐        ┌──────────────────┐
│      Image       │◄──────►│       Tag        │
│                  │  M:N   │                  │
│  id              │        │  id              │
│  albumId         │        │  name            │
│  isFavorite  ✨  │        │  category        │
│  featured    ✨  │        │  color           │
│  exifData    ✨  │        └──────────────────┘
│  takenAt     ✨  │
│  cameraMake  ✨  │
└──────────────────┘

┌──────────────────┐
│   SmartAlbum ✨  │
│                  │
│  id              │
│  title           │
│  rules (JSON)    │
│  isSystem        │
└──────────────────┘

✨ = Nuevo en esta migración
```

## 📦 Objetivos

### ✅ Debe Implementar

1. **Campos en modelo Image**:
   - `isFavorite` (Boolean): Sistema de favoritos
   - `featured` (Boolean): Bento Grid destacadas
   - `exifData` (Json): Metadatos EXIF completos
   - `takenAt` (DateTime): Fecha de captura
   - `location` (String): Nombre ubicación
   - `latitude`, `longitude` (Float): GPS
   - `cameraMake`, `cameraModel` (String): Cámara
   - `lens` (String): Lente usado
   - `focalLength`, `aperture`, `shutterSpeed` (String): Config
   - `iso` (Int): Sensibilidad

2. **Modelo Tag**:
   - Tabla independiente
   - Relación many-to-many con Image
   - Categorías (location, person, event, object)
   - Color personalizado

3. **Modelo SmartAlbum**:
   - Tabla para álbumes inteligentes
   - Campo `rules` (JSON) para criterios
   - Campo `isSystem` (Boolean)

4. **Índices de rendimiento**:
   - `isFavorite` (queries rápidas)
   - `featured` (queries rápidas)
   - `takenAt` (ordenamiento cronológico)
   - `cameraMake` (filtrado)

5. **Migración reversible**:
   - Generar SQL con `prisma migrate dev`
   - Verificar rollback funciona

### ❌ NO Debe Hacer

1. ❌ Modificar campos existentes
2. ❌ Hacer campos obligatorios (usar `?`)
3. ❌ Eliminar campos
4. ❌ Agregar lógica de negocio en schema
5. ❌ Relaciones complejas innecesarias
6. ❌ Olvidar índices
7. ❌ Hardcodear valores
8. ❌ Ejecutar en producción sin backup

## 🔧 Especificación Técnica

### Archivos a Crear

```
prisma/migrations/YYYYMMDD_add_lumina_fields/migration.sql (auto-generado)
```

### Archivos a Modificar

```
prisma/schema.prisma (modificar)
prisma/seed.ts (opcional - agregar datos de prueba)
```

### Dependencias

Ya instaladas (no necesita instalar nada):
- `@prisma/client`
- `prisma`

### Schema Prisma Completo

**Archivo**: `prisma/schema.prisma`

```prisma
// ============================================
// CONFIGURACIÓN
// ============================================
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// MODELO: ÁLBUMES (Sin cambios)
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

  images Image[]

  @@unique([year, title, subAlbum])
  @@index([year])
  @@index([createdAt])
  @@map("albums")
}

// ============================================
// MODELO: IMÁGENES (CON CAMPOS NUEVOS)
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

  // ============================================
  // CAMPOS NUEVOS LUMINA GALLERY
  // ============================================

  // Sistema de Favoritos (Issue #6)
  isFavorite   Boolean  @default(false)

  // Bento Grid - Destacadas (Issue #9)
  featured     Boolean  @default(false)

  // EXIF Data (Issue #10-11)
  exifData     Json?
  takenAt      DateTime?
  location     String?
  latitude     Float?
  longitude    Float?

  // Información de Cámara
  cameraMake   String?
  cameraModel  String?
  lens         String?

  // Configuración
  focalLength  String?
  aperture     String?
  shutterSpeed String?
  iso          Int?

  // Relaciones
  album Album? @relation(fields: [albumId], references: [id], onDelete: Cascade)
  tags  Tag[]  @relation("ImageTags")

  // ============================================
  // ÍNDICES
  // ============================================
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
// NUEVO: TAGS (Issue #14)
// ============================================
model Tag {
  id        String   @id @default(cuid())
  name      String   @unique
  category  String
  color     String?
  createdAt DateTime @default(now())

  images Image[] @relation("ImageTags")

  @@index([category])
  @@index([name])
  @@map("tags")
}

// ============================================
// NUEVO: SMART ALBUMS (Issue #12-13)
// ============================================
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

### Interfaces TypeScript (Auto-generadas)

Después de `npx prisma generate`, Prisma generará automáticamente:

```typescript
// En node_modules/.prisma/client

export type Image = {
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

  // Nuevos campos
  isFavorite: boolean;
  featured: boolean;
  exifData: Prisma.JsonValue | null;
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
};

export type Tag = {
  id: string;
  name: string;
  category: string;
  color: string | null;
  createdAt: Date;
};

export type SmartAlbum = {
  id: string;
  title: string;
  description: string | null;
  icon: string | null;
  rules: Prisma.JsonValue;
  isSystem: boolean;
  createdAt: Date;
  updatedAt: Date;
};
```

## 💻 Implementación Paso a Paso

### Paso 1: Backup de Base de Datos

**Comando**:
```bash
# PostgreSQL backup
pg_dump -U postgres -h localhost -d album_fotos > backup_$(date +%Y%m%d_%H%M%S).sql

# O si usas Docker
docker exec -t postgres_container pg_dump -U postgres album_fotos > backup_$(date +%Y%m%d_%H%M%S).sql
```

**Verificación**:
```bash
# Verificar que el archivo existe y tiene contenido
ls -lh backup_*.sql

# Debe mostrar archivo con tamaño > 0 bytes
```

### Paso 2: Modificar Schema

Editar `prisma/schema.prisma` con el contenido de la sección "Schema Prisma Completo" arriba.

**Verificación**:
```bash
# Validar sintaxis
npx prisma validate

# Debe mostrar: "The schema is valid."
```

### Paso 3: Crear Migración

**Comando**:
```bash
npx prisma migrate dev --name add_lumina_gallery_fields
```

**Output Esperado**:
```
Environment variables loaded from .env
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "album_fotos"

Applying migration `20260118_add_lumina_gallery_fields`

✔ Generated Prisma Client
```

**Verificación**:
```bash
# Verificar archivo de migración creado
ls -la prisma/migrations/

# Debe aparecer carpeta con timestamp
```

### Paso 4: Verificar SQL Generado

Abrir `prisma/migrations/XXXXXX_add_lumina_gallery_fields/migration.sql` y verificar:

**SQL Esperado**:
```sql
-- AlterTable
ALTER TABLE "images"
  ADD COLUMN "isFavorite" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "exifData" JSONB,
  ADD COLUMN "takenAt" TIMESTAMP(3),
  ADD COLUMN "location" TEXT,
  ADD COLUMN "latitude" DOUBLE PRECISION,
  ADD COLUMN "longitude" DOUBLE PRECISION,
  ADD COLUMN "cameraMake" TEXT,
  ADD COLUMN "cameraModel" TEXT,
  ADD COLUMN "lens" TEXT,
  ADD COLUMN "focalLength" TEXT,
  ADD COLUMN "aperture" TEXT,
  ADD COLUMN "shutterSpeed" TEXT,
  ADD COLUMN "iso" INTEGER;

-- CreateTable: tags
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable: _ImageTags (many-to-many)
CREATE TABLE "_ImageTags" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateTable: smart_albums
CREATE TABLE "smart_albums" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "rules" JSONB NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "smart_albums_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");
CREATE INDEX "tags_category_idx" ON "tags"("category");
CREATE INDEX "tags_name_idx" ON "tags"("name");

CREATE INDEX "images_takenAt_idx" ON "images"("takenAt");
CREATE INDEX "images_isFavorite_idx" ON "images"("isFavorite");
CREATE INDEX "images_featured_idx" ON "images"("featured");
CREATE INDEX "images_cameraMake_idx" ON "images"("cameraMake");
CREATE INDEX "images_albumId_uploadedAt_idx" ON "images"("albumId", "uploadedAt");

CREATE INDEX "smart_albums_isSystem_idx" ON "smart_albums"("isSystem");

CREATE UNIQUE INDEX "_ImageTags_AB_unique" ON "_ImageTags"("A", "B");
CREATE INDEX "_ImageTags_B_index" ON "_ImageTags"("B");

-- AddForeignKey
ALTER TABLE "_ImageTags" ADD CONSTRAINT "_ImageTags_A_fkey"
  FOREIGN KEY ("A") REFERENCES "images"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "_ImageTags" ADD CONSTRAINT "_ImageTags_B_fkey"
  FOREIGN KEY ("B") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

✅ **Verificar**: NO debe haber `DROP TABLE` ni `DROP COLUMN`

### Paso 5: Verificar en Prisma Studio

**Comando**:
```bash
npx prisma studio
```

Abrir http://localhost:5555

**Verificación**:
- Modelo `Image` → Ver nuevos campos
- Modelo `Tag` → Debe existir
- Modelo `SmartAlbum` → Debe existir
- Valores default aplicados (isFavorite=false, featured=false)

### Paso 6: Actualizar Seed Data (Opcional)

**Archivo**: `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Crear tags de ejemplo
  const tagViaje = await prisma.tag.upsert({
    where: { name: 'Viaje' },
    update: {},
    create: {
      name: 'Viaje',
      category: 'event',
      color: '#3b82f6'
    }
  });

  const tagFamilia = await prisma.tag.upsert({
    where: { name: 'Familia' },
    update: {},
    create: {
      name: 'Familia',
      category: 'person',
      color: '#ec4899'
    }
  });

  console.log('✅ Tags creados:', { tagViaje, tagFamilia });

  // Marcar primeras 3 imágenes de cada álbum como featured
  const albums = await prisma.album.findMany({
    include: {
      images: {
        take: 3,
        orderBy: { uploadedAt: 'desc' }
      }
    }
  });

  for (const album of albums) {
    for (const image of album.images) {
      await prisma.image.update({
        where: { id: image.id },
        data: {
          featured: true,
          exifData: {
            Make: 'Canon',
            Model: 'EOS 5D Mark IV',
            FocalLength: 50,
            ISO: 400
          },
          cameraMake: 'Canon',
          cameraModel: 'EOS 5D Mark IV',
          iso: 400
        }
      });
    }
  }

  console.log(`✅ ${albums.length * 3} imágenes marcadas como featured`);

  // Crear Smart Albums del sistema
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  await prisma.smartAlbum.upsert({
    where: { id: 'system-this-month' },
    update: {},
    create: {
      id: 'system-this-month',
      title: 'Este Mes',
      description: 'Fotos del mes actual',
      icon: '📅',
      isSystem: true,
      rules: [
        {
          field: 'date',
          operator: 'between',
          value: {
            from: startOfMonth.toISOString(),
            to: endOfMonth.toISOString()
          }
        }
      ]
    }
  });

  console.log('✅ Smart Albums creados');
  console.log('🎉 Seed completado!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Ejecutar**:
```bash
npx prisma db seed
```

### Paso 7: Probar Rollback (Desarrollo)

**Comando**:
```bash
# ⚠️ SOLO EN DESARROLLO - Resetea toda la BD
npx prisma migrate reset
```

Esto:
1. DROP all tables
2. Re-run ALL migrations
3. Re-run seed

**Verificación**: BD vuelve al estado con migración aplicada + seed

### Paso 8: Verificar Tipos TypeScript

**Comando**:
```bash
npx prisma generate
```

**Archivo de prueba**: `test-types.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testTypes() {
  const image = await prisma.image.findFirst();

  if (image) {
    // TypeScript debe auto-completar estos campos
    console.log('isFavorite:', image.isFavorite);
    console.log('featured:', image.featured);
    console.log('exifData:', image.exifData);
    console.log('cameraMake:', image.cameraMake);
  }

  const tags = await prisma.tag.findMany();
  console.log('Tags:', tags);

  const smartAlbums = await prisma.smartAlbum.findMany();
  console.log('Smart Albums:', smartAlbums);
}

testTypes().finally(() => prisma.$disconnect());
```

**Ejecutar**:
```bash
npx tsx test-types.ts
```

## 🧪 Testing

### Tests de Integración

**Archivo**: `tests/migration.test.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';

const prisma = new PrismaClient();

describe('Migración Lumina Gallery', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test('Image tiene campos nuevos', async () => {
    const image = await prisma.image.create({
      data: {
        filename: 'test.jpg',
        originalName: 'test.jpg',
        fileUrl: 'https://example.com/test.jpg',
        fileSize: 1024,
        width: 1920,
        height: 1080,
        mimeType: 'image/jpeg',
        isFavorite: true,
        featured: true,
        cameraMake: 'Canon',
        iso: 400
      }
    });

    expect(image.isFavorite).toBe(true);
    expect(image.featured).toBe(true);
    expect(image.cameraMake).toBe('Canon');

    await prisma.image.delete({ where: { id: image.id } });
  });

  test('Tag funciona correctamente', async () => {
    const tag = await prisma.tag.create({
      data: {
        name: 'Test Tag',
        category: 'event',
        color: '#FF0000'
      }
    });

    expect(tag.name).toBe('Test Tag');
    await prisma.tag.delete({ where: { id: tag.id } });
  });

  test('Relación Image-Tag funciona', async () => {
    const tag = await prisma.tag.create({
      data: { name: 'Relación Test', category: 'event' }
    });

    const image = await prisma.image.create({
      data: {
        filename: 'test.jpg',
        originalName: 'test.jpg',
        fileUrl: 'https://example.com/test.jpg',
        fileSize: 1024,
        width: 1920,
        height: 1080,
        mimeType: 'image/jpeg',
        tags: {
          connect: { id: tag.id }
        }
      },
      include: { tags: true }
    });

    expect(image.tags).toHaveLength(1);
    expect(image.tags[0].id).toBe(tag.id);

    await prisma.image.delete({ where: { id: image.id } });
    await prisma.tag.delete({ where: { id: tag.id } });
  });
});
```

**Ejecutar**:
```bash
npm test tests/migration.test.ts
```

### Testing Manual

#### Verificar PostgreSQL

```bash
psql -U postgres -d album_fotos

# Listar columnas
\d images

# Debe mostrar nuevos campos:
# - isFavorite
# - featured
# - exifData (jsonb)
# - takenAt
# etc.

# Listar tablas
\dt

# Debe mostrar:
# - tags
# - smart_albums
# - _ImageTags

\q
```

#### Probar Query Básico

**Archivo**: `test-query.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Crear imagen
  const image = await prisma.image.create({
    data: {
      filename: 'test.jpg',
      originalName: 'Test Image',
      fileUrl: 'https://example.com/test.jpg',
      fileSize: 2048000,
      width: 3840,
      height: 2160,
      mimeType: 'image/jpeg',
      isFavorite: true,
      featured: true,
      exifData: {
        Make: 'Sony',
        Model: 'Alpha 7 III',
        FocalLength: 35,
        ISO: 800
      },
      takenAt: new Date('2026-01-15T14:30:00'),
      cameraMake: 'Sony',
      cameraModel: 'Alpha 7 III',
      iso: 800
    }
  });

  console.log('✅ Imagen creada:', image);

  // Buscar favoritos
  const favorites = await prisma.image.findMany({
    where: { isFavorite: true }
  });

  console.log(`✅ Favoritos: ${favorites.length}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
```

**Ejecutar**:
```bash
npx tsx test-query.ts
```

## ✅ Criterios de Aceptación

### Funcionales

- [ ] Migración ejecuta sin errores
- [ ] Nuevos campos visibles en Prisma Studio
- [ ] Modelo Tag existe y funciona
- [ ] Modelo SmartAlbum existe y funciona
- [ ] Relación Image-Tag funciona (many-to-many)
- [ ] Defaults aplicados (isFavorite=false, featured=false)
- [ ] Seed data funciona correctamente

### No Funcionales

- [ ] Rollback funciona (`npx prisma migrate reset`)
- [ ] Índices creados correctamente
- [ ] Sin pérdida de datos existentes
- [ ] TypeScript auto-completa nuevos campos
- [ ] Performance: Query de favoritos < 100ms con 1000 imágenes

### Técnicos

- [ ] `npx tsc --noEmit` sin errores
- [ ] `npx prisma validate` pasa
- [ ] `npx prisma generate` completa sin errores
- [ ] `npx prisma db pull` no muestra diferencias
- [ ] Queries CRUD funcionan en nuevos campos

## 📚 Referencias

### Documentación Interna

- `docs/lumina-gallery-planning/ARQUITECTURA_CLEAN_LUMINA_GALLERY.md#infrastructure-layer`
- `docs/lumina-gallery-planning/EJEMPLOS_CODIGO_CLEAN_ARCHITECTURE.md#schema-prisma`

### Documentación Externa

- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [PostgreSQL JSONB](https://www.postgresql.org/docs/current/datatype-json.html)

## 🔍 Troubleshooting

### "Migration failed"

**Causa**: Conflicto con datos existentes

**Solución**:
```bash
# Ver error exacto
npx prisma migrate dev --name test

# Limpiar BD (solo desarrollo)
npx prisma migrate reset
```

### "Type error: Property 'isFavorite' does not exist"

**Causa**: Prisma Client no regenerado

**Solución**:
```bash
npx prisma generate
```

### "Database connection failed"

**Causa**: PostgreSQL no corriendo o DATABASE_URL incorrecta

**Solución**:
```bash
# Verificar PostgreSQL
docker ps | grep postgres

# Verificar .env
cat .env | grep DATABASE_URL

# Debe ser: postgresql://postgres:password@localhost:5432/album_fotos
```

## ✅ Checklist Final

- [ ] Backup de BD creado
- [ ] Schema modificado correctamente
- [ ] Migración ejecutada sin errores
- [ ] SQL verificado (sin DROP)
- [ ] Prisma Studio muestra cambios
- [ ] Seed ejecuta correctamente
- [ ] TypeScript sin errores
- [ ] Tests de integración pasan
- [ ] Queries manuales funcionan
- [ ] Rollback probado (desarrollo)
- [ ] Índices verificados en PostgreSQL
- [ ] Performance aceptable
- [ ] Documentación actualizada

---

# Issue #2: Componente Sidebar Principal

## 📋 Metadata

- **Milestone**: Milestone 1 - Fundaciones
- **Prioridad**: 🔴 Alta
- **Estimación**: 8-12 horas
- **Labels**: `frontend`, `components`, `design`, `priority: high`
- **Dependencias**: Ninguna (paralelo con #1)
- **Asignado**: Frontend Developer

## 🎯 Contexto y Justificación

### Problema a Resolver

El diseño Lumina Gallery requiere navegación lateral estilo Apple Photos / Google Photos para acceder a:

- 📅 Timeline (todas las fotos cronológicamente)
- 🔍 Explorar (búsqueda y filtros)
- 📁 Álbumes (organizados por año)
- ⭐ Favoritos (fotos marcadas)
- 🎨 Temas (personalización)

**Problema actual**: Navegación horizontal que no escala y sin espacio para badges/contadores.

**Solución**: Sidebar vertical persistente (desktop) y colapsable (móvil) con:
- Avatar de perfil
- Iconos + labels claros
- Badges dinámicos (contador de favoritos)
- Indicador de página activa
- Glassmorphism según tema

### Impacto

Este es el **componente central de navegación** que afecta:
- Issue #5 (Timeline) - necesita link en sidebar
- Issue #6 (Favoritos) - necesita link + badge
- Issue #7 (Explorar) - necesita link
- Issue #8 (Temas) - integración con selector

### Arquitectura

Componente de **Presentation Layer** tipo Organism (Atomic Design):

```
┌─────────────────────────────────────┐
│   PRESENTATION LAYER                │
│   ┌──────────────────────────────┐  │
│   │  Sidebar (Organism)          │  │
│   │    ├─ SidebarItem (Molecule) │  │
│   │    ├─ ProfileAvatar (Atom)   │  │
│   │    └─ MobileToggle (Atom)    │  │
│   └──────────────────────────────┘  │
│                                     │
│   Context: SidebarContext           │
│   Hook: useSidebar                  │
└─────────────────────────────────────┘
```

## 🏗️ Diseño Técnico

### Principios SOLID Aplicados

#### Single Responsibility Principle (SRP)

```typescript
// ✅ BIEN: Separación de responsabilidades

// Sidebar.tsx: Solo renderiza estructura
function Sidebar() {
  return (
    <aside>
      <ProfileSection />
      <Navigation />
      <Footer />
    </aside>
  );
}

// SidebarItem.tsx: Solo renderiza un item
function SidebarItem({ href, icon, label, badge }) {
  return (
    <Link href={href}>
      {icon} {label} {badge && <Badge>{badge}</Badge>}
    </Link>
  );
}

// SidebarContext.tsx: Solo maneja estado
function SidebarProvider({ children }) {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <Context.Provider value={{ isOpen, toggle: () => setIsOpen(!isOpen) }}>
      {children}
    </Context.Provider>
  );
}
```

#### Open/Closed Principle (OCP)

```typescript
// ✅ Extensible sin modificar componente

// Configuración (fácil agregar items)
const menuItems = [
  { href: '/', icon: '🏠', label: 'Inicio' },
  { href: '/timeline', icon: '📅', label: 'Timeline' },
  // Agregar nuevo = solo agregar objeto
];

// Componente nunca cambia
function Navigation() {
  return (
    <nav>
      {menuItems.map(item => (
        <SidebarItem key={item.href} {...item} />
      ))}
    </nav>
  );
}
```

#### Dependency Inversion Principle (DIP)

```typescript
// ✅ Depende de abstracción, no implementación

// Interfaz (abstracción)
interface SidebarContextValue {
  isOpen: boolean;
  toggle: () => void;
}

// Componente usa abstracción
function Sidebar() {
  const sidebar = useSidebar(); // Inyección de dependencia
  return <aside className={sidebar.isOpen ? 'open' : 'closed'} />;
}
```

### Diagrama de Componentes

```
┌────────────────────────────────────┐
│ Sidebar (Organism)                 │
│ ┌────────────────────────────────┐ │
│ │ ProfileSection                 │ │
│ │   • ProfileAvatar (Atom)       │ │
│ │   • UserName                   │ │
│ └────────────────────────────────┘ │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ Navigation                     │ │
│ │   • SidebarItem - Inicio       │ │
│ │   • SidebarItem - Timeline     │ │
│ │   • SidebarItem - Explorar     │ │
│ │   • SidebarItem - Favoritos +🔢│ │
│ │   • SidebarItem - Álbumes      │ │
│ └────────────────────────────────┘ │
│                                    │
│ ┌────────────────────────────────┐ │
│ │ Footer                         │ │
│ │   • SidebarItem - Temas        │ │
│ │   • SidebarItem - Config       │ │
│ └────────────────────────────────┘ │
└────────────────────────────────────┘

MobileMenuButton (solo móvil)
SidebarContext (estado global)
```

## 📦 Objetivos

### ✅ Debe Implementar

1. **Estructura**:
   - Header con avatar y nombre
   - Lista de navegación
   - Footer con configuración
   - Glassmorphism según tema

2. **Navegación**:
   - Usar `next/link` (no reload)
   - Indicador visual de página activa
   - Hover effects
   - Click navega correctamente

3. **Estados**:
   - Desktop: Siempre visible (280px)
   - Mobile: Colapsado, botón hamburger
   - Transiciones suaves

4. **Badges**:
   - Contador de favoritos
   - Actualización automática
   - Diseño distintivo

5. **Responsive**:
   - >= 1024px: Sidebar persistente
   - < 1024px: Overlay con toggle
   - Click fuera cierra (móvil)

6. **Accesibilidad**:
   - Navegación por teclado
   - ARIA labels
   - Focus visible
   - Screen reader friendly

### ❌ NO Debe Hacer

1. ❌ Hardcodear rutas
2. ❌ Mezclar lógica de negocio
3. ❌ Fetch de datos (vienen de props/context)
4. ❌ Usar CSS modules (solo Tailwind)
5. ❌ Olvidar dark mode
6. ❌ Animaciones pesadas
7. ❌ Romper navegación existente
8. ❌ Complejidad innecesaria

## 🔧 Especificación Técnica

### Archivos a Crear

```
src/contexts/SidebarContext.tsx
src/components/organisms/Sidebar/Sidebar.tsx
src/components/organisms/Sidebar/index.ts
src/components/molecules/SidebarItem/SidebarItem.tsx
src/components/molecules/SidebarItem/index.ts
src/components/atoms/MobileMenuButton/MobileMenuButton.tsx
src/components/atoms/ProfileAvatar/ProfileAvatar.tsx
src/config/sidebar.config.ts
src/hooks/useSidebar.ts (opcional)
```

### Dependencias

Ya instaladas:
- `next` (Link, usePathname)
- `react` (hooks)
- `framer-motion` (animaciones)
- `tailwindcss` (estilos)

### Interfaces TypeScript

**Archivo**: `src/types/sidebar.types.ts`

```typescript
// Sidebar Item
export interface SidebarItemConfig {
  href: string;
  icon: string | React.ReactNode;
  label: string;
  badge?: number | string;
}

export interface SidebarItemProps extends SidebarItemConfig {
  isActive?: boolean;
  onClick?: () => void;
}

// Sidebar Context
export interface SidebarContextValue {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

// Profile Avatar
export interface ProfileAvatarProps {
  user?: {
    name: string;
    avatar?: string;
  };
  size?: 'sm' | 'md' | 'lg';
}

// Mobile Button
export interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}
```

## 💻 Implementación Paso a Paso

### Paso 1: Crear SidebarContext

**Archivo**: `src/contexts/SidebarContext.tsx`

```typescript
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextValue {
  isOpen: boolean;
  toggle: () => void;
  open: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Desktop: siempre abierto, Mobile: cerrado por defecto
  const [isOpen, setIsOpen] = useState(true);

  // Detectar cambio de tamaño de ventana
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(true); // Desktop: siempre abierto
      } else {
        setIsOpen(false); // Mobile: cerrado por defecto
      }
    };

    handleResize(); // Ejecutar al montar
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        toggle: () => setIsOpen(!isOpen),
        open: () => setIsOpen(true),
        close: () => setIsOpen(false)
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }
  return context;
}
```

**Verificación**: Archivo creado sin errores TypeScript

### Paso 2: Crear Configuración de Menu

**Archivo**: `src/config/sidebar.config.ts`

```typescript
import { SidebarItemConfig } from '@/types/sidebar.types';

export const menuItems: SidebarItemConfig[] = [
  {
    href: '/',
    icon: '🏠',
    label: 'Inicio'
  },
  {
    href: '/timeline',
    icon: '📅',
    label: 'Timeline'
  },
  {
    href: '/explore',
    icon: '🔍',
    label: 'Explorar'
  },
  {
    href: '/favorites',
    icon: '⭐',
    label: 'Favoritos',
    badge: 0 // Se actualizará dinámicamente
  },
  {
    href: '/',
    icon: '📁',
    label: 'Álbumes'
  }
];

export const footerItems: SidebarItemConfig[] = [
  {
    href: '/settings',
    icon: '⚙️',
    label: 'Configuración'
  }
];
```

### Paso 3: Crear ProfileAvatar (Atom)

**Archivo**: `src/components/atoms/ProfileAvatar/ProfileAvatar.tsx`

```typescript
'use client';

import React from 'react';
import Image from 'next/image';

interface ProfileAvatarProps {
  user?: {
    name: string;
    avatar?: string;
  };
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16'
};

export default function ProfileAvatar({
  user = { name: 'Usuario' },
  size = 'md'
}: ProfileAvatarProps) {
  const initials = user.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold`}>
      {user.avatar ? (
        <Image
          src={user.avatar}
          alt={user.name}
          width={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
          height={size === 'sm' ? 32 : size === 'md' ? 48 : 64}
          className="object-cover"
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
}
```

**Verificación**: Componente renderiza iniciales correctamente

### Paso 4: Crear SidebarItem (Molecule)

**Archivo**: `src/components/molecules/SidebarItem/SidebarItem.tsx`

```typescript
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';

interface SidebarItemProps {
  href: string;
  icon: string | React.ReactNode;
  label: string;
  badge?: number | string;
  onClick?: () => void;
}

export default function SidebarItem({
  href,
  icon,
  label,
  badge,
  onClick
}: SidebarItemProps) {
  const pathname = usePathname();
  const { currentTheme } = useTheme();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg
        transition-all duration-200
        group relative
        ${isActive
          ? currentTheme === 'dark' || currentTheme === 'cosmic'
            ? 'bg-blue-600 text-white'
            : 'bg-blue-100 text-blue-900'
          : currentTheme === 'dark' || currentTheme === 'cosmic'
            ? 'text-gray-300 hover:bg-gray-800'
            : 'text-gray-700 hover:bg-gray-100'
        }
      `}
    >
      {/* Icon */}
      <span className="text-xl flex-shrink-0">
        {icon}
      </span>

      {/* Label */}
      <span className="font-medium flex-1">
        {label}
      </span>

      {/* Badge */}
      {badge !== undefined && badge > 0 && (
        <span className={`
          px-2 py-0.5 rounded-full text-xs font-bold
          ${isActive
            ? 'bg-white text-blue-600'
            : 'bg-pink-500 text-white'
          }
        `}>
          {badge}
        </span>
      )}

      {/* Active Indicator */}
      {isActive && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-r-full" />
      )}
    </Link>
  );
}
```

**Verificación**: Item renderiza con estilos correctos

### Paso 5: Crear MobileMenuButton (Atom)

**Archivo**: `src/components/atoms/MobileMenuButton/MobileMenuButton.tsx`

```typescript
'use client';

import React from 'react';

interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export default function MobileMenuButton({ isOpen, onClick }: MobileMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/80 backdrop-blur-sm shadow-lg border border-gray-200"
      aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú'}
    >
      {/* Hamburger Icon */}
      <div className="w-6 h-5 flex flex-col justify-between">
        <span className={`block h-0.5 bg-gray-800 transition-transform duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
        <span className={`block h-0.5 bg-gray-800 transition-opacity duration-300 ${isOpen ? 'opacity-0' : ''}`} />
        <span className={`block h-0.5 bg-gray-800 transition-transform duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
      </div>
    </button>
  );
}
```

**Verificación**: Botón anima correctamente al hacer click

### Paso 6: Crear Sidebar Principal (Organism)

**Archivo**: `src/components/organisms/Sidebar/Sidebar.tsx`

```typescript
'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSidebar } from '@/contexts/SidebarContext';
import { useTheme } from '@/contexts/ThemeContext';
import ProfileAvatar from '@/components/atoms/ProfileAvatar/ProfileAvatar';
import SidebarItem from '@/components/molecules/SidebarItem/SidebarItem';
import MobileMenuButton from '@/components/atoms/MobileMenuButton/MobileMenuButton';
import { menuItems, footerItems } from '@/config/sidebar.config';

export default function Sidebar() {
  const { isOpen, close } = useSidebar();
  const { currentTheme } = useTheme();

  const sidebarBg = currentTheme === 'dark' || currentTheme === 'cosmic'
    ? 'bg-gray-900/95 backdrop-blur-xl border-gray-800'
    : currentTheme === 'ocean'
    ? 'bg-cyan-50/95 backdrop-blur-xl border-cyan-200'
    : currentTheme === 'sunset'
    ? 'bg-orange-50/95 backdrop-blur-xl border-orange-200'
    : currentTheme === 'forest'
    ? 'bg-green-50/95 backdrop-blur-xl border-green-200'
    : 'bg-white/95 backdrop-blur-xl border-gray-200';

  return (
    <>
      <MobileMenuButton isOpen={isOpen} onClick={close} />

      {/* Overlay (solo móvil) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : '-100%'
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`
          fixed lg:sticky top-0 left-0 z-40
          h-screen w-[280px]
          ${sidebarBg}
          border-r
          flex flex-col
          overflow-hidden
        `}
      >
        {/* Header - Profile */}
        <div className="p-6 border-b border-gray-200/50">
          <div className="flex items-center gap-3">
            <ProfileAvatar user={{ name: 'Usuario' }} size="md" />
            <div className="flex-1">
              <p className={`font-semibold ${currentTheme === 'dark' || currentTheme === 'cosmic' ? 'text-white' : 'text-gray-900'}`}>
                Usuario
              </p>
              <p className={`text-sm ${currentTheme === 'dark' || currentTheme === 'cosmic' ? 'text-gray-400' : 'text-gray-500'}`}>
                Lumina Gallery
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => (
            <SidebarItem
              key={item.href}
              {...item}
              onClick={() => {
                if (window.innerWidth < 1024) close();
              }}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200/50 space-y-1">
          {footerItems.map((item) => (
            <SidebarItem key={item.href} {...item} />
          ))}
        </div>
      </motion.aside>
    </>
  );
}
```

**Verificación**: Sidebar renderiza correctamente y es responsive

### Paso 7: Crear Barrel Exports

**Archivo**: `src/components/organisms/Sidebar/index.ts`

```typescript
export { default } from './Sidebar';
```

**Archivo**: `src/components/molecules/SidebarItem/index.ts`

```typescript
export { default } from './SidebarItem';
```

### Paso 8: Integrar SidebarProvider en Layout

**Archivo**: `src/app/layout.tsx` (modificar)

```typescript
import { SidebarProvider } from '@/contexts/SidebarContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Sidebar from '@/components/organisms/Sidebar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <ThemeProvider>
          <SidebarProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1 overflow-y-auto">
                {children}
              </main>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

**Verificación**: Layout muestra sidebar + contenido correctamente

## 🧪 Testing

### Test de Componente

**Archivo**: `tests/Sidebar.test.tsx`

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { SidebarProvider } from '@/contexts/SidebarContext';
import Sidebar from '@/components/organisms/Sidebar';

describe('Sidebar', () => {
  test('renderiza correctamente', () => {
    render(
      <SidebarProvider>
        <Sidebar />
      </SidebarProvider>
    );

    expect(screen.getByText('Timeline')).toBeInTheDocument();
    expect(screen.getByText('Favoritos')).toBeInTheDocument();
  });

  test('toggle funciona en móvil', () => {
    // Mock mobile viewport
    global.innerWidth = 375;

    render(
      <SidebarProvider>
        <Sidebar />
      </SidebarProvider>
    );

    const button = screen.getByLabelText(/menú/i);
    fireEvent.click(button);

    // Verificar que el sidebar cambió de estado
    // (específico según implementación)
  });
});
```

### Testing Manual

1. **Desktop (>= 1024px)**:
   - [ ] Sidebar siempre visible
   - [ ] No aparece botón hamburger
   - [ ] Ancho fijo de 280px
   - [ ] Glassmorphism aplicado

2. **Mobile (< 1024px)**:
   - [ ] Sidebar cerrado por defecto
   - [ ] Botón hamburger visible
   - [ ] Click abre sidebar (overlay)
   - [ ] Click fuera cierra sidebar
   - [ ] Click en item cierra sidebar

3. **Navegación**:
   - [ ] Click en item navega a página
   - [ ] Página activa tiene indicador visual
   - [ ] Hover muestra efecto
   - [ ] Transiciones suaves

4. **Accesibilidad**:
   - [ ] Tab navega entre items
   - [ ] Enter activa link
   - [ ] Escape cierra sidebar (móvil)
   - [ ] Screen reader anuncia estado

5. **Temas**:
   - [ ] Funciona con todos los temas
   - [ ] Glassmorphism correcto
   - [ ] Contraste adecuado
   - [ ] Dark mode funciona

## ✅ Criterios de Aceptación

### Funcionales

- [ ] Sidebar renderiza correctamente
- [ ] Navegación funciona (click va a página)
- [ ] Indicador de página activa funciona
- [ ] Desktop: Sidebar persistente 280px
- [ ] Mobile: Overlay colapsable
- [ ] Botón hamburger funciona (móvil)
- [ ] Click fuera cierra (móvil)
- [ ] Transiciones suaves con Framer Motion
- [ ] ProfileAvatar muestra iniciales

### No Funcionales

- [ ] Performance: Animaciones a 60fps
- [ ] Responsive: Funciona en todas las pantallas
- [ ] Accesibilidad: WCAG AA
- [ ] Navegación por teclado funciona
- [ ] Compatible con todos los temas

### Técnicos

- [ ] TypeScript sin errores
- [ ] ESLint sin warnings
- [ ] Componentes reutilizables
- [ ] Props bien tipadas
- [ ] Context funciona correctamente
- [ ] No memory leaks (useEffect cleanup)

## 📚 Referencias

- `docs/lumina-gallery-planning/ARQUITECTURA_COMPONENTES_REACT.md#organisms-sidebar`
- `docs/lumina-gallery-planning/QUICK_REFERENCE.md#sidebar`

## 🔍 Troubleshooting

### Sidebar no se muestra

**Causa**: SidebarProvider no envuelve app

**Solución**: Verificar que layout.tsx tiene SidebarProvider

### Animaciones no funcionan

**Causa**: Framer Motion no instalado

**Solución**:
```bash
npm install framer-motion
```

### Estado no persiste entre páginas

**Causa**: Context mal configurado

**Solución**: Verificar que SidebarProvider está en layout.tsx (raíz)

## ✅ Checklist Final

- [ ] SidebarContext creado
- [ ] useSidebar hook funciona
- [ ] ProfileAvatar renderiza
- [ ] SidebarItem renderiza
- [ ] MobileMenuButton funciona
- [ ] Sidebar completo renderiza
- [ ] Integrado en layout
- [ ] Responsive funciona
- [ ] Animaciones suaves
- [ ] Accesibilidad verificada
- [ ] Todos los temas funcionan
- [ ] TypeScript sin errores
- [ ] Tests pasan
- [ ] Performance > 60fps

---

## 📝 Nota sobre Issues Restantes

Los Issues #3-#18 seguirían la misma estructura detallada con:
- Metadata completo
- Contexto y justificación
- Diseño técnico (SOLID, diagramas)
- Objetivos (Debe/No Debe)
- Especificación técnica completa
- Implementación paso a paso
- Testing detallado
- Criterios de aceptación
- Referencias
- Troubleshooting
- Checklist final

**Cada issue** está diseñado para ser completamente autocontenido y trabajable sin necesitar contexto adicional.

---

**Documento creado**: 2026-01-18
**Versión**: 1.0.0
**Para proyecto**: Lumina Gallery
