# Spec: Almacenamiento físico `año / álbum / imágenes`

**Fecha:** 2026-06-13
**Estado:** Aprobado (diseño)
**Alcance:** Reestructurar el almacenamiento de imágenes para que en disco refleje `año / álbum / imágenes`, creando la carpeta al crear el álbum y **preservando la calidad original** del archivo subido.

---

## 1. Contexto y problema

Hoy el almacenamiento es **plano** y la organización año→álbum existe **solo en la base de datos**:

- `POST /api/albums` (`src/app/api/albums/route.ts:70`) solo inserta una fila; **no crea ninguna carpeta**.
- El upload (`src/app/api/upload/route.ts:77-90`) guarda **todo** en `public/uploads/<timestamp>_<random>.ext` y los thumbnails en `public/thumbnails/<...>` — sin año ni álbum.
- El upload **re-codifica el original** con `sharp(buffer).rotate().toBuffer()` (`upload/route.ts:94`), lo que **degrada la calidad** (re-encode a calidad por defecto de sharp) y **borra metadatos** (EXIF/GPS). El "original" guardado ya no es el original.
- `DELETE /api/albums/[id]` (`[id]/route.ts:110`) borra la fila pero **no borra los archivos del disco** → fuga de archivos huérfanos.

### Objetivo
Que al crear un álbum se cree su carpeta, que los archivos vivan en `uploads/<año>/<álbum>/`, y que al subir una foto se **guarde el original tal cual, sin pérdida de calidad**.

### Fuera de alcance (YAGNI, para después)
- Optimización de velocidad de visualización (variante "display" del lightbox, virtualización, etc.).
- Timeline / organización automática por fecha estilo Google Fotos.
- Autenticación (pendiente aparte).

---

## 2. Decisiones tomadas

| Decisión | Elección |
|---|---|
| Nombre de carpeta de álbum | **Slug del título** (minúsculas, sin acentos, espacios→guiones). Ej: `cumpleanos-de-ana` |
| Al renombrar álbum | **Renombrar la carpeta** y actualizar las URLs de las imágenes |
| Nombre de archivo | **Nombre original** del archivo (IMG_1234.jpg); sufijo ` (1)` si colisiona |
| Ubicación de derivados | **Árbol espejo separado** (`thumbnails/<año>/<álbum>/`), originales solos en su carpeta |
| Fotos existentes | **Migrar** a la estructura manteniendo sus nombres actuales |

---

## 3. Estructura en disco

Dentro de los volúmenes Docker existentes (`uploads_data` → `/app/public/uploads`, `thumbnails_data` → `/app/public/thumbnails`). **No se requiere volumen nuevo.**

```
public/uploads/
  2025/
    cumpleanos-de-ana/
      IMG_1234.jpg            ← original byte-a-byte (calidad real)
      IMG_1235.jpg
    viaje-sur/
      DSC_0042.jpg
public/thumbnails/
  2025/
    cumpleanos-de-ana/
      IMG_1234.webp           ← derivado (espejo)
      IMG_1235.webp
```

URLs resultantes: `/uploads/2025/cumpleanos-de-ana/IMG_1234.jpg`, `/thumbnails/2025/cumpleanos-de-ana/IMG_1234.webp`.

---

## 4. Modelo de datos

**Cambio de schema (`prisma/schema.prisma`):**
- Añadir `folderName String?` al modelo `Album` → guarda el slug ya resuelto (incluyendo sufijo de colisión). Es la fuente de verdad del nombre de carpeta, evita recomputar y desincronización.
- Migración Prisma versionada. Para álbumes existentes, el script de migración (sección 8) rellena `folderName`.

**Sin cambio de tipo:** `Image.fileUrl` y `Image.thumbnailUrl` siguen siendo `String`, pero ahora contienen la ruta anidada. Igual `Album.coverImageUrl` y `YearCover.coverImageUrl`.

**Invariante:** el `year` del álbum es **inmutable** (el `PUT` no lo modifica), por lo tanto el segmento de año de la carpeta nunca cambia; solo el slug puede cambiar al renombrar.

---

## 5. Slug y colisiones

