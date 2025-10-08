// Implementación simple usando archivos JSON como base de datos
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const albumsFile = path.join(dataDir, 'albums.json');
const imagesFile = path.join(dataDir, 'images.json');

// Asegurar que el directorio de datos existe
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Inicializar archivos JSON si no existen
function initFiles() {
  if (!fs.existsSync(albumsFile)) {
    fs.writeFileSync(albumsFile, JSON.stringify([], null, 2));
  }
  if (!fs.existsSync(imagesFile)) {
    fs.writeFileSync(imagesFile, JSON.stringify([], null, 2));
  }
}

// Cache en memoria para reducir lecturas de disco
interface DataCache {
  albums: { data: any[], timestamp: number } | null;
  images: { data: any[], timestamp: number } | null;
}

const cache: DataCache = {
  albums: null,
  images: null
};

const CACHE_TTL = 5000; // 5 segundos

// Leer datos con caché
function readAlbums(): any[] {
  initFiles();

  // Verificar si hay datos en caché válidos
  if (cache.albums && Date.now() - cache.albums.timestamp < CACHE_TTL) {
    return cache.albums.data;
  }

  try {
    const data = fs.readFileSync(albumsFile, 'utf8');
    const albums = JSON.parse(data);

    // Actualizar caché
    cache.albums = {
      data: albums,
      timestamp: Date.now()
    };

    return albums;
  } catch (error) {
    console.error('Error reading albums:', error);
    return [];
  }
}

function readImages(): any[] {
  initFiles();

  // Verificar si hay datos en caché válidos
  if (cache.images && Date.now() - cache.images.timestamp < CACHE_TTL) {
    return cache.images.data;
  }

  try {
    const data = fs.readFileSync(imagesFile, 'utf8');
    const images = JSON.parse(data);

    // Actualizar caché
    cache.images = {
      data: images,
      timestamp: Date.now()
    };

    return images;
  } catch (error) {
    console.error('Error reading images:', error);
    return [];
  }
}

// Escribir datos e invalidar caché
function writeAlbums(albums: any[]) {
  initFiles();
  try {
    fs.writeFileSync(albumsFile, JSON.stringify(albums, null, 2));
    // Invalidar caché al escribir
    cache.albums = null;
  } catch (error) {
    console.error('Error writing albums:', error);
    throw error;
  }
}

function writeImages(images: any[]) {
  initFiles();
  try {
    fs.writeFileSync(imagesFile, JSON.stringify(images, null, 2));
    // Invalidar caché al escribir
    cache.images = null;
  } catch (error) {
    console.error('Error writing images:', error);
    throw error;
  }
}

