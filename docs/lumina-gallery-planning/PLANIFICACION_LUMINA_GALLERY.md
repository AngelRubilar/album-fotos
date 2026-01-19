# 📋 PLANIFICACIÓN COMPLETA: LUMINA GALLERY

> Transformación del Álbum de Fotos a diseño "Lumina Gallery"
> **Duración Estimada**: 20-28 días de trabajo (4-6 semanas)
> **Total de Issues**: 18 issues organizados en 5 milestones

---

## 📊 RESUMEN EJECUTIVO

**Stack Actual**: Next.js 15 + React 19 + TypeScript + Tailwind CSS 4 + Prisma + PostgreSQL
**Dependencias Disponibles**: Framer Motion ✅ | TanStack Query ✅ | Next/Image ✅

### Objetivo General
Transformar la aplicación actual en un diseño moderno tipo Apple Photos / Google Photos con:
- ✨ Sidebar de navegación profesional
- 🎨 Bento Grid dinámico (masonry layout)
- 📅 Vista Timeline cronológica
- 🔍 Vista Explorar con filtros avanzados
- ⭐ Sistema de Favoritos
- 🤖 Álbumes Inteligentes auto-generados
- 📷 Panel EXIF de metadatos
- 🎭 Glassmorphism prominente
- 🌈 Panel flotante de temas mejorado

---

## 🏆 MILESTONES Y ESTIMACIONES

| Milestone | Descripción | Issues | Días |
|-----------|-------------|--------|------|
| **M1** | Fundaciones y Arquitectura Base | 4 issues | 3-4 días |
| **M2** | Vistas Principales y Navegación | 4 issues | 4-5 días |
| **M3** | Bento Grid y Visualización Avanzada | 3 issues | 3-4 días |
| **M4** | Álbumes Inteligentes y Búsqueda | 3 issues | 4-5 días |
| **M5** | Pulido, Animaciones y Optimización | 4 issues | 3-4 días |
| **TOTAL** | **5 Milestones** | **18 issues** | **20-28 días** |

---

## 📅 CALENDARIO DE EJECUCIÓN

### SEMANA 1 - Fundaciones (CRÍTICO)
```
Día 1-2: ISSUE #1 (BD) + ISSUE #2 (Sidebar)
Día 3:   ISSUE #3 (Layout)
Día 4-5: ISSUE #5 (Timeline) + ISSUE #6 (Favoritos)
```

### SEMANA 2 - Vistas Principales (IMPORTANTE)
```
Día 6-7:  ISSUE #7 (Explorar)
Día 8-9:  ISSUE #9 (Bento Grid)
Día 10:   ISSUE #10 (EXIF) + ISSUE #11 (Panel EXIF)
```

### SEMANA 3 - Álbumes Inteligentes (MEJORAS)
```
Día 11-13: ISSUE #12 (Smart Albums)
Día 14:    ISSUE #13 (Vista Smart Albums)
Día 15:    ISSUE #4 (Perfil) + ISSUE #8 (Panel Temas)
```

### SEMANA 4 - Pulido y Optimización (REFINAMIENTO)
```
Día 16-17: ISSUE #15 (Framer Motion)
Día 18-19: ISSUE #16 (Virtualización) + ISSUE #14 (Tags)
Día 20:    ISSUE #17 (Glassmorphism) + ISSUE #18 (Docs)
```

---

## 🎯 MILESTONE 1: FUNDACIONES Y ARQUITECTURA BASE

**Objetivo**: Establecer la estructura base del nuevo diseño sin romper funcionalidades existentes
**Duración**: 3-4 días | **Issues**: 4

### ISSUE #1: Migración de Base de Datos - Campos Nuevos
- **Prioridad**: 🔴 Alta
- **Estimación**: M (4-6 horas)
- **Labels**: `database`, `backend`, `migration`
- **Dependencias**: Ninguna

**Descripción**: Agregar campos necesarios a la BD para soportar las nuevas funcionalidades.

