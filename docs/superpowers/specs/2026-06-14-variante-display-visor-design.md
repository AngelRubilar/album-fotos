# Spec: Variante "display" para el visor (velocidad)

**Fecha:** 2026-06-14
**Estado:** Aprobado (diseño)
**Alcance:** Generar una versión optimizada de tamaño medio ("display") de cada foto y usarla en el visor (lightbox), en vez del original a tamaño completo, para que abrir y deslizar fotos sea rápido. El original se conserva intacto.

---

## 1. Contexto y problema

El visor (`src/components/ImageGallery.tsx`) carga la **imagen original completa**:
- Imagen principal: `<img src={img.fileUrl}>` (línea ~357) → el original (JPEG/HEIC de varios MB).
- Precarga de las dos adyacentes (línea ~243): también el original.

Abrir una foto baja ~4-8 MB y precarga otros ~8-16 MB. En el teléfono con datos esto es lento y el deslizamiento se traba. Es lo opuesto a la "velocidad tipo Google Fotos" que se busca.

### Objetivo
Que abrir una foto y deslizar entre fotos sea instantáneo, bajando ~400 KB en vez de varios MB, sin perder el acceso al original a calidad total.

### Fuera de alcance (YAGNI)
- `srcset`/variantes múltiples por foto (una sola variante display alcanza).
- Cambios de infraestructura (volúmenes/rutas nuevas) — se reutiliza lo existente.

---

## 2. Decisiones tomadas

| Decisión | Elección |
|---|---|
| Tamaño de la variante display | **WebP, lado largo máx 2048px**, calidad ~82, sin agrandar (`withoutEnlargement`) |
| Dónde se guarda | Junto a la miniatura, en el árbol de thumbnails, con sufijo `.display.webp` |
| Cómo se sirve | Por la ruta catch-all `/thumbnails/[...path]` existente (sin ruta ni volumen nuevo) |
| Fotos existentes | **Backfill** de las 583 con un script idempotente |

---

## 3. Estructura en disco

Reutiliza el bind mount de thumbnails (sin tocar `docker-compose.yml`):

```
public/thumbnails/2025/viaje-a-la-playa/
  IMG_1234.webp           ← miniatura 400px (grilla)        [existente]
  IMG_1234.display.webp   ← display 2048px (visor)          [NUEVO]
```

URL de la display: `/thumbnails/2025/viaje-a-la-playa/IMG_1234.display.webp`, servida por el handler de `src/app/thumbnails/[...path]/route.ts` (que ya sirve cualquier archivo bajo `THUMBS_BASE` con sanitización). No requiere cambios en el serving.

---

## 4. Modelo de datos

- Añadir `displayUrl String?` al modelo `Image` (`prisma/schema.prisma`).
- Migración: en producción se aplica con `ALTER TABLE "images" ADD COLUMN IF NOT EXISTS "displayUrl" TEXT;` (idempotente y seguro, como se hizo con `Album.folderName`, para no chocar con el drift del historial de migraciones). En el repo se versiona la migración Prisma correspondiente (solo el `ADD COLUMN`).
- El cliente Prisma se regenera con el campo nuevo.

---

## 5. Generación de la variante (lib)

Nueva función en `src/lib/thumbnail.ts`:

```ts
export async function generateDisplayFromBuffer(buffer: Buffer, outputPath: string): Promise<void>
```
- `sharp(buffer).rotate().resize(2048, 2048, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(outputPath)`.
- Crea el directorio de salida si no existe.

Helper de nombre (en `src/lib/storage.ts` o junto a thumbnail): dado el nombre destino del original, la display es `<base>.display.webp`. Centralizar para que upload, backfill y URLs coincidan.

---

## 6. Upload

En `src/app/api/upload/route.ts`, dentro del loop, tras generar la miniatura:
- Calcular `displayFilename = <base de destName>.display.webp`.
- `generateDisplayFromBuffer(processBuffer, path.join(thumbsDir, displayFilename))` (usa el mismo `processBuffer` que la miniatura → funciona también para HEIC ya convertido).
- `displayUrl = thumbUrl(year, folderName, displayFilename)`. Si la generación falla, `displayUrl = null` (el visor cae al original).
- Guardar `displayUrl` en la fila `Image`.

