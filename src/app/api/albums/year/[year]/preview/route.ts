import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ year: string }>;
}

// GET /api/albums/year/[year]/preview - Get up to 4 preview thumbnails for a year
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { year } = await params;
    const yearNumber = parseInt(year);

    if (isNaN(yearNumber)) {
      return NextResponse.json(
        { success: false, error: 'Año inválido' },
        { status: 400 }
      );
    }

    // Single query: get 4 images from albums of this year
    const images = await prisma.image.findMany({
      where: { album: { year: yearNumber } },
      select: { thumbnailUrl: true, fileUrl: true },
      orderBy: { uploadedAt: 'desc' },
      take: 4,
    });

    const previews = images.map((img) =>
      img.thumbnailUrl?.includes('.webp') ? img.thumbnailUrl : (img.thumbnailUrl || img.fileUrl)
    ).filter(Boolean);

    return NextResponse.json({
      success: true,
      data: previews
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=300'
      }
    });
  } catch (error) {
    console.error('Error fetching year preview:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener preview' },
      { status: 500 }
    );
  }
}
