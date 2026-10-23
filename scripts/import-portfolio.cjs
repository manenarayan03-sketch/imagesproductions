const { PrismaClient } = require("@prisma/client");
const fs = require("node:fs/promises");
const path = require("node:path");
const { createHash } = require("node:crypto");
const { createReadStream } = require("node:fs");

const db = new PrismaClient();
const portfolioRoot = path.join(
  process.cwd(),
  "public",
  "uploads",
  "portfolio"
);

const photoCategories = [
  { folder: "candid", name: "Candid Photography" },
  { folder: "wedding-photography", name: "Traditional Wedding Photography" },
  { folder: "pre-wedding-photography", name: "Pre-Wedding Photography" },
  { folder: "baby-shower", name: "Baby Shower Photography" },
];

const videoCategories = [
  { slug: "cinematic-wedding-highlights", name: "Cinematic Wedding Highlights" },
  { slug: "pre-wedding-films", name: "Pre-Wedding Films" },
  { slug: "corporate-videos", name: "Corporate Videos" },
  { slug: "event-videos", name: "Event Videos" },
  { slug: "promotional-videos", name: "Promotional Videos" },
  { slug: "social-media-reels", name: "Social Media Reels" },
];

const additionalMedia = [
  {
    source: "Candid",
    destination: "candid",
    type: "photo",
    category: "Candid Photography",
  },
  {
    source: "Pre Wedding",
    destination: "pre-wedding-films",
    type: "video",
    category: "Pre-Wedding Films",
  },
  {
    source: "Cinematic Video",
    destination: "cinematic-wedding-highlights",
    type: "video",
    category: "Cinematic Wedding Highlights",
  },
  {
    source: "Corpa",
    destination: "corporate-promotional-films",
    type: "video",
    category: "Corporate Videos",
  },
  {
    source: "event",
    destination: "event-social-videos",
    type: "video",
    category: "Event Videos",
  },
];

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleFromFilename(filename) {
  return path
    .parse(filename)
    .name.replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function publicUrl(filePath) {
  const relativePath = filePath.replace(/^public[\\/]/, "");
  return `/${relativePath
    .split(path.sep)
    .map((segment) => encodeURIComponent(segment))
    .join("/")}`;
}

async function collectFiles(directory) {
  let entries;
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }

  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await collectFiles(entryPath)));
    else if (entry.isFile()) files.push(entryPath);
  }
  return files.sort((a, b) => a.localeCompare(b));
}

async function collectAdditionalMedia(directory) {
  let entries;
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch (error) {
    if (error.code === "ENOENT") return [];
    throw error;
  }

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(directory, entry.name))
    .sort((a, b) => a.localeCompare(b));
}

async function hashFile(filePath) {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filePath);
    stream.on("error", reject);
    stream.on("data", (chunk) => hash.update(chunk));
    stream.on("end", () => resolve(hash.digest("hex")));
  });
}

function getVideoCategory(filePath) {
  const filename = path.basename(filePath).toLowerCase();
  const parent = path.basename(path.dirname(filePath)).toLowerCase();
  if (parent === "pre-wedding-films") return "pre-wedding-films";
  if (/promotional|promo/.test(filename)) return "promotional-videos";
  if (/reel|images production/.test(filename)) return "social-media-reels";
  if (/event|birthday/.test(filename)) return "event-videos";
  if (parent === "corporate-promotional-films") return "corporate-videos";
  return "cinematic-wedding-highlights";
}

async function ensureCategory(model, name) {
  const slug = slugify(name);
  return model.upsert({
    where: { slug },
    update: { published: true },
    create: { slug, name, published: true },
  });
}

