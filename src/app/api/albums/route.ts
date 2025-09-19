import { NextRequest, NextResponse } from 'next/server';

// Datos de ejemplo (en producción esto vendría de la base de datos)
const albums = [
  { id: "1", year: 2024, title: "Año 2024", description: "Fotos del año 2024", imageCount: 150, createdAt: "2024-01-01" },
  { id: "2", year: 2023, title: "Año 2023", description: "Fotos del año 2023", imageCount: 89, createdAt: "2023-01-01" },
  { id: "3", year: 2022, title: "Año 2022", description: "Fotos del año 2022", imageCount: 234, createdAt: "2022-01-01" },
  { id: "4", year: 2021, title: "Año 2021", description: "Fotos del año 2021", imageCount: 167, createdAt: "2021-01-01" },
];

// GET /api/albums - Obtener todos los álbumes
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: albums.sort((a, b) => b.year - a.year) // Ordenar por año descendente
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al obtener álbumes' },
      { status: 500 }
    );
  }
}

// POST /api/albums - Crear nuevo álbum
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { year, title, description } = body;

    // Validaciones
    if (!year || !title) {
      return NextResponse.json(
        { success: false, error: 'Año y título son requeridos' },
        { status: 400 }
      );
    }

    // Verificar si el año ya existe
    const existingAlbum = albums.find(album => album.year === year);
    if (existingAlbum) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un álbum para este año' },
        { status: 409 }
      );
    }

    // Crear nuevo álbum
    const newAlbum = {
      id: Date.now().toString(),
      year: parseInt(year),
      title: title.trim(),
      description: description?.trim() || '',
      imageCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };

    albums.push(newAlbum);

    return NextResponse.json({
      success: true,
      data: newAlbum,
      message: 'Álbum creado exitosamente'
    }, { status: 201 });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al crear álbum' },
      { status: 500 }
    );
  }
}
