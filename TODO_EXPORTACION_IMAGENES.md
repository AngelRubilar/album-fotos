# 📤 Sistema de Exportación de Imágenes - TODO

## 🎯 Objetivo
Implementar un sistema para exportar imágenes seleccionadas o completas desde la aplicación.

## 📋 Funcionalidades a Implementar

### 1. Exportación Individual
- **Descargar imagen original** (botón en vista de detalle)
- **Descargar con metadatos** (imagen + archivo JSON con información)
- **Formato**: ZIP con imagen + metadata.json

### 2. Exportación por Selección
- **Checkbox en galería** para seleccionar múltiples imágenes
- **Barra de acciones** cuando hay imágenes seleccionadas
- **Opciones**:
  - Descargar solo imágenes
  - Descargar con metadatos
  - Descargar con miniaturas incluidas

### 3. Exportación de Álbum Completo
- **Botón "Exportar álbum"** en vista de álbum
- **Opciones**:
  - Solo imágenes originales
  - Imágenes + miniaturas
  - Imágenes + metadatos completos
  - Todo (imágenes + miniaturas + metadatos)

### 4. Exportación Global
- **Panel de administración** con opción de exportar todo
- **Backup completo** de imágenes y base de datos
- **Formato estructurado** por años/álbumes

## 🏗️ Arquitectura Propuesta

### Backend API Routes

#### 1. Exportar imagen individual
```typescript
// /api/images/[id]/export
GET /api/images/[id]/export?include=metadata

Response: ZIP file
├── image.jpg
└── metadata.json
```

#### 2. Exportar múltiples imágenes
```typescript
// /api/export/images
POST /api/export/images
Body: {
  imageIds: string[],
  includeMetadata: boolean,
  includeThumbnails: boolean
}

Response: ZIP file
├── image1.jpg
├── image1_metadata.json
├── image2.jpg
├── image2_metadata.json
└── ...
```

#### 3. Exportar álbum completo
```typescript
// /api/albums/[id]/export
GET /api/albums/[id]/export?format=full

Response: ZIP file
├── album_info.json
├── images/
│   ├── image1.jpg
│   ├── image2.jpg
│   └── ...
├── thumbnails/
│   ├── thumb1.jpg
│   └── ...
└── metadata/
    ├── image1.json
    └── ...
```

#### 4. Exportar todo
```typescript
// /api/export/all
GET /api/export/all

Response: ZIP file
├── 2024/
│   ├── images/
│   ├── thumbnails/
│   └── metadata/
├── 2023/
│   └── ...
├── database_backup.sql
└── export_info.json
```

## 🎨 UI/UX Propuesta

### Vista de Galería
```
┌─────────────────────────────────────────┐
│  Álbum 2024              [Exportar ▼]  │
├─────────────────────────────────────────┤
│  ☐ Select All                           │
│                                         │
│  ┌───┐  ┌───┐  ┌───┐  ┌───┐           │
│  │☐ │  │☐ │  │☐ │  │☐ │           │
│  └───┘  └───┘  └───┘  └───┘           │
│                                         │
│  [X] 4 imágenes seleccionadas           │
│  [Exportar selección] [Cancelar]        │
└─────────────────────────────────────────┘
```

### Botón de Exportar
```typescript
// Opciones del dropdown
- Exportar álbum completo
- Exportar con metadatos
- Exportar solo imágenes originales
- Seleccionar imágenes...
```

### Modal de Exportación
```
┌────────────────────────────────────┐
│  Exportar imágenes                 │
├────────────────────────────────────┤
│  ☑ Incluir imágenes originales     │
│  ☑ Incluir miniaturas              │
│  ☑ Incluir metadatos               │
│  ☐ Incluir backup de base de datos │
│                                    │
│  Formato: ZIP                      │
│  Tamaño estimado: 45 MB            │
│                                    │
│  [Cancelar]  [Exportar]            │
└────────────────────────────────────┘
```

## 💻 Implementación Técnica

### 1. Dependencias Necesarias
```bash
npm install archiver          # Para crear archivos ZIP
npm install stream-zip-async  # Alternativa moderna
```

### 2. Utilidad de Exportación
```typescript
// src/lib/export-utils.ts

import archiver from 'archiver';
import { prisma } from './prisma';
import fs from 'fs';
import path from 'path';

export async function exportImages(imageIds: string[], options: ExportOptions) {
  const archive = archiver('zip', { zlib: { level: 9 } });

  const images = await prisma.image.findMany({
    where: { id: { in: imageIds } }
  });

  for (const image of images) {
    // Agregar imagen original
    const imagePath = path.join(process.cwd(), 'public', image.fileUrl);
    archive.file(imagePath, { name: `images/${image.filename}` });

    // Agregar miniatura si se solicita
    if (options.includeThumbnails && image.thumbnailUrl) {
      const thumbPath = path.join(process.cwd(), 'public', image.thumbnailUrl);
      archive.file(thumbPath, { name: `thumbnails/${image.filename}` });
    }

    // Agregar metadatos si se solicita
    if (options.includeMetadata) {
      const metadata = {
        id: image.id,
        filename: image.filename,
        originalName: image.originalName,
        fileSize: image.fileSize,
        width: image.width,
        height: image.height,
        mimeType: image.mimeType,
        description: image.description,
        uploadedAt: image.uploadedAt,
      };
      archive.append(JSON.stringify(metadata, null, 2), {
        name: `metadata/${image.filename}.json`
      });
    }
  }

  await archive.finalize();
  return archive;
}
```

