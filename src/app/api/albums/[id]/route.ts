import { NextRequest, NextResponse } from 'next/server';

// Datos de ejemplo (en producción esto vendría de la base de datos)
const albums = [
  { id: "1", year: 2024, title: "Año 2024", description: "Fotos del año 2024", imageCount: 150, createdAt: "2024-01-01" },
  { id: "2", year: 2023, title: "Año 2023", description: "Fotos del año 2023", imageCount: 89, createdAt: "2023-01-01" },
  { id: "3", year: 2022, title: "Año 2022", description: "Fotos del año 2022", imageCount: 234, createdAt: "2022-01-01" },
  { id: "4", year: 2021, title: "Año 2021", description: "Fotos del año 2021", imageCount: 167, createdAt: "2021-01-01" },
];

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

// GET /api/albums/[id] - Obtener álbum específico
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const album = albums.find(a => a.id === id);
    
    if (!album) {
      return NextResponse.json(
        { success: false, error: 'Álbum no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: album
    });

  } catch (error) {
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

    const albumIndex = albums.findIndex(a => a.id === id);
    
    if (albumIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Álbum no encontrado' },
        { status: 404 }
      );
    }

    // Actualizar álbum
    albums[albumIndex] = {
      ...albums[albumIndex],
      title: title?.trim() || albums[albumIndex].title,
      description: description?.trim() || albums[albumIndex].description,
    };

    return NextResponse.json({
      success: true,
      data: albums[albumIndex],
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
    
    const albumIndex = albums.findIndex(a => a.id === id);
    
    if (albumIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Álbum no encontrado' },
        { status: 404 }
      );
    }

    // Eliminar álbum
    const deletedAlbum = albums.splice(albumIndex, 1)[0];

    return NextResponse.json({
      success: true,
      data: deletedAlbum,
      message: 'Álbum eliminado exitosamente'
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Error al eliminar álbum' },
      { status: 500 }
    );
  }
}
