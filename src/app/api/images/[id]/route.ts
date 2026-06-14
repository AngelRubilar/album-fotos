import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { unlink } from 'fs/promises';
import { safeResolve, UPLOADS_BASE, THUMBS_BASE } from '@/lib/storage';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/images/[id] - Obtener imagen con datos del album
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const image = await prisma.image.findUnique({
      where: { id },
      include: {
        album: {
          select: { id: true, title: true, year: true },
        },
      },
    });

    if (!image) {
      return NextResponse.json({ success: false, error: 'Imagen no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: image });
  } catch {
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
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
      const rel = image.fileUrl.replace(/^\/uploads\//, '');
      await unlink(safeResolve(UPLOADS_BASE, rel));
    } catch { console.warn('Archivo principal no encontrado:', image.fileUrl); }
    if (image.thumbnailUrl) {
      try {
        if (image.thumbnailUrl.startsWith('/thumbnails/')) {
          await unlink(safeResolve(THUMBS_BASE, image.thumbnailUrl.replace(/^\/thumbnails\//, '')));
        } else if (image.thumbnailUrl.startsWith('/uploads/')) {
          await unlink(safeResolve(UPLOADS_BASE, image.thumbnailUrl.replace(/^\/uploads\//, '')));
        }
      } catch { console.warn('Miniatura no encontrada:', image.thumbnailUrl); }
    }
    if (image.displayUrl && image.displayUrl.startsWith('/thumbnails/')) {
      try {
        await unlink(safeResolve(THUMBS_BASE, image.displayUrl.replace(/^\/thumbnails\//, '')));
      } catch { console.warn('Display no encontrada:', image.displayUrl); }
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
