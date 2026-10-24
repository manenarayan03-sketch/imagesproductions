import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import portfolioFallback from "@/lib/portfolio-fallback.json";
import portfolioVideoUrls from "@/lib/portfolio-video-urls";

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
        videos: (() => {
          const preparedVideos = category.videos.map((video) => {
            const fallbackVideo = portfolioFallback.videos.find((item) => item.id === video.id);
            return {
              ...video,
              videoUrl:
                portfolioVideoUrls[video.id] ??
                (video.videoUrl.startsWith("/uploads/") ? null : video.videoUrl),
              thumbnailUrl: fallbackVideo?.thumbnailUrl ?? video.thumbnailUrl,
            };
          });
          const featured = preparedVideos.find((video) => video.videoUrl) ?? preparedVideos[0];
          return featured ? [featured] : [];
        })(),
      })),
    });
  } catch (e) {
    if (portfolioFallback.videoCategories.length > 0) {
      return NextResponse.json({
        categories: portfolioFallback.videoCategories.map((category) => ({
          ...category,
          videos: (() => {
            const preparedVideos = portfolioFallback.videos
              .filter((video) => video.categoryId === category.id)
              .map((video) => ({
                ...video,
                videoUrl: portfolioVideoUrls[video.id] ?? video.videoUrl,
              }));
            const featured = preparedVideos.find((video) => video.videoUrl) ?? preparedVideos[0];
            return featured ? [featured] : category.videos;
          })(),
        })),
      });
    }
    return NextResponse.json(
      { error: "Failed to load video categories", detail: String(e) },
      { status: 500 }
    );
  }
}
