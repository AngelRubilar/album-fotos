# 🎫 GitHub Issues - Lumina Gallery

> Lista completa de 18 issues listos para crear en GitHub
> Copiar y pegar cada issue o usar el script de creación automática

---

## MILESTONE 1: Fundaciones y Arquitectura Base

### Issue #1: Migración de Base de Datos - Campos Nuevos

**Labels**: `database`, `backend`, `migration`, `priority: high`
**Milestone**: Milestone 1 - Fundaciones
**Estimación**: 4-6 horas

#### Descripción
Agregar campos necesarios a la base de datos para soportar las nuevas funcionalidades de Lumina Gallery: favoritos, EXIF data, tags y álbumes inteligentes.

#### Tareas
- [ ] Agregar campos a modelo `Image`: `isFavorite`, `featured`, `exifData`, `takenAt`, `cameraMake`, `cameraModel`, etc.
- [ ] Crear nuevo modelo `Tag` con relación many-to-many a `Image`
- [ ] Crear nuevo modelo `SmartAlbum` para álbumes inteligentes
- [ ] Crear migración de Prisma
- [ ] Ejecutar migración en desarrollo
- [ ] Actualizar seed data con datos de ejemplo
- [ ] Verificar que rollback funciona correctamente

#### Archivos Afectados
- `prisma/schema.prisma`
- `prisma/migrations/XXXXXX_add_lumina_fields/migration.sql` (nuevo)
- `prisma/seed.ts`

#### Criterios de Aceptación
- [ ] Migración ejecuta sin errores
- [ ] Campos nuevos disponibles en Prisma Client
- [ ] Seed data actualizado
- [ ] Rollback funciona

#### Esquema de Referencia
```prisma
model Image {
  isFavorite    Boolean  @default(false)
  featured      Boolean  @default(false)
  exifData      Json?
  takenAt       DateTime?
  cameraMake    String?
  cameraModel   String?
  lens          String?
  tags          Tag[]    @relation("ImageTags")
}

model Tag {
  id         String   @id @default(cuid())
  name       String   @unique
  category   String
  images     Image[]  @relation("ImageTags")
}

model SmartAlbum {
  id          String   @id @default(cuid())
  title       String
  rules       Json
  isSystem    Boolean  @default(false)
}
```

---

### Issue #2: Componente Sidebar Principal

**Labels**: `frontend`, `components`, `design`, `priority: high`
**Milestone**: Milestone 1 - Fundaciones
**Estimación**: 8-12 horas

#### Descripción
Crear el sidebar izquierdo principal del diseño Lumina Gallery con navegación, avatar de perfil y todas las secciones principales de la aplicación.

#### Funcionalidades
- Avatar de perfil en la parte superior
- Navegación a Timeline, Explorar, Álbumes, Favoritos
- Selector de temas integrado
- Estado colapsado/expandido
- Responsive con hamburger menu en móvil
- Animaciones suaves
- Glassmorphism según tema activo

#### Tareas
- [ ] Crear componente `Sidebar.tsx` con estructura completa
- [ ] Implementar navegación con Next.js Link
- [ ] Agregar avatar de perfil (placeholder inicial)
- [ ] Estados activo/colapsado con animaciones CSS
- [ ] Responsive (colapsable en móvil con botón hamburger)
- [ ] Integración con sistema de temas existente
- [ ] Iconos SVG para cada sección
- [ ] Indicador visual de página activa
- [ ] Hover effects y micro-interacciones