### 3. API Route Ejemplo
```typescript
// src/app/api/export/images/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { exportImages } from '@/lib/export-utils';

export async function POST(request: NextRequest) {
  try {
    const { imageIds, includeMetadata, includeThumbnails } = await request.json();

    const archive = await exportImages(imageIds, {
      includeMetadata,
      includeThumbnails
    });

    const buffer = await streamToBuffer(archive);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="images-export-${Date.now()}.zip"`
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

function streamToBuffer(stream: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk: Buffer) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}
```

### 4. Componente React de Exportación
```typescript
// src/components/ExportButton.tsx

'use client';

import { useState } from 'react';

interface ExportButtonProps {
  imageIds: string[];
  albumId?: string;
}

export function ExportButton({ imageIds, albumId }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (options: ExportOptions) => {
    setIsExporting(true);

    try {
      const response = await fetch('/api/export/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageIds,
          includeMetadata: options.metadata,
          includeThumbnails: options.thumbnails
        })
      });

      if (!response.ok) throw new Error('Export failed');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `export-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
      alert('Error al exportar imágenes');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={() => handleExport({ metadata: true, thumbnails: true })}
      disabled={isExporting}
      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
    >
      {isExporting ? 'Exportando...' : 'Exportar'}
    </button>
  );
}
```

## 📝 Casos de Uso

### Caso 1: Exportar imágenes seleccionadas
```
Usuario → Selecciona 5 imágenes
Usuario → Click "Exportar selección"
Sistema → Crea ZIP con 5 imágenes + metadatos
Sistema → Descarga automática
```

### Caso 2: Exportar álbum completo
```
Usuario → Vista de álbum 2024
Usuario → Click "Exportar álbum"
Sistema → Crea ZIP con estructura:
  2024/
    ├── images/ (150 fotos)
    ├── thumbnails/ (150 miniaturas)
    └── metadata/ (150 JSON)
Sistema → Descarga ZIP (aprox 450MB)
```

### Caso 3: Backup completo
```
Admin → Panel de administración
Admin → Click "Exportar todo"
Sistema → Crea backup de:
  - Todas las imágenes organizadas por año
  - Todas las miniaturas
  - Todos los metadatos
  - Dump de base de datos PostgreSQL
Sistema → Descarga ZIP completo
```

## 🔐 Consideraciones de Seguridad

1. **Límite de imágenes**: Máximo 500 imágenes por exportación
2. **Límite de tamaño**: Máximo 2GB por archivo ZIP
3. **Autenticación**: Solo usuarios autenticados pueden exportar
4. **Rate limiting**: Máximo 5 exportaciones por hora
5. **Validación**: Verificar que el usuario tiene acceso a las imágenes

## ⚡ Optimizaciones

1. **Streaming**: Usar streams para no cargar todo en memoria
2. **Compresión selectiva**: JPEGs ya comprimidos, no re-comprimir
3. **Caché**: Cachear ZIPs de álbumes completos por 1 hora
4. **Worker threads**: Procesar exportaciones grandes en background
5. **Progress bar**: Mostrar progreso de exportación

## 🎯 Prioridades de Implementación

### Fase 1 (MVP)
- ✅ Exportar imagen individual con metadatos
- ✅ Exportar álbum completo (solo imágenes)

### Fase 2
- ✅ Selección múltiple en galería
- ✅ Exportar selección con opciones
- ✅ Progress bar

### Fase 3
- ✅ Exportación global (backup completo)
- ✅ Programar exportaciones automáticas
- ✅ Sincronización con almacenamiento externo

## 📚 Referencias

- [archiver npm package](https://www.npmjs.com/package/archiver)
- [JSZip documentation](https://stuk.github.io/jszip/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [File downloads in React](https://blog.logrocket.com/programmatic-file-downloads-in-the-browser-9a5186298d5a/)

## 🛠️ Comandos para Implementar

```bash
# 1. Instalar dependencias
npm install archiver
npm install --save-dev @types/archiver

# 2. Crear estructura de archivos
mkdir -p src/lib/export
mkdir -p src/app/api/export

# 3. Crear archivos base
touch src/lib/export/export-utils.ts
touch src/app/api/export/images/route.ts
touch src/components/ExportButton.tsx

# 4. Agregar scripts de exportación al package.json
npm pkg set scripts.export:all="tsx scripts/export-all.ts"
```

## 📋 Checklist de Implementación

### Backend
- [ ] Crear utilidad de exportación (`export-utils.ts`)
- [ ] Implementar API route `/api/export/images`
- [ ] Implementar API route `/api/albums/[id]/export`
- [ ] Implementar API route `/api/export/all`
- [ ] Agregar validación de permisos
- [ ] Implementar rate limiting
- [ ] Agregar logs de exportación

### Frontend
- [ ] Crear componente `ExportButton`
- [ ] Agregar checkbox de selección en galería
- [ ] Crear modal de opciones de exportación
- [ ] Implementar progress bar
- [ ] Agregar indicador de tamaño estimado
- [ ] Crear página de historial de exportaciones

### Testing
- [ ] Test de exportación de imagen individual
- [ ] Test de exportación múltiple
- [ ] Test de exportación de álbum completo
- [ ] Test de límites (tamaño, cantidad)
- [ ] Test de permisos
- [ ] Test de performance con archivos grandes

### Documentación
- [ ] Documentar API endpoints
- [ ] Crear guía de usuario
- [ ] Documentar límites y restricciones
- [ ] Agregar ejemplos de uso

---

**Estado**: 📝 Pendiente de implementación
**Prioridad**: 🔥 Media-Alta
**Estimación**: 2-3 días de desarrollo