**Cambios en `prisma/schema.prisma`**:
```prisma
model Image {
  // ... campos existentes ...

  // NUEVOS CAMPOS
  isFavorite    Boolean  @default(false)
  featured      Boolean  @default(false)
  exifData      Json?
  takenAt       DateTime?
  location      String?
  latitude      Float?
  longitude     Float?
  cameraMake    String?
  cameraModel   String?
  lens          String?
  focalLength   String?
  aperture      String?
  shutterSpeed  String?
  iso           Int?

  // Relaciones
  tags          Tag[]    @relation("ImageTags")
}

model Tag {
  id         String   @id @default(cuid())
  name       String   @unique
  category   String   // 'location', 'object', 'person', 'event'
  color      String?
  createdAt  DateTime @default(now())
  images     Image[]  @relation("ImageTags")

  @@index([category])
  @@map("tags")
}

model SmartAlbum {
  id          String   @id @default(cuid())
  title       String
  description String?
  icon        String?
  rules       Json     // Criterios de filtrado
  isSystem    Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("smart_albums")
}
```

**Tareas**:
- [ ] Crear migración de Prisma
- [ ] Ejecutar migración en desarrollo
- [ ] Actualizar seed data
- [ ] Verificar rollback funciona

**Archivos a Crear/Modificar**:
- `prisma/schema.prisma` (modificar)
- `prisma/migrations/XXXXXX_add_lumina_fields/migration.sql` (crear)
- `prisma/seed.ts` (modificar)

---

### ISSUE #2: Componente Sidebar Principal
- **Prioridad**: 🔴 Alta
- **Estimación**: L (8-12 horas)
- **Labels**: `frontend`, `components`, `design`
- **Dependencias**: Ninguna

**Descripción**: Crear el sidebar izquierdo principal con navegación y avatar de perfil.

**Secciones del Sidebar**:
- 👤 Avatar de perfil (top)
- 📅 Timeline
- 🔍 Explorar
- 📁 Álbumes
- ⭐ Favoritos
- 🎨 Themes
- ⚙️ Configuración

**Tareas**:
- [ ] Crear componente `Sidebar.tsx`
- [ ] Implementar navegación con Next.js Link
- [ ] Estados activo/colapsado con animaciones
- [ ] Responsive (colapsable en móvil)
- [ ] Integración con temas existentes
- [ ] Iconos SVG para cada sección

**Archivos a Crear**:
- `src/components/layout/Sidebar.tsx` (nuevo)
- `src/components/layout/SidebarItem.tsx` (nuevo)
- `src/components/layout/MobileMenuButton.tsx` (nuevo)
- `src/hooks/useSidebar.ts` (nuevo)

**Criterios de Aceptación**:
- [ ] Sidebar visible en desktop
- [ ] Colapsable en móvil con hamburger
- [ ] Navegación funcional
- [ ] Animaciones suaves
- [ ] Indicador de página activa
- [ ] Glassmorphism aplicado

---

### ISSUE #3: Ajustar Layout Principal para Sidebar + Contenido
- **Prioridad**: 🔴 Alta
- **Estimación**: M (4-6 horas)
- **Labels**: `frontend`, `layout`
- **Dependencias**: ISSUE #2

**Descripción**: Modificar el layout raíz para acomodar sidebar + contenido.

**Estructura**:
```tsx
<div className="flex min-h-screen">
  <Sidebar />
  <main className="flex-1 overflow-y-auto">
    {children}
  </main>
</div>
```

**Tareas**:
- [ ] Modificar `layout.tsx` para grid 2 columnas
- [ ] Estado global de sidebar (expandido/colapsado)
- [ ] Transiciones smooth
- [ ] Responsive breakpoints
- [ ] Z-index hierarchy

**Archivos a Modificar**:
- `src/app/layout.tsx`
- `src/contexts/ThemeContext.tsx` (opcional)

---

### ISSUE #4: Context de Usuario y Perfil
- **Prioridad**: 🟡 Media
- **Estimación**: S (2-4 horas)
- **Labels**: `backend`, `frontend`
- **Dependencias**: ISSUE #2

