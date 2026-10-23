/**
 * One-off script (Task ID 6) — remove the photo and video categories the owner
 * asked to take out of the public portfolio. Also updates the seed script so
 * future fresh installs don't bring them back.
 *
 * Photo categories removed:
 *   - Engagement Photography
 *   - Haldi, Mehendi & Sangeet
 *   - Maternity Photography
 *   - Portrait Photography
 *   - Event Photography
 *   - Corporate Photography
 *   - Product Photography
 *   - Social Media Photography
 *
 * Video categories removed:
 *   - Promotional Films
 *   - Music Videos
 *   - Social Media Reels
 *   - Behind-the-Scenes Videos
 *
 * Run with: bun run scripts/remove-categories.ts
 *
 * Note: Prisma cascades Photo / Video records on category delete (per schema).
 * There are currently no published photos or videos attached to these
 * categories, so the cascade is a no-op in practice.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const PHOTO_CATEGORIES_TO_REMOVE = [
  "Engagement Photography",
  "Haldi, Mehendi & Sangeet",
  "Maternity Photography",
  "Portrait Photography",
  "Event Photography",
  "Corporate Photography",
  "Product Photography",
  "Social Media Photography",
];

const VIDEO_CATEGORIES_TO_REMOVE = [
  "Promotional Films",
  "Music Videos",
  "Social Media Reels",
  "Behind-the-Scenes Videos",
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  console.log("Removing curated categories from the live database...");

  const photoSlugs = PHOTO_CATEGORIES_TO_REMOVE.map(slugify);
  const videoSlugs = VIDEO_CATEGORIES_TO_REMOVE.map(slugify);

  // Delete photo categories (cascade-deletes their Photo rows)
  const deletedPhotoCats = await db.photographyCategory.deleteMany({
    where: { slug: { in: photoSlugs } },
  });
  console.log(
    `✅ Removed ${deletedPhotoCats.count} photography categories (and their photos via cascade)`
  );

  // Delete video categories (cascade-deletes their Video rows)
  const deletedVideoCats = await db.videoCategory.deleteMany({
    where: { slug: { in: videoSlugs } },
  });
  console.log(
    `✅ Removed ${deletedVideoCats.count} video categories (and their videos via cascade)`
  );

  // Show what remains
  const remainingPhotoCats = await db.photographyCategory.findMany({
    orderBy: { order: "asc" },
    select: { name: true, slug: true, order: true, published: true },
  });
  console.log(`\n📸 Remaining photography categories (${remainingPhotoCats.length}):`);
  for (const c of remainingPhotoCats) {
    console.log(`   ${c.order + 1}. ${c.name} (published: ${c.published})`);
  }

  const remainingVideoCats = await db.videoCategory.findMany({
    orderBy: { order: "asc" },
    select: { name: true, slug: true, order: true, published: true },
  });
  console.log(`\n🎬 Remaining video categories (${remainingVideoCats.length}):`);
  for (const c of remainingVideoCats) {
    console.log(`   ${c.order + 1}. ${c.name} (published: ${c.published})`);
  }
}

main()
  .then(() => {
    console.log("\n🎉 Removal complete.");
  })
  .catch((e) => {
    console.error("❌ Removal failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
