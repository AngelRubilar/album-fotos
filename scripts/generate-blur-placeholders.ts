import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  const images = await prisma.image.findMany({
    where: { blurDataUrl: null },
    select: { id: true, fileUrl: true },
  });

  console.log(`Procesando ${images.length} imagenes sin blur placeholder...`);
  let ok = 0, fail = 0;

  for (const image of images) {
    try {
      const filePath = path.join(process.cwd(), 'public', image.fileUrl);
      const blurBuffer = await sharp(filePath)
        .resize(20, 20, { fit: 'inside' })
        .jpeg({ quality: 40 })
        .toBuffer();

      const blurDataUrl = `data:image/jpeg;base64,${blurBuffer.toString('base64')}`;

      await prisma.image.update({
        where: { id: image.id },
        data: { blurDataUrl },
      });

      ok++;
      if (ok % 50 === 0) console.log(`  ${ok}/${images.length} procesadas...`);
    } catch (err) {
      fail++;
      console.error(`Error ${image.id} (${image.fileUrl}):`, (err as Error).message);
    }
  }

  console.log(`\nTerminado: ${ok} OK, ${fail} errores`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); });
