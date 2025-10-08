#!/usr/bin/env tsx
/**
 * Script para generar thumbnails de todas las imágenes existentes
 * Uso: npm run generate-thumbnails
 */

import { generateAllThumbnails } from '../src/lib/thumbnail';
import path from 'path';

async function main() {
  console.log('🚀 Iniciando generación de thumbnails...\n');

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const thumbnailsDir = path.join(process.cwd(), 'public', 'thumbnails');

  try {
    const count = await generateAllThumbnails(uploadsDir, thumbnailsDir);

    console.log(`\n✅ Proceso completado!`);
    console.log(`📊 Thumbnails generados: ${count}`);
    console.log(`📁 Ubicación: ${thumbnailsDir}`);
  } catch (error) {
    console.error('\n❌ Error generando thumbnails:', error);
    process.exit(1);
  }
}

main();
