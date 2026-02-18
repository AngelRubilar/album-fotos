import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/albums/[id]/images - Obtener imágenes de un álbum con paginacion
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50', 10)));
    const skip = (page - 1) * limit;

    // Get album info
    const album = await prisma.album.findUnique({
      where: { id },
      select: {
        id: true,
        year: true,
        title: true,
        description: true,
        subAlbum: true,
      }
    });

    if (!album) {
      return NextResponse.json(
        { success: false, error: 'Álbum no encontrado' },
        { status: 404 }
      );
    }

    // Get paginated images + total count in parallel
    const [images, total] = await Promise.all([
      prisma.image.findMany({
        where: { albumId: id },
        select: {
          id: true,
          fileUrl: true,
          thumbnailUrl: true,
          originalName: true,
          description: true,
          width: true,
          height: true,
          fileSize: true,
          mimeType: true,
          uploadedAt: true,
          blurDataUrl: true,
        },
        orderBy: { uploadedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.image.count({ where: { albumId: id } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        album,
        images,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasMore: page < totalPages,
        }
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
