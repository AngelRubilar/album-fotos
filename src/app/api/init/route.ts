import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Verificar si ya existen álbumes
    const existingAlbums = await prisma.album.count();

    if (existingAlbums > 0) {
      return NextResponse.json({
        success: true,
        message: 'La base de datos ya está inicializada',
        data: { albumCount: existingAlbums }
      });
    }

    // Crear álbumes de ejemplo
    const exampleAlbums = [
      { year: 2024, title: 'Año 2024', description: 'Fotos del año 2024' },
      { year: 2023, title: 'Año 2023', description: 'Fotos del año 2023' },
      { year: 2022, title: 'Año 2022', description: 'Fotos del año 2022' },
      { year: 2021, title: 'Año 2021', description: 'Fotos del año 2021' },
    ];

    const createdAlbums = await prisma.album.createMany({
      data: exampleAlbums,
      skipDuplicates: true
    });

    return NextResponse.json({
      success: true,
      message: 'Base de datos inicializada correctamente',
      data: { albumsCreated: createdAlbums.count }
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { success: false, error: 'Error al inicializar la base de datos' },
      { status: 500 }
    );
  }
}
