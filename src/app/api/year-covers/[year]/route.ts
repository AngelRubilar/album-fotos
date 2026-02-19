import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/year-covers/[year]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ year: string }> }
) {
  const { year } = await params;
  const yearNum = parseInt(year, 10);
  if (isNaN(yearNum)) {
    return NextResponse.json({ success: false, error: 'Año inválido' }, { status: 400 });
  }

  try {
    const cover = await prisma.yearCover.findUnique({ where: { year: yearNum } });
    return NextResponse.json({
      success: true,
      data: cover
        ? {
            coverImageUrl: cover.coverImageUrl,
            coverFocalPoint: cover.coverFocalPoint,
            description: cover.description,
          }
        : null,
    });
  } catch (error) {
    console.error('Error fetching year cover:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener portada' }, { status: 500 });
  }
}

// PUT /api/year-covers/[year] — upsert; campos opcionales
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ year: string }> }
) {
  const { year } = await params;
  const yearNum = parseInt(year, 10);
  if (isNaN(yearNum)) {
    return NextResponse.json({ success: false, error: 'Año inválido' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { coverImageUrl, coverFocalPoint, description } = body;

    // Si se piden borrar portada y no hay descripción, eliminar el registro entero
    if (coverImageUrl === null && description === undefined) {
      await prisma.yearCover.deleteMany({ where: { year: yearNum } });
      return NextResponse.json({ success: true, data: null });
    }

    // Verificar si ya existe
    const existing = await prisma.yearCover.findUnique({ where: { year: yearNum } });

    if (!existing && coverImageUrl === null && !description) {
      // No hay nada que guardar
      return NextResponse.json({ success: true, data: null });
    }

    const data: {
      coverImageUrl?: string | null;
      coverFocalPoint?: string | null;
      description?: string | null;
      updatedAt: Date;
    } = { updatedAt: new Date() };

    if (coverImageUrl !== undefined) data.coverImageUrl = coverImageUrl;
    if (coverFocalPoint !== undefined) data.coverFocalPoint = coverFocalPoint;
    if (description !== undefined) data.description = description || null;

    const cover = await prisma.yearCover.upsert({
      where: { year: yearNum },
      update: data,
      create: {
        year: yearNum,
        coverImageUrl: coverImageUrl ?? null,
        coverFocalPoint: coverFocalPoint ?? null,
        description: description || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        coverImageUrl: cover.coverImageUrl,
        coverFocalPoint: cover.coverFocalPoint,
        description: cover.description,
      },
    });
  } catch (error) {
    console.error('Error updating year cover:', error);
    return NextResponse.json({ success: false, error: 'Error al guardar' }, { status: 500 });
  }
}
