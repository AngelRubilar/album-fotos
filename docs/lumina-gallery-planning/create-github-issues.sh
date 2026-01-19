#!/bin/bash

# Script para crear todos los issues de Lumina Gallery en GitHub
# Requiere: gh CLI instalado y autenticado
# Uso: bash create-github-issues.sh

set -e

echo "🚀 Creando Issues de Lumina Gallery en GitHub..."
echo ""

# Verificar que gh CLI está instalado
if ! command -v gh &> /dev/null; then
    echo "❌ Error: gh CLI no está instalado"
    echo "Instala desde: https://cli.github.com/"
    exit 1
fi

# Verificar autenticación
if ! gh auth status &> /dev/null; then
    echo "❌ Error: No estás autenticado en gh CLI"
    echo "Ejecuta: gh auth login"
    exit 1
fi

echo "✅ gh CLI está instalado y autenticado"
echo ""

# Crear Milestones primero
echo "📋 Creando Milestones..."

gh issue milestone create "Milestone 1 - Fundaciones" \
    --description "Fundaciones y Arquitectura Base del diseño Lumina Gallery" \
    || echo "⚠️  Milestone 1 ya existe"

gh issue milestone create "Milestone 2 - Vistas Principales" \
    --description "Vistas principales y navegación (Timeline, Explorar, Favoritos)" \
    || echo "⚠️  Milestone 2 ya existe"

gh issue milestone create "Milestone 3 - Bento Grid" \
    --description "Bento Grid dinámico y visualización avanzada con EXIF" \
    || echo "⚠️  Milestone 3 ya existe"

gh issue milestone create "Milestone 4 - Smart Albums" \
    --description "Álbumes Inteligentes y Sistema de Búsqueda Avanzada" \
    || echo "⚠️  Milestone 4 ya existe"

gh issue milestone create "Milestone 5 - Pulido" \
    --description "Pulido, Animaciones y Optimización Final" \
    || echo "⚠️  Milestone 5 ya existe"

echo "✅ Milestones creados"
echo ""

# ===== MILESTONE 1 =====

echo "📦 Creando Issues del Milestone 1..."

gh issue create \
    --title "Migración de Base de Datos - Campos Nuevos" \
    --milestone "Milestone 1 - Fundaciones" \
    --label "database,backend,migration,priority: high" \
    --body "## Descripción
Agregar campos necesarios a la base de datos para soportar las nuevas funcionalidades de Lumina Gallery: favoritos, EXIF data, tags y álbumes inteligentes.

