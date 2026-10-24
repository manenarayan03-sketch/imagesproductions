import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import portfolioFallback from "@/lib/portfolio-fallback.json";

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
    return NextResponse.json({
      categories: cats.map((category) => ({
        ...category,
        videos: category.videos.map((video) => {
          const fallbackVideo = portfolioFallback.videos.find((item) => item.id === video.id);
          return {
            ...video,
            videoUrl: video.videoUrl.startsWith("/uploads/") ? null : video.videoUrl,
            thumbnailUrl: fallbackVideo?.thumbnailUrl ?? video.thumbnailUrl,
          };
        }),
      })),
    });
  } catch (e) {
    if (portfolioFallback.videoCategories.length > 0) {
      return NextResponse.json({ categories: portfolioFallback.videoCategories });
    }
    return NextResponse.json(
      { error: "Failed to load video categories", detail: String(e) },
      { status: 500 }
    );
  }
}
