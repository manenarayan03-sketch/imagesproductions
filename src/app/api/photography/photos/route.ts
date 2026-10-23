import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

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
    return NextResponse.json({ photos });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to load photos", detail: String(e) },
      { status: 500 }
    );
  }
}
