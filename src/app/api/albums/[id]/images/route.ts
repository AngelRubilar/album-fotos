import { NextRequest, NextResponse } from 'next/server';
import { getSimpleDatabase } from '@/lib/simple-db';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/albums/[id]/images - Obtener imágenes de un álbum específico
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = getSimpleDatabase();
    
    // Verificar que el álbum existe
    const album = await db.getAlbumById(id);
    if (!album) {
      return NextResponse.json(
        { success: false, error: 'Álbum no encontrado' },
        { status: 404 }
      );
    }

    // Obtener imágenes del álbum
    const images = await db.getImagesByAlbum(id);

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
        images: images
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
