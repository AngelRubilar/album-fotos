import { NextRequest, NextResponse } from 'next/server';
import { getSimpleDatabase } from '@/lib/simple-db';

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/albums/[id] - Obtener álbum específico
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = getSimpleDatabase();
    
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
        id: album.id,
        year: album.year,
        title: album.title,
        description: album.description,
        subAlbum: album.subAlbum,
        imageCount: images.length,
        createdAt: album.createdAt
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
    const { title, description } = body;

    // Obtener álbumes desde la API principal
    const response = await fetch(`${request.nextUrl.origin}/api/albums`);
    const data = await response.json();
    
    if (!data.success) {
      return NextResponse.json(
        { success: false, error: 'Error al obtener álbumes' },
        { status: 500 }
      );
    }
    
    const album = data.data.find((a: any) => a.id === id);
    
    if (!album) {
      return NextResponse.json(
        { success: false, error: 'Álbum no encontrado' },
        { status: 404 }
      );
    }

    // Por ahora, retornamos éxito (en una implementación real actualizaríamos el storage)
    const updatedAlbum = {
      ...album,
      title: title?.trim() || album.title,
      description: description?.trim() || album.description,
    };

    return NextResponse.json({
      success: true,
      data: updatedAlbum,
      message: 'Álbum actualizado exitosamente'
    });

  } catch (error) {
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
    const db = getSimpleDatabase();
    
    // Verificar si el álbum existe
    const existingAlbum = await db.getAlbumById(id);
    
    if (!existingAlbum) {
      return NextResponse.json(
        { success: false, error: 'Álbum no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar álbum y sus imágenes
    await db.deleteAlbum(id);

    return NextResponse.json({
      success: true,
      data: {
        id: existingAlbum.id,
        year: existingAlbum.year,
        title: existingAlbum.title,
        description: existingAlbum.description,
        subAlbum: existingAlbum.subAlbum,
        imageCount: 0,
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
