import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/years - Obtener años que tienen imágenes (single query)
export async function GET() {
  try {
    // Single raw query replaces N+1 pattern (groupBy + N count queries)
    const result = await prisma.$queryRaw<
      Array<{ year: number; album_count: bigint; image_count: bigint }>
    >`
      SELECT a.year,
             COUNT(DISTINCT a.id) as album_count,
             COUNT(i.id) as image_count
      FROM albums a
      LEFT JOIN images i ON a.id = i."albumId"
      GROUP BY a.year
      HAVING COUNT(i.id) > 0
      ORDER BY a.year DESC
    `;

    const data = result.map((row) => ({
      year: row.year,
      totalImages: Number(row.image_count),
      albumCount: Number(row.album_count),
    }));

    return NextResponse.json({
      success: true,
      data
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
