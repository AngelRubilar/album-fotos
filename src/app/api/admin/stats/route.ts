import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [imageAgg, totalAlbums, years] = await Promise.all([
      prisma.image.aggregate({
        _count: { id: true },
        _sum: { fileSize: true },
      }),
      prisma.album.count(),
      prisma.album.findMany({
        select: { year: true },
        distinct: ["year"],
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        totalImages: imageAgg._count.id,
        totalAlbums,
        totalYears: years.length,
        diskUsageMB: Math.round(((imageAgg._sum.fileSize ?? 0) / 1024 / 1024) * 10) / 10,
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ success: false, error: "Error al obtener estadísticas" }, { status: 500 });
  }
}
