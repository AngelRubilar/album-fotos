#!/usr/bin/env tsx
/**
 * Script para corregir las dimensiones en la BD usando los thumbnails como referencia.
 * Los thumbnails tienen las dimensiones correctas (con orientacion EXIF aplicada).
 * Uso: npm run fix-db-dimensions
 */

import sharp from 'sharp';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const publicDir = path.join(process.cwd(), 'public');

  // Obtener todas las imagenes con thumbnailUrl
  const images = await prisma.image.findMany({
    select: { id: true, filename: true, thumbnailUrl: true, width: true, height: true },
  });

  console.log(`Procesando ${images.length} imagenes...`);

  let updated = 0, skipped = 0, errors = 0;

  for (const img of images) {
    if (!img.thumbnailUrl || img.thumbnailUrl.startsWith('/placeholder')) {
      skipped++;
      continue;
    }

    // thumbnailUrl es tipo "/thumbnails/xxx.webp"
    const thumbPath = path.join(publicDir, img.thumbnailUrl);

    try {
      const meta = await sharp(thumbPath).metadata();
      const w = meta.width;
      const h = meta.height;

      if (!w || !h) {
        skipped++;
        continue;
      }

      // Solo actualizar si las dimensiones son distintas
      if (img.width === w && img.height === h) {
        skipped++;
        continue;
      }

      await prisma.image.update({
        where: { id: img.id },
        data: { width: w, height: h },
      });

      updated++;
      if (updated % 50 === 0) {
        console.log(`  ${updated} actualizadas...`);
      }
    } catch {
      errors++;
      console.error(`Error en ${img.filename} (${thumbPath})`);
    }
  }

  console.log(`\nTerminado: ${updated} actualizadas, ${skipped} sin cambios, ${errors} errores`);

  // Verificacion final
  const stats = await prisma.$queryRaw<{ portrait: bigint; landscape: bigint }[]>`
    SELECT
      COUNT(*) FILTER (WHERE width < height) AS portrait,
      COUNT(*) FILTER (WHERE width > height) AS landscape
    FROM images
  `;
  console.log(`\nVerificacion BD:`);
  console.log(`  Portrait (vertical):  ${stats[0].portrait}`);
  console.log(`  Landscape (horizontal): ${stats[0].landscape}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
