# Fase 5: Nuevas Funcionalidades

## Resumen
Implementar la pagina de imagen individual, autenticacion basica, error boundaries, y accesibilidad.

## Dependencia
- **Requiere**: Fase 1 y 2 completadas

---

## Paso 5.1: Pagina /image/[id] funcional

### Concepto
Actualmente la pagina tiene datos dummy. Conectarla al sistema real para que sirva como enlace directo a una imagen.

### 5.1.1 Crear endpoint GET /api/images/[id]

**Archivo nuevo**: `src/app/api/images/[id]/route.ts` (agregar handler GET)

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const image = await prisma.image.findUnique({
      where: { id },
      include: {
        album: {
          select: {
            id: true,
            title: true,
            year: true,
          },
        },
      },
    });

    if (!image) {
      return NextResponse.json({ success: false, error: 'Imagen no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: image });
  } catch {
    return NextResponse.json({ success: false, error: 'Error interno' }, { status: 500 });
  }
}
```

### 5.1.2 Reescribir pagina /image/[id]

**Archivo**: `src/app/image/[id]/page.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

export default function ImagePage({ params }: { params: Promise<{ id: string }> }) {
  const { t } = useTheme();
  const [imageId, setImageId] = useState('');
  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    params.then(({ id }) => setImageId(id));
  }, [params]);

  useEffect(() => {
    if (!imageId) return;
    fetch(`/api/images/${imageId}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setImage(d.data);
        else setError(d.error);
      })
      .catch(() => setError('Error al cargar la imagen'))
      .finally(() => setLoading(false));
  }, [imageId]);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${t.bg}`}>
        <div className={`animate-spin rounded-full h-8 w-8 border-2 border-t-transparent ${t.border}`} />
      </div>
    );
  }

  if (error || !image) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${t.bg}`}>
        <div className="text-center">
          <h2 className={`text-xl font-bold ${t.text} mb-2`}>Imagen no encontrada</h2>
          <p className={`${t.textMuted} mb-4`}>{error}</p>
          <Link href="/" className={`${t.accent} hover:underline`}>Volver al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${t.bg}`}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Breadcrumb */}
        <nav className={`flex items-center gap-1.5 text-sm ${t.textMuted} mb-6`}>
          <Link href="/" className="hover:underline">Inicio</Link>
          <span>/</span>
          <Link href={`/album/${image.album.year}`} className="hover:underline">{image.album.year}</Link>
          <span>/</span>
          <span className={t.text}>{image.originalName}</span>
        </nav>

        {/* Imagen principal */}
        <div className={`${t.glassCard} rounded-2xl overflow-hidden mb-6`}>
          <div className="relative flex items-center justify-center bg-black/5 dark:bg-black/20 min-h-[60vh]">
            <Image
              src={image.fileUrl}
              alt={image.originalName}
              width={image.width || 1200}
              height={image.height || 800}
              className="max-w-full max-h-[70vh] object-contain"
              priority
            />
          </div>
        </div>

        {/* Metadata */}
        <div className={`${t.glassCard} rounded-2xl p-6`}>
          <h2 className={`text-lg font-semibold ${t.text} mb-4`}>{image.originalName}</h2>
          {image.description && (
            <p className={`${t.textMuted} mb-4`}>{image.description}</p>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className={`text-xs uppercase tracking-wider ${t.textMuted} mb-1`}>Dimensiones</p>
              <p className={`text-sm font-medium ${t.text}`}>
                {image.width && image.height ? `${image.width} x ${image.height}` : 'Desconocido'}
              </p>
            </div>
            <div>
              <p className={`text-xs uppercase tracking-wider ${t.textMuted} mb-1`}>Tamaño</p>
              <p className={`text-sm font-medium ${t.text}`}>
                {image.fileSize ? `${(image.fileSize / 1024 / 1024).toFixed(1)} MB` : 'Desconocido'}
              </p>
            </div>
            <div>
              <p className={`text-xs uppercase tracking-wider ${t.textMuted} mb-1`}>Tipo</p>
              <p className={`text-sm font-medium ${t.text}`}>{image.mimeType || 'Desconocido'}</p>
            </div>
            <div>
              <p className={`text-xs uppercase tracking-wider ${t.textMuted} mb-1`}>Album</p>
              <Link href={`/album/${image.album.year}`} className={`text-sm font-medium ${t.accent}`}>
                {image.album.title}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## Paso 5.2: Autenticacion Basica

### Concepto
Proteger las rutas de admin, upload y delete con una contraseña simple. Sin sistema de usuarios complejo.

### 5.2.1 Variables de entorno

**Archivo**: `.env`

```
ADMIN_PASSWORD=tu-contraseña-segura
```

### 5.2.2 Crear contexto de auth

**Archivo nuevo**: `src/contexts/AuthContext.tsx`

```typescript
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('auth-token');
    if (token) setIsAuthenticated(true);
  }, []);

  const login = (password: string) => {
    // Verificar contra la API
    // (NO verificar en el cliente, enviar al servidor)
    return false; // placeholder
  };

  const logout = () => {
    sessionStorage.removeItem('auth-token');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
```

### 5.2.3 Endpoint de login

**Archivo nuevo**: `src/app/api/auth/login/route.ts`

```typescript
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  const { password } = await request.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json({ success: false, error: 'Auth no configurada' }, { status: 500 });
  }

  // Comparacion timing-safe
  const inputHash = crypto.createHash('sha256').update(password).digest();
  const expectedHash = crypto.createHash('sha256').update(adminPassword).digest();

  if (crypto.timingSafeEqual(inputHash, expectedHash)) {
    // Generar token simple
    const token = crypto.randomBytes(32).toString('hex');
    // En produccion: guardar en DB o Redis con expiracion
    return NextResponse.json({ success: true, token });
  }

  return NextResponse.json({ success: false, error: 'Contraseña incorrecta' }, { status: 401 });
}
```

### 5.2.4 Componente LoginModal

**Archivo nuevo**: `src/components/LoginModal.tsx`

Modal glass que pide la contraseña cuando se intenta acceder a admin/upload/delete.

```typescript
'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface LoginModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function LoginModal({ onSuccess, onCancel }: LoginModalProps) {
  const { t } = useTheme();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();

      if (data.success) {
        sessionStorage.setItem('auth-token', data.token);
        onSuccess();
      } else {
        setError(data.error);
      }
    } catch {
      setError('Error de conexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={onCancel} />
      <div className={`relative ${t.glassCard} rounded-2xl p-8 w-full max-w-sm mx-4`}>
        <h2 className={`text-xl font-bold ${t.text} mb-2`}>Acceso Administrador</h2>
        <p className={`text-sm ${t.textMuted} mb-6`}>Ingresa la contraseña para continuar.</p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Contraseña"
            className={`w-full px-4 py-3 rounded-xl border ${t.inputBorder} ${t.inputBg} ${t.text} backdrop-blur-sm focus:ring-2 focus:ring-blue-500/50 focus:outline-none mb-3`}
            autoFocus
          />
          {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={onCancel} className={`flex-1 px-4 py-2.5 rounded-xl border ${t.inputBorder} ${t.text} text-sm`}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl btn-glass-accent text-white text-sm font-medium disabled:opacity-50">
              {loading ? 'Verificando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

### 5.2.5 Proteger rutas

En las paginas `/admin` y `/upload`, verificar autenticacion:

```tsx
const { isAuthenticated } = useAuth();
const [showLogin, setShowLogin] = useState(false);

if (!isAuthenticated) {
  return <LoginModal onSuccess={() => {}} onCancel={() => router.push('/')} />;
}
```

En las API de escritura (POST, DELETE, PATCH), verificar el token:

```typescript
const token = request.headers.get('Authorization')?.replace('Bearer ', '');
// Verificar token...
```

---

## Paso 5.3: Error Boundaries

### 5.3.1 Crear componente ErrorBoundary

**Archivo nuevo**: `src/components/ErrorBoundary.tsx`

```typescript
'use client';

import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mb-4">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Algo salio mal</h3>
            <p className="text-neutral-400 mb-4 text-sm">{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-500"
            >
              Intentar de nuevo
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 5.3.2 Envolver componentes criticos

**Archivo**: `src/app/layout.tsx`

```tsx
import ErrorBoundary from '@/components/ErrorBoundary';

// Envolver el main content:
<main className="flex-1 min-h-screen overflow-y-auto glass-bg">
  <ErrorBoundary>
    {children}
  </ErrorBoundary>
</main>
```

---

## Paso 5.4: Accesibilidad

### 5.4.1 Agregar alt texts descriptivos

En todos los `<Image>` que tengan `alt=""`:
```tsx
// ANTES:
<Image src={src} alt="" ... />

// DESPUES:
<Image src={src} alt={`Foto del album ${albumTitle}`} ... />
```

### 5.4.2 ARIA labels en botones de icono

```tsx
// ANTES:
<button onClick={onClose}>
  <svg ...><path ... /></svg>
</button>

// DESPUES:
<button onClick={onClose} aria-label="Cerrar">
  <svg ...><path ... /></svg>
</button>
```

### 5.4.3 Lista de botones a agregar aria-label:

| Componente | Boton | aria-label |
|------------|-------|------------|
| Sidebar.tsx | Hamburger mobile | "Abrir menu" |
| Sidebar.tsx | Theme toggle | "Cambiar tema" |
| ImageGallery.tsx | Cerrar | "Cerrar galeria" |
| ImageGallery.tsx | Info | "Ver informacion" |
| ImageGallery.tsx | Prev | "Imagen anterior" |
| ImageGallery.tsx | Next | "Imagen siguiente" |
| Album page | Delete image | "Eliminar imagen" |
| Admin page | Delete album | "Eliminar album" |

### 5.4.4 Focus management en modal

```tsx
// En ImageGallery, agregar focus trap:
useEffect(() => {
  if (isOpen) {
    // Guardar el elemento enfocado antes de abrir
    const previousFocus = document.activeElement as HTMLElement;
    // Focus el modal
    modalRef.current?.focus();

    return () => {
      // Restaurar focus al cerrar
      previousFocus?.focus();
    };
  }
}, [isOpen]);
```

### 5.4.5 Skip navigation link

**Archivo**: `src/app/layout.tsx`

```tsx
<body>
  <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:rounded-xl focus:bg-blue-600 focus:text-white">
    Saltar al contenido
  </a>
  ...
  <main id="main-content" ...>
```

---

## Checklist de Implementacion

- [ ] 5.1.1 Endpoint GET /api/images/[id]
- [ ] 5.1.2 Pagina /image/[id] funcional
- [ ] 5.2.1 Variables de entorno
- [ ] 5.2.2 AuthContext
- [ ] 5.2.3 Endpoint de login
- [ ] 5.2.4 LoginModal
- [ ] 5.2.5 Proteger rutas
- [ ] 5.3.1 ErrorBoundary
- [ ] 5.3.2 Envolver componentes
- [ ] 5.4.1 Alt texts
- [ ] 5.4.2 ARIA labels
- [ ] 5.4.3 Todos los botones con aria-label
- [ ] 5.4.4 Focus management
- [ ] 5.4.5 Skip navigation
- [ ] Probar login/logout completo
- [ ] Probar error boundary con error forzado
- [ ] Probar con screen reader
- [ ] Probar navegacion con teclado

## Dependencias
**Ninguna nueva** - Todo es React + Next.js + CSS puro.
