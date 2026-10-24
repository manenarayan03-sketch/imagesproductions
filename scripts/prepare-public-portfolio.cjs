/* eslint @typescript-eslint/no-require-imports: "off" */
const { PrismaClient } = require("@prisma/client");
const sharp = require("sharp");
const fs = require("node:fs/promises");
const { existsSync } = require("node:fs");
const path = require("node:path");

const db = new PrismaClient();
const outputRoot = path.join(process.cwd(), "public", "portfolio-media");
const manifestPath = path.join(process.cwd(), "src", "lib", "portfolio-fallback.json");
let optimizedBytes = 0;
const posterPhotoCategories = {
  "cinematic-wedding-highlights": "traditional-wedding-photography",
  "pre-wedding-films": "pre-wedding-photography",
  "corporate-videos": "candid-photography",
  "event-videos": "baby-shower-photography",
  "social-media-reels": "candid-photography",
};

function optimizedImageUrl(categorySlug, photoId) {
  return `/portfolio-media/${categorySlug}/${photoId}.webp`;
}

async function optimizePhoto(photo) {
  const sourceRelativePath = decodeURIComponent(photo.imageUrl.replace(/^\/+/, ""));
  const sourcePath = path.join(process.cwd(), "public", sourceRelativePath);
  const destination = path.join(outputRoot, photo.category.slug, `${photo.id}.webp`);
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await sharp(sourcePath)
    .rotate()
    .resize({ width: 2200, height: 2200, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 78, effort: 4 })
    .toFile(destination);
  optimizedBytes += (await fs.stat(destination)).size;
  return optimizedImageUrl(photo.category.slug, photo.id);
}

async function main() {
  const ownerSourcePath = path.join(process.cwd(), "public", "uploads", "portfolio", "owner", "owner.jpeg");
  if (!process.env.DATABASE_URL || !existsSync(ownerSourcePath)) {
    console.log("Using the checked-in portfolio manifest and optimized media; no local portfolio database and source media were found.");
    return;
  }

  const [photoCategories, videoCategories, photos, videos, owner, site] = await Promise.all([
    db.photographyCategory.findMany({
      where: { published: true, photos: { some: { published: true } } },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        order: true,
        photos: {
          where: { published: true },
          orderBy: [{ order: "asc" }, { createdAt: "desc" }],
          select: { id: true, title: true, imageUrl: true, order: true, description: true },
        },
      },
    }),
    db.videoCategory.findMany({
      where: { published: true, videos: { some: { published: true } } },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        order: true,
        videos: {
          where: { published: true },
          orderBy: [{ order: "asc" }, { createdAt: "desc" }],
          select: {
            id: true,
            title: true,
            description: true,
            videoUrl: true,
            thumbnailUrl: true,
            duration: true,
            order: true,
          },
        },
      },
    }),
    db.photo.findMany({
      where: { published: true, category: { published: true } },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        categoryId: true,
        order: true,
        category: { select: { id: true, name: true, slug: true } },
      },
    }),
    db.video.findMany({
      where: { published: true, category: { published: true } },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
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
    }),
    db.ownerInfo.findFirst({
      select: {
        id: true,
        name: true,
        role: true,
        bio: true,
        phone: true,
        whatsapp: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        country: true,
        stats: true,
        photoUrl: true,
      },
    }),
    db.siteContent.findFirst({
      select: {
        companyName: true,
        tagline: true,
        heroHeadline: true,
        heroSubtext: true,
        heroCtaPrimary: true,
        heroCtaSecondary: true,
        heroVideoUrl: true,
        whatsappNumber: true,
        instagram: true,
        youtube: true,
        vimeo: true,
        facebook: true,
      },
    }),
  ]);

  const imageUrls = new Map();
  let completed = 0;
  for (const photo of photos) {
    imageUrls.set(photo.id, await optimizePhoto(photo));
    completed += 1;
    console.log(`Optimized ${completed}/${photos.length}: ${photo.title}`);
  }

  const staticPhotos = photos.map((photo) => ({
    ...photo,
    imageUrl: imageUrls.get(photo.id),
  }));
  const photoCategoryBySlug = new Map(photoCategories.map((category) => [category.slug, category]));
  const staticPhotoCategories = photoCategories.map((category) => {
    const categoryPhotos = staticPhotos.filter((photo) => photo.categoryId === category.id);
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      order: category.order,
      _count: { photos: categoryPhotos.length },
      photos: categoryPhotos.slice(0, 1).map(({ id, title, imageUrl }) => ({ id, title, imageUrl })),
    };
  });
  const staticVideos = videos.map((video) => {
    const photoCategorySlug = posterPhotoCategories[video.category.slug];
    const posterPhoto = photoCategories.find((category) => category.slug === photoCategorySlug)?.photos[0];
    const posterUrl = posterPhoto ? imageUrls.get(posterPhoto.id) : null;
    return {
      ...video,
      videoUrl: video.videoUrl.startsWith("/uploads/") ? null : video.videoUrl,
      thumbnailUrl: posterUrl || video.thumbnailUrl,
    };
  });
  const staticVideoCategories = videoCategories.map((category) => {
    const categoryVideos = staticVideos.filter((video) => video.categoryId === category.id);
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      order: category.order,
      _count: { videos: categoryVideos.length },
      videos: categoryVideos.slice(0, 1).map(({ id, title, videoUrl, thumbnailUrl }) => ({
        id,
        title,
        videoUrl,
        thumbnailUrl,
      })),
    };
  });
  const cleanOwner = owner
    ? {
        ...owner,
        photoUrl: owner.photoUrl?.startsWith("/uploads/")
          ? "/portfolio-media/owner.webp"
          : owner.photoUrl,
      }
    : null;
  const cleanSite = site
    ? {
        ...site,
        heroVideoUrl: site.heroVideoUrl?.startsWith("/uploads/") ? null : site.heroVideoUrl,
      }
    : null;
  const manifest = {
    photoCategories: staticPhotoCategories,
    videoCategories: staticVideoCategories,
    photos: staticPhotos,
    videos: staticVideos,
    owner: cleanOwner,
    site: cleanSite,
    generatedAt: new Date().toISOString(),
  };

  const ownerSource = ownerSourcePath;
  const ownerOutput = path.join(outputRoot, "owner.webp");
  await fs.mkdir(outputRoot, { recursive: true });
  await sharp(ownerSource).rotate().resize({ width: 1400, height: 1750, fit: "inside", withoutEnlargement: true }).webp({ quality: 82, effort: 4 }).toFile(ownerOutput);
  optimizedBytes += (await fs.stat(ownerOutput)).size;
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(JSON.stringify({
    optimizedPhotos: staticPhotos.length,
    categories: staticPhotoCategories.length + staticVideoCategories.length,
    videosInManifest: staticVideos.length,
    optimizedMediaMegabytes: Number((optimizedBytes / 1024 / 1024).toFixed(1)),
    manifest: path.relative(process.cwd(), manifestPath),
    ownerPhoto: "/portfolio-media/owner.webp",
  }, null, 2));
}

main()
  .catch((error) => {
    console.error("Failed to prepare public portfolio media:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
