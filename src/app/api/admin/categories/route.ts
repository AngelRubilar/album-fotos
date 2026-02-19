import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json({ success: false, error: "Error al obtener categorías" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ success: false, error: "El nombre es requerido" }, { status: 400 });
    }
    const category = await prisma.category.create({
      data: { name: name.trim() },
    });
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ success: false, error: "Ya existe esa categoría" }, { status: 400 });
    }
    return NextResponse.json({ success: false, error: "Error al crear categoría" }, { status: 500 });
  }
}