**`slugify(title)`** (nueva util en `src/lib/storage.ts`):
- Normaliza Unicode (`NFKD`), elimina diacríticos (acentos), pasa a minúsculas.
- Reemplaza espacios y caracteres no `[a-z0-9]` por `-`, colapsa guiones múltiples, recorta guiones de los extremos.
- Si el resultado queda vacío (ej. título solo emoji), usa un fallback (ej. `album`).

**Colisión de slug dentro del mismo año:** al crear/renombrar, si ya existe otro álbum con ese `folderName` en ese año, se agrega sufijo numérico `-2`, `-3`… El valor final se persiste en `Album.folderName`.

**Colisión de nombre de archivo dentro del álbum:** si `IMG_1234.jpg` ya existe en la carpeta destino, se agrega ` (1)`, ` (2)`… antes de la extensión (estilo SO/Google).

**Sanitización del nombre original** del archivo subido: quitar separadores de ruta y caracteres peligrosos del `file.name` antes de usarlo como nombre en disco (evitar `../`, `/`, bytes nulos).

---

## 6. Ciclo de vida álbum ↔ carpeta

Toda operación de disco va acompañada de su actualización en BD; las que tocan múltiples filas usan **transacción Prisma**.

- **Crear** (`POST /api/albums`): calcular `folderName` (con resolución de colisión), `mkdir -p` de `uploads/<año>/<folderName>` y `thumbnails/<año>/<folderName>`, guardar `folderName` en la fila.
- **Renombrar** (`PUT /api/albums/[id]`): si el nuevo título produce un slug distinto al `folderName` actual:
  1. Resolver nuevo `folderName` (con colisión).
  2. Renombrar (`fs.rename`) las carpetas en uploads y thumbnails.
  3. Actualizar `Album.folderName`, y reescribir `fileUrl`/`thumbnailUrl` de todas las imágenes del álbum (reemplazo de prefijo de ruta), más `coverImageUrl` del álbum y el `YearCover` si apunta a este álbum. Todo en una transacción.
  - Si `fs.rename` falla, no se commitea la transacción (consistencia).
- **Borrar** (`DELETE /api/albums/[id]`): tras borrar la fila (cascade a imágenes), borrar recursivamente las carpetas `uploads/<año>/<folderName>` y `thumbnails/<año>/<folderName>`. Arregla la fuga actual.

---

## 7. Upload — calidad + ubicación

Reescribir `POST /api/upload` (`src/app/api/upload/route.ts`):

1. **Resolver el álbum UNA vez** antes del loop (hoy hace `findUnique` dentro del loop). Obtener `year` y `folderName`. Si el álbum no tiene `folderName` (caso borde pre-migración), calcularlo/crearlo.
2. Calcular dirs destino: `uploads/<year>/<folderName>/` y `thumbnails/<year>/<folderName>/` (`mkdir -p`).
3. Por cada archivo:
   - Validar tipo/tamaño (como hoy).
   - Resolver nombre destino = `sanitize(file.name)` con resolución de colisión ` (n)`.
   - **Escribir el original byte-a-byte** (`writeFile(dest, buffer)`), **sin `sharp().rotate()`** sobre el original → preserva calidad y metadatos.
   - Generar **miniatura WebP** con `sharp(buffer).rotate()...webp()` en el árbol espejo (la orientación EXIF se hornea en el derivado, no en el original).
   - Leer dimensiones reales **post-rotación** (`sharp(buffer).rotate().metadata()`) para `width/height` correctos para el masonry.
   - Generar `blurDataUrl` (como hoy).
   - (Opcional barato) leer `takenAt` del EXIF (`DateTimeOriginal`) y guardarlo si se agrega el campo; **no** se construye UI de fecha ahora.
   - Crear la fila `Image` con `fileUrl`/`thumbnailUrl` anidados y `originalName = file.name`.

**Nota HEIC:** el original HEIC se guarda tal cual; el derivado se genera en WebP (visible en navegador). Requiere que `sharp` tenga soporte `libheif` en la imagen Docker — **verificar en implementación**; si el build de sharp en Alpine no decodifica HEIC, evaluar instalar `libheif`/`libde265` o un fallback (`heic-convert`). Si no se puede decodificar, registrar el archivo con un thumbnail de respaldo y no romper el upload.

---

## 8. Servir archivos (rutas)

Las rutas actuales son de **un solo segmento** y no sirven rutas anidadas:
- `src/app/uploads/[filename]/route.ts` → `src/app/uploads/[...path]/route.ts`
- `src/app/thumbnails/[filename]/route.ts` → `src/app/thumbnails/[...path]/route.ts`

