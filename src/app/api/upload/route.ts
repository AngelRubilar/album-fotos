import { NextRequest, NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { generateThumbnailForUpload } from '@/lib/thumbnail';
import sharp from 'sharp';

// Configuración para permitir archivos grandes (500MB máximo)
export const config = {
  api: {
    bodyParser: false,
  },
};

// Aumentar el límite de tamaño del body para Next.js App Router
export const maxDuration = 300; // 5 minutos de timeout
export const dynamic = 'force-dynamic';

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

    const uploadedImages = [];

    for (const file of files) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        continue; // Saltar archivos que no son imágenes
      }

      // Crear nombre único para el archivo
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 11);
      const fileExtension = path.extname(file.name);
      const fileName = `${timestamp}_${randomId}${fileExtension}`;

      // Crear directorios si no existen
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      const thumbnailsDir = path.join(process.cwd(), 'public', 'thumbnails');

      try {
        await mkdir(uploadsDir, { recursive: true });
        await mkdir(thumbnailsDir, { recursive: true });
      } catch {
        // Los directorios ya existen
      }

      // Write file to disk, auto-rotating based on EXIF orientation
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const filePath = path.join(uploadsDir, fileName);

      // Auto-rotate to fix EXIF orientation (fotos de celular)
      try {
        const rotatedBuffer = await sharp(buffer).rotate().toBuffer();
        await writeFile(filePath, rotatedBuffer);
      } catch {
        // Si falla la rotacion, guardar el original
        await writeFile(filePath, buffer);
      }

      // Generate thumbnail from file on disk (not from buffer)
      let thumbnailUrl = `/thumbnails/${fileName}`;
      try {
        thumbnailUrl = await generateThumbnailForUpload(fileName, uploadsDir, thumbnailsDir);
        console.log(`Thumbnail generated: ${thumbnailUrl}`);
      } catch {
        console.warn(`Could not generate thumbnail for ${fileName}, using fallback`);
        thumbnailUrl = `/uploads/${fileName}`;
      }

      // Read metadata from the already-rotated file
      let realWidth = 800;
      let realHeight = 600;
      let blurDataUrl: string | null = null;
      try {
        const metadata = await sharp(filePath).metadata();
        realWidth = metadata.width || 800;
        realHeight = metadata.height || 600;
      } catch {
        console.warn(`Could not read image metadata for ${fileName}, using defaults`);
      }

      // Generate LQIP blur placeholder (~20px base64)
      try {
        const blurBuffer = await sharp(filePath)
          .resize(20, 20, { fit: 'inside' })
          .jpeg({ quality: 40 })
          .toBuffer();
        blurDataUrl = `data:image/jpeg;base64,${blurBuffer.toString('base64')}`;
      } catch {
        console.warn(`Could not generate blur placeholder for ${fileName}`);
      }

      // Determinar el álbum a usar
      let targetAlbumId: string;
      let targetAlbum;

      if (albumId) {
        // Usar el álbum específico seleccionado
        targetAlbum = await prisma.album.findUnique({
          where: { id: albumId }
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
        targetAlbum = await prisma.album.findFirst({
          where: {
            year: parseInt(albumYear),
            subAlbum: null // Buscar álbum principal del año
          }
        });

        if (!targetAlbum) {
          // Si no hay álbum principal, buscar cualquier álbum del año
          targetAlbum = await prisma.album.findFirst({
            where: { year: parseInt(albumYear) }
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

      // Crear entrada de imagen en la base de datos
      const imageData = await prisma.image.create({
        data: {
          albumId: targetAlbumId,
          filename: fileName,
          originalName: file.name,
          fileUrl: `/uploads/${fileName}`,
          thumbnailUrl: thumbnailUrl,
          fileSize: file.size,
          width: realWidth,
          height: realHeight,
          mimeType: file.type,
          description: '',
          blurDataUrl,
        }
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
        uploadedAt: imageData.uploadedAt.toISOString()
      });
    }

    if (uploadedImages.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No se subieron imágenes válidas' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: uploadedImages,
      message: `${uploadedImages.length} imagen(es) subida(s) exitosamente`
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
          year: parseInt(albumYear)
        }
      },
      orderBy: { uploadedAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: images
    });

  } catch (error) {
    console.error('Error fetching images:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener imágenes' },
      { status: 500 }
    );
  }
}
