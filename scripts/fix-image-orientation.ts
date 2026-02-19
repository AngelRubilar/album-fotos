import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * Script para corregir la orientacion EXIF de las imagenes existentes.
 * Lee cada imagen, la auto-rota segun EXIF y la sobreescribe.
 * Tambien regenera los thumbnails.
 */
async function main() {
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  const thumbnailsDir = path.join(process.cwd(), 'public', 'thumbnails');

  if (!fs.existsSync(uploadsDir)) {
    console.log('No existe el directorio de uploads');
    return;
  }

  const files = fs.readdirSync(uploadsDir).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
  });

  console.log(`Procesando ${files.length} imagenes...`);
  let fixed = 0, skipped = 0, errors = 0;

  for (const file of files) {
    const filePath = path.join(uploadsDir, file);
    try {
      const metadata = await sharp(filePath).metadata();
      const orientation = metadata.orientation || 1;

      // Solo procesar si tiene orientacion EXIF que necesita correccion
      if (orientation > 1) {
        const rotatedBuffer = await sharp(filePath).rotate().toBuffer();
        await fs.promises.writeFile(filePath, rotatedBuffer);

        // Regenerar thumbnail preservando aspect ratio
        const thumbName = file.replace(/\.[^.]+$/, '.webp');
        const thumbPath = path.join(thumbnailsDir, thumbName);
        await sharp(filePath)
          .rotate()
          .resize(400, null, { fit: 'inside', withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(thumbPath);

        fixed++;
        if (fixed % 20 === 0) console.log(`  ${fixed} corregidas...`);
      } else {
        skipped++;
      }
    } catch (err) {
      errors++;
      console.error(`Error en ${file}:`, (err as Error).message);
    }
  }

  console.log(`\nTerminado: ${fixed} corregidas, ${skipped} ya estaban bien, ${errors} errores`);
}

main().catch(console.error);
