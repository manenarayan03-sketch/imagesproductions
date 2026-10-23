/* One-off migration script — update the existing SiteContent row with the new
 * IMAGES PRODUCTION hero copy (Task ID 5). Run once after the schema push.
 *
 *   bun run scripts/update-hero-content.ts
 *
 * This script is IDEMPOTENT — safe to re-run; it always sets the same values.
 */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
  console.log("Updating SiteContent hero copy (Task 5)…");

  const existing = await db.siteContent.findFirst();
  if (!existing) {
    console.log("No SiteContent row found — nothing to update. Run scripts/seed.ts first.");
    return;
  }

  await db.siteContent.update({
    where: { id: existing.id },
    data: {
      // Tagline uses mixed case now — Frames Alive with Imagination
      tagline: "Frames Alive with Imagination",
      // Headline is the brand name in Marcellus
      heroHeadline: "IMAGES PRODUCTION",
      // Sub-text uses • bullet separators (not commas or pipes)
      heroSubtext: "Photography • Videography • Video Editing",
      // Primary CTA scrolls to #categories
      heroCtaPrimary: "VIEW OUR WORK",
      // Secondary CTA scrolls to #contact
      heroCtaSecondary: "CONTACT US",
      // heroVideoUrl stays null by default — clean dark cinematic background.
      heroVideoUrl: existing.heroVideoUrl ?? null,
    },
  });

  console.log("✅ SiteContent hero copy updated.");
  console.log("   tagline          = Frames Alive with Imagination");
  console.log("   heroHeadline     = IMAGES PRODUCTION");
  console.log("   heroSubtext      = Photography • Videography • Video Editing");
  console.log("   heroCtaPrimary   = VIEW OUR WORK");
  console.log("   heroCtaSecondary = CONTACT US");
}

main()
  .catch((e) => {
    console.error("❌ Update failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
