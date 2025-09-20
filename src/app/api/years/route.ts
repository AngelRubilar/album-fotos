import { NextResponse } from 'next/server';
import { getSimpleDatabase } from '@/lib/simple-db';

// GET /api/years - Obtener años que tienen imágenes
export async function GET() {
  try {
    const db = getSimpleDatabase();
    const years = await db.getYearsWithImages();

    return NextResponse.json({
      success: true,
      data: years
    });
  } catch (error) {
    console.error('Error fetching years:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener años' },
      { status: 500 }
    );
  }
}