async function main() {
  let importedPhotos = 0;
  let importedVideos = 0;
  const photoCategoryByFolder = new Map();
  const videoCategoryBySlug = new Map();

  const photosWithFilesystemUrls = await db.photo.findMany({
    where: { imageUrl: { startsWith: "/public/uploads/" } },
    select: { id: true, imageUrl: true },
  });
  for (const photo of photosWithFilesystemUrls) {
    await db.photo.update({
      where: { id: photo.id },
      data: { imageUrl: photo.imageUrl.replace(/^\/public\//, "/") },
    });
  }

  const videosWithFilesystemUrls = await db.video.findMany({
    where: { videoUrl: { startsWith: "/public/uploads/" } },
    select: { id: true, videoUrl: true },
  });
  for (const video of videosWithFilesystemUrls) {
    await db.video.update({
      where: { id: video.id },
      data: { videoUrl: video.videoUrl.replace(/^\/public\//, "/") },
    });
  }

  for (const category of photoCategories) {
    photoCategoryByFolder.set(
      category.folder,
      await ensureCategory(db.photographyCategory, category.name)
    );
  }
  for (const category of videoCategories) {
    videoCategoryBySlug.set(
      category.slug,
      await ensureCategory(db.videoCategory, category.name)
    );
  }

  for (const { folder } of photoCategories) {
    const directory = path.join(portfolioRoot, folder);
    for (const filePath of await collectFiles(directory)) {
      if (!/\.(jpe?g|png|webp)$/i.test(filePath)) continue;
      const imageUrl = publicUrl(path.relative(process.cwd(), filePath));
      const existing = await db.photo.findFirst({ where: { imageUrl } });
      if (existing) continue;
      const category = photoCategoryByFolder.get(folder);
      const order = await db.photo.count({ where: { categoryId: category.id } });
      await db.photo.create({
        data: {
          title: titleFromFilename(path.basename(filePath)),
          imageUrl,
          categoryId: category.id,
          order,
          published: true,
        },
      });
      importedPhotos += 1;
    }
  }

  for (const { folder } of [
    { folder: "cinematic-wedding-highlights" },
    { folder: "pre-wedding-films" },
    { folder: "corporate-promotional-films" },
    { folder: "event-social-videos" },
  ]) {
    const directory = path.join(portfolioRoot, folder);
    for (const filePath of await collectFiles(directory)) {
      if (!/\.(mp4|webm)$/i.test(filePath)) continue;
      const videoUrl = publicUrl(path.relative(process.cwd(), filePath));
      const existing = await db.video.findFirst({ where: { videoUrl } });
      if (existing) continue;
      const category = videoCategoryBySlug.get(getVideoCategory(filePath));
      const order = await db.video.count({ where: { categoryId: category.id } });
      await db.video.create({
        data: {
          title: titleFromFilename(path.basename(filePath)),
          videoUrl,
          categoryId: category.id,
          order,
          published: true,
        },
      });
      importedVideos += 1;
    }
  }

  const ownerPhotoUrl = "/uploads/portfolio/owner/owner.jpeg";
  const owner = await db.ownerInfo.findFirst();
  if (owner && !owner.photoUrl) {
    await db.ownerInfo.update({
      where: { id: owner.id },
      data: { photoUrl: ownerPhotoUrl },
    });
  }

  const site = await db.siteContent.findFirst();
  if (site && !site.heroVideoUrl) {
    await db.siteContent.update({
      where: { id: site.id },
      data: { heroVideoUrl: "/uploads/videos/Wedding%20Films.mp4" },
    });
  }

  let importedAdditional = 0;
  const externalMediaRoot = process.env.IMAGES_PRODUCTION_MEDIA_ROOT;
  if (externalMediaRoot) {
    for (const asset of [
      { source: "owner/owner.jpeg", destination: "owner/owner.jpeg" },
      { source: "logo/logo.jpeg", destination: "brand/logo.jpeg" },
    ]) {
      const sourcePath = path.join(externalMediaRoot, asset.source);
      const destinationPath = path.join(portfolioRoot, asset.destination);
      await fs.mkdir(path.dirname(destinationPath), { recursive: true });
      try {
        await fs.copyFile(
          sourcePath,
          destinationPath,
          require("node:fs").constants.COPYFILE_EXCL
        );
      } catch (error) {
        if (error.code !== "EEXIST" && error.code !== "ENOENT") throw error;
      }
    }

    for (const item of additionalMedia) {
      const category =
        item.type === "photo"
          ? await ensureCategory(db.photographyCategory, item.category)
          : await ensureCategory(db.videoCategory, item.category);
      const sourceDirectory = path.join(externalMediaRoot, item.source);

      for (const sourcePath of await collectAdditionalMedia(sourceDirectory)) {
        const extension = path.extname(sourcePath);
        const isPhoto = item.type === "photo" && /\.(jpe?g|png|webp)$/i.test(extension);
        const isVideo = item.type === "video" && /\.(mp4|webm)$/i.test(extension);
        if (!isPhoto && !isVideo) continue;

        const destinationDirectory = path.join(portfolioRoot, item.destination);
        await fs.mkdir(destinationDirectory, { recursive: true });
        const destinationPath = path.join(destinationDirectory, path.basename(sourcePath));
        try {
          const sourceStat = await fs.stat(sourcePath);
          for (const existingPath of await collectFiles(portfolioRoot)) {
            if (path.extname(existingPath).toLowerCase() !== extension.toLowerCase()) continue;
            const existingStat = await fs.stat(existingPath);
            if (sourceStat.size !== existingStat.size) continue;
            const [sourceHash, existingHash] = await Promise.all([
              hashFile(sourcePath),
              hashFile(existingPath),
            ]);
            if (sourceHash === existingHash) {
              throw Object.assign(new Error("Identical media already imported"), {
                code: "DUPLICATE_CONTENT",
              });
            }
          }
          await fs.copyFile(sourcePath, destinationPath, require("node:fs").constants.COPYFILE_EXCL);
        } catch (error) {
          if (error.code === "DUPLICATE_CONTENT" || error.code === "EEXIST") continue;
          throw error;
        }

        const url = publicUrl(path.relative(process.cwd(), destinationPath));
        if (isPhoto) {
          const existing = await db.photo.findFirst({ where: { imageUrl: url } });
          if (!existing) {
            const order = await db.photo.count({ where: { categoryId: category.id } });
            await db.photo.create({
              data: {
                title: titleFromFilename(path.basename(sourcePath)),
                imageUrl: url,
                categoryId: category.id,
                order,
                published: true,
              },
            });
            importedPhotos += 1;
          }
        } else {
          const existing = await db.video.findFirst({ where: { videoUrl: url } });
          if (!existing) {
            const order = await db.video.count({ where: { categoryId: category.id } });
            await db.video.create({
              data: {
                title: titleFromFilename(path.basename(sourcePath)),
                videoUrl: url,
                categoryId: category.id,
                order,
                published: true,
              },
            });
            importedVideos += 1;
          }
        }
        importedAdditional += 1;
      }
    }
  }

  console.log(
    JSON.stringify({
      importedPhotos,
      importedVideos,
      importedAdditional,
      message: "Portfolio import complete. Existing matching media was left unchanged.",
    })
  );
}

main()
  .catch((error) => {
    console.error("Portfolio import failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });