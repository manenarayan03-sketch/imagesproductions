import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import portfolioFallback from "@/lib/portfolio-fallback.json";
import portfolioVideoUrls from "@/lib/portfolio-video-urls";

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

    const videos = await db.video.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take,
      select: {
        id: true,
        title: true,
        description: true,
        videoUrl: true,
        thumbnailUrl: true,
        duration: true,
        categoryId: true,
        order: true,
        category: { select: { id: true, name: true, slug: true } },
      },
    });
    return NextResponse.json({
      videos: videos.map((video) => {
        const fallbackVideo = portfolioFallback.videos.find((item) => item.id === video.id);
        return {
          ...video,
          videoUrl:
            portfolioVideoUrls[video.id] ??
            (video.videoUrl.startsWith("/uploads/") ? null : video.videoUrl),
          thumbnailUrl: fallbackVideo?.thumbnailUrl ?? video.thumbnailUrl,
        };
      }),
    });
  } catch (e) {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const limitRaw = searchParams.get("limit");
    const take =
      limitRaw && !Number.isNaN(Number(limitRaw))
        ? Math.max(1, Math.min(200, Number(limitRaw)))
        : undefined;
    const videos = portfolioFallback.videos.filter(
      (video) => !categoryId || video.categoryId === categoryId
    );
    return NextResponse.json({
      videos: (take ? videos.slice(0, take) : videos).map((video) => ({
        ...video,
        videoUrl: portfolioVideoUrls[video.id] ?? video.videoUrl,
      })),
    });
  }
}
