import { NextRequest, NextResponse } from 'next/server';
import { getSimpleDatabase } from '@/lib/simple-db';

interface RouteParams {
  params: Promise<{
    year: string;
  }>;
}

// GET /api/albums/year/[year] - Obtener todos los álbumes de un año específico
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { year } = await params;
    const yearNumber = parseInt(year);

    if (isNaN(yearNumber)) {
      return NextResponse.json(
        { success: false, error: 'Año inválido' },
        { status: 400 }
      );
    }

    const db = getSimpleDatabase();
    const albums = await db.getAlbumsByYear(yearNumber);

    return NextResponse.json({
      success: true,
      data: albums
    });

  } catch (error) {
    console.error('Error fetching albums by year:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener álbumes del año' },
      { status: 500 }
    );
  }
}
