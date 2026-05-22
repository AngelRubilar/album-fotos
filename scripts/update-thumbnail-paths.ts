#!/usr/bin/env tsx
/**
 * Script para actualizar las rutas de thumbnails en la base de datos a .webp
 * Uso: npm run update-thumbnails
 */

import fs from 'fs';
import path from 'path';

async function main() {
  console.log('🔄 Actualizando rutas de thumbnails en la base de datos...\n');

  const dataDir = path.join(process.cwd(), 'data');
  const imagesFile = path.join(dataDir, 'images.json');

  try {
    // Leer datos actuales
    const data = fs.readFileSync(imagesFile, 'utf8');
    const images = JSON.parse(data);

    console.log(`📊 Total de imágenes encontradas: ${images.length}`);

    let updatedCount = 0;

    // Actualizar cada imagen
    const updatedImages = images.map((img: { thumbnailUrl?: string; [key: string]: unknown }) => {
      if (img.thumbnailUrl && !img.thumbnailUrl.includes('placeholder')) {
        // Cambiar extensión a .webp
        const oldUrl = img.thumbnailUrl;
        const newUrl = img.thumbnailUrl.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');

        if (oldUrl !== newUrl) {
          console.log(`  ✏️  ${oldUrl} → ${newUrl}`);
          updatedCount++;
          return { ...img, thumbnailUrl: newUrl };
        }
      }
      return img;
    });

    // Guardar cambios
    fs.writeFileSync(imagesFile, JSON.stringify(updatedImages, null, 2));

    console.log(`\n✅ Proceso completado!`);
    console.log(`📊 Thumbnails actualizados: ${updatedCount}`);
    console.log(`💾 Base de datos actualizada: ${imagesFile}`);
  } catch (error) {
    console.error('\n❌ Error actualizando thumbnails:', error);
    process.exit(1);
  }
}

main();
