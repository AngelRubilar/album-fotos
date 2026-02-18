import { NextResponse } from 'next/server';
import crypto from 'crypto';

// Almacen de tokens activos en memoria (en produccion usar Redis/DB)
const activeTokens = new Set<string>();

export async function POST(request: Request) {
  const { password } = await request.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    // Si no hay contraseña configurada, permitir acceso libre
    return NextResponse.json({ success: true, token: 'no-auth-required' });
  }

  // Comparacion timing-safe
  const inputHash = crypto.createHash('sha256').update(password).digest();
  const expectedHash = crypto.createHash('sha256').update(adminPassword).digest();

  if (crypto.timingSafeEqual(inputHash, expectedHash)) {
    const token = crypto.randomBytes(32).toString('hex');
    activeTokens.add(token);

    // Expirar token despues de 24h
    setTimeout(() => activeTokens.delete(token), 24 * 60 * 60 * 1000);

    return NextResponse.json({ success: true, token });
  }

  return NextResponse.json(
    { success: false, error: 'Contraseña incorrecta' },
    { status: 401 }
  );
}

// Exportar para que otros endpoints puedan verificar tokens
export function isValidToken(token: string | null): boolean {
  if (!process.env.ADMIN_PASSWORD) return true; // Sin auth configurada
  if (!token) return false;
  if (token === 'no-auth-required') return !process.env.ADMIN_PASSWORD;
  return activeTokens.has(token);
}