**Descripción**: Sistema básico de perfil de usuario para el sidebar.

**Tareas**:
- [ ] Crear contexto de usuario
- [ ] Modelo de usuario (nombre, avatar, bio)
- [ ] Almacenamiento en localStorage
- [ ] Componente de perfil editable

**Archivos a Crear**:
- `src/contexts/UserContext.tsx`
- `src/components/profile/ProfileAvatar.tsx`
- `src/components/profile/ProfileEditor.tsx`

---

## 🎯 MILESTONE 2: VISTAS PRINCIPALES Y NAVEGACIÓN

**Objetivo**: Implementar las nuevas vistas principales
**Duración**: 4-5 días | **Issues**: 4

### ISSUE #5: Vista Timeline - Todas las Fotos Cronológicamente
- **Prioridad**: 🔴 Alta
- **Estimación**: L (8-12 horas)
- **Labels**: `frontend`, `features`
- **Dependencias**: ISSUE #1, ISSUE #2

**Descripción**: Vista Timeline con TODAS las fotos en orden cronológico.

**Funcionalidades**:
- Infinite scroll con TanStack Query
- Agrupación por fechas (Hoy, Ayer, Esta semana, etc.)
- Grid responsive
- Click abre lightbox

**API Endpoint**:
```typescript
GET /api/timeline?page=1&limit=50&sort=desc
Response: {
  images: Image[],
  hasMore: boolean,
  nextCursor: string
}
```

**Archivos a Crear**:
- `src/app/timeline/page.tsx`
- `src/app/api/timeline/route.ts`
- `src/components/timeline/TimelineGrid.tsx`
- `src/components/timeline/DateSeparator.tsx`
- `src/hooks/useInfiniteTimeline.ts`

**Criterios de Aceptación**:
- [ ] Muestra todas las fotos cronológicamente
- [ ] Scroll infinito funciona
- [ ] Agrupación por fechas correcta
- [ ] Performance optimizado
- [ ] Estados de carga/error

---

### ISSUE #6: Sistema de Favoritos
- **Prioridad**: 🔴 Alta
- **Estimación**: M (6-8 horas)
- **Labels**: `frontend`, `backend`, `features`
- **Dependencias**: ISSUE #1, ISSUE #2

**Descripción**: Sistema completo de favoritos.

**API Endpoints**:
```typescript
PUT /api/images/:id/favorite
DELETE /api/images/:id/favorite
GET /api/favorites?page=1&limit=50
```

**Tareas**:
- [ ] API endpoints para favoritos
- [ ] Vista `/favorites/page.tsx`
- [ ] Botón de favorito en lightbox
- [ ] Botón en grids de fotos
- [ ] Contador en sidebar
- [ ] Animación de "corazón"

**Archivos a Crear**:
- `src/app/favorites/page.tsx`
- `src/app/api/images/[id]/favorite/route.ts`
- `src/app/api/favorites/route.ts`
- `src/components/common/FavoriteButton.tsx`

**Archivos a Modificar**:
- `src/components/ImageGallery.tsx`
- `src/components/layout/Sidebar.tsx`

---

### ISSUE #7: Vista Explorar con Búsqueda y Filtros
- **Prioridad**: 🟡 Media
- **Estimación**: L (10-14 horas)
- **Labels**: `frontend`, `backend`, `features`
- **Dependencias**: ISSUE #1, ISSUE #2

**Descripción**: Vista de exploración con búsqueda y filtros avanzados.

**Filtros**:
- Rango de fechas
- Álbum
- Cámara/modelo
- Favoritos
- Tags

**API Endpoint**:
```typescript
GET /api/search?q=text&from=date&to=date&album=id&camera=model&favorites=true
```

**Archivos a Crear**:
- `src/app/explore/page.tsx`
- `src/app/api/search/route.ts`
- `src/components/explore/SearchBar.tsx`
- `src/components/explore/FilterPanel.tsx`
- `src/components/explore/FilterChip.tsx`

---

