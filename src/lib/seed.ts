import { getDatabase } from './database';

export async function seedDatabase() {
  console.log('🌱 Seeding database...');

  const db = getDatabase();

  // Crear álbumes de ejemplo
  const albums = [
    { year: 2024, title: 'Año 2024', description: 'Fotos del año 2024' },
    { year: 2023, title: 'Año 2023', description: 'Fotos del año 2023' },
    { year: 2022, title: 'Año 2022', description: 'Fotos del año 2022' },
    { year: 2021, title: 'Año 2021', description: 'Fotos del año 2021' },
  ];

  for (const albumData of albums) {
    try {
      const existingAlbum = await db.getAlbumByYear(albumData.year);
      
      if (!existingAlbum) {
        await db.createAlbum(albumData);
        console.log(`✅ Created album: ${albumData.title}`);
      } else {
        console.log(`⏭️  Album ${albumData.title} already exists`);
      }
    } catch (error) {
      console.error(`❌ Error creating album ${albumData.title}:`, error);
    }
  }

  console.log('🎉 Seeding completed!');
}