#### Archivos a Crear
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/SidebarItem.tsx`
- `src/components/layout/MobileMenuButton.tsx`
- `src/hooks/useSidebar.ts`

#### Criterios de Aceptación
- [ ] Sidebar visible en desktop (siempre visible)
- [ ] Sidebar colapsable en móvil con botón hamburger
- [ ] Navegación funcional entre todas las secciones
- [ ] Animaciones suaves al colapsar/expandir
- [ ] Indicador visual de página activa funciona
- [ ] Compatible con todos los temas existentes
- [ ] Glassmorphism aplicado según tema

---

### Issue #3: Ajustar Layout Principal para Sidebar + Contenido

**Labels**: `frontend`, `layout`, `priority: high`
**Milestone**: Milestone 1 - Fundaciones
**Estimación**: 4-6 horas
**Dependencias**: #2

#### Descripción
Modificar el layout raíz de la aplicación para acomodar el nuevo sidebar y el área de contenido principal según el diseño de Lumina Gallery.

#### Tareas
- [ ] Modificar `layout.tsx` para grid de 2 columnas (sidebar + main)
- [ ] Agregar estado global de sidebar (expandido/colapsado)
- [ ] Implementar transiciones smooth al cambiar estado
- [ ] Ajustar padding y márgenes correctamente
- [ ] Configurar z-index hierarchy
- [ ] Configurar responsive breakpoints
- [ ] Probar que no hay overflow issues
- [ ] Verificar que páginas existentes siguen funcionando

#### Estructura de Layout
```tsx
<div className="flex min-h-screen">
  <Sidebar />
  <main className="flex-1 overflow-y-auto">
    {children}
  </main>