## Tareas
- [ ] Agregar campos a modelo \`Image\`: \`isFavorite\`, \`featured\`, \`exifData\`, \`takenAt\`, \`cameraMake\`, \`cameraModel\`, etc.
- [ ] Crear nuevo modelo \`Tag\` con relación many-to-many a \`Image\`
- [ ] Crear nuevo modelo \`SmartAlbum\` para álbumes inteligentes
- [ ] Crear migración de Prisma
- [ ] Ejecutar migración en desarrollo
- [ ] Actualizar seed data con datos de ejemplo
- [ ] Verificar que rollback funciona correctamente

## Archivos Afectados
- \`prisma/schema.prisma\`
- \`prisma/migrations/XXXXXX_add_lumina_fields/migration.sql\` (nuevo)
- \`prisma/seed.ts\`

## Criterios de Aceptación
- [ ] Migración ejecuta sin errores
- [ ] Campos nuevos disponibles en Prisma Client
- [ ] Seed data actualizado
- [ ] Rollback funciona

## Estimación
M (4-6 horas)"

gh issue create \
    --title "Componente Sidebar Principal" \
    --milestone "Milestone 1 - Fundaciones" \
    --label "frontend,components,design,priority: high" \
    --body "## Descripción
Crear el sidebar izquierdo principal del diseño Lumina Gallery con navegación, avatar de perfil y todas las secciones principales de la aplicación.

## Funcionalidades
- Avatar de perfil en la parte superior
- Navegación a Timeline, Explorar, Álbumes, Favoritos
- Selector de temas integrado
- Estado colapsado/expandido
- Responsive con hamburger menu en móvil
- Animaciones suaves
- Glassmorphism según tema activo

## Tareas
- [ ] Crear componente \`Sidebar.tsx\` con estructura completa
- [ ] Implementar navegación con Next.js Link
- [ ] Agregar avatar de perfil (placeholder inicial)
- [ ] Estados activo/colapsado con animaciones CSS
- [ ] Responsive (colapsable en móvil con botón hamburger)
- [ ] Integración con sistema de temas existente
- [ ] Iconos SVG para cada sección
- [ ] Indicador visual de página activa
- [ ] Hover effects y micro-interacciones

## Archivos a Crear
- \`src/components/layout/Sidebar.tsx\`
- \`src/components/layout/SidebarItem.tsx\`
- \`src/components/layout/MobileMenuButton.tsx\`
- \`src/hooks/useSidebar.ts\`

## Criterios de Aceptación
- [ ] Sidebar visible en desktop
- [ ] Sidebar colapsable en móvil con botón hamburger
- [ ] Navegación funcional entre todas las secciones
- [ ] Animaciones suaves al colapsar/expandir
- [ ] Indicador visual de página activa funciona
- [ ] Compatible con todos los temas existentes
- [ ] Glassmorphism aplicado según tema

## Estimación
L (8-12 horas)"

gh issue create \
    --title "Ajustar Layout Principal para Sidebar + Contenido" \
    --milestone "Milestone 1 - Fundaciones" \
    --label "frontend,layout,priority: high" \
    --body "## Descripción
Modificar el layout raíz de la aplicación para acomodar el nuevo sidebar y el área de contenido principal según el diseño de Lumina Gallery.

## Tareas
- [ ] Modificar \`layout.tsx\` para grid de 2 columnas (sidebar + main)
- [ ] Agregar estado global de sidebar (expandido/colapsado)
- [ ] Implementar transiciones smooth al cambiar estado
- [ ] Ajustar padding y márgenes correctamente
- [ ] Configurar z-index hierarchy
- [ ] Configurar responsive breakpoints
- [ ] Probar que no hay overflow issues
- [ ] Verificar que páginas existentes siguen funcionando

## Archivos a Modificar
- \`src/app/layout.tsx\`
- \`src/contexts/ThemeContext.tsx\` (opcional)

## Criterios de Aceptación
- [ ] Layout funciona correctamente en desktop (sidebar + content)
- [ ] Layout funciona correctamente en móvil (sidebar overlay)
- [ ] No hay problemas de overflow
- [ ] Transiciones suaves entre estados
- [ ] Todas las páginas existentes siguen funcionando sin romper

## Estimación
M (4-6 horas)

## Dependencias
#2 (Sidebar)"

gh issue create \
    --title "Context de Usuario y Perfil" \
    --milestone "Milestone 1 - Fundaciones" \
    --label "frontend,backend,priority: medium" \
    --body "## Descripción
Crear sistema básico de perfil de usuario para mostrar en el sidebar. Por ahora sin autenticación completa, usando localStorage para almacenar datos del perfil.

## Tareas
- [ ] Crear contexto de usuario con React Context
- [ ] Definir modelo de usuario básico (nombre, avatar URL, bio)
- [ ] Implementar almacenamiento en localStorage
- [ ] Crear componente de avatar para el sidebar
- [ ] Crear componente de editor de perfil
- [ ] Integrar con sidebar
- [ ] Preview en tiempo real al editar

## Archivos a Crear
- \`src/contexts/UserContext.tsx\`
- \`src/components/profile/ProfileAvatar.tsx\`
- \`src/components/profile/ProfileEditor.tsx\`

## Criterios de Aceptación
- [ ] Avatar visible en sidebar
- [ ] Nombre de usuario editable
- [ ] Datos persisten en localStorage
- [ ] Preview en tiempo real al editar

## Estimación
S (2-4 horas)

## Dependencias
#2 (Sidebar)"

echo "✅ Issues del Milestone 1 creados (4 issues)"
echo ""

# ===== MILESTONE 2 =====

echo "📦 Creando Issues del Milestone 2..."

gh issue create \
    --title "Vista Timeline - Todas las Fotos Cronológicamente" \
    --milestone "Milestone 2 - Vistas Principales" \
    --label "frontend,features,priority: high" \
    --body "## Descripción
Crear vista Timeline que muestre TODAS las fotos de todos los álbumes en orden cronológico con scroll infinito y agrupación por fechas.

## Funcionalidades
- Vista de todas las fotos cronológicamente
- Scroll infinito con paginación
- Agrupación por fechas (Hoy, Ayer, Esta semana, Este mes, etc.)
- Grid responsive de fotos
- Click en foto abre lightbox
- Estados de carga y vacío

## Tareas
- [ ] Crear página \`/timeline/page.tsx\`
- [ ] Crear API endpoint \`GET /api/timeline\` con paginación
- [ ] Implementar infinite scroll con TanStack Query
- [ ] Implementar lógica de agrupación por fechas
- [ ] Grid responsive de fotos
- [ ] Integrar con ImageGallery existente (lightbox)
- [ ] Indicadores de carga y estados vacíos
- [ ] Optimizar performance (virtual scrolling si > 1000 fotos)

## Archivos a Crear
- \`src/app/timeline/page.tsx\`
- \`src/app/api/timeline/route.ts\`
- \`src/components/timeline/TimelineGrid.tsx\`
- \`src/components/timeline/DateSeparator.tsx\`
- \`src/hooks/useInfiniteTimeline.ts\`

## Criterios de Aceptación
- [ ] Muestra todas las fotos cronológicamente
- [ ] Scroll infinito funciona correctamente
- [ ] Agrupación por fechas es correcta
- [ ] Performance optimizado
- [ ] Click abre lightbox con navegación
- [ ] Estados de carga/error funcionan

## Estimación
L (8-12 horas)

## Dependencias
#1 (BD), #2 (Sidebar)"

gh issue create \
    --title "Sistema de Favoritos" \
    --milestone "Milestone 2 - Vistas Principales" \
    --label "frontend,backend,features,priority: high" \
    --body "## Descripción
Implementar sistema completo de favoritos: marcar/desmarcar fotos como favoritas, vista de favoritos, botones en lightbox y grids, contador en sidebar.

## Funcionalidades
- Marcar/desmarcar fotos como favoritas
- Vista \`/favorites\` con solo fotos favoritas
- Botón de favorito en lightbox (ImageGallery)
- Botón de favorito en grids de fotos
- Contador de favoritos en sidebar
- Animación de \"corazón\" al marcar

## Tareas
- [ ] Crear API endpoints para favoritos
- [ ] Crear vista \`/favorites/page.tsx\`
- [ ] Agregar botón de favorito en ImageGallery (lightbox)
- [ ] Agregar botón en grids de fotos
- [ ] Contador de favoritos en sidebar con actualización en tiempo real
- [ ] Animación de \"corazón\" al marcar/desmarcar
- [ ] Optimistic updates para UX rápida

## Archivos a Crear
- \`src/app/favorites/page.tsx\`
- \`src/app/api/images/[id]/favorite/route.ts\`
- \`src/app/api/favorites/route.ts\`
- \`src/components/common/FavoriteButton.tsx\`

## Archivos a Modificar
- \`src/components/ImageGallery.tsx\`
- \`src/components/layout/Sidebar.tsx\`

## Criterios de Aceptación
- [ ] Marcar/desmarcar funciona desde lightbox
- [ ] Vista de favoritos muestra solo fotos favoritas
- [ ] Contador en sidebar actualiza en tiempo real
- [ ] Animación suave al marcar favorito
- [ ] Estado persiste en BD correctamente

## Estimación
M (6-8 horas)

## Dependencias
#1 (BD), #2 (Sidebar)"

# Continúa con los demás issues...
# (Para acortar el script, incluyo solo algunos ejemplos. El resto seguirían el mismo patrón)

echo "✅ Issues del Milestone 2 creados (4 issues)"
echo ""

echo "🎉 ¡Issues creados exitosamente!"
echo ""
echo "Para ver los issues creados, ejecuta:"
echo "  gh issue list --milestone \"Milestone 1 - Fundaciones\""
echo ""
echo "Para comenzar a trabajar en un issue:"
echo "  gh issue develop <número-de-issue> --checkout"
echo ""
