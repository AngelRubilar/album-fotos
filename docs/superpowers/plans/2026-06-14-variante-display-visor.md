# Variante "display" para el visor — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generar una versión WebP de máx 2048px ("display") de cada foto y usarla en el visor (en vez del original de varios MB), conservando el original intacto, para que abrir/deslizar fotos sea rápido.

**Architecture:** La display es un tercer derivado, hermano de la miniatura, guardado en el árbol de thumbnails como `<base>.display.webp` y servido por la ruta `/thumbnails/[...path]` existente (sin volumen ni ruta nuevos). Se genera en el upload (desde el mismo buffer procesable, sirve para HEIC) y se rellena para las fotos existentes con un script. El visor usa `Image.displayUrl` con fallback al original.

**Tech Stack:** Next.js 15, Prisma 6 + PostgreSQL, Sharp, heic-convert, Vitest, pnpm.

---

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `src/lib/storage.ts` (mod) | `displayName(name)` → `<base>.display.webp` + test |
| `src/lib/thumbnail.ts` (mod) | `generateDisplayFromBuffer(buffer, outputPath)` |
| `prisma/schema.prisma` (mod) + migración manual | `Image.displayUrl` |
| `src/app/api/upload/route.ts` (mod) | generar display + guardar `displayUrl` |
| `src/app/api/albums/[id]/images/route.ts` (mod) | incluir `displayUrl` en la respuesta |
| `src/app/api/images/[id]/route.ts` (mod) | incluir `displayUrl` (GET) + borrar `.display.webp` (DELETE) |
| `src/types/index.ts` (mod) | `displayUrl` en `AlbumImage` |
| `src/components/ImageGallery.tsx` (mod) | usar `displayUrl` en imagen principal + preload; `displayUrl` en `ImageData` |
| `scripts/generate-display-variants.ts` (nuevo) | backfill de fotos existentes |

**Entorno:** Hay (o el controlador levanta) un Postgres de dev en el puerto **5433**: `DATABASE_URL="postgresql://postgres:password@localhost:5433/album_fotos?schema=public"`. El schema de dev se sincroniza con `prisma db push` (NO `migrate dev`, por el bug de orden de migraciones en BD fresca).

---

## Task 1: `displayName` + `generateDisplayFromBuffer`

**Files:**
- Modify: `src/lib/storage.ts`
- Test: `src/lib/storage.test.ts`
- Modify: `src/lib/thumbnail.ts`

- [ ] **Step 1: Test que falla para `displayName`**

Añadir a `src/lib/storage.test.ts`:

```ts
import { displayName } from './storage';

describe('displayName', () => {
  test('reemplaza la extensión por .display.webp', () => {
    expect(displayName('IMG_1234.jpg')).toBe('IMG_1234.display.webp');
    expect(displayName('foto.HEIC')).toBe('foto.display.webp');
  });
  test('sin extensión, agrega .display.webp', () => {
    expect(displayName('archivo')).toBe('archivo.display.webp');
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `pnpm test`
Expected: FAIL (displayName no definido)

- [ ] **Step 3: Implementar `displayName`**

Añadir a `src/lib/storage.ts` (ya importa `path`):

```ts
/** Nombre del archivo "display" derivado del nombre destino: IMG_1.jpg → IMG_1.display.webp */
export function displayName(name: string): string {
  const ext = path.extname(name);
  return name.slice(0, name.length - ext.length) + '.display.webp';
}
```

- [ ] **Step 4: Implementar `generateDisplayFromBuffer`**

Añadir a `src/lib/thumbnail.ts` (junto a `generateThumbnailFromBuffer`):

```ts
const DISPLAY_CONFIG = {
  maxSize: 2048,
  quality: 82,
};

