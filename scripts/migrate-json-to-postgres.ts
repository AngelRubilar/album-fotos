/**
 * Script para migrar datos de archivos JSON a PostgreSQL
 *
 * Uso: npx tsx scripts/migrate-json-to-postgres.ts
 *
 * Este script:
 * 1. Lee los álbumes e imágenes desde data/albums.json y data/images.json
 * 2. Los inserta en PostgreSQL usando Prisma
 * 3. Mantiene las relaciones entre álbumes e imágenes
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface JsonAlbum {
  id: string;
  year: number;
  title: string;
  description: string;
  subAlbum: string | null;
  createdAt: string;
  updatedAt: string;
}

interface JsonImage {
  id: string;
  albumId: string;
  filename: string;
  originalName: string;
  fileUrl: string;
  thumbnailUrl: string;
  fileSize: number;
  width: number;
  height: number;
  mimeType: string;
  description: string;
  uploadedAt: string;
}

async function migrateData() {
  const dataDir = path.join(process.cwd(), 'data');
  const albumsFile = path.join(dataDir, 'albums.json');
  const imagesFile = path.join(dataDir, 'images.json');

  console.log('🚀 Iniciando migración de JSON a PostgreSQL...\n');

  // Verificar que existen los archivos JSON
  if (!fs.existsSync(albumsFile)) {
    console.log('❌ No se encontró el archivo albums.json');
    console.log('   Ubicación esperada:', albumsFile);
    return;
  }

  if (!fs.existsSync(imagesFile)) {
    console.log('❌ No se encontró el archivo images.json');
    console.log('   Ubicación esperada:', imagesFile);
    return;
  }

  // Leer archivos JSON
  console.log('📖 Leyendo archivos JSON...');
  const albumsData: JsonAlbum[] = JSON.parse(fs.readFileSync(albumsFile, 'utf8'));
  const imagesData: JsonImage[] = JSON.parse(fs.readFileSync(imagesFile, 'utf8'));

  console.log(`   - ${albumsData.length} álbumes encontrados`);
  console.log(`   - ${imagesData.length} imágenes encontradas\n`);

  // Mapeo de IDs antiguos a nuevos
  const albumIdMap = new Map<string, string>();

  try {
    // Migrar álbumes
    console.log('📁 Migrando álbumes...');

    for (const album of albumsData) {
      // Verificar si ya existe un álbum con el mismo año y título
      const existingAlbum = await prisma.album.findFirst({
        where: {
          year: album.year,
          title: album.title,
          subAlbum: album.subAlbum
        }
      });

      if (existingAlbum) {
        console.log(`   ⏭️  Álbum ya existe: "${album.title}" (${album.year})`);
        albumIdMap.set(album.id, existingAlbum.id);
        continue;
      }

      const newAlbum = await prisma.album.create({
        data: {
          year: album.year,
          title: album.title,
          description: album.description || null,
          subAlbum: album.subAlbum || null,
          createdAt: new Date(album.createdAt),
          updatedAt: new Date(album.updatedAt)
        }
      });

      albumIdMap.set(album.id, newAlbum.id);
      console.log(`   ✅ Álbum migrado: "${album.title}" (${album.year})`);
    }

    console.log(`\n📸 Migrando imágenes...`);

    let migratedImages = 0;
    let skippedImages = 0;

    for (const image of imagesData) {
      // Obtener el nuevo ID del álbum
      const newAlbumId = albumIdMap.get(image.albumId);

      if (!newAlbumId) {
        console.log(`   ⚠️  Álbum no encontrado para imagen: ${image.filename}`);
        skippedImages++;
        continue;
      }

      // Verificar si la imagen ya existe
      const existingImage = await prisma.image.findFirst({
        where: {
          filename: image.filename,
          albumId: newAlbumId
        }
      });

      if (existingImage) {
        skippedImages++;
        continue;
      }

      await prisma.image.create({
        data: {
          albumId: newAlbumId,
          filename: image.filename,
          originalName: image.originalName,
          fileUrl: image.fileUrl,
          thumbnailUrl: image.thumbnailUrl || null,
          fileSize: image.fileSize,
          width: image.width,
          height: image.height,
          mimeType: image.mimeType,
          description: image.description || null,
          uploadedAt: new Date(image.uploadedAt)
        }
      });

      migratedImages++;
    }

    console.log(`   ✅ ${migratedImages} imágenes migradas`);
    if (skippedImages > 0) {
      console.log(`   ⏭️  ${skippedImages} imágenes omitidas (ya existían)`);
    }

    // Verificar resultados
    console.log('\n📊 Verificando migración...');
    const totalAlbums = await prisma.album.count();
    const totalImages = await prisma.image.count();

    console.log(`   - Total álbumes en PostgreSQL: ${totalAlbums}`);
    console.log(`   - Total imágenes en PostgreSQL: ${totalImages}`);

    console.log('\n✨ ¡Migración completada exitosamente!');

    // Crear backup de los archivos JSON
    const backupDir = path.join(dataDir, 'backup');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    fs.copyFileSync(albumsFile, path.join(backupDir, `albums_${timestamp}.json`));
    fs.copyFileSync(imagesFile, path.join(backupDir, `images_${timestamp}.json`));

    console.log(`\n💾 Backup de archivos JSON creado en: ${backupDir}`);

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar migración
migrateData()
  .then(() => {
    console.log('\n🎉 Proceso finalizado.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
