import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import archiver from 'archiver';
import { Readable } from 'stream';
import path from 'path';
import fs from 'fs';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // 1. Obtener álbum con imágenes
    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { uploadedAt: 'asc' }
        }
      }
    });

    // 2. Validaciones
    if (!album) {
      return NextResponse.json(
        { success: false, error: 'Álbum no encontrado' },
        { status: 404 }
      );
    }

    if (album.images.length === 0) {
      return NextResponse.json(
        { success: false, error: 'El álbum está vacío' },
        { status: 400 }
      );
    }

    // 3. Crear nombre del ZIP sanitizado
    const zipFilename = sanitizeFilename(
      `${album.year}_${album.title}${album.subAlbum ? `_${album.subAlbum}` : ''}.zip`
    );

    // 4. Use level 1 compression - JPEG/WebP are already compressed,
    //    higher levels waste CPU without meaningful size reduction
    const archive = archiver('zip', {
      zlib: { level: 1 }
    });

    // 5. Configurar headers para descarga
    const headers = new Headers();
    headers.set('Content-Type', 'application/zip');
    headers.set('Content-Disposition', `attachment; filename="${zipFilename}"`);
    headers.set('Cache-Control', 'no-cache');

    // 6. Manejar errores
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      throw err;
    });

    // 7. Agregar imágenes al ZIP
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    const folderName = `${album.year}_${album.title}${album.subAlbum ? `_${album.subAlbum}` : ''}`;

    let addedCount = 0;
    const skippedFiles: string[] = [];

    for (const image of album.images) {
      const filePath = path.join(uploadsDir, image.filename);

      // Verificar si existe y no está vacío
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${image.filename}`);
        skippedFiles.push(image.filename);
        continue;
      }

      try {
        const stats = fs.statSync(filePath);
        if (stats.size === 0) {
          console.warn(`Empty file: ${image.filename}`);
          skippedFiles.push(image.filename);
          continue;
        }
      } catch (error) {
        console.error(`Error checking file ${image.filename}:`, error);
        skippedFiles.push(image.filename);
        continue;
      }

      // Agregar al ZIP con estructura de carpetas
      const zipPath = `${folderName}/${image.originalName}`;
      archive.file(filePath, { name: zipPath });
      addedCount++;
    }

    // 8. Finalizar archivo
    archive.finalize();

    // 9. Log de resultados
    console.log(`ZIP created: ${zipFilename} - ${addedCount} files`);
    if (skippedFiles.length > 0) {
      console.log(`Skipped: ${skippedFiles.length} files`);
    }

    // 10. Convertir stream para Next.js
    const stream = Readable.toWeb(archive) as ReadableStream;

    return new NextResponse(stream, { headers });

  } catch (error) {
    console.error('Error downloading album:', error);
    return NextResponse.json(
      { success: false, error: 'Error al generar el archivo ZIP' },
      { status: 500 }
    );
  }
}

function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .substring(0, 200);
}
