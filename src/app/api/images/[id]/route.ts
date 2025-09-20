import { NextRequest, NextResponse } from 'next/server';
import { getSimpleDatabase } from '@/lib/simple-db';
import { unlink } from 'fs/promises';
import path from 'path';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// DELETE /api/images/[id] - Eliminar imagen específica
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = getSimpleDatabase();
    
    // Obtener la imagen para verificar que existe
    const images = await db.getAllImages();
    const image = images.find(img => img.id === id);
    
    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Imagen no encontrada' },
        { status: 404 }
      );
    }

    // Eliminar archivos físicos si existen
    try {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      const thumbnailsDir = path.join(process.cwd(), 'public', 'thumbnails');
      
      const filePath = path.join(uploadsDir, image.filename);
      const thumbnailPath = path.join(thumbnailsDir, image.filename);
      
      // Intentar eliminar archivos (no fallar si no existen)
      try {
        await unlink(filePath);
      } catch (error) {
        console.log('Archivo principal no encontrado:', filePath);
      }
      
      try {
        await unlink(thumbnailPath);
      } catch (error) {
        console.log('Miniatura no encontrada:', thumbnailPath);
      }
    } catch (error) {
      console.log('Error eliminando archivos físicos:', error);
      // No fallar la operación por problemas con archivos
    }

    // Eliminar de la base de datos
    await db.deleteImage(id);

    return NextResponse.json({
      success: true,
      message: 'Imagen eliminada exitosamente',
      data: {
        id: image.id,
        filename: image.filename,
        albumId: image.albumId
      }
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error al eliminar imagen' },
      { status: 500 }
    );
  }
}
