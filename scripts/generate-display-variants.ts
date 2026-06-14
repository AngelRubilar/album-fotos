import { PrismaClient } from '@prisma/client';
import { readFile, access } from 'fs/promises';
import path from 'path';
import convert from 'heic-convert';
import { generateDisplayFromBuffer } from '../src/lib/thumbnail';
import { displayName, albumThumbDir, thumbUrl, UPLOADS_BASE } from '../src/lib/storage';

const prisma = new PrismaClient();
const exists = (p: string) => access(p).then(() => true).catch(() => false);

function isHeicName(name: string): boolean {
  const ext = path.extname(name).toLowerCase();
  return ext === '.heic' || ext === '.heif';
}

async function main() {
  const images = await prisma.image.findMany({ include: { album: true } });
  let done = 0, skipped = 0, failed = 0;

  for (const img of images) {
    if (!img.album?.folderName) { skipped++; continue; }
    const { year, folderName } = { year: img.album.year, folderName: img.album.folderName };
    const origName = path.basename(img.fileUrl);
    const dispName = displayName(origName);
    const outPath = path.join(albumThumbDir(year, folderName), dispName);
    const wantUrl = thumbUrl(year, folderName, dispName);

    if (img.displayUrl === wantUrl && (await exists(outPath))) { skipped++; continue; }

    const srcPath = path.join(UPLOADS_BASE, year.toString(), folderName, origName);
    if (!(await exists(srcPath))) { console.warn(`sin original: ${img.fileUrl}`); failed++; continue; }

    try {
      let buf = await readFile(srcPath);
      if (isHeicName(origName)) {
        buf = Buffer.from(await convert({ buffer: buf, format: 'JPEG', quality: 0.92 }));
      }
      await generateDisplayFromBuffer(buf, outPath);
      await prisma.image.update({ where: { id: img.id }, data: { displayUrl: wantUrl } });
      done++;
      if (done % 50 === 0) console.log(`${done} displays generadas...`);
    } catch (e) {
      console.error(`falló ${img.fileUrl}:`, (e as Error).message);
      failed++;
    }
  }
  console.log(`Backfill display completo. generadas=${done} saltadas=${skipped} fallidas=${failed}`);
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
