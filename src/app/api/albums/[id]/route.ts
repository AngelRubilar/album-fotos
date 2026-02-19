import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const albumInclude = {
  _count: { select: { images: true } },
  category: { select: { id: true, name: true } },
} as const;

function formatAlbum(album: any) {
  return {
    id: album.id,
    year: album.year,
    title: album.title,
    description: album.description,
    subAlbum: album.subAlbum,
    categoryId: album.categoryId,
    category: album.category,
    coverImageUrl: album.coverImageUrl,
    coverFocalPoint: album.coverFocalPoint,
    eventDate: album.eventDate,
    imageCount: album._count.images,
    createdAt: album.createdAt,
    updatedAt: album.updatedAt,
  };
}

// GET /api/albums/[id]
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const album = await prisma.album.findUnique({ where: { id }, include: albumInclude });

    if (!album) {
      return NextResponse.json({ success: false, error: 'Álbum no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: formatAlbum(album) });
  } catch (error) {
    console.error('Error fetching album:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener álbum' }, { status: 500 });
  }
}

// PUT /api/albums/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, categoryId, eventDate, coverImageUrl, coverFocalPoint } = body;

    const existing = await prisma.album.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Álbum no encontrado' }, { status: 404 });
    }

    // Resolver nombre de categoría si cambió
    let newCategoryId = categoryId !== undefined ? (categoryId || null) : existing.categoryId;
    let newSubAlbum = existing.subAlbum;

    if (categoryId !== undefined) {
      if (categoryId) {
        const cat = await prisma.category.findUnique({ where: { id: categoryId } });
        newSubAlbum = cat?.name ?? null;
      } else {
        newSubAlbum = null;
      }
    }

    const updated = await prisma.album.update({
      where: { id },
      data: {
        title: title?.trim() || existing.title,
        description: description?.trim() ?? existing.description,
        categoryId: newCategoryId,
        subAlbum: newSubAlbum,
        eventDate: eventDate !== undefined
          ? (eventDate ? new Date(eventDate) : null)
          : existing.eventDate,
        coverImageUrl: coverImageUrl !== undefined ? coverImageUrl : existing.coverImageUrl,
        coverFocalPoint: coverFocalPoint !== undefined ? coverFocalPoint : existing.coverFocalPoint,
      },
      include: albumInclude,
    });

    return NextResponse.json({ success: true, data: formatAlbum(updated) });
  } catch (error) {
    console.error('Error updating album:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar álbum' }, { status: 500 });
  }
}

// DELETE /api/albums/[id]
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const existing = await prisma.album.findUnique({
      where: { id },
      include: { _count: { select: { images: true } } }
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Álbum no encontrado' }, { status: 404 });
    }

    await prisma.album.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      data: { id: existing.id, title: existing.title },
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
