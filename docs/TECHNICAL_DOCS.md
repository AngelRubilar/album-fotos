# 📚 Documentación Técnica - Álbum de Fotos

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico
- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS v4
- **Estado**: React Context API
- **Base de Datos**: JSON Files (simple-db)
- **File System**: Node.js fs/promises

### Estructura de Datos

#### Modelo Album
```typescript
interface Album {
  id: string;           // ID único generado
  year: number;         // Año del álbum
  title: string;        // Título del álbum
  description: string;  // Descripción opcional
  subAlbum?: string;    // Sub-álbum (opcional)
  imageCount: number;   // Contador de imágenes
  createdAt: string;    // Fecha de creación ISO
  updatedAt: string;    // Fecha de actualización ISO
}
```

#### Modelo Image
```typescript
interface Image {
  id: string;           // ID único generado
  albumId: string;      // Referencia al álbum
  filename: string;     // Nombre del archivo
  originalName: string; // Nombre original
  fileUrl: string;      // URL pública
  thumbnailUrl?: string; // URL de miniatura
  fileSize: number;     // Tamaño en bytes
  width: number;        // Ancho en píxeles
  height: number;       // Alto en píxeles
  mimeType: string;     // Tipo MIME
  description: string;  // Descripción opcional
  createdAt: string;    // Fecha de creación ISO
}
```

## 🔄 Flujo de Datos

### 1. Navegación Principal
```
Vista Principal (page.tsx)
    ↓
GET /api/years
    ↓
SimpleDatabase.getYearsWithImages()
    ↓
Mostrar años con imágenes
```

### 2. Vista de Año
```
Click en Año → /album/[year]
    ↓
GET /api/albums/year/[year]
    ↓
SimpleDatabase.getAlbumsByYear()
    ↓
Mostrar álbumes del año
```

### 3. Vista de Álbum
```
Click en Álbum → loadAlbumImages()
    ↓
GET /api/albums/[id]/images
    ↓
SimpleDatabase.getImagesByAlbum()
    ↓
Mostrar fotos del álbum
```

### 4. Subida de Imágenes
```
Seleccionar archivos → handleUpload()
    ↓
POST /api/upload (FormData)
    ↓
Procesar archivos → SimpleDatabase.createImage()
    ↓
Guardar en disco → Actualizar JSON
```

## 🎨 Sistema de Temas

### ThemeContext
```typescript
interface ThemeContextType {
  currentTheme: string;
  setTheme: (theme: string) => void;
  themes: Theme[];
}

interface Theme {
  name: string;
  displayName: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  gradients: string[];
}
```

### Aplicación de Temas
Los temas se aplican mediante:
1. **CSS Variables**: Definidas en `globals.css`
2. **Tailwind Classes**: Condicionales basadas en `currentTheme`
3. **localStorage**: Persistencia del tema seleccionado

## 🖼️ Sistema de Previsualizaciones

### AlbumPreview Component
```typescript
interface AlbumPreviewProps {
  albumId: string;      // ID del álbum
  imageCount: number;   // Número de imágenes
  className?: string;   // Clases CSS adicionales
}
```

### Layouts Disponibles
- **1 imagen**: Imagen completa
- **2 imágenes**: Grid 2x1
- **3 imágenes**: Layout asimétrico (1 grande + 2 pequeñas)
- **4+ imágenes**: Layout con contador "+X"

### Placeholders
```typescript
const colors = [
  'bg-gradient-to-br from-blue-400 to-blue-600',
  'bg-gradient-to-br from-green-400 to-green-600',
  'bg-gradient-to-br from-purple-400 to-purple-600',
  'bg-gradient-to-br from-pink-400 to-pink-600',
  'bg-gradient-to-br from-orange-400 to-orange-600'
];
```

## 🗄️ Base de Datos JSON

### SimpleDatabase Class
```typescript
class SimpleDatabase {
  // Álbumes
  async createAlbum(data: CreateAlbumData): Promise<Album>
  async getAlbumById(id: string): Promise<Album>
  async getAlbumsByYear(year: number): Promise<Album[]>
  async getYearsWithImages(): Promise<YearStats[]>
  async deleteAlbum(id: string): Promise<void>

  // Imágenes
  async createImage(data: CreateImageData): Promise<Image>
  async getImagesByAlbum(albumId: string): Promise<Image[]>
  async deleteImage(id: string): Promise<void>
  async getAllImages(): Promise<Image[]>
}
```

### Operaciones de Archivo
```typescript
// Lectura
function readAlbums(): Album[]
function readImages(): Image[]

// Escritura
function writeAlbums(albums: Album[]): void
function writeImages(images: Image[]): void
```

## 🛣️ API Routes

### Estructura de Respuesta
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

### Endpoints Principales

#### GET /api/albums
```typescript
Response: {
  success: true,
  data: Album[]
}
```

#### POST /api/albums
```typescript
Request: {
  year: number;
  title: string;
  description?: string;
  subAlbum?: string;
}

Response: {
  success: true,
  data: Album
}
```

#### POST /api/upload
```typescript
Request: FormData {
  files: File[];
  albumId: string;
}

Response: {
  success: true,
  data: {
    uploadedImages: Image[];
    totalFiles: number;
    successfulUploads: number;
  }
}
```

## 🎯 Optimizaciones

### Lazy Loading
```typescript
// Componente AlbumPreview
const [previewImages, setPreviewImages] = useState<string[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  // Cargar imágenes solo cuando sea necesario
  if (imageCount > 0) {
    fetchPreviewImages();
  }
}, [albumId, imageCount]);
```

### Memoización
```typescript
// En ThemeContext
const memoizedThemes = useMemo(() => themes, []);

// En componentes
const memoizedGradients = useMemo(() => 
  getGradientsForTheme(currentTheme), [currentTheme]
);
```

### Optimización de Imágenes
```typescript
// Next.js Image Component
<Image
  src={imageUrl}
  alt={altText}
  fill
  className="object-cover"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
/>
```

## 🔒 Seguridad

### Validaciones de Archivo
```typescript
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function validateFile(file: File): boolean {
  return ALLOWED_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE;
}
```

### Sanitización de Entrada
```typescript
function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
```

## 🧪 Testing

### Estructura de Pruebas
```
tests/
├── components/
│   ├── AlbumPreview.test.tsx
│   └── ThemeSelector.test.tsx
├── api/
│   ├── albums.test.ts
│   └── upload.test.ts
└── lib/
    └── simple-db.test.ts
```

### Datos de Prueba
```typescript
const mockAlbum: Album = {
  id: 'test-album-1',
  year: 2025,
  title: 'Test Album',
  description: 'Test Description',
  imageCount: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
};
```

## 📊 Métricas y Monitoreo

### Performance
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

### Bundle Size
- **JavaScript**: ~200KB gzipped
- **CSS**: ~50KB gzipped
- **Images**: Optimizadas automáticamente

## 🚀 Deployment

### Variables de Entorno
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

### Build Process
```bash
npm run build
npm run start
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🔧 Mantenimiento

### Limpieza de Archivos
```typescript
// Limpiar imágenes huérfanas
async function cleanupOrphanedImages(): Promise<void> {
  const images = readImages();
  const albums = readAlbums();
  const albumIds = new Set(albums.map(a => a.id));
  
  const validImages = images.filter(img => albumIds.has(img.albumId));
  writeImages(validImages);
}
```

### Backup Automático
```typescript
// Backup diario de la base de datos
async function createBackup(): Promise<void> {
  const timestamp = new Date().toISOString().split('T')[0];
  const backupDir = path.join(process.cwd(), 'backups');
  
  await fs.copyFile('data/albums.json', `backups/albums-${timestamp}.json`);
  await fs.copyFile('data/images.json', `backups/images-${timestamp}.json`);
}
```

---

**Última actualización**: 20 de Septiembre 2025
**Versión**: 2.0.0

