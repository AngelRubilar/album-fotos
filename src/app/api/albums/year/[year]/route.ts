import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{
    year: string;
  }>;
}

// GET /api/albums/year/[year] - Obtener todos los álbumes de un año específico
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { year } = await params;
    const yearNumber = parseInt(year);

    if (isNaN(yearNumber)) {
      return NextResponse.json(
        { success: false, error: 'Año inválido' },
        { status: 400 }
      );
    }

    const albums = await prisma.album.findMany({
      where: { year: yearNumber },
      include: {
        _count: {
          select: { images: true }
        }
      },
      orderBy: [
        { subAlbum: 'asc' }, // Álbumes principales (null) primero
        { createdAt: 'desc' }
      ]
    });

    const albumsWithCount = albums.map(album => ({
      id: album.id,
      year: album.year,
      title: album.title,
      description: album.description,
      subAlbum: album.subAlbum,
      coverImageUrl: album.coverImageUrl,
      imageCount: album._count.images,
      createdAt: album.createdAt,
      updatedAt: album.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: albumsWithCount
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });

  } catch (error) {
    console.error('Error fetching albums by year:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener álbumes del año' },
      { status: 500 }
    );
  }
}

export const revalidate = 60;
