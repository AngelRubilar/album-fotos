# Fase 3: Mejoras de Rendimiento

## Resumen
Optimizar la carga de imagenes con LQIP placeholders, agregar virtualizacion para albums grandes, implementar Service Worker y convertir la app en PWA.

## Dependencia
- **Independiente** de Fase 1 (puede hacerse en paralelo)

---

## Paso 3.1: LQIP (Low Quality Image Placeholders)

### Concepto
Generar una imagen de ~20px en base64 durante el upload que sirva como placeholder blur mientras carga la imagen real.

### 3.1.1 Modificar schema de Prisma

**Archivo**: `prisma/schema.prisma`

Agregar campo al modelo Image:
```prisma
model Image {
  // ... campos existentes ...
  blurDataUrl  String?   // LQIP base64 placeholder (~20px)
}
```

Ejecutar migration:
```bash
npx prisma migrate dev --name add-blur-data-url
```

### 3.1.2 Generar blurDataUrl en el upload

**Archivo**: `src/app/api/upload/route.ts`

Despues de generar el thumbnail, agregar generacion de LQIP:

```typescript
import sharp from 'sharp';

// Dentro del loop de procesamiento de cada imagen:
const blurBuffer = await sharp(filePath)
  .resize(20, 20, { fit: 'inside' })
  .jpeg({ quality: 40 })
  .toBuffer();

const blurDataUrl = `data:image/jpeg;base64,${blurBuffer.toString('base64')}`;

// Guardar en la DB junto con los demas campos:
await prisma.image.create({
  data: {
    // ... campos existentes ...
    blurDataUrl,
  },
});
```

### 3.1.3 Script para generar LQIP de imagenes existentes

**Archivo nuevo**: `scripts/generate-blur-placeholders.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const images = await prisma.image.findMany({
    where: { blurDataUrl: null },
    select: { id: true, fileUrl: true },
  });

  console.log(`Procesando ${images.length} imagenes...`);

  for (const image of images) {
    try {
      const filePath = path.join(process.cwd(), 'public', image.fileUrl);
      const blurBuffer = await sharp(filePath)
        .resize(20, 20, { fit: 'inside' })
        .jpeg({ quality: 40 })
        .toBuffer();

      const blurDataUrl = `data:image/jpeg;base64,${blurBuffer.toString('base64')}`;

      await prisma.image.update({
        where: { id: image.id },
        data: { blurDataUrl },
      });

      console.log(`OK: ${image.id}`);
    } catch (err) {
      console.error(`Error ${image.id}:`, err);
    }
  }
}

main().then(() => prisma.$disconnect());
```

Agregar al package.json:
```json
"generate-blur": "tsx scripts/generate-blur-placeholders.ts"
```

### 3.1.4 Usar blurDataUrl en los componentes

**Archivo**: `src/app/album/[year]/page.tsx`

```tsx
// En las imagenes del masonry y grid:
<Image
  src={image.thumbnailUrl || image.fileUrl}
  alt={image.originalName || ''}
  placeholder={image.blurDataUrl ? 'blur' : 'empty'}
  blurDataURL={image.blurDataUrl || undefined}
  // ... resto de props
/>
```

### 3.1.5 Incluir blurDataUrl en la respuesta de la API

**Archivo**: `src/app/api/albums/[id]/images/route.ts`

Asegurarse de que el select incluya `blurDataUrl`:
```typescript
select: {
  // ... campos existentes ...
  blurDataUrl: true,
}
```

---

## Paso 3.2: Virtualizacion del Masonry para albums grandes

### Concepto
Cuando un album tiene muchas fotos (100+), el DOM crece demasiado. Virtualizar para renderizar solo las fotos visibles.

### 3.2.1 Instalar dependencia

```bash
npm install @tanstack/react-virtual
```

### 3.2.2 Crear componente VirtualMasonry

**Archivo nuevo**: `src/components/VirtualMasonry.tsx`

