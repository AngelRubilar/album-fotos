import { NextRequest, NextResponse } from 'next/server';
import { getSimpleDatabase } from '@/lib/simple-db';

// GET /api/albums - Obtener todos los álbumes
export async function GET() {
  try {
    const db = getSimpleDatabase();
    const albums = await db.getAlbums();

    return NextResponse.json({
      success: true,
      data: albums
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });
  } catch (error) {
    console.error('Error fetching albums:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener álbumes' },
      { status: 500 }
    );
  }
}

export const revalidate = 60;

// POST /api/albums - Crear nuevo álbum
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, title, description, subAlbum } = body;

    // Validaciones
    if (!year || !title) {
      return NextResponse.json(
        { success: false, error: 'Año y título son requeridos' },
        { status: 400 }
      );
    }

    const db = getSimpleDatabase();

    // Crear nuevo álbum en la base de datos
    const newAlbum = await db.createAlbum({
      year: parseInt(year),
      title: title.trim(),
      description: description?.trim() || '',
      subAlbum: subAlbum?.trim() || undefined
    });

    return NextResponse.json({
      success: true,
      data: {
        id: newAlbum.id,
        year: newAlbum.year,
        title: newAlbum.title,
        description: newAlbum.description,
        subAlbum: newAlbum.subAlbum,
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
