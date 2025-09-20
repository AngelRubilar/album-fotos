import { NextResponse } from 'next/server';
import { addTestImages } from '@/lib/add-test-images';

// POST /api/test-images - Agregar imágenes de prueba
export async function POST() {
  try {
    await addTestImages();
    
    return NextResponse.json({
      success: true,
      message: 'Imágenes de prueba agregadas correctamente'
    });
  } catch (error) {
    console.error('Error adding test images:', error);
    return NextResponse.json(
      { success: false, error: 'Error al agregar imágenes de prueba' },
      { status: 500 }
    );
  }
}