```typescript
'use client';

import { useRef, useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import Image from 'next/image';

interface VirtualMasonryProps {
  images: any[];
  onImageClick: (index: number) => void;
  onDeleteImage: (id: string) => void;
  columns?: number;
}

export default function VirtualMasonry({
  images,
  onImageClick,
  onDeleteImage,
  columns = 4,
}: VirtualMasonryProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  // Distribuir imagenes en columnas
  const columnData = useMemo(() => {
    const cols: any[][] = Array.from({ length: columns }, () => []);
    images.forEach((img, i) => {
      cols[i % columns].push({ ...img, originalIndex: i });
    });
    return cols;
  }, [images, columns]);

  // Virtualizar por filas (cada fila = una imagen por columna)
  const maxRows = Math.max(...columnData.map(c => c.length));

  const virtualizer = useVirtualizer({
    count: maxRows,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 300, // altura estimada por fila
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-[calc(100vh-200px)] overflow-y-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
            className="flex gap-3"
          >
            {columnData.map((col, colIdx) => {
              const img = col[virtualRow.index];
              if (!img) return <div key={colIdx} className="flex-1" />;
              return (
                <div key={img.id} className="flex-1 group">
                  <div
                    className="photo-card cursor-pointer relative"
                    onClick={() => onImageClick(img.originalIndex)}
                  >
                    <Image
                      src={img.thumbnailUrl || img.fileUrl}
                      alt={img.originalName || ''}
                      width={600}
                      height={0}
                      className="w-full h-auto block rounded-xl"
                      placeholder={img.blurDataUrl ? 'blur' : 'empty'}
                      blurDataURL={img.blurDataUrl || undefined}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 3.2.3 Usar condicionalmente

Solo activar virtualizacion cuando hay muchas imagenes:

```tsx
// En album/[year]/page.tsx:
{images.length > 100 ? (
  <VirtualMasonry
    images={images}
    onImageClick={(i) => { setGalleryIndex(i); setGalleryOpen(true); }}
    onDeleteImage={deleteImage}
  />
) : (
  // Masonry normal existente
  <div className="masonry">...</div>
)}
```

---

## Paso 3.3: Preload de imagenes adyacentes en galeria

**Archivo**: `src/components/ImageGallery.tsx`

### Agregar preload de siguiente/anterior:
```typescript
// Dentro del useEffect del ImageGallery:
useEffect(() => {
  // Preload imagen anterior y siguiente
  const preloadIndexes = [idx - 1, idx + 1].filter(i => i >= 0 && i < images.length);
  preloadIndexes.forEach(i => {
    const img = new window.Image();
    img.src = images[i].fileUrl;
  });
}, [idx, images]);
```

---

## Paso 3.4: Optimizar re-renders con React.memo

### Componentes a memorizar:
- `AlbumPreview` - ya tiene memo (OK)
- `ImageGallery` - ya tiene memo (OK)
- Cards individuales de album (extraer a componente propio con memo)

### 3.4.1 Crear componente AlbumCard

**Archivo nuevo**: `src/components/AlbumCard.tsx`

Extraer la card de album de `page.tsx` a un componente separado con memo para evitar re-renders innecesarios cuando se actualiza el estado del padre.

```tsx
import { memo } from 'react';
import Link from 'next/link';
import AlbumPreview from './AlbumPreview';

interface AlbumCardProps {
  year: number;
  totalImages: number;
  albumCount: number;
  theme: any;
}

const AlbumCard = memo(function AlbumCard({ year, totalImages, albumCount, theme: t }: AlbumCardProps) {
  return (
    <Link href={`/album/${year}`} className="group block">
      <div className={`rounded-2xl overflow-hidden ${t.glassCard} glass-card glass-glow`}>
        {/* ... card content ... */}
      </div>
    </Link>
  );
});

export default AlbumCard;
```

---

## Paso 3.5: PWA - Progressive Web App

### 3.5.1 Crear manifest.json

**Archivo nuevo**: `public/manifest.json`

```json
{
  "name": "Album de Fotos",
  "short_name": "Fotos",
  "description": "Tu galeria personal de recuerdos",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0f",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 3.5.2 Agregar meta tags en layout

**Archivo**: `src/app/layout.tsx`

```tsx
export const metadata: Metadata = {
  title: "Album de Fotos",
  description: "Tu galeria personal de recuerdos",
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Album de Fotos',
  },
};
```

### 3.5.3 Service Worker basico

**Archivo nuevo**: `public/sw.js`

```javascript
const CACHE_NAME = 'album-fotos-v1';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  // Cache-first para thumbnails
  if (event.request.url.includes('/uploads/thumbnails/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Network-first para todo lo demas
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
```

### 3.5.4 Registrar Service Worker

**Archivo**: `src/app/layout.tsx`

Agregar script de registro:
```tsx
<script
  dangerouslySetInnerHTML={{
    __html: `
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js');
      }
    `,
  }}
/>
```

---

## Paso 3.6: Optimizar carga de API

### 3.6.1 Reducir payload de imagenes

**Archivo**: `src/app/api/albums/[id]/images/route.ts`

Solo enviar los campos necesarios para el grid:
```typescript
const images = await prisma.image.findMany({
  select: {
    id: true,
    fileUrl: true,
    thumbnailUrl: true,
    originalName: true,
    description: true,
    width: true,
    height: true,
    blurDataUrl: true,
    // NO enviar: fileSize, mimeType, uploadedAt (solo se necesitan en la galeria)
  },
});
```

### 3.6.2 Endpoint separado para metadata de imagen

Crear endpoint `/api/images/[id]` GET que devuelva todos los campos, usado solo cuando se abre el panel de info en la galeria.

---

## Checklist de Implementacion

- [ ] 3.1.1 Agregar campo blurDataUrl al schema
- [ ] 3.1.2 Generar LQIP en upload
- [ ] 3.1.3 Script para imagenes existentes
- [ ] 3.1.4 Usar blurDataUrl en componentes
- [ ] 3.1.5 Incluir en respuesta API
- [ ] 3.2.1 Instalar @tanstack/react-virtual
- [ ] 3.2.2 Crear VirtualMasonry
- [ ] 3.2.3 Integrar condicionalmente
- [ ] 3.3 Preload de imagenes adyacentes
- [ ] 3.4 Extraer AlbumCard con memo
- [ ] 3.5.1 Crear manifest.json
- [ ] 3.5.2 Meta tags PWA
- [ ] 3.5.3 Service Worker
- [ ] 3.5.4 Registrar SW
- [ ] 3.6 Optimizar payload API
- [ ] Ejecutar script de blur para imagenes existentes
- [ ] Probar PWA con Lighthouse

## Dependencias
```json
{
  "@tanstack/react-virtual": "^3.x"
}
```
