import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/albums/[id]/images - Obtener imágenes de un álbum específico
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Obtener álbum con sus imágenes
    const album = await prisma.album.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { uploadedAt: 'desc' }
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
        album: {
          id: album.id,
          year: album.year,
          title: album.title,
          description: album.description,
          subAlbum: album.subAlbum
        },
        images: album.images
      }
    });
  } catch (error) {
    console.error('Error fetching album images:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener imágenes del álbum' },
      { status: 500 }
    );
  }
}