### ISSUE #8: Panel Flotante de Personalización de Temas
- **Prioridad**: 🟡 Media
- **Estimación**: M (4-6 horas)
- **Labels**: `frontend`, `design`
- **Dependencias**: ISSUE #2

**Descripción**: Panel flotante moderno para selección de temas.

**Temas Destacados**:
1. 💎 Modo Cristal (glassmorphism)
2. 🌙 Dark 2.0 (negro puro)
3. 📄 Orgánico (texturas de papel)

**Archivos a Crear**:
- `src/components/themes/ThemePanel.tsx`
- `src/components/themes/ThemePreviewCard.tsx`

**Archivos a Modificar**:
- `src/contexts/ThemeContext.tsx`
- `src/components/layout/Sidebar.tsx`

---

## 🎯 MILESTONE 3: BENTO GRID Y VISUALIZACIÓN AVANZADA

**Objetivo**: Grid dinámico y panel EXIF
**Duración**: 3-4 días | **Issues**: 3

### ISSUE #9: Bento Grid Dinámico (Masonry Layout)
- **Prioridad**: 🔴 Alta
- **Estimación**: L (10-14 horas)
- **Labels**: `frontend`, `design`, `complex`
- **Dependencias**: ISSUE #1

**Descripción**: Grid tipo masonry donde fotos destacadas ocupan 2x2.

**Implementación**:
- Usar `react-masonry-css` (más estable que CSS Grid Masonry)
- Fotos featured = 2x2
- Fotos normales = 1x1
- Animaciones con Framer Motion
- Lazy loading

**Criterios para Featured**:
- Campo `featured` en BD (manual)
- Primeras N fotos del álbum
- Fotos favoritas
- Mayor resolución

**Archivos a Crear**:
- `src/components/gallery/BentoGrid.tsx`
- `src/components/gallery/BentoGridItem.tsx`
- `src/hooks/useBentoLayout.ts`

**Archivos a Modificar**:
- `src/app/page.tsx`
- `src/app/album/[year]/page.tsx`

**Criterios de Aceptación**:
- [ ] Grid masonry funciona
- [ ] Fotos destacadas 2x2
- [ ] Responsive
- [ ] Performance optimizado
- [ ] Animaciones suaves

---

### ISSUE #10: Extracción de EXIF Data
- **Prioridad**: 🟡 Media
- **Estimación**: M (6-8 horas)
- **Labels**: `backend`, `features`
- **Dependencias**: ISSUE #1

**Descripción**: Extraer y almacenar metadatos EXIF al subir imágenes.

**Librería**: `exifr`

**Datos a Extraer**:
- Fecha y hora de captura
- Cámara (make, model)
- Lente
- Configuración (ISO, aperture, shutter speed, focal length)
- GPS (si disponible)
- Dimensiones originales

**Archivos a Modificar**:
- `src/app/api/upload/route.ts`
- `package.json`

**Criterios de Aceptación**:
- [ ] EXIF se extrae al subir
- [ ] Datos se guardan en BD
- [ ] No falla si EXIF no existe
- [ ] Campos clave parseados

---

### ISSUE #11: Panel EXIF en Lightbox
- **Prioridad**: 🟡 Media
- **Estimación**: M (4-6 horas)
- **Labels**: `frontend`, `features`
- **Dependencias**: ISSUE #10

**Descripción**: Panel lateral en lightbox con información EXIF.

**Datos a Mostrar**:
- 📅 Fecha y hora de captura
- 📷 Cámara y lente
- ⚙️ Configuración (ISO, aperture, shutter, focal)
- 📐 Dimensiones
- 💾 Tamaño de archivo
- 📍 Ubicación (si GPS disponible)

**Archivos a Crear**:
- `src/components/gallery/ExifPanel.tsx`
- `src/components/gallery/ExifDataRow.tsx`

**Archivos a Modificar**:
- `src/components/ImageGallery.tsx`

---

## 🎯 MILESTONE 4: ÁLBUMES INTELIGENTES Y BÚSQUEDA

