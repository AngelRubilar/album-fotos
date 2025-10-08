import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

/**
 * Configuración de thumbnails
 */
const THUMBNAIL_CONFIG = {
  width: 400,
  height: 400,
  quality: 80,
  fit: 'cover' as const,
  format: 'webp' as const, // WebP para mejor compresión
};

/**
 * Genera un thumbnail optimizado de una imagen
 * @param inputPath Ruta completa de la imagen original
 * @param outputPath Ruta completa donde se guardará el thumbnail
 * @returns Promise que resuelve cuando el thumbnail se genera
 */
export async function generateThumbnail(
  inputPath: string,
  outputPath: string
): Promise<void> {
  try {
    // Asegurar que el directorio de salida existe
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Generar thumbnail con Sharp
    await sharp(inputPath)
      .resize(THUMBNAIL_CONFIG.width, THUMBNAIL_CONFIG.height, {
        fit: THUMBNAIL_CONFIG.fit,
        position: 'center',
      })
      .webp({ quality: THUMBNAIL_CONFIG.quality })
      .toFile(outputPath);

    console.log(`✅ Thumbnail generated: ${outputPath}`);
  } catch (error) {
    console.error(`❌ Error generating thumbnail for ${inputPath}:`, error);
    throw error;
  }
}

/**
 * Genera un thumbnail para un archivo subido
 * @param filename Nombre del archivo (ej: "1234_abcd.jpg")
 * @param uploadsDir Directorio de uploads
 * @param thumbnailsDir Directorio de thumbnails
 * @returns Ruta relativa del thumbnail generado
 */
export async function generateThumbnailForUpload(
  filename: string,
  uploadsDir: string = path.join(process.cwd(), 'public', 'uploads'),
  thumbnailsDir: string = path.join(process.cwd(), 'public', 'thumbnails')
): Promise<string> {
  const inputPath = path.join(uploadsDir, filename);

  // Cambiar extensión a .webp para thumbnails
  const thumbnailFilename = filename.replace(/\.[^.]+$/, '.webp');
  const outputPath = path.join(thumbnailsDir, thumbnailFilename);

  await generateThumbnail(inputPath, outputPath);

  // Retornar ruta relativa para usar en la web
  return `/thumbnails/${thumbnailFilename}`;
}

/**
 * Genera thumbnails para todas las imágenes en un directorio
 * @param uploadsDir Directorio de uploads
 * @param thumbnailsDir Directorio de thumbnails
 * @returns Número de thumbnails generados
 */
export async function generateAllThumbnails(
  uploadsDir: string = path.join(process.cwd(), 'public', 'uploads'),
  thumbnailsDir: string = path.join(process.cwd(), 'public', 'thumbnails')
): Promise<number> {
  let count = 0;

  try {
    // Leer todos los archivos del directorio de uploads
    const files = fs.readdirSync(uploadsDir);

    // Filtrar solo imágenes
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
    });

    console.log(`📸 Generating thumbnails for ${imageFiles.length} images...`);

    // Generar thumbnail para cada imagen
    for (const file of imageFiles) {
      try {
        await generateThumbnailForUpload(file, uploadsDir, thumbnailsDir);
        count++;
      } catch (error) {
        console.error(`Failed to generate thumbnail for ${file}:`, error);
      }
    }

    console.log(`✅ Generated ${count} thumbnails successfully`);
    return count;
  } catch (error) {
    console.error('Error generating thumbnails:', error);
    throw error;
  }
}

/**
 * Verifica si un thumbnail existe
 * @param filename Nombre del archivo original
 * @param thumbnailsDir Directorio de thumbnails
 * @returns true si el thumbnail existe
 */
export function thumbnailExists(
  filename: string,
  thumbnailsDir: string = path.join(process.cwd(), 'public', 'thumbnails')
): boolean {
  const thumbnailFilename = filename.replace(/\.[^.]+$/, '.webp');
  const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename);
  return fs.existsSync(thumbnailPath);
}

/**
 * Elimina un thumbnail
 * @param filename Nombre del archivo original
 * @param thumbnailsDir Directorio de thumbnails
 */
export function deleteThumbnail(
  filename: string,
  thumbnailsDir: string = path.join(process.cwd(), 'public', 'thumbnails')
): void {
  const thumbnailFilename = filename.replace(/\.[^.]+$/, '.webp');
  const thumbnailPath = path.join(thumbnailsDir, thumbnailFilename);

  if (fs.existsSync(thumbnailPath)) {
    fs.unlinkSync(thumbnailPath);
    console.log(`🗑️ Thumbnail deleted: ${thumbnailPath}`);
  }
}