/** Genera la versión "display" (máx 2048px WebP) para el visor, desde un buffer. */
export async function generateDisplayFromBuffer(
  buffer: Buffer,
  outputPath: string
): Promise<void> {
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  await sharp(buffer)
    .rotate()
    .resize(DISPLAY_CONFIG.maxSize, DISPLAY_CONFIG.maxSize, {
      fit: 'inside',
      withoutEnlargement: true,
    })
    .webp({ quality: DISPLAY_CONFIG.quality })
    .toFile(outputPath);
}
```

- [ ] **Step 5: Correr tests y tsc**

Run: `pnpm test && npx tsc --noEmit`
Expected: PASS, exit 0

- [ ] **Step 6: Commit**

```bash
git add src/lib/storage.ts src/lib/storage.test.ts src/lib/thumbnail.ts
git commit -m "feat: displayName y generateDisplayFromBuffer (variante 2048px)"
```

---

## Task 2: Schema `Image.displayUrl` + migración

**Files:**
- Modify: `prisma/schema.prisma` (modelo `Image`)
- Create: `prisma/migrations/20260614000000_add_image_display_url/migration.sql`

- [ ] **Step 1: Añadir el campo al schema**

En `prisma/schema.prisma`, en el modelo `Image`, tras `thumbnailUrl`:

```prisma
  displayUrl      String?
```

- [ ] **Step 2: Crear la migración manualmente** (no usar `migrate dev`)

Create `prisma/migrations/20260614000000_add_image_display_url/migration.sql`:

```sql
-- AlterTable
ALTER TABLE "public"."images" ADD COLUMN     "displayUrl" TEXT;
```

- [ ] **Step 3: Regenerar el cliente Prisma**

Run: `npx prisma generate`
Expected: "Generated Prisma Client"

- [ ] **Step 4: Aplicar a la BD de dev y verificar tipos**

Run:
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5433/album_fotos?schema=public" pnpm exec prisma db push --skip-generate
npx tsc --noEmit
```
Expected: db push aplica el cambio; tsc exit 0.

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: campo Image.displayUrl + migración"
```

---

## Task 3: Upload genera la display y guarda `displayUrl`

**Files:**
- Modify: `src/app/api/upload/route.ts`

- [ ] **Step 1: Imports**

En `src/app/api/upload/route.ts`, añadir `displayName` al import de `@/lib/storage` y `generateDisplayFromBuffer` al import de `@/lib/thumbnail`:

```ts
import { generateThumbnailFromBuffer, generateDisplayFromBuffer } from '@/lib/thumbnail';
// y en el import de @/lib/storage, añadir displayName a la lista existente
```

- [ ] **Step 2: Generar la display tras la miniatura**

En el loop, justo después del bloque que genera la miniatura (`generateThumbnailFromBuffer(...)`) y antes del bloque de dimensiones, añadir:

```ts
      // Versión "display" (2048px WebP) para el visor
      let displayUrlValue: string | null = thumbUrl(year, folderName, displayName(destName));
      try {
        await generateDisplayFromBuffer(processBuffer, path.join(thumbsDir, displayName(destName)));
      } catch {
        console.warn(`No se pudo generar display para ${destName}`);
        displayUrlValue = null;
      }
```

- [ ] **Step 3: Guardar `displayUrl` en la fila**

En el `data` de `prisma.image.create`, añadir tras `thumbnailUrl`:

```ts
          displayUrl: displayUrlValue,
```

- [ ] **Step 4: Verificar tsc y lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: exit 0, sin errores nuevos

- [ ] **Step 5: Commit**

```bash
git add src/app/api/upload/route.ts
git commit -m "feat: el upload genera la variante display y guarda displayUrl"
```

---

## Task 4: Exponer `displayUrl` en API y tipos

**Files:**
- Modify: `src/types/index.ts` (interface `AlbumImage`)
- Modify: `src/app/api/albums/[id]/images/route.ts`
- Modify: `src/app/api/images/[id]/route.ts` (GET)

- [ ] **Step 1: Tipo**

En `src/types/index.ts`, en la interface `AlbumImage`, añadir junto a `thumbnailUrl`:

```ts
  displayUrl?: string | null;
