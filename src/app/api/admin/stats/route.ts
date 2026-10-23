import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const [
    photoCategories,
    videoCategories,
    photos,
    videos,
    services,
    admins,
    owner,
    site,
  ] = await Promise.all([
    db.photographyCategory.count(),
    db.videoCategory.count(),
    db.photo.count(),
    db.video.count(),
    db.service.count(),
    db.adminUser.count(),
    db.ownerInfo.findFirst(),
    db.siteContent.findFirst(),
  ]);

  const photosPublished = await db.photo.count({ where: { published: true } });
  const photosHidden = photos - photosPublished;
  const videosPublished = await db.video.count({ where: { published: true } });
  const videosHidden = videos - videosPublished;
  const catsPublishedPhoto = await db.photographyCategory.count({
    where: { published: true },
  });
  const catsPublishedVideo = await db.videoCategory.count({
    where: { published: true },
  });

  return NextResponse.json({
    stats: {
      photoCategories,
      videoCategories,
      photos,
      videos,
      services,
      admins,
      photosPublished,
      photosHidden,
      videosPublished,
      videosHidden,
      catsPublishedPhoto,
      catsPublishedVideo,
    },
    hasOwner: !!owner,
    hasSiteContent: !!site,
  });
}
