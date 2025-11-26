import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/albums/[id] - Obtener álbum específico
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        _count: {
          select: { images: true }
        }
      }
    });

    if (!album) {
      return NextResponse.json(
        { success: false, error: 'Álbum no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: album.id,
        year: album.year,
        title: album.title,
        description: album.description,
        subAlbum: album.subAlbum,
        coverImageUrl: album.coverImageUrl,
        imageCount: album._count.images,
        createdAt: album.createdAt,
        updatedAt: album.updatedAt
      }
    });

  } catch (error) {
    console.error('Error fetching album:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener álbum' },
      { status: 500 }
    );
  }
}

// PUT /api/albums/[id] - Actualizar álbum
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, subAlbum } = body;

    // Verificar que el álbum existe
    const existingAlbum = await prisma.album.findUnique({
      where: { id }
    });

    if (!existingAlbum) {
      return NextResponse.json(
        { success: false, error: 'Álbum no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar álbum
    const updatedAlbum = await prisma.album.update({
      where: { id },
      data: {
        title: title?.trim() || existingAlbum.title,
        description: description?.trim() ?? existingAlbum.description,
        subAlbum: subAlbum?.trim() ?? existingAlbum.subAlbum
      },
      include: {
        _count: {
          select: { images: true }
        }
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: updatedAlbum.id,
        year: updatedAlbum.year,
        title: updatedAlbum.title,
        description: updatedAlbum.description,
        subAlbum: updatedAlbum.subAlbum,
        coverImageUrl: updatedAlbum.coverImageUrl,
        imageCount: updatedAlbum._count.images,
        createdAt: updatedAlbum.createdAt,
        updatedAt: updatedAlbum.updatedAt
      },
      message: 'Álbum actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error updating album:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar álbum' },
      { status: 500 }
    );
  }
}

// DELETE /api/albums/[id] - Eliminar álbum
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Verificar si el álbum existe
    const existingAlbum = await prisma.album.findUnique({
      where: { id },
      include: {
        _count: {
          select: { images: true }
        }
      }
    });

    if (!existingAlbum) {
      return NextResponse.json(
        { success: false, error: 'Álbum no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar álbum (las imágenes se eliminan en cascada gracias al schema)
    await prisma.album.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: existingAlbum.id,
        year: existingAlbum.year,
        title: existingAlbum.title,
        description: existingAlbum.description,
        subAlbum: existingAlbum.subAlbum,
        imageCount: existingAlbum._count.images,
        createdAt: existingAlbum.createdAt
      },
      message: 'Álbum eliminado exitosamente'
    });

  } catch (error) {
    console.error('Error deleting album:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error al eliminar álbum' },
      { status: 500 }
    );
  }
}