---

## 7. Backfill de lo existente

Script `scripts/generate-display-variants.ts` (idempotente):
- Por cada `Image` con `displayUrl` nulo (o cuyo archivo display no exista en disco):
  - Leer el original desde su ruta (`fileUrl`). Si es HEIC (extensión/mime), convertir a JPEG en memoria con `heic-convert` (igual que el upload).
  - Generar la display 2048px en `<thumbsDir del álbum>/<base>.display.webp`.
  - Setear `displayUrl` en la BD.
- Idempotente: si ya existe el archivo y la URL, saltar.
- Se corre una vez en el server, en un contenedor node de un solo uso (mismo patrón que la migración de carpetas).

---

## 8. Visor y tipos

`src/components/ImageGallery.tsx`:
- Imagen principal: `src={image.displayUrl || image.fileUrl}` (línea ~357).
- Precarga de adyacentes (línea ~243): usar `displayUrl || fileUrl`.
- La acción de descargar/ver original (si existe) sigue usando `fileUrl`.

Tipos y API:
- Añadir `displayUrl?: string | null` a `ImageData` (ImageGallery) y a `AlbumImage` (`src/types/index.ts`).
- Incluir `displayUrl` en los `select`/respuestas que alimentan el visor: `src/app/api/albums/[id]/images/route.ts` y `src/app/api/images/[id]/route.ts`.

---

## 9. Casos borde

- Foto sin display (recién subida con fallo, o pre-backfill): el visor cae a `fileUrl` (funciona, solo más pesado).
- Imagen más chica que 2048px: `withoutEnlargement` evita agrandarla (la display puede igualar al original en px, pero re-encodeada a WebP → más liviana).
- HEIC: convertir antes de generar la display (reutiliza la lógica del upload).
- Colisión de nombre: la display deriva del `destName` ya único del original, así que no colisiona.

---

## 10. Componentes nuevos / tocados

**Nuevo:** `scripts/generate-display-variants.ts`.
**Tocados:**
- `prisma/schema.prisma` (+ migración) — `Image.displayUrl`.
- `src/lib/thumbnail.ts` — `generateDisplayFromBuffer`.
- `src/lib/storage.ts` — helper de nombre `.display.webp` (o en thumbnail).
- `src/app/api/upload/route.ts` — generar display + guardar `displayUrl`.
- `src/app/api/albums/[id]/images/route.ts`, `src/app/api/images/[id]/route.ts` — incluir `displayUrl`.
- `src/components/ImageGallery.tsx` — usar `displayUrl` en visor y preload.
- `src/types/index.ts` — `displayUrl` en `AlbumImage`.

El borrado de imagen (`api/images/[id]`) también debería borrar el archivo `.display.webp` además del original y la miniatura (evitar huérfanos).

---

## 11. Pruebas / verificación

- **Unit:** helper de nombre de display (`<base>.display.webp`).
- **E2E (dev):** subir una foto → existe `<base>.display.webp` en el árbol de thumbnails, `displayUrl` seteada, y el visor (HTML) referencia la URL display; el original intacto (sha256). Probar también con HEIC.
- **Backfill:** correr en una copia con fotos planas migradas; verificar que genera displays para todas e idempotencia (segunda corrida no hace nada).
- `pnpm test`, `tsc --noEmit`, `pnpm lint`, `pnpm build` en verde.

---

## 12. Despliegue

1. Desplegar el código (build + recreate).
2. `ALTER TABLE "images" ADD COLUMN IF NOT EXISTS "displayUrl" TEXT;` en la BD de producción.
3. Correr el backfill una vez en un contenedor node (con los volúmenes montados), respaldo previo opcional (no destruye originales, solo agrega derivados).
4. Verificar que el visor carga la versión display (peso ~400 KB) y el original sigue disponible.

---

## 13. Riesgos

- Espacio en disco: ~250 MB extra para 583 displays (sobre 2.3 GB de originales) — trivial.
- Tiempo de backfill: unos minutos (lee y re-encodea 583 imágenes).
- Consistencia: el borrado de imagen debe incluir el `.display.webp` (cubierto en §10).
