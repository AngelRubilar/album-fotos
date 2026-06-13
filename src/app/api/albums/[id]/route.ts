import { NextRequest, NextResponse } from 'next/server';
import { rm, rename } from 'fs/promises';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { slugify, uniqueSlug, albumUploadDir, albumThumbDir } from '@/lib/storage';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const albumInclude = {
  _count: { select: { images: true } },
  category: { select: { id: true, name: true } },
} as const;

type AlbumWithRelations = Prisma.AlbumGetPayload<{ include: typeof albumInclude }>;

function formatAlbum(album: AlbumWithRelations) {
  return {
    id: album.id,
    year: album.year,
    title: album.title,
    description: album.description,
    subAlbum: album.subAlbum,
    categoryId: album.categoryId,
    category: album.category,
    coverImageUrl: album.coverImageUrl,
    coverFocalPoint: album.coverFocalPoint,
    eventDate: album.eventDate,
    imageCount: album._count.images,
    createdAt: album.createdAt,
    updatedAt: album.updatedAt,
  };
}

// GET /api/albums/[id]
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const album = await prisma.album.findUnique({ where: { id }, include: albumInclude });

    if (!album) {
      return NextResponse.json({ success: false, error: 'Álbum no encontrado' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: formatAlbum(album) });
  } catch (error) {
    console.error('Error fetching album:', error);
    return NextResponse.json({ success: false, error: 'Error al obtener álbum' }, { status: 500 });
  }
}

// PUT /api/albums/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, categoryId, eventDate, coverImageUrl, coverFocalPoint } = body;

    const existing = await prisma.album.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Álbum no encontrado' }, { status: 404 });
    }

    // Resolver nombre de categoría si cambió
    const newCategoryId = categoryId !== undefined ? (categoryId || null) : existing.categoryId;
    let newSubAlbum = existing.subAlbum;

    if (categoryId !== undefined) {
      if (categoryId) {
        const cat = await prisma.category.findUnique({ where: { id: categoryId } });
        newSubAlbum = cat?.name ?? null;
      } else {
        newSubAlbum = null;
      }
    }

    const newTitle = title?.trim() || existing.title;
    let newFolderName = existing.folderName;

    // Solo recalcular carpeta si el SLUG cambia realmente
    if (existing.folderName && slugify(newTitle) !== slugify(existing.title)) {
      const sameYear = await prisma.album.findMany({
        where: { year: existing.year, id: { not: id } },
        select: { folderName: true },
      });
      const taken = new Set(sameYear.map((a) => a.folderName).filter((f): f is string => !!f));
      newFolderName = uniqueSlug(slugify(newTitle), taken);
    }

    const oldFolder = existing.folderName;
    const folderChanged = !!oldFolder && newFolderName !== oldFolder;

    if (folderChanged) {
      // renombrar uploads ANTES de la transacción; si falla, no tocamos la BD
      await rename(albumUploadDir(existing.year, oldFolder!), albumUploadDir(existing.year, newFolderName!));
      // renombrar thumbnails; si falla, revertir uploads
      try {
        await rename(albumThumbDir(existing.year, oldFolder!), albumThumbDir(existing.year, newFolderName!));
      } catch (thumbErr) {
        await rename(albumUploadDir(existing.year, newFolderName!), albumUploadDir(existing.year, oldFolder!)).catch(() => {});
        throw thumbErr;
      }
    }

    const oldPrefixUp = `/uploads/${existing.year}/${oldFolder}/`;
    const newPrefixUp = `/uploads/${existing.year}/${newFolderName}/`;
    const oldPrefixTh = `/thumbnails/${existing.year}/${oldFolder}/`;
    const newPrefixTh = `/thumbnails/${existing.year}/${newFolderName}/`;

    let updated;
    try {
    updated = await prisma.$transaction(async (tx) => {
      if (folderChanged) {
        const imgs = await tx.image.findMany({ where: { albumId: id } });
        for (const img of imgs) {
          await tx.image.update({
            where: { id: img.id },
            data: {
              fileUrl: img.fileUrl.replace(oldPrefixUp, newPrefixUp),
              thumbnailUrl: img.thumbnailUrl ? img.thumbnailUrl.replace(oldPrefixTh, newPrefixTh) : img.thumbnailUrl,
            },
          });
        }
        const yc = await tx.yearCover.findUnique({ where: { year: existing.year } });
        if (yc?.coverImageUrl && (yc.coverImageUrl.startsWith(oldPrefixTh) || yc.coverImageUrl.startsWith(oldPrefixUp))) {
          await tx.yearCover.update({
            where: { year: existing.year },
            data: { coverImageUrl: yc.coverImageUrl.replace(oldPrefixTh, newPrefixTh).replace(oldPrefixUp, newPrefixUp) },
          });
        }
      }

      const album = await tx.album.update({
        where: { id },
        data: {
          title: newTitle,
          description: description?.trim() ?? existing.description,
          categoryId: newCategoryId,
          subAlbum: newSubAlbum,
          eventDate: eventDate !== undefined ? (eventDate ? new Date(eventDate) : null) : existing.eventDate,
          coverImageUrl: coverImageUrl !== undefined
            ? coverImageUrl
            : (folderChanged && existing.coverImageUrl ? existing.coverImageUrl.replace(oldPrefixTh, newPrefixTh).replace(oldPrefixUp, newPrefixUp) : existing.coverImageUrl),
          coverFocalPoint: coverFocalPoint !== undefined ? coverFocalPoint : existing.coverFocalPoint,
          folderName: newFolderName,
        },
        include: albumInclude,
      });
      return album;
    });
    } catch (txErr) {
      // La transacción falló: revertir ambos renames de disco
      if (folderChanged) {
        await rename(albumThumbDir(existing.year, newFolderName!), albumThumbDir(existing.year, oldFolder!)).catch(() => {});
        await rename(albumUploadDir(existing.year, newFolderName!), albumUploadDir(existing.year, oldFolder!)).catch(() => {});
      }
      throw txErr;
    }

    return NextResponse.json({ success: true, data: formatAlbum(updated) });
  } catch (error) {
    console.error('Error updating album:', error);
    return NextResponse.json({ success: false, error: 'Error al actualizar álbum' }, { status: 500 });
  }
}

// DELETE /api/albums/[id]
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const existing = await prisma.album.findUnique({
      where: { id },
      include: { _count: { select: { images: true } } }
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: 'Álbum no encontrado' }, { status: 404 });
    }

    await prisma.album.delete({ where: { id } });

    if (existing.folderName) {
      await rm(albumUploadDir(existing.year, existing.folderName), { recursive: true, force: true });
      await rm(albumThumbDir(existing.year, existing.folderName), { recursive: true, force: true });
    }

    return NextResponse.json({
      success: true,
      data: { id: existing.id, title: existing.title },
      message: 'Álbum eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error deleting album:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Error al eliminar álbum' },
      { status: 500 }
    );
  }
}
