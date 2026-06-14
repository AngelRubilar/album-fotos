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

/** Nombre del archivo "display" derivado del nombre destino: IMG_1.jpg → IMG_1.display.webp */
export function displayName(name: string): string {
  const ext = path.extname(name);
  return name.slice(0, name.length - ext.length) + '.display.webp';
}

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
