import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const cats = await db.videoCategory.findMany({
      where: {
        published: true,
        videos: { some: { published: true } },
      },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        order: true,
        _count: { select: { videos: { where: { published: true } } } },
        videos: {
          where: { published: true },
          orderBy: [{ order: "asc" }, { createdAt: "desc" }],
          take: 1,
          select: {
            id: true,
            title: true,
            videoUrl: true,
            thumbnailUrl: true,
          },
        },
      },
    });
    return NextResponse.json({ categories: cats });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to load video categories", detail: String(e) },
      { status: 500 }
    );
  }
}
