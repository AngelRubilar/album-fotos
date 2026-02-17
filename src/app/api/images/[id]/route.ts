import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import path from 'path';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// PATCH /api/images/[id] - Actualizar descripcion de imagen
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { description } = body;

    const image = await prisma.image.findUnique({ where: { id } });
    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Imagen no encontrada' },
        { status: 404 }
      );
    }

    const updated = await prisma.image.update({
      where: { id },
      data: { description: description?.trim() ?? null },
      select: { id: true, description: true },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error updating image:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar imagen' },
      { status: 500 }
    );
  }
}

// DELETE /api/images/[id] - Eliminar imagen específica
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Obtener la imagen para verificar que existe
    const image = await prisma.image.findUnique({
      where: { id }
    });

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

      // Obtener nombre del thumbnail (puede tener extensión .webp)
      const thumbnailBaseName = path.basename(image.filename, path.extname(image.filename));
      const thumbnailPath = path.join(thumbnailsDir, `${thumbnailBaseName}.webp`);

      // Intentar eliminar archivos (no fallar si no existen)
      try {
        await unlink(filePath);
      } catch {
        console.log('Archivo principal no encontrado:', filePath);
      }

      try {
        await unlink(thumbnailPath);
      } catch {
        console.log('Miniatura no encontrada:', thumbnailPath);
      }
    } catch (error) {
      console.log('Error eliminando archivos físicos:', error);
    }

    // Eliminar de la base de datos
    await prisma.image.delete({
      where: { id }
    });

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
