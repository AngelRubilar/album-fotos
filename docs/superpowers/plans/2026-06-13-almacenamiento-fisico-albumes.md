# Almacenamiento físico año/álbum/imágenes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que en disco las imágenes vivan en `public/uploads/<año>/<álbum-slug>/<nombre-original>` (derivados en árbol espejo en `public/thumbnails/...`), creando la carpeta al crear el álbum y guardando el original **sin re-encode** (calidad intacta).

**Architecture:** Una util pura/IO `src/lib/storage.ts` (slug, colisiones, anti-traversal, builders de rutas) que consumen las rutas de API. El álbum guarda su `folderName` (slug resuelto) en BD como fuente de verdad. Crear/renombrar/borrar álbum sincroniza carpetas y URLs en transacción. El upload escribe el original byte-a-byte y genera el thumbnail aparte. Las rutas que sirven archivos pasan a catch-all con sanitización. Un script migra lo existente.

**Tech Stack:** Next.js 15 (App Router), Prisma 6 + PostgreSQL, Sharp, TypeScript, Vitest (nuevo, para tests de lógica pura), pnpm.

---

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `src/lib/storage.ts` (nuevo) | `slugify`, `sanitizeName`, `uniqueName`, `uniqueSlug`, `safeResolve`, builders de rutas/URLs |
| `src/lib/storage.test.ts` (nuevo) | Tests unitarios de la lógica pura |
| `vitest.config.ts` (nuevo) | Config mínima de Vitest |
| `prisma/schema.prisma` (mod) | `Album.folderName` + migración |
| `src/app/api/albums/route.ts` (mod) | Crear álbum → calcular folderName + mkdir |
| `src/app/api/albums/[id]/route.ts` (mod) | Renombrar → rename + URLs; borrar → rmdir |
| `src/app/api/upload/route.ts` (mod) | Original sin re-encode + ubicación + álbum resuelto una vez |
| `src/app/uploads/[...path]/route.ts` (mov) | Servir uploads anidados + sanitización (reemplaza `[filename]`) |
| `src/app/thumbnails/[...path]/route.ts` (mov) | Servir thumbnails anidados + sanitización (reemplaza `[filename]`) |
| `scripts/migrate-to-album-folders.ts` (nuevo) | Reubicar fotos existentes a la nueva estructura |

---

## Task 1: Configurar Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `src/lib/__smoke__.test.ts` (temporal)

- [ ] **Step 1: Instalar Vitest**

Run: `pnpm add -D vitest`

- [ ] **Step 2: Crear config mínima**

Create `vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 3: Añadir script de test**

En `package.json`, dentro de `"scripts"`, añadir:

```json
"test": "vitest run",
```

- [ ] **Step 4: Smoke test que falla**

Create `src/lib/__smoke__.test.ts`:

```ts
import { test, expect } from 'vitest';

test('vitest funciona', () => {
  expect(1 + 1).toBe(2);
});
```

- [ ] **Step 5: Correr y verificar que pasa**

Run: `pnpm test`
Expected: PASS (1 test passed)

- [ ] **Step 6: Borrar el smoke test y commitear**

```bash
rm src/lib/__smoke__.test.ts
git add package.json pnpm-lock.yaml vitest.config.ts
git commit -m "build: configurar vitest para tests unitarios"
```

---

## Task 2: `slugify` y `sanitizeName`

**Files:**
- Create: `src/lib/storage.ts`
- Test: `src/lib/storage.test.ts`

- [ ] **Step 1: Tests que fallan**

Create `src/lib/storage.test.ts`:

```ts
import { describe, test, expect } from 'vitest';
import { slugify, sanitizeName } from './storage';

describe('slugify', () => {
  test('minúsculas y espacios a guiones', () => {
    expect(slugify('Cumpleaños de Ana')).toBe('cumpleanos-de-ana');
  });
  test('quita acentos y símbolos/emoji', () => {
    expect(slugify('Viaje al Sur 🎉!!')).toBe('viaje-al-sur');
  });
  test('colapsa y recorta guiones', () => {
    expect(slugify('  --Hola___Mundo--  ')).toBe('hola-mundo');
  });
  test('fallback si queda vacío', () => {
    expect(slugify('🎉🎉')).toBe('album');
  });
});

