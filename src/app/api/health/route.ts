// Health Check Endpoint para Docker healthcheck
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Verificación básica de que la aplicación responde
    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