```

- [ ] **Step 2: Incluir en la respuesta de imágenes del álbum**

En `src/app/api/albums/[id]/images/route.ts`, localizar el `select` (o el mapeo) de imágenes y asegurar que `displayUrl` se incluye. Si usa `select`, añadir `displayUrl: true`; si devuelve el objeto completo (sin select), ya viene. Verificar leyendo el archivo y ajustar para que `displayUrl` llegue al cliente.

- [ ] **Step 3: Incluir en `GET /api/images/[id]`**

En `src/app/api/images/[id]/route.ts` (GET), asegurar que la respuesta incluye `displayUrl` (igual criterio que Step 2).

- [ ] **Step 4: Verificar tsc y lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: exit 0

- [ ] **Step 5: Commit**

```bash
git add src/types/index.ts src/app/api/albums/[id]/images/route.ts src/app/api/images/[id]/route.ts
git commit -m "feat: exponer displayUrl en API y tipos"
```

---

## Task 5: El visor usa la display

**Files:**
- Modify: `src/components/ImageGallery.tsx`

- [ ] **Step 1: Tipo `ImageData`**

En `src/components/ImageGallery.tsx`, en la interface `ImageData` (cerca de la línea 9, donde están `fileUrl`/`thumbnailUrl`), añadir:

```ts
  displayUrl?: string | null;
```

- [ ] **Step 2: Imagen principal usa la display**

Localizar el `<img src={img.fileUrl}` de la imagen principal del visor (≈ línea 357) y cambiarlo a:

```tsx
                    src={img.displayUrl || img.fileUrl}
```

- [ ] **Step 3: Preload de adyacentes usa la display**

Localizar la precarga (≈ línea 243, `p.src = images[i].fileUrl`) y cambiarla a:

```ts
      .forEach(i => { const p = new window.Image(); p.src = images[i].displayUrl || images[i].fileUrl; });
