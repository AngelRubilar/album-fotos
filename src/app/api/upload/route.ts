import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { getSimpleDatabase } from '@/lib/simple-db';

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
      const randomId = Math.random().toString(36).substr(2, 9);
      const fileExtension = path.extname(file.name);
      const fileName = `${timestamp}_${randomId}${fileExtension}`;
      
      // Convertir archivo a buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Crear directorios si no existen
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      const thumbnailsDir = path.join(process.cwd(), 'public', 'thumbnails');
      
      try {
        await mkdir(uploadsDir, { recursive: true });
        await mkdir(thumbnailsDir, { recursive: true });
      } catch (error) {
        // Los directorios ya existen
      }

      // Guardar archivo
      const filePath = path.join(uploadsDir, fileName);
      await writeFile(filePath, buffer);

      const db = getSimpleDatabase();

      // Determinar el álbum a usar
      let targetAlbumId: string;
      
      if (albumId) {
        // Usar el álbum específico seleccionado
        const album = await db.getAlbumById(albumId);
        if (!album) {
          return NextResponse.json(
            { success: false, error: `No existe el álbum seleccionado` },
            { status: 400 }
          );
        }
        targetAlbumId = albumId;
      } else {
        // Compatibilidad con el método anterior (por año)
        const album = await db.getAlbumByYear(parseInt(albumYear));
        if (!album) {
          return NextResponse.json(
            { success: false, error: `No existe un álbum para el año ${albumYear}` },
            { status: 400 }
          );
        }
        targetAlbumId = album.id;
      }

      // Crear entrada de imagen en la base de datos
      const imageData = await db.createImage({
        albumId: targetAlbumId,
        filename: fileName,
        originalName: file.name,
        fileUrl: `/uploads/${fileName}`,
        thumbnailUrl: `/thumbnails/${fileName}`,
        fileSize: file.size,
        width: 800, // Valores por defecto
        height: 600,
        mimeType: file.type,
        description: ''
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
        albumYear: albumId ? (await db.getAlbumById(targetAlbumId)).year : parseInt(albumYear),
        uploadedAt: new Date().toISOString()
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

// GET /api/upload - Obtener imágenes por álbum
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

    const db = getSimpleDatabase();

    // Obtener imágenes por año del álbum
    const images = await db.getImagesByAlbumYear(parseInt(albumYear));

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