**Objetivo**: Álbumes auto-generados
**Duración**: 4-5 días | **Issues**: 3

### ISSUE #12: Generador de Álbumes Inteligentes
- **Prioridad**: 🟡 Media
- **Estimación**: XL (14-18 horas)
- **Labels**: `backend`, `features`, `complex`
- **Dependencias**: ISSUE #1, ISSUE #10

**Descripción**: Sistema para generar álbumes automáticamente.

**Álbumes del Sistema**:
- "Este mes"
- "Hace 1 año"
- "Cámara: iPhone"
- "Cámara: Canon"
- "Viajes" (GPS fuera de área home)

**Schema de Reglas**:
```typescript
interface SmartAlbumRule {
  field: 'date' | 'camera' | 'location' | 'favorite' | 'tag';
  operator: 'equals' | 'contains' | 'between' | 'in';
  value: any;
}
```

**Archivos a Crear**:
- `src/app/api/smart-albums/route.ts`
- `src/app/api/smart-albums/[id]/route.ts`
- `src/app/api/smart-albums/[id]/images/route.ts`
- `src/lib/smartAlbums.ts`
- `src/components/albums/SmartAlbumCreator.tsx`

---

### ISSUE #13: Vista de Álbumes Inteligentes
- **Prioridad**: 🟡 Media
- **Estimación**: M (6-8 horas)
- **Labels**: `frontend`, `features`
- **Dependencias**: ISSUE #12

**Descripción**: Integrar Smart Albums en vista principal.

**Archivos a Modificar**:
- `src/app/page.tsx`
- `src/components/AlbumPreview.tsx`

---

### ISSUE #14: Sistema de Tags
- **Prioridad**: 🟢 Baja
- **Estimación**: L (8-10 horas)
- **Labels**: `frontend`, `backend`, `features`
- **Dependencias**: ISSUE #1

**Descripción**: Sistema de tags para categorizar fotos.

**Funcionalidades**:
- CRUD de tags
- Asignar/remover tags a fotos
- Vista de fotos por tag
- Autocompletado
- Colores personalizados
- Búsqueda por tags

**Archivos a Crear**:
- `src/app/api/tags/route.ts`
- `src/app/api/images/[id]/tags/route.ts`
- `src/components/tags/TagInput.tsx`
- `src/components/tags/TagBadge.tsx`
- `src/components/tags/TagManager.tsx`

---

## 🎯 MILESTONE 5: PULIDO, ANIMACIONES Y OPTIMIZACIÓN

**Objetivo**: Refinamiento final
**Duración**: 3-4 días | **Issues**: 4

### ISSUE #15: Integración de Framer Motion
- **Prioridad**: 🟡 Media
- **Estimación**: M (6-8 horas)
- **Labels**: `frontend`, `animations`

**Componentes a Animar**:
- Transiciones de página
- Grid de fotos (entrada escalonada)
- Lightbox (modal slide-up)
- Sidebar (slide-in/out)
- Cards de álbumes (hover effects)

**Archivos a Crear**:
- `src/components/animations/PageTransition.tsx`
- `src/components/animations/GridAnimation.tsx`

**Archivos a Modificar**:
- `src/app/layout.tsx`
- `src/components/ImageGallery.tsx`
- `src/components/layout/Sidebar.tsx`

---

### ISSUE #16: Optimización de Performance - Virtualización
- **Prioridad**: 🟡 Media
- **Estimación**: L (8-12 horas)
- **Labels**: `frontend`, `performance`
- **Dependencias**: ISSUE #5

**Descripción**: Virtualizar grids grandes para mejor performance.

**Librería**: `react-virtual` o `react-window`

**Archivos a Modificar**:
- `src/app/timeline/page.tsx`
- `src/app/explore/page.tsx`
- `src/components/timeline/TimelineGrid.tsx`

---

### ISSUE #17: Mejoras de Glassmorphism
- **Prioridad**: 🟢 Baja
- **Estimación**: M (6-8 horas)
- **Labels**: `frontend`, `design`

