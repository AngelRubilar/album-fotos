import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile, readdir } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { generateThumbnailFromBuffer } from '@/lib/thumbnail';
import sharp from 'sharp';
import convert from 'heic-convert';
import {
  slugify,
  uniqueSlug,
  sanitizeName,
  uniqueName,
  albumUploadDir,
  albumThumbDir,
  uploadUrl,
  thumbUrl,
} from '@/lib/storage';

// Configuración para permitir archivos grandes (500MB máximo)
export const config = {
  api: {
    bodyParser: false,
  },
};

// Aumentar el límite de tamaño del body para Next.js App Router
export const maxDuration = 300; // 5 minutos de timeout
export const dynamic = 'force-dynamic';

// Validación de archivos subidos
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100 MB por archivo
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/heic',
  'image/heif',
  'image/tiff',
]);

// HEIC/HEIF (formato por defecto del iPhone) no lo decodifica sharp.
// Se detecta por mime o extensión para convertirlo antes de generar derivados.
function isHeic(file: File): boolean {
  const t = (file.type || '').toLowerCase();
  if (t === 'image/heic' || t === 'image/heif') return true;
  const ext = path.extname(file.name).toLowerCase();
  return ext === '.heic' || ext === '.heif';
}

// POST /api/upload - Subir imágenes
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const albumId = formData.get('albumId') as string;
    const albumYear = formData.get('albumYear') as string; // Para compatibilidad

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionaron archivos' },
        { status: 400 }
      );
    }

    if (!albumId && !albumYear) {
      return NextResponse.json(
        { success: false, error: 'ID del álbum es requerido' },
        { status: 400 }
      );
    }

    // --- Resolver el álbum UNA vez ANTES del loop ---
    let targetAlbumId: string;
    let targetAlbum: Awaited<ReturnType<typeof prisma.album.findUnique>>;

    if (albumId) {
      // Usar el álbum específico seleccionado
      targetAlbum = await prisma.album.findUnique({
        where: { id: albumId },
      });

      if (!targetAlbum) {
        return NextResponse.json(
          { success: false, error: 'No existe el álbum seleccionado' },
          { status: 400 }
        );
      }
      targetAlbumId = albumId;
    } else {
      // Compatibilidad con el método anterior (por año) - buscar primer álbum del año
      const yearInt = parseInt(albumYear);
      if (isNaN(yearInt)) {
        return NextResponse.json(
          { success: false, error: `No existe un álbum para el año ${albumYear}` },
          { status: 400 }
        );
      }
      targetAlbum = await prisma.album.findFirst({
        where: {
          year: yearInt,
          subAlbum: null, // Buscar álbum principal del año
        },
      });

      if (!targetAlbum) {
        // Si no hay álbum principal, buscar cualquier álbum del año
        targetAlbum = await prisma.album.findFirst({
          where: { year: yearInt },
        });
      }

      if (!targetAlbum) {
        return NextResponse.json(
          { success: false, error: `No existe un álbum para el año ${albumYear}` },
          { status: 400 }
        );
      }
      targetAlbumId = targetAlbum.id;
    }

    // Asegurar que el álbum tiene folderName (caso pre-migración)
    if (!targetAlbum.folderName) {
      const sameYear = await prisma.album.findMany({
        where: { year: targetAlbum.year },
        select: { folderName: true },
      });
      const taken = new Set(
        sameYear.map((a) => a.folderName).filter((f): f is string => !!f)
      );
      const fn = uniqueSlug(slugify(targetAlbum.title), taken);
      await prisma.album.update({ where: { id: targetAlbum.id }, data: { folderName: fn } });
      targetAlbum = { ...targetAlbum, folderName: fn };
    }

    const year = targetAlbum.year;
    const folderName = targetAlbum.folderName!;
    const uploadsDir = albumUploadDir(year, folderName);
    const thumbsDir = albumThumbDir(year, folderName);
    await mkdir(uploadsDir, { recursive: true });
    await mkdir(thumbsDir, { recursive: true });

    // Set para detectar colisiones de nombre dentro de esta tanda
    const usedNames = new Set<string>(await readdir(uploadsDir).catch(() => []));

    const uploadedImages = [];
    const skippedFiles: { name: string; reason: string }[] = [];

    for (const file of files) {
      // Validar tipo: debe ser una imagen de un formato soportado
      if (!file.type.startsWith('image/') || !ALLOWED_MIME_TYPES.has(file.type)) {
        skippedFiles.push({ name: file.name, reason: `Tipo no soportado (${file.type || 'desconocido'})` });
        continue;
      }

      // Validar tamaño máximo por archivo
      if (file.size > MAX_FILE_SIZE) {
        skippedFiles.push({ name: file.name, reason: `Excede el tamaño máximo (${Math.round(MAX_FILE_SIZE / 1024 / 1024)} MB)` });
        continue;
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Nombre = original saneado, resolviendo colisión
      const destName = uniqueName(sanitizeName(file.name), usedNames);
      usedNames.add(destName);
      const filePath = path.join(uploadsDir, destName);

      // GUARDAR ORIGINAL BYTE-A-BYTE (sin re-encode → calidad y metadatos intactos)
      await writeFile(filePath, buffer);

      // Buffer procesable por sharp para los DERIVADOS (miniatura/dimensiones/blur).
      // HEIC (iPhone) no lo decodifica sharp → se convierte a JPEG en memoria.
      // El original guardado en disco sigue siendo el .heic intacto.
      let processBuffer = buffer;
      if (isHeic(file)) {
        try {
          processBuffer = Buffer.from(
            await convert({ buffer, format: 'JPEG', quality: 0.92 })
          );
        } catch (e) {
          console.warn(`No se pudo convertir HEIC ${destName}:`, e);
        }
      }

      // Miniatura WebP generada desde el buffer procesable (rotate hornea EXIF)
      const thumbFilename = destName.replace(/\.[^.]+$/, '.webp');
      let thumbUrlValue = thumbUrl(year, folderName, thumbFilename);
      try {
        await generateThumbnailFromBuffer(processBuffer, path.join(thumbsDir, thumbFilename));
      } catch {
        console.warn(`No se pudo generar thumbnail para ${destName}`);
        thumbUrlValue = uploadUrl(year, folderName, destName); // fallback: usa el original
      }

      // Dimensiones reales POST-rotación (para el masonry)
      let realWidth = 800;
      let realHeight = 600;
      let blurDataUrl: string | null = null;
      try {
        const meta = await sharp(processBuffer).rotate().metadata();
        realWidth = meta.width || 800;
        realHeight = meta.height || 600;
      } catch {
        /* formato no decodificable: usar defaults */
      }
      try {
        const blurBuffer = await sharp(processBuffer)
          .rotate()
          .resize(20, 20, { fit: 'inside' })
          .jpeg({ quality: 40 })
          .toBuffer();
        blurDataUrl = `data:image/jpeg;base64,${blurBuffer.toString('base64')}`;
      } catch {
        /* sin blur */
      }

      // Crear entrada de imagen en la base de datos
      const imageData = await prisma.image.create({
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
        },
      });

      uploadedImages.push({
        id: imageData.id,
        filename: imageData.filename,
        originalName: imageData.originalName,
        fileUrl: imageData.fileUrl,
        thumbnailUrl: imageData.thumbnailUrl,
        fileSize: imageData.fileSize,
        width: imageData.width,
        height: imageData.height,
        mimeType: imageData.mimeType,
        description: imageData.description,
        albumYear: targetAlbum.year,
        uploadedAt: imageData.uploadedAt.toISOString(),
      });
    }

    if (uploadedImages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No se subieron imágenes válidas', skipped: skippedFiles },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: uploadedImages,
      skipped: skippedFiles,
      message:
        `${uploadedImages.length} imagen(es) subida(s) exitosamente` +
        (skippedFiles.length > 0 ? `, ${skippedFiles.length} omitida(s)` : ''),
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    return NextResponse.json(
      { success: false, error: 'Error al subir imágenes' },
      { status: 500 }
    );
  }
}

// GET /api/upload - Obtener imágenes por año del álbum
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const albumYear = searchParams.get('albumYear');

    if (!albumYear) {
      return NextResponse.json(
        { success: false, error: 'Año del álbum es requerido' },
        { status: 400 }
      );
    }

    // Obtener todas las imágenes de álbumes del año especificado
    const images = await prisma.image.findMany({
      where: {
        album: {
          year: parseInt(albumYear),
        },
      },
      orderBy: { uploadedAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: images,
    });
  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener imágenes' },
      { status: 500 }
    );
  }
}
