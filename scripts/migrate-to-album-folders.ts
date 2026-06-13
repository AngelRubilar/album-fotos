import { PrismaClient } from '@prisma/client';
import { rename, mkdir, access } from 'fs/promises';
import path from 'path';
import {
  slugify, uniqueSlug, albumUploadDir, albumThumbDir, uploadUrl, thumbUrl,
  UPLOADS_BASE, THUMBS_BASE,
} from '../src/lib/storage';

const prisma = new PrismaClient();
const exists = (p: string) => access(p).then(() => true).catch(() => false);

async function main() {
  // 1) folderName por álbum
  const albums = await prisma.album.findMany({ orderBy: { year: 'asc' } });
  const byYear = new Map<number, Set<string>>();
  for (const a of albums) {
    const taken = byYear.get(a.year) ?? new Set<string>();
    let folder = a.folderName;
    if (!folder) {
      folder = uniqueSlug(slugify(a.title), taken);
      await prisma.album.update({ where: { id: a.id }, data: { folderName: folder } });
      console.log(`album ${a.id} → folderName=${folder}`);
    }
    taken.add(folder);
    byYear.set(a.year, taken);
    await mkdir(albumUploadDir(a.year, folder), { recursive: true });
    await mkdir(albumThumbDir(a.year, folder), { recursive: true });
  }

  // 2) mover cada imagen (manteniendo su nombre actual)
  const images = await prisma.image.findMany({ include: { album: true } });
  for (const img of images) {
    if (!img.album?.folderName) { console.warn(`imagen ${img.id} sin álbum/folder, salto`); continue; }
    const { year, folderName } = { year: img.album.year, folderName: img.album.folderName };
    const current = path.basename(img.fileUrl);
    const newFileUrl = uploadUrl(year, folderName, current);
    if (img.fileUrl === newFileUrl) continue; // idempotente

    const srcUp = path.join(UPLOADS_BASE, path.basename(img.fileUrl));
    const dstUp = path.join(albumUploadDir(year, folderName), current);
    if (await exists(srcUp) && !(await exists(dstUp))) await rename(srcUp, dstUp);

    let newThumbUrl = img.thumbnailUrl;
    if (img.thumbnailUrl) {
      const tname = path.basename(img.thumbnailUrl);
      const srcTh = path.join(THUMBS_BASE, tname);
      const dstTh = path.join(albumThumbDir(year, folderName), tname);
      if (await exists(srcTh) && !(await exists(dstTh))) await rename(srcTh, dstTh);
      newThumbUrl = thumbUrl(year, folderName, tname);
    }

    await prisma.image.update({ where: { id: img.id }, data: { fileUrl: newFileUrl, thumbnailUrl: newThumbUrl } });
  }

  // 3) reescribir covers de álbum que aún apunten a rutas planas
  const albumsRefreshed = await prisma.album.findMany();
  for (const a of albumsRefreshed) {
    if (!a.coverImageUrl || !a.folderName) continue;
    const base = path.basename(a.coverImageUrl);
    // Ya está en ruta anidada → idempotente
    const isNested = a.coverImageUrl.includes(`/${a.year}/${a.folderName}/`);
    if (isNested) continue;

    let newCover: string | null = null;
    if (a.coverImageUrl.startsWith('/thumbnails/')) {
      newCover = thumbUrl(a.year, a.folderName, base);
    } else if (a.coverImageUrl.startsWith('/uploads/')) {
      newCover = uploadUrl(a.year, a.folderName, base);
    }
    if (newCover) {
      await prisma.album.update({ where: { id: a.id }, data: { coverImageUrl: newCover } });
      console.log(`Album cover ${a.id}: ${a.coverImageUrl} → ${newCover}`);
    }
  }

  // 4) reescribir covers de YearCover que aún apunten a rutas planas
  const yearCovers = await prisma.yearCover.findMany();
  const imagesByAlbumYear = new Map<number, Array<{ fileUrl: string; thumbnailUrl: string | null }>>();
  for (const img of await prisma.image.findMany({ include: { album: { select: { year: true } } } })) {
    const y = img.album?.year;
    if (y === undefined) continue;
    const list = imagesByAlbumYear.get(y) ?? [];
    list.push({ fileUrl: img.fileUrl, thumbnailUrl: img.thumbnailUrl });
    imagesByAlbumYear.set(y, list);
  }
  for (const yc of yearCovers) {
    if (!yc.coverImageUrl) continue;
    const base = path.basename(yc.coverImageUrl);
    const isNested = /\/(uploads|thumbnails)\/\d{4}\//.test(yc.coverImageUrl);
    if (isNested) continue;

    // Buscar la imagen del año que tenga ese basename
    const candidates = imagesByAlbumYear.get(yc.year) ?? [];
    const match = candidates.find(
      (img) => path.basename(img.fileUrl) === base || (img.thumbnailUrl && path.basename(img.thumbnailUrl) === base)
    );
    if (match) {
      const newCover = match.thumbnailUrl ?? match.fileUrl;
      await prisma.yearCover.update({ where: { year: yc.year }, data: { coverImageUrl: newCover } });
      console.log(`YearCover ${yc.year}: ${yc.coverImageUrl} → ${newCover}`);
    } else {
      console.warn(`YearCover ${yc.year}: no se encontró imagen con basename '${base}' para reescribir cover`);
    }
  }

  console.log('Migración completa.');
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