**Descripción**: Refinar efectos visuales en todos los componentes.

**Componentes**:
- Album cards
- Sidebar
- Panel de temas
- Lightbox controls
- Search bar
- Filter chips

---

### ISSUE #18: Documentación y Testing
- **Prioridad**: 🟢 Baja
- **Estimación**: M (4-6 horas)
- **Labels**: `documentation`, `testing`

**Archivos a Crear**:
- `LUMINA_GALLERY_GUIDE.md`
- `docs/SMART_ALBUMS.md`

---

## 📊 DIAGRAMA DE DEPENDENCIAS

```
ISSUE #1 (BD)
    ├─→ ISSUE #5 (Timeline)
    ├─→ ISSUE #6 (Favoritos)
    ├─→ ISSUE #7 (Explorar)
    ├─→ ISSUE #9 (Bento Grid)
    ├─→ ISSUE #10 (EXIF)
    ├─→ ISSUE #12 (Smart Albums)
    └─→ ISSUE #14 (Tags)

ISSUE #2 (Sidebar)
    ├─→ ISSUE #3 (Layout)
    ├─→ ISSUE #4 (Perfil)
    ├─→ ISSUE #5 (Timeline)
    ├─→ ISSUE #6 (Favoritos)
    ├─→ ISSUE #7 (Explorar)
    └─→ ISSUE #8 (Panel Temas)

ISSUE #10 (EXIF)
    ├─→ ISSUE #11 (Panel EXIF)
    └─→ ISSUE #12 (Smart Albums)

ISSUE #12 (Smart Albums)
    └─→ ISSUE #13 (Vista Smart Albums)

ISSUE #5 (Timeline)
    └─→ ISSUE #16 (Virtualización)
```

---

## ⚠️ RIESGOS TÉCNICOS

### RIESGO 1: Performance del Bento Grid
**Probabilidad**: Media | **Impacto**: Alto
**Mitigación**: Usar `react-masonry-css`, virtualización desde el inicio

### RIESGO 2: EXIF Data Faltante
**Probabilidad**: Alta | **Impacto**: Medio
**Mitigación**: Campos opcionales, UI funciona sin EXIF, placeholders

### RIESGO 3: Complejidad de Smart Albums
**Probabilidad**: Media | **Impacto**: Medio
**Mitigación**: Empezar simple (fecha, cámara), expandir gradualmente

### RIESGO 4: Bundle Size de Framer Motion
**Probabilidad**: Baja | **Impacto**: Medio
**Mitigación**: Import selectivo, code splitting, lazy load

### RIESGO 5: Performance Móvil
**Probabilidad**: Media | **Impacto**: Alto
**Mitigación**: Testing continuo, virtualización, lazy loading

---

## 📈 MÉTRICAS DE ÉXITO

### Performance
- ✅ Lighthouse Score > 90
- ✅ FCP < 1.5s
- ✅ TTI < 3s
- ✅ Scroll > 60fps

### Funcionalidad
- ✅ Todas las vistas navegables
- ✅ Favoritos funcionan
- ✅ EXIF se muestra
- ✅ Smart Albums se generan

### UX
- ✅ Transiciones suaves
- ✅ Mobile responsive
- ✅ Accesibilidad
- ✅ Temas aplicados

### Código
- ✅ TypeScript sin errores
- ✅ ESLint sin warnings
- ✅ Componentes reutilizables
- ✅ APIs documentadas

---

## 📁 ARCHIVOS CRÍTICOS

Los 5 archivos más importantes para esta implementación:

1. **prisma/schema.prisma** - Base de datos (EXIF, favoritos, tags, smart albums)
2. **src/app/layout.tsx** - Layout principal con Sidebar
3. **src/components/ImageGallery.tsx** - Lightbox con panel EXIF y favoritos
4. **src/contexts/ThemeContext.tsx** - Sistema de temas ampliado
5. **src/app/page.tsx** - Home con Bento Grid y smart albums

---

**Última Actualización**: 2026-01-18
**Plan ID**: `agent-a27fe00`
