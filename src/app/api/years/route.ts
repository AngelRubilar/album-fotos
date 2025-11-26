import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/years - Obtener años que tienen imágenes
export async function GET() {
  try {
    // Obtener años con conteo de imágenes usando agregación
    const yearsData = await prisma.album.groupBy({
      by: ['year'],
      _count: {
        id: true
      },
      orderBy: {
        year: 'desc'
      }
    });

    // Obtener conteo de imágenes por año
    const yearsWithImages = await Promise.all(
      yearsData.map(async (yearGroup) => {
        const imageCount = await prisma.image.count({
          where: {
            album: {
              year: yearGroup.year
            }
          }
        });

        return {
          year: yearGroup.year,
          totalImages: imageCount,
          albumCount: yearGroup._count.id
        };
      })
    );

    // Filtrar solo años que tienen imágenes
    const filteredYears = yearsWithImages.filter(y => y.totalImages > 0);

    return NextResponse.json({
      success: true,
      data: filteredYears
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });
  } catch (error) {
    console.error('Error fetching years:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener años' },
      { status: 500 }
    );
  }
}

export const revalidate = 60;
