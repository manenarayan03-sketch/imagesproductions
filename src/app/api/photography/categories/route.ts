import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const cats = await db.photographyCategory.findMany({
      where: {
        published: true,
        photos: { some: { published: true } },
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        order: true,
        _count: { select: { photos: { where: { published: true } } } },
        photos: {
          where: { published: true },
          orderBy: [{ order: "asc" }, { createdAt: "desc" }],
          take: 1,
          select: { id: true, title: true, imageUrl: true },
        },
      },
    });
    return NextResponse.json({ categories: cats });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to load photography categories", detail: String(e) },
      { status: 500 }
    );
  }
}