```

(Mantener la lógica de descarga/ver original con `fileUrl` si existe — NO cambiarla.)

- [ ] **Step 4: Verificar tsc, lint y build**

Run: `npx tsc --noEmit && pnpm lint && pnpm build`
Expected: exit 0

- [ ] **Step 5: Commit**

```bash
git add src/components/ImageGallery.tsx
git commit -m "feat: el visor carga la variante display (preload incluido)"
```

---

## Task 6: Borrar imagen elimina también la display

**Files:**
- Modify: `src/app/api/images/[id]/route.ts` (DELETE)

- [ ] **Step 1: Borrar el archivo `.display.webp`**

En el bloque DELETE que borra archivos físicos (tras borrar el thumbnail), añadir el borrado de la display. La display vive junto al thumbnail; su URL es `thumbnailUrl` con sufijo `.display.webp`, pero es más robusto derivarla de `displayUrl` si está guardada. Implementar:

```ts
    if (image.displayUrl && image.displayUrl.startsWith('/thumbnails/')) {
      try {
        await unlink(safeResolve(THUMBS_BASE, image.displayUrl.replace(/^\/thumbnails\//, '')));
      } catch { console.warn('Display no encontrada:', image.displayUrl); }
    }
```

(`safeResolve` y `THUMBS_BASE` ya se importan en este archivo para el borrado de la miniatura; si no, añadirlos al import de `@/lib/storage`.)

- [ ] **Step 2: Verificar tsc y lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: exit 0

- [ ] **Step 3: Commit**

```bash
git add src/app/api/images/[id]/route.ts
git commit -m "fix: borrar imagen elimina también su variante display"
```

---

## Task 7: Script de backfill

**Files:**
- Create: `scripts/generate-display-variants.ts`
- Modify: `package.json` (script)

- [ ] **Step 1: Implementar el script**

Create `scripts/generate-display-variants.ts`:

```ts
import { PrismaClient } from '@prisma/client';
import { readFile, access } from 'fs/promises';
import path from 'path';
import convert from 'heic-convert';
import { generateDisplayFromBuffer } from '../src/lib/thumbnail';
import { displayName, albumThumbDir, thumbUrl, UPLOADS_BASE } from '../src/lib/storage';

const prisma = new PrismaClient();
const exists = (p: string) => access(p).then(() => true).catch(() => false);

function isHeicName(name: string): boolean {
  const ext = path.extname(name).toLowerCase();
  return ext === '.heic' || ext === '.heif';
}

async function main() {
  const images = await prisma.image.findMany({ include: { album: true } });
  let done = 0, skipped = 0, failed = 0;

  for (const img of images) {
    if (!img.album?.folderName) { skipped++; continue; }
    const { year, folderName } = { year: img.album.year, folderName: img.album.folderName };
    const origName = path.basename(img.fileUrl);
    const dispName = displayName(origName);
    const outPath = path.join(albumThumbDir(year, folderName), dispName);
    const wantUrl = thumbUrl(year, folderName, dispName);

    if (img.displayUrl === wantUrl && (await exists(outPath))) { skipped++; continue; }

    const srcPath = path.join(UPLOADS_BASE, year.toString(), folderName, origName);
    if (!(await exists(srcPath))) { console.warn(`sin original: ${img.fileUrl}`); failed++; continue; }

    try {
      let buf = await readFile(srcPath);
      if (isHeicName(origName)) {
        buf = Buffer.from(await convert({ buffer: buf, format: 'JPEG', quality: 0.92 }));
      }
      await generateDisplayFromBuffer(buf, outPath);
      await prisma.image.update({ where: { id: img.id }, data: { displayUrl: wantUrl } });
      done++;
      if (done % 50 === 0) console.log(`${done} displays generadas...`);
    } catch (e) {
      console.error(`falló ${img.fileUrl}:`, (e as Error).message);
      failed++;
    }
  }
  console.log(`Backfill display completo. generadas=${done} saltadas=${skipped} fallidas=${failed}`);
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
```

- [ ] **Step 2: Añadir script a package.json**

En `"scripts"`:

```json
"generate-display": "tsx scripts/generate-display-variants.ts",
```

- [ ] **Step 3: Verificar tsc**

Run: `npx tsc --noEmit`
Expected: exit 0

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-display-variants.ts package.json
git commit -m "feat: script de backfill de variantes display"
```

---

## Task 8: Verificación final (E2E)

**Files:** ninguno (verificación)

- [ ] **Step 1: Suite estática**

Run: `pnpm test && npx tsc --noEmit && pnpm lint && pnpm build`
Expected: todo en verde.

- [ ] **Step 2: E2E con dev server (lo hace el controlador)**

Con Postgres dev (5433) y `pnpm dev`: crear álbum, subir una foto, y verificar:
- existe `public/thumbnails/<año>/<slug>/<base>.display.webp`,
- la fila tiene `displayUrl` poblada,
- `GET /api/albums/<id>/images` devuelve `displayUrl`,
- el original sigue intacto (sha256).
Repetir con un HEIC (debe generar la display vía conversión).

- [ ] **Step 3: Commit (si hubo ajustes)**

```bash
git add -A && git commit -m "test: verificación de la variante display" || echo "nada que commitear"
```

---

## Notas de ejecución

- Las tareas que tocan BD/route se verifican con el Postgres de dev en **5433** (`prisma db push`, no `migrate dev`).
- El backfill en producción se corre tras desplegar, en un contenedor node con los volúmenes montados (mismo patrón que la migración de carpetas), y la columna se agrega en prod con `ALTER TABLE "images" ADD COLUMN IF NOT EXISTS "displayUrl" TEXT;`.
- Orden recomendado: 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8.