export class SimpleDatabase {
  async createAlbum(data: { year: number; title: string; description?: string; subAlbum?: string }): Promise<any> {
    const albums = readAlbums();
    
    // Verificar si ya existe un álbum con el mismo año, título y subálbum
    const existingAlbum = albums.find(album => 
      album.year === data.year && 
      album.title === data.title && 
      album.subAlbum === (data.subAlbum || null)
    );
    
    if (existingAlbum) {
      throw new Error(`Ya existe un álbum con ese nombre para el año ${data.year}`);
    }

    const newAlbum = {
      id: `album_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      year: data.year,
      title: data.title,
      description: data.description || '',
      subAlbum: data.subAlbum || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    albums.push(newAlbum);
    writeAlbums(albums);

    return newAlbum;
  }

  async getAlbums(): Promise<any[]> {
    const albums = readAlbums();
    const images = readImages();

    // Agregar conteo de imágenes a cada álbum
    return albums.map(album => ({
      ...album,
      imageCount: images.filter(img => img.albumId === album.id).length
    })).sort((a, b) => b.year - a.year);
  }

  async getYearsWithImages(): Promise<any[]> {
    const albums = readAlbums();
    const images = readImages();

    // Agrupar por año y contar imágenes
    const yearStats = albums.reduce((acc, album) => {
      const yearImages = images.filter(img => img.albumId === album.id).length;
      
      if (!acc[album.year]) {
        acc[album.year] = {
          year: album.year,
          totalImages: 0,
          albumCount: 0
        };
      }
      
      acc[album.year].totalImages += yearImages;
      acc[album.year].albumCount += 1;
      
      return acc;
    }, {} as any);

    // Filtrar solo años que tienen imágenes y convertir a array
    return Object.values(yearStats)
      .filter((yearData: any) => yearData.totalImages > 0)
      .sort((a: any, b: any) => b.year - a.year);
  }

  async getAlbumById(id: string): Promise<any> {
    const albums = readAlbums();
    const album = albums.find(a => a.id === id);
    
    if (album) {
      const images = readImages();
      album.imageCount = images.filter(img => img.albumId === album.id).length;
    }
    
    return album;
  }

  async getAlbumByYear(year: number): Promise<any> {
    const albums = readAlbums();
    return albums.find(album => album.year === year && !album.subAlbum);
  }

  async getAlbumsByYear(year: number): Promise<any[]> {
    const albums = readAlbums();
    const images = readImages();

    // Obtener todos los álbumes del año especificado
    const yearAlbums = albums.filter(album => album.year === year);

    // Agregar conteo de imágenes a cada álbum
    return yearAlbums.map(album => ({
      ...album,
      imageCount: images.filter(img => img.albumId === album.id).length
    })).sort((a, b) => {
      // Ordenar: primero álbumes principales (sin subálbum), luego subálbumes
      if (!a.subAlbum && b.subAlbum) return -1;
      if (a.subAlbum && !b.subAlbum) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }


  async createImage(data: {
    albumId: string;
    filename: string;
    originalName: string;
    fileUrl: string;
    thumbnailUrl?: string;
    fileSize: number;
    width: number;
    height: number;
    mimeType: string;
    description?: string;
  }): Promise<any> {
    const images = readImages();

    const newImage = {
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      thumbnailUrl: data.thumbnailUrl || '',
      description: data.description || '',
      uploadedAt: new Date().toISOString()
    };

    images.push(newImage);
    writeImages(images);

    return newImage;
  }

  async getImagesByAlbum(albumId: string): Promise<any[]> {
    const images = readImages();
    return images.filter(img => img.albumId === albumId);
  }

  async getImagesByAlbumYear(year: number): Promise<any[]> {
    const albums = readAlbums();
    const images = readImages();
    
    // Obtener todos los álbumes del año
    const yearAlbums = albums.filter(a => a.year === year);
    const yearAlbumIds = yearAlbums.map(a => a.id);

    // Obtener todas las imágenes de esos álbumes
    return images.filter(img => yearAlbumIds.includes(img.albumId));
  }

  async deleteAlbum(id: string): Promise<void> {
    const albums = readAlbums();
    const images = readImages();
    
    // Eliminar álbum
    const albumIndex = albums.findIndex(a => a.id === id);
    if (albumIndex === -1) {
      throw new Error('Álbum no encontrado');
    }
    
    albums.splice(albumIndex, 1);
    writeAlbums(albums);
    
    // Eliminar todas las imágenes del álbum
    const filteredImages = images.filter(img => img.albumId !== id);
    writeImages(filteredImages);
  }

  async getAllImages(): Promise<any[]> {
    return readImages();
  }

  async deleteImage(id: string): Promise<void> {
    const images = readImages();
    
    const imageIndex = images.findIndex(img => img.id === id);
    if (imageIndex === -1) {
      throw new Error('Imagen no encontrada');
    }
    
    images.splice(imageIndex, 1);
    writeImages(images);
  }

  // Método para inicializar con datos de ejemplo
  async seedDatabase(): Promise<void> {
    const albums = readAlbums();
    
    if (albums.length === 0) {
      const exampleAlbums = [
        // Álbumes principales por año
        { year: 2024, title: 'Año 2024', description: 'Fotos del año 2024' },
        { year: 2023, title: 'Año 2023', description: 'Fotos del año 2023' },
        { year: 2022, title: 'Año 2022', description: 'Fotos del año 2022' },
        { year: 2021, title: 'Año 2021', description: 'Fotos del año 2021' },
        
        // Subálbumes de ejemplo para 2025
        { year: 2025, title: 'Vacaciones de Verano', description: 'Fotos de las vacaciones de verano 2025', subAlbum: 'Vacaciones' },
        { year: 2025, title: 'Cumpleaños', description: 'Fotos del cumpleaños 2025', subAlbum: 'Eventos' },
        { year: 2025, title: 'Viaje a la Playa', description: 'Fotos del viaje a la playa', subAlbum: 'Viajes' },
      ];

      for (const albumData of exampleAlbums) {
        try {
          await this.createAlbum(albumData);
        } catch (error) {
          console.log(`Album ${albumData.title} already exists`);
        }
      }
    }
  }
}

// Instancia singleton
let dbInstance: SimpleDatabase | null = null;

export function getSimpleDatabase() {
  if (!dbInstance) {
    dbInstance = new SimpleDatabase();
  }
  return dbInstance;
}
