import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { name } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: "El nombre es requerido" }, { status: 400 });
    }

    // Renombrar categoría y sincronizar subAlbum en todos los álbumes vinculados
    const [category] = await prisma.$transaction([
      prisma.category.update({ where: { id }, data: { name: name.trim() } }),
      prisma.album.updateMany({ where: { categoryId: id }, data: { subAlbum: name.trim() } }),
    ]);

    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ success: false, error: "Ya existe esa categoría" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Error al actualizar" }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    // ON DELETE SET NULL en la FK: los álbumes quedan sin categoría
    // También limpiamos subAlbum para consistencia
    await prisma.$transaction([
      prisma.album.updateMany({ where: { categoryId: id }, data: { subAlbum: null } }),
      prisma.category.delete({ where: { id } }),
    ]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: "Error al eliminar" }, { status: 500 });
  }
}
