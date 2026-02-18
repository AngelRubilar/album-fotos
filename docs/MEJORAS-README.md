# Plan de Mejoras - Album de Fotos

## Objetivo
Modernizar la aplicacion con diseño glassmorphism, animaciones fluidas, mejor rendimiento y nuevas funcionalidades.

## Fases de Implementacion

| Fase | Documento | Descripcion | Dependencias |
|------|-----------|-------------|--------------|
| 1 | [FASE-1-GLASSMORPHISM.md](./FASE-1-GLASSMORPHISM.md) | Rediseño visual: glassmorphism, gradientes, nuevo sistema de temas | Ninguna |
| 2 | [FASE-2-ANIMACIONES.md](./FASE-2-ANIMACIONES.md) | Framer Motion: transiciones de pagina, stagger, gestos tactiles | Fase 1 |
| 3 | [FASE-3-RENDIMIENTO.md](./FASE-3-RENDIMIENTO.md) | LQIP placeholders, virtualizacion, optimizaciones de carga | Ninguna |
| 4 | [FASE-4-UX-MEJORAS.md](./FASE-4-UX-MEJORAS.md) | Skeleton loaders, busqueda, filtros, PWA | Fase 1 |
| 5 | [FASE-5-FUNCIONALIDADES.md](./FASE-5-FUNCIONALIDADES.md) | Pagina /image/[id], autenticacion basica, error boundaries | Fase 1-2 |

## Stack Actual
- **Frontend**: Next.js 15.5.3, React 19, Tailwind CSS 4, TypeScript 5
- **Backend**: Prisma 6.16, PostgreSQL 15, Sharp 0.34
- **Deploy**: Docker multi-stage, Docker Compose

## Archivos Clave del Proyecto
```
src/
├── app/
│   ├── layout.tsx              # Layout principal con Sidebar
│   ├── page.tsx                # Home - grid de años
│   ├── globals.css             # Estilos globales (masonry, animaciones)
│   ├── album/[year]/page.tsx   # Vista de album con masonry/grid
│   ├── upload/page.tsx         # Subida de fotos
│   ├── admin/page.tsx          # CRUD de albumes
│   └── api/                    # 14 endpoints REST
├── components/
│   ├── Sidebar.tsx             # Navegacion lateral
│   ├── AlbumPreview.tsx        # Previews de 4 imagenes
│   ├── ImageGallery.tsx        # Visor modal fullscreen
│   └── ThemeSelector.tsx       # Toggle de tema
├── contexts/
│   └── ThemeContext.tsx         # Sistema de temas light/dark
└── lib/
    ├── prisma.ts               # Singleton Prisma
    └── thumbnail.ts            # Generacion de thumbnails
```

## Orden Recomendado
1. **Fase 1** primero (base visual para todo lo demas)
2. **Fase 2 y 3** pueden ir en paralelo
3. **Fase 4** despues de Fase 1
4. **Fase 5** al final
