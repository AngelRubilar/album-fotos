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