</div>
```

#### Archivos a Modificar
- `src/app/layout.tsx`
- `src/contexts/ThemeContext.tsx` (opcional, si se necesita contexto de Sidebar)

#### Criterios de Aceptación
- [ ] Layout funciona correctamente en desktop (sidebar + content)
- [ ] Layout funciona correctamente en móvil (sidebar overlay)
- [ ] No hay problemas de overflow
- [ ] Transiciones suaves entre estados
- [ ] Todas las páginas existentes siguen funcionando sin romper

---

### Issue #4: Context de Usuario y Perfil

**Labels**: `frontend`, `backend`, `priority: medium`
**Milestone**: Milestone 1 - Fundaciones
**Estimación**: 2-4 horas
**Dependencias**: #2

#### Descripción
Crear sistema básico de perfil de usuario para mostrar en el sidebar. Por ahora sin autenticación completa, usando localStorage para almacenar datos del perfil.

#### Tareas
- [ ] Crear contexto de usuario con React Context
- [ ] Definir modelo de usuario básico (nombre, avatar URL, bio)
- [ ] Implementar almacenamiento en localStorage
- [ ] Crear componente de avatar para el sidebar
- [ ] Crear componente de editor de perfil
- [ ] Integrar con sidebar
- [ ] Preview en tiempo real al editar

#### Archivos a Crear
- `src/contexts/UserContext.tsx`
- `src/components/profile/ProfileAvatar.tsx`
- `src/components/profile/ProfileEditor.tsx`

#### Criterios de Aceptación
- [ ] Avatar visible en sidebar
- [ ] Nombre de usuario editable
- [ ] Datos persisten en localStorage
- [ ] Preview en tiempo real al editar

---

## MILESTONE 2: Vistas Principales y Navegación

### Issue #5: Vista Timeline - Todas las Fotos Cronológicamente

**Labels**: `frontend`, `features`, `priority: high`
**Milestone**: Milestone 2 - Vistas Principales
**Estimación**: 8-12 horas
**Dependencias**: #1, #2

#### Descripción
Crear vista Timeline que muestre TODAS las fotos de todos los álbumes en orden cronológico con scroll infinito y agrupación por fechas.

#### Funcionalidades
- Vista de todas las fotos cronológicamente
- Scroll infinito con paginación
- Agrupación por fechas (Hoy, Ayer, Esta semana, Este mes, etc.)
- Grid responsive de fotos
- Click en foto abre lightbox
- Estados de carga y vacío

#### Tareas
- [ ] Crear página `/timeline/page.tsx`
- [ ] Crear API endpoint `GET /api/timeline` con paginación
- [ ] Implementar infinite scroll con TanStack Query
- [ ] Implementar lógica de agrupación por fechas
- [ ] Grid responsive de fotos
- [ ] Integrar con ImageGallery existente (lightbox)
- [ ] Indicadores de carga y estados vacíos
- [ ] Optimizar performance (virtual scrolling si > 1000 fotos)

#### API Endpoint
```typescript
GET /api/timeline?page=1&limit=50&sort=desc
Response: {
  images: Image[],
  hasMore: boolean,
  nextCursor: string
}
```

#### Archivos a Crear
- `src/app/timeline/page.tsx`
- `src/app/api/timeline/route.ts`
- `src/components/timeline/TimelineGrid.tsx`
- `src/components/timeline/DateSeparator.tsx`
- `src/hooks/useInfiniteTimeline.ts`

#### Criterios de Aceptación
- [ ] Muestra todas las fotos cronológicamente
- [ ] Scroll infinito funciona correctamente
- [ ] Agrupación por fechas es correcta
- [ ] Performance optimizado (virtual scrolling)
- [ ] Click abre lightbox con navegación
- [ ] Estados de carga/error funcionan

---

### Issue #6: Sistema de Favoritos

**Labels**: `frontend`, `backend`, `features`, `priority: high`
**Milestone**: Milestone 2 - Vistas Principales
**Estimación**: 6-8 horas
**Dependencias**: #1, #2

#### Descripción
Implementar sistema completo de favoritos: marcar/desmarcar fotos como favoritas, vista de favoritos, botones en lightbox y grids, contador en sidebar.

#### Funcionalidades
- Marcar/desmarcar fotos como favoritas
- Vista `/favorites` con solo fotos favoritas
- Botón de favorito en lightbox (ImageGallery)
- Botón de favorito en grids de fotos
- Contador de favoritos en sidebar
- Animación de "corazón" al marcar

#### Tareas
- [ ] Crear API endpoints para favoritos
- [ ] Crear vista `/favorites/page.tsx`
- [ ] Agregar botón de favorito en ImageGallery (lightbox)
- [ ] Agregar botón en grids de fotos
- [ ] Contador de favoritos en sidebar con actualización en tiempo real
- [ ] Animación de "corazón" al marcar/desmarcar
- [ ] Optimistic updates para UX rápida

#### API Endpoints
```typescript
PUT /api/images/:id/favorite
DELETE /api/images/:id/favorite
GET /api/favorites?page=1&limit=50
```

#### Archivos a Crear
- `src/app/favorites/page.tsx`
- `src/app/api/images/[id]/favorite/route.ts`
- `src/app/api/favorites/route.ts`
- `src/components/common/FavoriteButton.tsx`

#### Archivos a Modificar
- `src/components/ImageGallery.tsx`
- `src/components/layout/Sidebar.tsx`

#### Criterios de Aceptación
- [ ] Marcar/desmarcar funciona desde lightbox
- [ ] Vista de favoritos muestra solo fotos favoritas
- [ ] Contador en sidebar actualiza en tiempo real
- [ ] Animación suave al marcar favorito
- [ ] Estado persiste en BD correctamente

---

### Issue #7: Vista Explorar con Búsqueda y Filtros

**Labels**: `frontend`, `backend`, `features`, `priority: medium`
**Milestone**: Milestone 2 - Vistas Principales
**Estimación**: 10-14 horas
**Dependencias**: #1, #2

#### Descripción
Crear vista de exploración con barra de búsqueda en tiempo real y filtros avanzados por fecha, álbum, cámara, favoritos y tags.

#### Funcionalidades
- Barra de búsqueda en tiempo real
- Filtros avanzados:
  - Rango de fechas
  - Álbum específico
  - Cámara/modelo
  - Solo favoritos
  - Tags (si disponibles)
- URL state (query params para compartir búsquedas)
- Resultados con grid paginado

#### Tareas
- [ ] Crear página `/explore/page.tsx`
- [ ] Barra de búsqueda con debounce
- [ ] Panel de filtros colapsable
- [ ] API con query complejo
- [ ] Grid de resultados con paginación
- [ ] URL state (query params)
- [ ] Chips de filtros activos
- [ ] Limpiar filtros

#### API Endpoint
```typescript
GET /api/search?q=text&from=date&to=date&album=id&camera=model&favorites=true
```

#### Archivos a Crear
- `src/app/explore/page.tsx`
- `src/app/api/search/route.ts`
- `src/components/explore/SearchBar.tsx`
- `src/components/explore/FilterPanel.tsx`
- `src/components/explore/FilterChip.tsx`

#### Criterios de Aceptación
- [ ] Búsqueda en tiempo real funciona
- [ ] Filtros se combinan correctamente
- [ ] URL refleja filtros activos (compartible)
- [ ] Resultados paginados correctamente
- [ ] UI responsive y clara

---

### Issue #8: Panel Flotante de Personalización de Temas

**Labels**: `frontend`, `design`, `priority: medium`
**Milestone**: Milestone 2 - Vistas Principales
**Estimación**: 4-6 horas
**Dependencias**: #2

#### Descripción
Crear panel flotante moderno para selección de temas, reemplazando el ThemeSelector actual con previews más grandes y descripción de cada tema.

#### Temas Destacados
1. 💎 **Modo Cristal** - Glassmorphism con fondo translúcido
2. 🌙 **Dark 2.0** - Negro puro con sombras flotantes
3. 📄 **Orgánico** - Texturas de papel, tipografía manuscrita

#### Tareas
- [ ] Diseñar panel flotante con glassmorphism
- [ ] Previews grandes de cada tema
- [ ] Descripción y características de cada tema
- [ ] Transiciones smooth al cambiar tema
- [ ] Botón para abrir/cerrar desde sidebar
- [ ] Agregar 3 nuevos modos de temas
- [ ] Responsive

#### Archivos a Crear
- `src/components/themes/ThemePanel.tsx`
- `src/components/themes/ThemePreviewCard.tsx`

#### Archivos a Modificar
- `src/contexts/ThemeContext.tsx`
- `src/components/layout/Sidebar.tsx`

#### Criterios de Aceptación
- [ ] Panel se abre/cierra con animación
- [ ] Previews visuales atractivos
- [ ] Aplicación instantánea de temas
- [ ] Glassmorphism en el panel
- [ ] Responsive en móvil

---

## MILESTONE 3: Bento Grid y Visualización Avanzada

### Issue #9: Bento Grid Dinámico (Masonry Layout)

**Labels**: `frontend`, `design`, `complex`, `priority: high`
**Milestone**: Milestone 3 - Bento Grid
**Estimación**: 10-14 horas
**Dependencias**: #1

#### Descripción
Implementar grid tipo masonry (Bento Grid) donde fotos destacadas ocupan más espacio (2x2) y fotos normales ocupan tamaño estándar (1x1), creando un ritmo visual dinámico.

#### Implementación
- Usar librería `react-masonry-css` (más estable que CSS Grid Masonry experimental)
- Fotos "featured" = 2x2 espacios
- Fotos normales = 1x1 espacio
- Animaciones de entrada con Framer Motion
- Lazy loading de imágenes
- Mantener aspect ratio correcto

#### Criterios para Featured
- Campo `featured` en BD (selección manual)
- O primeras N fotos del álbum
- O fotos favoritas
- O fotos con mayor resolución

#### Tareas
- [ ] Instalar y configurar `react-masonry-css`
- [ ] Implementar layout responsivo (columnas según breakpoint)
- [ ] Lógica para determinar fotos "featured"
- [ ] Animaciones de entrada con Framer Motion (stagger)
- [ ] Lazy loading de imágenes fuera del viewport
- [ ] Mantener aspect ratio correcto
- [ ] Click abre lightbox con índice correcto
- [ ] Optimizar performance (memoización)

#### Archivos a Crear
- `src/components/gallery/BentoGrid.tsx`
- `src/components/gallery/BentoGridItem.tsx`
- `src/hooks/useBentoLayout.ts`

#### Archivos a Modificar
- `src/app/page.tsx` (usar BentoGrid en lugar de grid uniforme)
- `src/app/album/[year]/page.tsx` (opción de vista Bento)

#### Criterios de Aceptación
- [ ] Grid masonry funciona correctamente
- [ ] Fotos destacadas ocupan 2x2
- [ ] Fotos normales ocupan 1x1
- [ ] Responsive en mobile/tablet/desktop
- [ ] Performance optimizado (< 50ms renders)
- [ ] Animaciones suaves sin jank

---

### Issue #10: Extracción de EXIF Data

**Labels**: `backend`, `features`, `priority: medium`
**Milestone**: Milestone 3 - Bento Grid
**Estimación**: 6-8 horas
**Dependencias**: #1

#### Descripción
Extraer y almacenar metadatos EXIF de las imágenes al momento de subirlas, incluyendo información de cámara, configuración y ubicación GPS.

#### Datos a Extraer
- Fecha y hora de captura (`takenAt`)
- Cámara (make, model)
- Lente
- Configuración (ISO, aperture, shutter speed, focal length)
- GPS (latitude, longitude) si disponible
- Dimensiones originales
- Orientación

#### Tareas
- [ ] Instalar librería `exifr` (npm install exifr)
- [ ] Extraer EXIF en API de upload
- [ ] Parsear campos clave y guardar en campos específicos
- [ ] Guardar JSON completo en campo `exifData`
- [ ] Manejar imágenes sin EXIF gracefully (no fallar)
- [ ] Logging de errores de extracción
- [ ] Testing con diferentes tipos de imágenes

#### Archivos a Modificar
- `src/app/api/upload/route.ts`
- `package.json` (agregar dependencia)

#### Criterios de Aceptación
- [ ] EXIF se extrae correctamente al subir
- [ ] Datos se guardan en BD en campos correctos
- [ ] No falla si EXIF no existe
- [ ] Campos clave parseados correctamente
- [ ] JSON completo guardado en `exifData`

---

### Issue #11: Panel EXIF en Lightbox

**Labels**: `frontend`, `features`, `priority: medium`
**Milestone**: Milestone 3 - Bento Grid
**Estimación**: 4-6 horas
**Dependencias**: #10

#### Descripción
Agregar panel lateral deslizable en el lightbox (ImageGallery) que muestre información EXIF de la foto actual de forma atractiva y organizada.

#### Datos a Mostrar
- 📅 Fecha y hora de captura
- 📷 Cámara (make + model)
- 🔍 Lente
- ⚙️ Configuración:
  - ISO
  - Aperture (f-stop)
  - Shutter speed
  - Focal length
- 📐 Dimensiones (width x height)
- 💾 Tamaño de archivo
- 📍 Ubicación (si GPS disponible) - placeholder mapa

#### Tareas
- [ ] Diseñar panel lateral deslizable
- [ ] Mostrar datos EXIF formateados
- [ ] Iconos para cada tipo de dato
- [ ] Panel colapsable/expandible
- [ ] Placeholder de mapa si hay GPS (integración real opcional)
- [ ] No mostrar panel si no hay EXIF
- [ ] Responsive

#### Archivos a Crear
- `src/components/gallery/ExifPanel.tsx`
- `src/components/gallery/ExifDataRow.tsx`

#### Archivos a Modificar
- `src/components/ImageGallery.tsx`

#### Criterios de Aceptación
- [ ] Panel visible en lightbox cuando hay EXIF
- [ ] Datos formateados legiblemente
- [ ] Panel colapsable funciona
- [ ] No muestra panel si no hay EXIF
- [ ] Responsive en móvil

---

## MILESTONE 4: Álbumes Inteligentes y Búsqueda

### Issue #12: Generador de Álbumes Inteligentes

**Labels**: `backend`, `features`, `complex`, `priority: medium`
**Milestone**: Milestone 4 - Smart Albums
**Estimación**: 14-18 horas
**Dependencias**: #1, #10

#### Descripción
Sistema para generar automáticamente álbumes basados en criterios (fecha, cámara, ubicación, etc.) con motor de reglas flexible.

#### Álbumes del Sistema (Auto-generados)
- "Este mes" - fotos del mes actual
- "Hace 1 año" - fotos de hace 1 año
- "Cámara: iPhone" - todas las fotos de iPhone
- "Cámara: Canon" - todas las fotos de Canon
- "Viajes" - fotos con GPS fuera del área home

#### Schema de Reglas
```typescript
interface SmartAlbumRule {
  field: 'date' | 'camera' | 'location' | 'favorite' | 'tag';
  operator: 'equals' | 'contains' | 'between' | 'in' | 'not';
  value: any;
}
```

#### Tareas
- [ ] Crear API para CRUD de Smart Albums
- [ ] Implementar motor de reglas (evaluar JSON)
- [ ] Generación automática periódica (cron job o trigger)
- [ ] Crear álbumes del sistema predefinidos
- [ ] API para obtener imágenes de Smart Album
- [ ] UI para crear Smart Albums personalizados
- [ ] Validación de reglas

#### Archivos a Crear
- `src/app/api/smart-albums/route.ts`
- `src/app/api/smart-albums/[id]/route.ts`
- `src/app/api/smart-albums/[id]/images/route.ts`
- `src/lib/smartAlbums.ts` (motor de reglas)
- `src/components/albums/SmartAlbumCreator.tsx`

#### Criterios de Aceptación
- [ ] Álbumes del sistema se generan automáticamente
- [ ] Usuarios pueden crear Smart Albums personalizados
- [ ] Reglas se evalúan correctamente
- [ ] Álbumes se actualizan al agregar fotos nuevas
- [ ] UI intuitiva para crear reglas

---

### Issue #13: Vista de Álbumes Inteligentes

**Labels**: `frontend`, `features`, `priority: medium`
**Milestone**: Milestone 4 - Smart Albums
**Estimación**: 6-8 horas
**Dependencias**: #12

#### Descripción
Integrar Smart Albums en la vista de álbumes principal, diferenciándolos visualmente de los álbumes manuales normales.

#### Tareas
- [ ] Modificar vista de álbumes principal
- [ ] Sección separada para Smart Albums
- [ ] Iconos distintivos (⚡ para smart)
- [ ] Indicador de "auto-actualizado"
- [ ] Vista de fotos del Smart Album (reutilizar componente)
- [ ] Contador de fotos actualizado dinámicamente

#### Archivos a Modificar
- `src/app/page.tsx`
- `src/components/AlbumPreview.tsx`

#### Criterios de Aceptación
- [ ] Smart Albums visibles en home
- [ ] Se diferencian visualmente de álbumes normales
- [ ] Click abre vista de fotos del smart album
- [ ] Se actualizan automáticamente
- [ ] Contador de fotos correcto

---

### Issue #14: Sistema de Tags

**Labels**: `frontend`, `backend`, `features`, `priority: low`
**Milestone**: Milestone 4 - Smart Albums
**Estimación**: 8-10 horas
**Dependencias**: #1

#### Descripción
Sistema completo de tags para categorizar fotos manualmente con CRUD, asignación, búsqueda y colores personalizados.

#### Funcionalidades
- CRUD de tags
- Asignar/remover tags a fotos
- Vista de fotos por tag
- Autocompletado en input de tags
- Colores personalizados para tags
- Búsqueda por tags
- Categorías de tags (location, person, event, etc.)

#### Tareas
- [ ] API CRUD de tags
- [ ] API para asignar/remover tags a fotos
- [ ] Vista de fotos por tag
- [ ] Componente de input con autocompletado
- [ ] Selector de color para tags
- [ ] Búsqueda por tags (integrar con #7)
- [ ] Badges de tags en fotos

#### Archivos a Crear
- `src/app/api/tags/route.ts`
- `src/app/api/tags/[id]/route.ts`
- `src/app/api/images/[id]/tags/route.ts`
- `src/components/tags/TagInput.tsx`
- `src/components/tags/TagBadge.tsx`
- `src/components/tags/TagManager.tsx`

#### Criterios de Aceptación
- [ ] CRUD de tags funciona
- [ ] Tags se asignan a fotos correctamente
- [ ] Búsqueda por tags funcional
- [ ] Autocompletado funciona
- [ ] Colores personalizables

---

## MILESTONE 5: Pulido, Animaciones y Optimización

### Issue #15: Integración de Framer Motion - Transiciones

**Labels**: `frontend`, `animations`, `priority: medium`
**Milestone**: Milestone 5 - Pulido
**Estimación**: 6-8 horas

#### Descripción
Agregar animaciones suaves con Framer Motion a todas las transiciones de página y componentes principales para mejorar la UX.

#### Componentes a Animar
- Transiciones de página (Timeline, Explore, Favorites)
- Grid de fotos (entrada escalonada - stagger)
- Lightbox (modal slide-up con shared layout)
- Sidebar (slide-in/out)
- Cards de álbumes (hover effects sutiles)
- Panel de temas (fade + slide)

#### Tareas
- [ ] Wrapper de página con AnimatePresence
- [ ] Transiciones fade/slide entre páginas
- [ ] Animaciones de entrada para grids de fotos (stagger)
- [ ] Transiciones del lightbox (shared layout animation)
- [ ] Animaciones del sidebar
- [ ] Hover effects en cards
- [ ] Verificar performance > 60fps

#### Archivos a Crear
- `src/components/animations/PageTransition.tsx`
- `src/components/animations/GridAnimation.tsx`

#### Archivos a Modificar
- `src/app/layout.tsx`
- `src/components/ImageGallery.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/gallery/BentoGrid.tsx`

#### Criterios de Aceptación
- [ ] Transiciones suaves entre páginas
- [ ] Grid anima al entrar (stagger effect)
- [ ] Lightbox con transición elegante
- [ ] No hay jank o lag
- [ ] Performance > 60fps en todas las animaciones

---

### Issue #16: Optimización de Performance - Virtualización

**Labels**: `frontend`, `performance`, `priority: medium`
**Milestone**: Milestone 5 - Pulido
**Estimación**: 8-12 horas
**Dependencias**: #5

#### Descripción
Implementar virtualización para grids grandes (Timeline, Explore) para mejorar performance con miles de fotos.

#### Tareas
- [ ] Instalar `react-virtual` o `react-window`
- [ ] Virtualizar Timeline grid
- [ ] Virtualizar Explore grid
- [ ] Lazy loading de imágenes fuera del viewport
- [ ] Medir performance antes/después (Lighthouse)
- [ ] Optimizar re-renders con React.memo
- [ ] Testing con 1000+ fotos

#### Archivos a Modificar
- `src/app/timeline/page.tsx`
- `src/app/explore/page.tsx`
- `src/components/timeline/TimelineGrid.tsx`

#### Criterios de Aceptación
- [ ] Timeline con 1000+ fotos carga rápido (< 3s)
- [ ] Scroll suave sin lag (60fps)
- [ ] Métricas de performance mejoradas
- [ ] Memory footprint reducido
- [ ] Lighthouse score > 90

---

### Issue #17: Mejoras de Glassmorphism y Diseño Visual

**Labels**: `frontend`, `design`, `priority: low`
**Milestone**: Milestone 5 - Pulido
**Estimación**: 6-8 horas

#### Descripción
Refinar efectos de glassmorphism en todos los componentes clave y asegurar consistencia visual en todo el diseño.

#### Componentes a Mejorar
- Album cards (backdrop-blur + gradientes)
- Sidebar (efecto cristal)
- Panel de temas
- Lightbox controls
- Search bar
- Filter chips
- Modales y dropdowns

#### Tareas
- [ ] Aplicar backdrop-blur consistente a cards
- [ ] Gradientes sutiles en backgrounds
- [ ] Sombras y elevación consistentes
- [ ] Border radius y spacing unificados
- [ ] Micro-interacciones (hover, active, focus)
- [ ] Refinar dark mode
- [ ] Verificar contraste (accesibilidad)

#### Criterios de Aceptación
- [ ] Glassmorphism consistente en todos los componentes
- [ ] Visual hierarchy clara
- [ ] Cumple accesibilidad (contraste WCAG AA)
- [ ] Funciona bien en todos los temas
- [ ] Micro-interacciones sutiles

---

### Issue #18: Documentación y Testing

**Labels**: `documentation`, `testing`, `priority: low`
**Milestone**: Milestone 5 - Pulido
**Estimación**: 4-6 horas

#### Descripción
Documentar las nuevas funcionalidades de Lumina Gallery y crear tests básicos para componentes críticos.

#### Tareas
- [ ] Actualizar README con nuevas features
- [ ] Documentar estructura de Smart Albums
- [ ] Crear guía de usuario para Lumina Gallery
- [ ] Documentar APIs nuevas
- [ ] Tests unitarios de componentes clave (opcional)
- [ ] Tests de integración de APIs (opcional)

#### Archivos a Crear
- `LUMINA_GALLERY_GUIDE.md`
- `docs/SMART_ALBUMS.md`
- `docs/API.md`
- Tests (opcional)

#### Criterios de Aceptación
- [ ] README actualizado con features
- [ ] Guía de usuario completa
- [ ] Documentación técnica clara
- [ ] APIs documentadas

---

## 📊 RESUMEN

**Total de Issues**: 18
**Milestones**: 5
**Duración Estimada**: 20-28 días de trabajo

### Distribución por Prioridad
- 🔴 **Alta**: 7 issues
- 🟡 **Media**: 8 issues
- 🟢 **Baja**: 3 issues

### Distribución por Estimación
- **XS** (1-2h): 0 issues
- **S** (2-4h): 1 issue
- **M** (4-8h): 9 issues
- **L** (8-14h): 6 issues
- **XL** (14-18h): 2 issues

---

**Generado**: 2026-01-18
**Para**: Proyecto Lumina Gallery