El handler une los segmentos (`params.path.join('/')`), resuelve contra el dir base y **valida que la ruta resuelta siga dentro del dir base** (`path.resolve(...).startsWith(baseDir + path.sep)`) para impedir path traversal. Mantiene el soporte de Range y los headers de caché actuales.

---

## 9. Migración de lo existente

Script `scripts/migrate-to-album-folders.ts` (idempotente):
1. Para cada `Album` sin `folderName`: calcular `folderName` (con colisión), `mkdir` de sus carpetas, persistir `folderName`.
2. Para cada `Image`: calcular ruta destino `<year>/<folderName>/<nombre-actual>` (se mantiene el nombre único actual, no se renombra). `fs.rename` del archivo en uploads y del thumbnail. Actualizar `fileUrl`/`thumbnailUrl` en BD.
3. Actualizar `Album.coverImageUrl` y `YearCover.coverImageUrl` al nuevo path.
4. Idempotencia: si el archivo ya está en destino (o no está en origen), saltar sin error.
5. Las fotos viejas conservan la calidad que ya tienen (re-codificada en su día); **solo se reorganizan**, no se "recupera" calidad.

Se ejecuta una vez en el server tras desplegar (documentar en `CLAUDE.local.md`).

---

## 10. Componentes nuevos / tocados

**Nuevo:** `src/lib/storage.ts` — `slugify`, `resolveAlbumFolder`, `albumDirs(year, folderName)`, `uniqueFilename(dir, name)`, `sanitizeName`, `safeResolve(baseDir, relPath)`. Lógica pura/IO aislada y testeable.

**Tocados:**
- `prisma/schema.prisma` (+ migración) — `Album.folderName` (y opcional `Image.takenAt`).
- `src/app/api/albums/route.ts` (crear → mkdir).
- `src/app/api/albums/[id]/route.ts` (renombrar → rename + URLs; borrar → rmdir).
- `src/app/api/upload/route.ts` (original sin re-encode + ubicación + álbum una vez).
- `src/app/uploads/[...path]/route.ts` y `src/app/thumbnails/[...path]/route.ts` (catch-all + sanitización).
- `scripts/migrate-to-album-folders.ts` (nuevo).

El frontend no requiere cambios: consume `fileUrl`/`thumbnailUrl` como URLs opacas; al ser ahora rutas anidadas funcionan igual a través de los catch-all.

---

## 11. Casos borde

- Título que produce slug vacío (solo emoji/símbolos) → fallback `album` + sufijo.
- Dos álbumes mismo año, mismo título, distinta categoría (`@@unique([year,title,subAlbum])` lo permite) → colisión de slug resuelta con sufijo `-2`.
- Renombrar a un título cuyo slug ya existe en el año → sufijo.
- Subir dos archivos con el mismo `originalName` al mismo álbum → ` (1)`, ` (2)`.
- HEIC no decodificable por sharp → no romper el upload; thumbnail de respaldo.
- Fallo de `fs.rename` en renombrado → abortar transacción, no dejar BD/disco inconsistentes.

---

## 12. Pruebas / verificación

- **Unit (funciones puras de `storage.ts`):** `slugify` con acentos/espacios/emoji; `uniqueFilename` con colisiones; `safeResolve` rechaza `../`.
- **Manual/integración:** crear álbum → existe la carpeta; subir → original en `uploads/<año>/<slug>/` con tamaño/bytes idénticos al archivo de origen (verificar con hash) y thumbnail en el espejo; renombrar → carpetas movidas + URLs actualizadas + imágenes siguen cargando; borrar → carpetas eliminadas.
- **Migración:** correr en una copia; verificar que toda imagen quedó reubicada, URLs consistentes, e idempotencia (segunda corrida no hace nada).
- `pnpm tsc --noEmit`, `pnpm lint`, `pnpm build` en verde.

---

## 13. Riesgos

- **HEIC/libheif** en Docker (sección 7) — principal incógnita técnica.
- **Migración sobre datos reales** — correr con respaldo del volumen; idempotente y reversible-friendly (mantiene nombres).
- **Consistencia BD↔disco** en rename/delete — mitigada con transacciones y orden de operaciones.