describe('sanitizeName', () => {
  test('elimina separadores de ruta', () => {
    expect(sanitizeName('../../etc/passwd')).not.toContain('/');
    expect(sanitizeName('../../etc/passwd')).not.toContain('..');
  });
  test('conserva nombre normal con extensión', () => {
    expect(sanitizeName('IMG_1234.jpg')).toBe('IMG_1234.jpg');
  });
  test('fallback si queda vacío', () => {
    expect(sanitizeName('')).toBe('archivo');
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `pnpm test`
Expected: FAIL ("Failed to resolve import './storage'" / funciones no definidas)

- [ ] **Step 3: Implementar**

Create `src/lib/storage.ts`:

```ts
import path from 'path';

/** Convierte un título en un slug seguro para carpeta/URL. */
export function slugify(input: string): string {
  const base = input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // quitar diacríticos (acentos)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // no alfanumérico → guión
    .replace(/-+/g, '-') // colapsar guiones
    .replace(/^-+|-+$/g, ''); // recortar extremos
  return base || 'album';
}

/** Limpia el nombre de un archivo subido: sin separadores de ruta ni '..'. */
export function sanitizeName(name: string): string {
  const cleaned = name
    .replace(/[/\\\x00]/g, '_') // separadores y null byte
    .replace(/\.\.+/g, '.') // evitar '..'
    .trim();
  return cleaned || 'archivo';
}
```

- [ ] **Step 4: Correr y verificar que pasa**

Run: `pnpm test`
Expected: PASS (slugify + sanitizeName)

- [ ] **Step 5: Commit**

```bash
git add src/lib/storage.ts src/lib/storage.test.ts
git commit -m "feat: slugify y sanitizeName en lib/storage"
```

---

## Task 2.b: `uniqueName` y `uniqueSlug`

**Files:**
- Modify: `src/lib/storage.ts`
- Test: `src/lib/storage.test.ts`

- [ ] **Step 1: Añadir tests que fallan**

Añadir al final de `src/lib/storage.test.ts`:

```ts
import { uniqueName, uniqueSlug } from './storage';

describe('uniqueName', () => {
  test('devuelve el nombre si no colisiona', () => {
    expect(uniqueName('IMG_1.jpg', new Set())).toBe('IMG_1.jpg');
  });
  test('agrega sufijo " (n)" antes de la extensión al colisionar', () => {
    const taken = new Set(['IMG_1.jpg', 'IMG_1 (1).jpg']);
    expect(uniqueName('IMG_1.jpg', taken)).toBe('IMG_1 (2).jpg');
  });
});

describe('uniqueSlug', () => {
  test('devuelve el slug si no colisiona', () => {
    expect(uniqueSlug('viaje-sur', new Set())).toBe('viaje-sur');
  });
  test('agrega sufijo -n al colisionar', () => {
    const taken = new Set(['viaje-sur', 'viaje-sur-2']);
    expect(uniqueSlug('viaje-sur', taken)).toBe('viaje-sur-3');
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `pnpm test`
Expected: FAIL (uniqueName/uniqueSlug no definidos)

- [ ] **Step 3: Implementar**

Añadir a `src/lib/storage.ts`:

```ts
/** Nombre de archivo que no colisiona con `taken`, agregando " (n)" antes de la extensión. */
export function uniqueName(desired: string, taken: Set<string>): string {
  if (!taken.has(desired)) return desired;
  const ext = path.extname(desired);
  const stem = path.basename(desired, ext);
  let i = 1;
  let candidate = `${stem} (${i})${ext}`;
  while (taken.has(candidate)) {
    i += 1;
    candidate = `${stem} (${i})${ext}`;
  }
  return candidate;
}

/** Slug que no colisiona con `taken`, agregando sufijo -2, -3, … */
export function uniqueSlug(desired: string, taken: Set<string>): string {
  if (!taken.has(desired)) return desired;
  let i = 2;
  while (taken.has(`${desired}-${i}`)) i += 1;
  return `${desired}-${i}`;
}
```

- [ ] **Step 4: Correr y verificar que pasa**

Run: `pnpm test`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/lib/storage.ts src/lib/storage.test.ts
git commit -m "feat: uniqueName y uniqueSlug para resolver colisiones"
```

---

## Task 3: `safeResolve` (anti path-traversal) y builders de rutas

**Files:**
- Modify: `src/lib/storage.ts`
- Test: `src/lib/storage.test.ts`

- [ ] **Step 1: Añadir tests que fallan**

Añadir a `src/lib/storage.test.ts`:

```ts
import { safeResolve, uploadUrl, thumbUrl } from './storage';
import path from 'path';

describe('safeResolve', () => {
  const base = path.join('/tmp', 'base');
  test('resuelve una ruta interna', () => {
    expect(safeResolve(base, '2025/album/IMG.jpg')).toBe(
      path.join(base, '2025/album/IMG.jpg')
    );
  });
  test('rechaza escapar con ..', () => {
    expect(() => safeResolve(base, '../../etc/passwd')).toThrow();
  });
});

describe('builders de URL', () => {
  test('uploadUrl', () => {
    expect(uploadUrl(2025, 'cumpleanos-de-ana', 'IMG_1.jpg')).toBe(
      '/uploads/2025/cumpleanos-de-ana/IMG_1.jpg'
    );
  });
  test('thumbUrl', () => {
    expect(thumbUrl(2025, 'cumpleanos-de-ana', 'IMG_1.webp')).toBe(
      '/thumbnails/2025/cumpleanos-de-ana/IMG_1.webp'
    );
  });
});
```

- [ ] **Step 2: Correr y verificar que falla**

Run: `pnpm test`
Expected: FAIL (safeResolve/uploadUrl/thumbUrl no definidos)

- [ ] **Step 3: Implementar**

Añadir a `src/lib/storage.ts`:

```ts
/** Resuelve `relPath` contra `baseDir` garantizando que no escape (path traversal). Lanza si escapa. */
export function safeResolve(baseDir: string, relPath: string): string {
  const base = path.resolve(baseDir);
  const resolved = path.resolve(base, relPath);
  if (resolved !== base && !resolved.startsWith(base + path.sep)) {
    throw new Error('Ruta fuera del directorio base');
  }
  return resolved;
}

const UPLOADS_BASE = path.join(process.cwd(), 'public', 'uploads');
const THUMBS_BASE = path.join(process.cwd(), 'public', 'thumbnails');

export function albumUploadDir(year: number, folderName: string): string {
  return path.join(UPLOADS_BASE, String(year), folderName);
}
export function albumThumbDir(year: number, folderName: string): string {
  return path.join(THUMBS_BASE, String(year), folderName);
}
export function uploadUrl(year: number, folderName: string, file: string): string {
  return `/uploads/${year}/${folderName}/${file}`;
}
export function thumbUrl(year: number, folderName: string, file: string): string {
  return `/thumbnails/${year}/${folderName}/${file}`;
}
export { UPLOADS_BASE, THUMBS_BASE };
```

- [ ] **Step 4: Correr y verificar que pasa**

Run: `pnpm test`
Expected: PASS (toda la suite de storage)

- [ ] **Step 5: Commit**

```bash
git add src/lib/storage.ts src/lib/storage.test.ts
git commit -m "feat: safeResolve y builders de rutas/URLs en lib/storage"
```

---

## Task 4: Schema — `Album.folderName` + migración

**Files:**
- Modify: `prisma/schema.prisma:46` (zona de campos de `Album`)

- [ ] **Step 1: Añadir el campo**

En `prisma/schema.prisma`, en el modelo `Album`, añadir tras `coverFocalPoint`:

```prisma
  folderName      String?   // slug de carpeta en disco (fuente de verdad)
```

- [ ] **Step 2: Crear la migración**

Con Postgres del proyecto levantado (`docker compose up -d postgres`), correr:

```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/album_fotos?schema=public" pnpm exec prisma migrate dev --name add_album_folder_name
```

Expected: crea `prisma/migrations/<ts>_add_album_folder_name/` y regenera el client.

- [ ] **Step 3: Verificar compilación**

Run: `npx tsc --noEmit`
Expected: exit 0

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: campo Album.folderName + migración"
```

---

## Task 5: Crear álbum → calcular `folderName` + crear carpetas

**Files:**
- Modify: `src/app/api/albums/route.ts:43-98` (POST)

- [ ] **Step 1: Implementar**

En `src/app/api/albums/route.ts`, añadir imports al inicio:

```ts
import { mkdir } from 'fs/promises';
import { slugify, uniqueSlug, albumUploadDir, albumThumbDir } from '@/lib/storage';
```

Dentro de `POST`, **después** de la verificación de duplicado (línea ~68, antes de `prisma.album.create`), calcular el folderName resolviendo colisiones contra los álbumes del mismo año:

```ts
    const yearInt = parseInt(year);
    const sameYear = await prisma.album.findMany({
      where: { year: yearInt },
      select: { folderName: true },
    });
    const takenFolders = new Set(
      sameYear.map((a) => a.folderName).filter((f): f is string => !!f)
    );
    const folderName = uniqueSlug(slugify(title.trim()), takenFolders);
```

En el `data` del `prisma.album.create`, añadir `folderName` y usar `yearInt`:

```ts
      data: {
        year: yearInt,
        title: title.trim(),
        description: description?.trim() || null,
        categoryId: categoryId || null,
        subAlbum: categoryName,
        eventDate: eventDate ? new Date(eventDate) : null,
        folderName,
      },
```

**Después** del create exitoso (antes del `return`), crear las carpetas:

```ts
    await mkdir(albumUploadDir(yearInt, folderName), { recursive: true });
    await mkdir(albumThumbDir(yearInt, folderName), { recursive: true });
```

- [ ] **Step 2: Verificar compilación y lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: exit 0, sin errores

- [ ] **Step 3: Verificación manual**

Con la app en dev (`docker compose up -d postgres` + `DATABASE_URL=...localhost... pnpm dev`):

```bash
curl -s -X POST http://localhost:3000/api/albums -H 'Content-Type: application/json' \
  -d '{"year":2099,"title":"Prueba Folder"}' | head
ls -la public/uploads/2099/ public/thumbnails/2099/
```

Expected: respuesta `success:true` con `folderName:"prueba-folder"`, y existen `public/uploads/2099/prueba-folder/` y `public/thumbnails/2099/prueba-folder/`.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/albums/route.ts
git commit -m "feat: crear álbum genera su carpeta en disco (uploads y thumbnails)"
```

---

## Task 6: Borrar álbum → eliminar carpetas

**Files:**
- Modify: `src/app/api/albums/[id]/route.ts:98-124` (DELETE)

- [ ] **Step 1: Implementar**

En `src/app/api/albums/[id]/route.ts`, añadir imports:

```ts
import { rm } from 'fs/promises';
import { albumUploadDir, albumThumbDir } from '@/lib/storage';
```

En `DELETE`, tras obtener `existing` (que ya trae `year` y necesitamos `folderName`), y **después** de `prisma.album.delete`, borrar las carpetas si hay `folderName`:

```ts
    if (existing.folderName) {
      await rm(albumUploadDir(existing.year, existing.folderName), { recursive: true, force: true });
      await rm(albumThumbDir(existing.year, existing.folderName), { recursive: true, force: true });
    }
```

(`existing` ya se obtiene con `findUnique`; incluye `year` y `folderName` por defecto al no usar `select`.)

- [ ] **Step 2: Verificar compilación y lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: exit 0

- [ ] **Step 3: Verificación manual**

```bash
# usando el id del álbum "Prueba Folder" creado antes
curl -s -X DELETE http://localhost:3000/api/albums/<ID> | head
ls public/uploads/2099/ 2>&1
```

Expected: `success:true`; la carpeta `prueba-folder` ya no existe.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/albums/[id]/route.ts
git commit -m "fix: borrar álbum elimina también sus carpetas (arregla fuga de archivos)"
```

---

## Task 7: Renombrar álbum → renombrar carpetas + actualizar URLs

**Files:**
- Modify: `src/app/api/albums/[id]/route.ts:51-96` (PUT)

- [ ] **Step 1: Implementar**

En `src/app/api/albums/[id]/route.ts`, ampliar imports:

```ts
import { rename } from 'fs/promises';
import { slugify, uniqueSlug, albumUploadDir, albumThumbDir } from '@/lib/storage';
```

En `PUT`, tras obtener `existing` y antes del `prisma.album.update`, si el título cambió calcular el nuevo `folderName`:

```ts
    const newTitle = title?.trim() || existing.title;
    let newFolderName = existing.folderName;

    // Solo recalcular carpeta si el SLUG cambia realmente
    if (existing.folderName && slugify(newTitle) !== slugify(existing.title)) {
      const sameYear = await prisma.album.findMany({
        where: { year: existing.year, id: { not: id } },
        select: { folderName: true },
      });
      const taken = new Set(sameYear.map((a) => a.folderName).filter((f): f is string => !!f));
      newFolderName = uniqueSlug(slugify(newTitle), taken);
    }
```

Reemplazar el `prisma.album.update` por una **transacción** que: renombre carpetas, actualice el álbum (con `folderName`), y reescriba las URLs de imágenes / cover / yearCover cuando cambió la carpeta:

```ts
    const oldFolder = existing.folderName;
    const folderChanged = !!oldFolder && newFolderName !== oldFolder;

    if (folderChanged) {
      // renombrar en disco ANTES de la transacción; si falla, no tocamos la BD
      await rename(albumUploadDir(existing.year, oldFolder!), albumUploadDir(existing.year, newFolderName!));
      await rename(albumThumbDir(existing.year, oldFolder!), albumThumbDir(existing.year, newFolderName!));
    }

    const oldPrefixUp = `/uploads/${existing.year}/${oldFolder}/`;
    const newPrefixUp = `/uploads/${existing.year}/${newFolderName}/`;
    const oldPrefixTh = `/thumbnails/${existing.year}/${oldFolder}/`;
    const newPrefixTh = `/thumbnails/${existing.year}/${newFolderName}/`;

    const updated = await prisma.$transaction(async (tx) => {
      if (folderChanged) {
        const imgs = await tx.image.findMany({ where: { albumId: id } });
        for (const img of imgs) {
          await tx.image.update({
            where: { id: img.id },
            data: {
              fileUrl: img.fileUrl.replace(oldPrefixUp, newPrefixUp),
              thumbnailUrl: img.thumbnailUrl ? img.thumbnailUrl.replace(oldPrefixTh, newPrefixTh) : img.thumbnailUrl,
            },
          });
        }
        const yc = await tx.yearCover.findUnique({ where: { year: existing.year } });
        if (yc?.coverImageUrl && (yc.coverImageUrl.startsWith(oldPrefixTh) || yc.coverImageUrl.startsWith(oldPrefixUp))) {
          await tx.yearCover.update({
            where: { year: existing.year },
            data: { coverImageUrl: yc.coverImageUrl.replace(oldPrefixTh, newPrefixTh).replace(oldPrefixUp, newPrefixUp) },
          });
        }
      }

      const album = await tx.album.update({
        where: { id },
        data: {
          title: newTitle,
          description: description?.trim() ?? existing.description,
          categoryId: newCategoryId,
          subAlbum: newSubAlbum,
          eventDate: eventDate !== undefined ? (eventDate ? new Date(eventDate) : null) : existing.eventDate,
          coverImageUrl: coverImageUrl !== undefined
            ? coverImageUrl
            : (folderChanged && existing.coverImageUrl ? existing.coverImageUrl.replace(oldPrefixTh, newPrefixTh).replace(oldPrefixUp, newPrefixUp) : existing.coverImageUrl),
          coverFocalPoint: coverFocalPoint !== undefined ? coverFocalPoint : existing.coverFocalPoint,
          folderName: newFolderName,
        },
        include: albumInclude,
      });
      return album;
    });
```

> Nota: dejar `newCategoryId`/`newSubAlbum` como ya se calculan en el código actual (líneas 63-73). Eliminar el `prisma.album.update` viejo y el bloque `yearCover.updateMany` vacío si no aplica YearCover por carpeta en tu caso (YearCover.coverImageUrl suele apuntar a un thumbnail; si lo usas, actualízalo con el mismo `.replace`).

- [ ] **Step 2: Verificar compilación y lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: exit 0

- [ ] **Step 3: Verificación manual**

```bash
# crear álbum, subir 1 foto (Task 8 ya implementado o vía UI), renombrar:
curl -s -X PUT http://localhost:3000/api/albums/<ID> -H 'Content-Type: application/json' \
  -d '{"title":"Nuevo Nombre"}' | head
ls public/uploads/2099/
```

Expected: la carpeta pasó de `prueba-folder` a `nuevo-nombre`; las imágenes del álbum siguen cargando (sus `fileUrl` actualizados).

- [ ] **Step 4: Commit**

```bash
git add src/app/api/albums/[id]/route.ts
git commit -m "feat: renombrar álbum renombra carpetas y actualiza URLs en transacción"
```

---

## Task 8: Upload — original sin re-encode + ubicación por álbum

**Files:**
- Modify: `src/app/api/upload/route.ts` (reescribir el cuerpo del POST)

- [ ] **Step 1: Implementar**

En `src/app/api/upload/route.ts`, ajustar imports:

```ts
import { mkdir, writeFile, readdir } from 'fs/promises';
import { generateThumbnailForUpload } from '@/lib/thumbnail';
import sharp from 'sharp';
import { slugify, uniqueSlug, sanitizeName, uniqueName, albumUploadDir, albumThumbDir, uploadUrl, thumbUrl } from '@/lib/storage';
```

Cambios clave en el `POST` (mantener validaciones de tipo/tamaño y el manejo de `skippedFiles`):

1. **Resolver el álbum UNA vez antes del loop.** Mover el bloque que obtiene `targetAlbum`/`targetAlbumId` a antes del `for`. Tras resolverlo, asegurar `folderName`:

```ts
    // (antes del for) — targetAlbum ya resuelto por albumId o albumYear
    if (!targetAlbum.folderName) {
      // álbum pre-migración: generarle folderName y carpeta ahora
      const sameYear = await prisma.album.findMany({ where: { year: targetAlbum.year }, select: { folderName: true } });
      const taken = new Set(sameYear.map(a => a.folderName).filter((f): f is string => !!f));
      const fn = uniqueSlug(slugify(targetAlbum.title), taken); // importar slugify/uniqueSlug
      await prisma.album.update({ where: { id: targetAlbum.id }, data: { folderName: fn } });
      targetAlbum = { ...targetAlbum, folderName: fn };
    }
    const year = targetAlbum.year;
    const folderName = targetAlbum.folderName!;
    const uploadsDir = albumUploadDir(year, folderName);
    const thumbsDir = albumThumbDir(year, folderName);
    await mkdir(uploadsDir, { recursive: true });
    await mkdir(thumbsDir, { recursive: true });
    // set para detectar colisiones de nombre dentro de esta tanda
    const usedNames = new Set<string>(await readdir(uploadsDir).catch(() => []));
```

2. **Dentro del loop**, reemplazar la generación de nombre, escritura y thumbnail:

```ts
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // nombre = original saneado, resolviendo colisión
      const destName = uniqueName(sanitizeName(file.name), usedNames);
      usedNames.add(destName);
      const filePath = path.join(uploadsDir, destName);

      // GUARDAR ORIGINAL BYTE-A-BYTE (sin re-encode → calidad y metadatos intactos)
      await writeFile(filePath, buffer);

      // miniatura WebP aparte (rotate hornea la orientación EXIF en el derivado)
      let thumbUrlValue = thumbUrl(year, folderName, destName.replace(/\.[^.]+$/, '.webp'));
      try {
        await generateThumbnailForUpload(destName, uploadsDir, thumbsDir);
      } catch {
        console.warn(`No se pudo generar thumbnail para ${destName}`);
        thumbUrlValue = uploadUrl(year, folderName, destName); // fallback: usa el original
      }

      // dimensiones reales POST-rotación (para el masonry)
      let realWidth = 800, realHeight = 600;
      let blurDataUrl: string | null = null;
      try {
        const meta = await sharp(buffer).rotate().metadata();
        realWidth = meta.width || 800;
        realHeight = meta.height || 600;
      } catch { /* HEIC no decodificable u otro: usar defaults */ }
      try {
        const blurBuffer = await sharp(buffer).rotate().resize(20, 20, { fit: 'inside' }).jpeg({ quality: 40 }).toBuffer();
        blurDataUrl = `data:image/jpeg;base64,${blurBuffer.toString('base64')}`;
      } catch { /* sin blur */ }
```

3. En `prisma.image.create`, usar las nuevas URLs y nombre:

```ts
        data: {
          albumId: targetAlbumId,
          filename: destName,
          originalName: file.name,
          fileUrl: uploadUrl(year, folderName, destName),
          thumbnailUrl: thumbUrlValue,
          fileSize: file.size,
          width: realWidth,
          height: realHeight,
          mimeType: file.type,
          description: '',
          blurDataUrl,
        }
```

> **Importante:** `generateThumbnailForUpload(filename, uploadsDir, thumbsDir)` ya acepta dirs custom (`src/lib/thumbnail.ts:60-61`), así que escribe el thumbnail con el **mismo nombre base** en `thumbsDir`. Verificar que el nombre del thumbnail generado coincide con `destName` cambiando la extensión a `.webp`; si la lib usa otro patrón, ajustar `thumbUrlValue` para que apunte al archivo real generado.

- [ ] **Step 2: Verificar compilación y lint**

Run: `npx tsc --noEmit && pnpm lint`
Expected: exit 0

- [ ] **Step 3: Verificación manual — calidad intacta**

Subir una foto a un álbum (vía UI o curl multipart) y comparar bytes con el origen:

```bash
# tras subir foto.jpg al álbum 2099/nuevo-nombre:
ls -la public/uploads/2099/nuevo-nombre/
sha256sum /ruta/origen/foto.jpg public/uploads/2099/nuevo-nombre/foto.jpg
```

Expected: el archivo existe con su nombre original y el **sha256 es idéntico** al de origen (prueba de que NO se re-encodeó). Existe su `.webp` en `public/thumbnails/2099/nuevo-nombre/`.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/upload/route.ts
git commit -m "feat: upload guarda el original sin re-encode en carpeta del álbum"
```

---

## Task 9: Servir archivos anidados (catch-all + sanitización)

**Files:**
- Create: `src/app/uploads/[...path]/route.ts`
- Delete: `src/app/uploads/[filename]/route.ts`
- Create: `src/app/thumbnails/[...path]/route.ts`
- Delete: `src/app/thumbnails/[filename]/route.ts`

- [ ] **Step 1: Crear el catch-all de uploads**

Create `src/app/uploads/[...path]/route.ts` (basado en el handler actual, pero uniendo segmentos y validando con `safeResolve`):

```ts
import { NextRequest, NextResponse } from 'next/server';
import { stat } from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { safeResolve, UPLOADS_BASE } from '@/lib/storage';

const mimeTypes: Record<string, string> = {
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
  '.gif': 'image/gif', '.webp': 'image/webp', '.heic': 'image/heic', '.heif': 'image/heif',
};

export async function GET(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path: segs } = await params;
    let filePath: string;
    try {
      filePath = safeResolve(UPLOADS_BASE, segs.join('/'));
    } catch {
      return new NextResponse('Bad request', { status: 400 });
    }

    let fileStats;
    try { fileStats = await stat(filePath); } catch { return new NextResponse('File not found', { status: 404 }); }

    const ext = path.extname(filePath).toLowerCase();
    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    const fileSize = fileStats.size;
    const range = request.headers.get('range');

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const stream = createReadStream(filePath, { start, end });
      return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
        status: 206,
        headers: {
          'Content-Type': mimeType,
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Content-Length': String(end - start + 1),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    const stream = createReadStream(filePath);
    return new NextResponse(Readable.toWeb(stream) as ReadableStream, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': String(fileSize),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving upload:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
```

- [ ] **Step 2: Borrar la ruta vieja de uploads**

```bash
rm -r src/app/uploads/[filename]
```

- [ ] **Step 3: Crear el catch-all de thumbnails**

Create `src/app/thumbnails/[...path]/route.ts` con el mismo patrón pero usando `THUMBS_BASE` (import desde `@/lib/storage`) y la tabla de mime correspondiente (`.webp` → `image/webp`). Copiar el handler de Step 1 cambiando `UPLOADS_BASE` por `THUMBS_BASE` y el mensaje de error a `'Error serving thumbnail:'`.

- [ ] **Step 4: Borrar la ruta vieja de thumbnails**

```bash
rm -r src/app/thumbnails/[filename]
```

- [ ] **Step 5: Verificar compilación, lint y build**

Run: `npx tsc --noEmit && pnpm lint && pnpm build`
Expected: exit 0; en el output del build aparecen `/uploads/[...path]` y `/thumbnails/[...path]` (ya no `[filename]`).

- [ ] **Step 6: Verificación manual**

```bash
curl -s -o /dev/null -w '%{http_code}\n' "http://localhost:3000/uploads/2099/nuevo-nombre/foto.jpg"   # 200
curl -s -o /dev/null -w '%{http_code}\n' "http://localhost:3000/uploads/../../etc/passwd"             # 400/404
```

- [ ] **Step 7: Commit**

```bash
git add src/app/uploads src/app/thumbnails
git commit -m "feat: servir uploads/thumbnails anidados con catch-all + sanitización anti-traversal"
```

---

## Task 10: Script de migración de lo existente

**Files:**
- Create: `scripts/migrate-to-album-folders.ts`

- [ ] **Step 1: Implementar el script**

Create `scripts/migrate-to-album-folders.ts`:

```ts
import { PrismaClient } from '@prisma/client';
import { rename, mkdir, access } from 'fs/promises';
import path from 'path';
import {
  slugify, uniqueSlug, albumUploadDir, albumThumbDir, uploadUrl, thumbUrl,
  UPLOADS_BASE, THUMBS_BASE,
} from '../src/lib/storage';

const prisma = new PrismaClient();
const exists = (p: string) => access(p).then(() => true).catch(() => false);

async function main() {
  // 1) folderName por álbum
  const albums = await prisma.album.findMany({ orderBy: { year: 'asc' } });
  const byYear = new Map<number, Set<string>>();
  for (const a of albums) {
    const taken = byYear.get(a.year) ?? new Set<string>();
    let folder = a.folderName;
    if (!folder) {
      folder = uniqueSlug(slugify(a.title), taken);
      await prisma.album.update({ where: { id: a.id }, data: { folderName: folder } });
      console.log(`album ${a.id} → folderName=${folder}`);
    }
    taken.add(folder);
    byYear.set(a.year, taken);
    await mkdir(albumUploadDir(a.year, folder), { recursive: true });
    await mkdir(albumThumbDir(a.year, folder), { recursive: true });
  }

  // 2) mover cada imagen (manteniendo su nombre actual)
  const images = await prisma.image.findMany({ include: { album: true } });
  for (const img of images) {
    if (!img.album?.folderName) { console.warn(`imagen ${img.id} sin álbum/folder, salto`); continue; }
    const { year, folderName } = { year: img.album.year, folderName: img.album.folderName };
    const current = path.basename(img.fileUrl);
    const newFileUrl = uploadUrl(year, folderName, current);
    if (img.fileUrl === newFileUrl) continue; // idempotente

    const srcUp = path.join(UPLOADS_BASE, path.basename(img.fileUrl));
    const dstUp = path.join(albumUploadDir(year, folderName), current);
    if (await exists(srcUp) && !(await exists(dstUp))) await rename(srcUp, dstUp);

    let newThumbUrl = img.thumbnailUrl;
    if (img.thumbnailUrl) {
      const tname = path.basename(img.thumbnailUrl);
      const srcTh = path.join(THUMBS_BASE, tname);
      const dstTh = path.join(albumThumbDir(year, folderName), tname);
      if (await exists(srcTh) && !(await exists(dstTh))) await rename(srcTh, dstTh);
      newThumbUrl = thumbUrl(year, folderName, tname);
    }

    await prisma.image.update({ where: { id: img.id }, data: { fileUrl: newFileUrl, thumbnailUrl: newThumbUrl } });
  }

  // 3) covers
  console.log('Migración completa. Revisa covers (Album.coverImageUrl / YearCover) manualmente si apuntan a rutas viejas.');
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
```

- [ ] **Step 2: Añadir script a package.json**

En `"scripts"`:

```json
"migrate-folders": "tsx scripts/migrate-to-album-folders.ts",
```

- [ ] **Step 3: Verificar compilación**

Run: `npx tsc --noEmit`
Expected: exit 0

- [ ] **Step 4: Verificación (en copia/dev, NO producción aún)**

Con Postgres dev y datos de prueba:

```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/album_fotos?schema=public" pnpm migrate-folders
# correr de nuevo para verificar idempotencia (no debe mover nada):
DATABASE_URL="postgresql://postgres:password@localhost:5432/album_fotos?schema=public" pnpm migrate-folders
```

Expected: primera corrida reubica; segunda no hace cambios. Las imágenes siguen cargando en la app.

- [ ] **Step 5: Commit**

```bash
git add scripts/migrate-to-album-folders.ts package.json
git commit -m "feat: script de migración de fotos a la estructura año/álbum"
```

---

## Task 11: Verificación final + HEIC + docs

**Files:**
- Modify: `CLAUDE.local.md` (documentar migración y orden de despliegue)

- [ ] **Step 1: Suite + build completos**

Run: `pnpm test && npx tsc --noEmit && pnpm lint && pnpm build`
Expected: todo en verde.

- [ ] **Step 2: Verificar soporte HEIC de sharp en Docker**

```bash
docker compose build app
docker compose run --rm app node -e "const s=require('sharp'); console.log('heif:', s.format.heif)"
```

Expected: imprime info de `heif` con `input: true`. **Si `input` es false/ausente**, sharp no decodifica HEIC en esa imagen → registrar como tarea de seguimiento (instalar `libheif`/`libde265` en el Dockerfile o usar `heic-convert` como fallback en el upload). El upload ya no rompe (guarda el original + thumbnail de respaldo), pero los HEIC no tendrán miniatura hasta resolverlo.

- [ ] **Step 3: Documentar despliegue**

En `CLAUDE.local.md`, añadir bajo "Operaciones comunes":

```markdown
## Migración a estructura año/álbum (una vez)

Tras desplegar la versión con almacenamiento físico:
1. Respaldar el volumen de uploads antes de migrar.
2. Correr dentro del contenedor:
   docker compose exec app pnpm migrate-folders
3. Verificar que las imágenes cargan y que las carpetas quedaron en /app/public/uploads/<año>/<álbum>/.
```

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.local.md
git commit -m "docs: documentar migración a estructura año/álbum"
```

---

## Notas de ejecución

- Las tareas 5-8 requieren Postgres del proyecto levantado para verificación manual: `docker compose up -d postgres` y `DATABASE_URL="postgresql://postgres:password@localhost:5432/album_fotos?schema=public" pnpm dev`.
- El frontend no se toca: consume `fileUrl`/`thumbnailUrl` como URLs opacas.
- **Orden recomendado:** 1→2→2.b→3 (lib pura, con tests) antes de las tareas de rutas, porque todas dependen de `lib/storage.ts`.
- La migración en producción se corre **después** de desplegar el código nuevo y **con respaldo** del volumen.
