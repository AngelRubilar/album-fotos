import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;
    const filePath = path.join(process.cwd(), 'public', 'thumbnails', filename);

    // Verificar si el archivo existe
    try {
      await fs.access(filePath);
    } catch {
      return new NextResponse('File not found', { status: 404 });
    }

    // Leer el archivo
    const fileBuffer = await fs.readFile(filePath);

    // Determinar el tipo MIME basado en la extensión
    const ext = path.extname(filename).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };

    const mimeType = mimeTypes[ext] || 'application/octet-stream';

    // Devolver la imagen
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving thumbnail:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
