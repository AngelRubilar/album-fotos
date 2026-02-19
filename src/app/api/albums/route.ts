import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/albums - Obtener todos los álbumes
export async function GET() {
  try {
    const albums = await prisma.album.findMany({
      include: {
        _count: { select: { images: true } },
        category: { select: { id: true, name: true } },
      },
      orderBy: { year: 'desc' }
    });

    const albumsWithCount = albums.map(album => ({
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
      updatedAt: album.updatedAt
    }));

    return NextResponse.json({ success: true, data: albumsWithCount }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' }
    });
  } catch (error) {
    console.error('Error fetching albums:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener álbumes' }, { status: 500 });
  }
}

export const revalidate = 60;

// POST /api/albums - Crear nuevo álbum
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, title, description, categoryId, eventDate } = body;

    if (!year || !title) {
      return NextResponse.json({ success: false, error: 'Año y título son requeridos' }, { status: 400 });
    }

    // Resolver nombre de categoría si viene categoryId
    let categoryName: string | null = null;
    if (categoryId) {
      const cat = await prisma.category.findUnique({ where: { id: categoryId } });
      categoryName = cat?.name ?? null;
    }

    // Verificar duplicado
    const existingAlbum = await prisma.album.findFirst({
      where: { year: parseInt(year), title: title.trim(), subAlbum: categoryName }
    });
    if (existingAlbum) {
      return NextResponse.json(
        { success: false, error: `Ya existe un álbum con ese nombre para el año ${year}` },
        { status: 400 }
      );
    }

    const newAlbum = await prisma.album.create({
      data: {
        year: parseInt(year),
        title: title.trim(),
        description: description?.trim() || null,
        categoryId: categoryId || null,
        subAlbum: categoryName,
        eventDate: eventDate ? new Date(eventDate) : null,
      },
      include: { category: { select: { id: true, name: true } } }
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newAlbum.id,
        year: newAlbum.year,
        title: newAlbum.title,
        description: newAlbum.description,
        subAlbum: newAlbum.subAlbum,
        categoryId: newAlbum.categoryId,
        category: newAlbum.category,
        eventDate: newAlbum.eventDate,
        coverImageUrl: newAlbum.coverImageUrl,
        imageCount: 0,
        createdAt: newAlbum.createdAt
      },
      message: 'Álbum creado exitosamente'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating album:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error al crear álbum' },
      { status: 500 }
    );
  }
}
