import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import portfolioFallback from "@/lib/portfolio-fallback.json";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const limitRaw = searchParams.get("limit");

    const where: { published: boolean; categoryId?: string } = {
      published: true,
    };
    if (categoryId) where.categoryId = categoryId;

    const take =
      limitRaw && !Number.isNaN(Number(limitRaw))
        ? Math.max(1, Math.min(200, Number(limitRaw)))
        : undefined;

    const photos = await db.photo.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take,
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        categoryId: true,
        order: true,
        category: { select: { id: true, name: true, slug: true } },
      },
    });
    return NextResponse.json({
      photos: photos.map((photo) => ({
        ...photo,
        imageUrl:
          portfolioFallback.photos.find((fallbackPhoto) => fallbackPhoto.id === photo.id)?.imageUrl ??
          photo.imageUrl,
      })),
    });
  } catch (e) {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const limitRaw = searchParams.get("limit");
    const take =
      limitRaw && !Number.isNaN(Number(limitRaw))
        ? Math.max(1, Math.min(200, Number(limitRaw)))
        : undefined;
    const photos = portfolioFallback.photos.filter(
      (photo) => !categoryId || photo.categoryId === categoryId
    );
    return NextResponse.json({ photos: take ? photos.slice(0, take) : photos });
  }
}
