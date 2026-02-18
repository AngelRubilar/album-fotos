import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Crear álbumes de ejemplo
  const albums = [
    { year: 2024, title: 'Año 2024', description: 'Fotos del año 2024' },
    { year: 2023, title: 'Año 2023', description: 'Fotos del año 2023' },
    { year: 2022, title: 'Año 2022', description: 'Fotos del año 2022' },
    { year: 2021, title: 'Año 2021', description: 'Fotos del año 2021' },
  ];

  for (const albumData of albums) {
    const existingAlbum = await prisma.album.findFirst({
      where: { year: albumData.year, title: albumData.title }
    });

    if (!existingAlbum) {
      await prisma.album.create({
        data: albumData
      });
      console.log(`✅ Created album: ${albumData.title}`);
    } else {
      console.log(`⏭️  Album ${albumData.title} already exists`);
    }
  }

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
