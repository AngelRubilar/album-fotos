import { NextRequest, NextResponse } from 'next/server';
import { stat } from 'fs/promises';
import { createReadStream } from 'fs';
import path from 'path';
import { Readable } from 'stream';

const mimeTypes: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const filePath = path.join(process.cwd(), 'public', 'thumbnails', filename);

    let fileStats;
    try {
      fileStats = await stat(filePath);
    } catch {
      return new NextResponse('File not found', { status: 404 });
    }

    const ext = path.extname(filename).toLowerCase();
    const mimeType = mimeTypes[ext] || 'application/octet-stream';

    const stream = createReadStream(filePath);
    const webStream = Readable.toWeb(stream) as ReadableStream;

    return new NextResponse(webStream, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Length': String(fileStats.size),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Error serving thumbnail:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
