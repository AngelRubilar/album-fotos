import { getSimpleDatabase } from './simple-db';

export async function addTestImages() {
  const db = getSimpleDatabase();
  
  // Obtener álbumes existentes
  const albums = await db.getAlbums();
  
  if (albums.length === 0) {
    console.log('No hay álbumes para agregar imágenes');
    return;
  }

  // Agregar algunas imágenes de prueba a diferentes álbumes
  const testImages = [
    {
      albumId: albums[0].id,
      filename: 'test1.jpg',
      originalName: 'Foto de prueba 1',
      fileUrl: '/placeholder-1.jpg',
      thumbnailUrl: '/placeholder-1-thumb.jpg',
      fileSize: 1024000,
      width: 800,
      height: 600,
      mimeType: 'image/jpeg',
      description: 'Imagen de prueba 1'
    },
    {
      albumId: albums[0].id,
      filename: 'test2.jpg',
      originalName: 'Foto de prueba 2',
      fileUrl: '/placeholder-2.jpg',
      thumbnailUrl: '/placeholder-2-thumb.jpg',
      fileSize: 2048000,
      width: 1200,
      height: 800,
      mimeType: 'image/jpeg',
      description: 'Imagen de prueba 2'
    },
    {
      albumId: albums[1]?.id || albums[0].id,
      filename: 'test3.jpg',
      originalName: 'Foto de prueba 3',
      fileUrl: '/placeholder-3.jpg',
      thumbnailUrl: '/placeholder-3-thumb.jpg',
      fileSize: 1536000,
      width: 600,
      height: 900,
      mimeType: 'image/jpeg',
      description: 'Imagen de prueba 3'
    }
  ];

  for (const imageData of testImages) {
    try {
      await db.createImage(imageData);
      console.log(`✅ Imagen agregada: ${imageData.originalName}`);
    } catch (error) {
      console.error(`❌ Error agregando imagen ${imageData.originalName}:`, error);
    }
  }
}
