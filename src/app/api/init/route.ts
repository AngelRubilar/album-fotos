import { NextResponse } from 'next/server';
import { getSimpleDatabase } from '@/lib/simple-db';

export async function POST() {
  try {
    const db = getSimpleDatabase();
    await db.seedDatabase();
    
    return NextResponse.json({
      success: true,
      message: 'Base de datos inicializada correctamente'
    });
  } catch (error) {
    console.error('Error initializing database:', error);
    return NextResponse.json(
      { success: false, error: 'Error al inicializar la base de datos' },
      { status: 500 }
    );
  }
}
