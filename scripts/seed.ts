import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const OWNER_BIO = `Welcome to Images Production.

I am Narayan Maane, Founder and Creative Director of Images Production, based in Mulund West, Mumbai.

My focus is on capturing meaningful moments, creating compelling visual stories, and transforming raw footage into memorable cinematic experiences.

At Images Production, we offer photography, videography, cinematography, and professional video editing services, with an emphasis on creativity, attention to detail, and understanding every client's unique vision.

From personal celebrations and weddings to corporate projects and social media content, our goal is to bring every story to life through the power of visuals.

**IMAGES PRODUCTION — FRAMES ALIVE WITH IMAGINATION.**`;

const SERVICE_DESCRIPTIONS: Record<string, string> = {
  "Wedding Photography & Films":
    "Your wedding day is a constellation of once-in-a-lifetime moments — the stolen glance before the ceremony, the laughter that fills the mandap, the tears a father hides, the promise in a single intertwined hand. Our Wedding Photography & Films service is built to honour every one of them with intention and craft. We blend timeless portraiture, candid documentary coverage, and cinematic film direction to deliver a complete story of your celebration — not just isolated frames. From the haldi glow to the bidaai embrace, we work discreetly, anticipate emotion before it unfolds, and protect the rhythm of your day. Every album is colour-graded to a refined, editorial palette, and every film is scored, paced, and edited to feel like the cinema your story deserves. This is not posed, repetitive wedding coverage. This is your day, returned to you as a memory you can relive forever.",
  "Pre-Wedding & Engagement Shoots":
    "Pre-wedding and engagement shoots are where your story begins to be told — a chance to capture the easy chemistry, the inside jokes, and the quiet anticipation that lives between two people before the world arrives for the wedding. We design each session around who you actually are as a couple, not a borrowed Pinterest mood. Whether you want the heritage alleys of South Mumbai, the monsoon-kissed coastline of Marine Drive, a misty morning in Matheran, or a styled studio set with hand-crafted backdrops, we plan locations, wardrobe, lighting, and timing down to the hour. We guide you gently through poses so the moments never feel stiff, and we leave space for the unscripted in-between beats that turn out to be your favourite frames. You receive a gallery of editorial portraits and short cinematic reels ready for sharing, save-the-dates, and your wedding film intro.",
  "Cinematography & Filmmaking":
    "Cinematography is the difference between a recording and a memory. At Images Production, our Filmmaking practice treats every project — wedding, brand, event, or music — as a film in its own right, with a clear narrative spine, considered framing, controlled light, and a soundtrack that earns the image. We shoot on professional cinema cameras with prime glass, stabilised rigs, and aerial support where it adds value, then grade every frame to a colour script that reinforces the mood. Our direction style is observational and unobtrusive on event days, and collaborative and structured on scripted projects. From the storyboard to the final cut, you see the film take shape in stages, with revisions, sound design, and motion graphics handled in-house. The result is work that feels alive — that holds attention in the first three seconds and rewards a viewer who stays to the end credits.",
  "Professional Video Editing":
    "Great footage deserves a great edit. Our Professional Video Editing service exists to take raw material — yours or ours — and shape it into a final piece that is sharp, paced, and purposeful. We edit on industry-standard NLE timelines with proxy workflows for 4K and beyond, handle multi-cam sync, colour correction and grading, dialogue cleanup, sound design, music licensing, subtitle design, motion titles, and platform-ready exports for Instagram Reels, YouTube, and long-form. Whether you are a brand sitting on hours of footage, a couple with raw wedding files from another team, or a creator who needs a consistent publishing cadence, we become your post-production partner. You receive structured review links, clear revision rounds, and final masters delivered in the formats and aspect ratios each platform demands. Editing is where the story is actually written — and where we make sure every second earns its place.",
  "Event Coverage (Haldi, Mehendi, Sangeet, Baby Shower, Maternity)":
    "Indian celebrations carry a rhythm of their own — the turmeric-stained hands of haldi, the swirling patterns of mehendi, the dance floor that refuses to end at sangeet, the pastel anticipation of a baby shower, and the quiet glow of a maternity session. Our Event Coverage is designed to move through these occasions fluently, capturing the rituals, the relatives, and the unrehearsed moments in between. We arrive early to scout light and frame the empty stage before it fills, we cover the仪式 and the periphery alike, and we deliver a complete visual record in both stills and short cinematic recaps. Because these events are layered and emotionally dense, we work as a coordinated team so nothing is missed — the bride's mother applying haldi, the cousin choreographing the sangeet act, the father finally on the dance floor. You receive an album of memories and a highlight reel built for sharing with family across the world.",
  "Portrait & Candid Photography":
    "A great portrait is not about a perfect smile — it is about recognition. Our Portrait & Candid Photography service is for individuals, couples, families, and creators who want images that feel like themselves, not like stock photography. We work in natural light on location and in styled studio sets, guiding you into expressions that are relaxed, real, and occasionally surprising. Sessions can be framed around a milestone — a graduation, a maternity, an anniversary, a new beginning — or simply an instinct to be seen. We direct gently, talk you through the awkward first ten minutes, and create the conditions for the in-between moment to occur. Every frame is colour-graded to a consistent editorial look, and you receive a curated gallery of high-resolution images along with web-ready exports for portfolio, press, and social. These are portraits that age well — the kind you will still be glad to have in ten years.",
  "Corporate & Brand Films":
    "Brand films today are watched in three-second windows on a feed and in three-minute windows on a founder's pitch. Our Corporate & Brand Films service builds work that survives both. We start with strategy — understanding what the brand stands for, who it is talking to, and what action the film needs to drive — and then we move into concept, script, shot list, and production. We shoot founders, teams, products, facilities, and customer stories with the same cinema-grade approach we bring to weddings, then edit for clarity, pace, and emotional pull. Deliverables include a flagship film, platform-cut versions for Instagram, YouTube, and LinkedIn, and a library of shorter assets you can publish across a quarter. Whether you are launching a product, raising a round, or simply telling the world who you are, we make sure the film earns the audience it is shown to.",
  "Product & Social Media Content":
    "Selling a product today means making it visible, desirable, and consistent across every grid it appears on. Our Product & Social Media Content service combines studio product photography, lifestyle styling, motion content, and short-form editing into a single production pipeline built for high-frequency publishing. We light products to flatter material and finish — fabric, metal, glass, food, skin — and deliver both clean e-commerce cut-outs and styled lifestyle sets. For social, we shoot and cut vertical Reels, hooks, and story templates that match your brand's tone and posting cadence. You receive organised, named, and ready-to-publish assets each cycle, with the option to commission a longer campaign film for hero placement. This is content built to perform — measured by saves, shares, and conversions, not just likes — and produced with the same craft we bring to every frame at Images Production.",
};

const PHOTO_CATEGORIES = [
  "Wedding Photography",
  "Pre-Wedding Photography",
  "Engagement Photography",
  "Haldi, Mehendi & Sangeet",
  "Baby Shower Photography",
  "Maternity Photography",
  "Portrait Photography",
  "Event Photography",
  "Corporate Photography",
  "Product Photography",
  "Candid Photography",
  "Social Media Photography",
];

const VIDEO_CATEGORIES = [
  "Wedding Films",
  "Cinematic Wedding Highlights",
  "Pre-Wedding Films",
  "Event Films",
  "Corporate Videos",
  "Promotional Films",
  "Brand Films",
  "Music Videos",
  "Social Media Reels",
  "Behind-the-Scenes Videos",
];

const SERVICES: { title: string; icon: string; description: string }[] = [
  {
    title: "Wedding Photography & Films",
    icon: "camera",
    description: SERVICE_DESCRIPTIONS["Wedding Photography & Films"],
  },
  {
    title: "Pre-Wedding & Engagement Shoots",
    icon: "portrait",
    description: SERVICE_DESCRIPTIONS["Pre-Wedding & Engagement Shoots"],
  },
  {
    title: "Cinematography & Filmmaking",
    icon: "film",
    description: SERVICE_DESCRIPTIONS["Cinematography & Filmmaking"],
  },
  {
    title: "Professional Video Editing",
    icon: "edit",
    description: SERVICE_DESCRIPTIONS["Professional Video Editing"],
  },
  {
    title: "Event Coverage (Haldi, Mehendi, Sangeet, Baby Shower, Maternity)",
    icon: "event",
    description:
      SERVICE_DESCRIPTIONS[
        "Event Coverage (Haldi, Mehendi, Sangeet, Baby Shower, Maternity)"
      ],
  },
  {
    title: "Portrait & Candid Photography",
    icon: "portrait",
    description: SERVICE_DESCRIPTIONS["Portrait & Candid Photography"],
  },
  {
    title: "Corporate & Brand Films",
    icon: "corporate",
    description: SERVICE_DESCRIPTIONS["Corporate & Brand Films"],
  },
  {
    title: "Product & Social Media Content",
    icon: "product",
    description: SERVICE_DESCRIPTIONS["Product & Social Media Content"],
  },
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  console.log("🌱 Seeding database...");

  const adminEmail = process.env.ADMIN_EMAIL || "admin@imagesproduction.in";
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe!2024";
  if (
    process.env.NODE_ENV === "production" &&
    adminPassword === "ChangeMe!2024"
  ) {
    throw new Error("Set a unique ADMIN_PASSWORD before seeding production.");
  }

  // Admin user (only create if missing)
  const existingAdmin = await db.adminUser.findFirst({
    where: { email: adminEmail },
  });
  if (!existingAdmin) {
    const hash = bcrypt.hashSync(adminPassword, 10);
    await db.adminUser.create({
      data: {
        email: adminEmail,
        username: "admin",
        passwordHash: hash,
        name: "Narayan Maane",
        role: "admin",
      },
    });
    console.log(`✅ Admin user created for ${adminEmail}`);
  } else {
    console.log("ℹ️  Admin user already exists — skipping");
  }

  // OwnerInfo (upsert by single row)
  const owner = await db.ownerInfo.findFirst();
  if (!owner) {
    await db.ownerInfo.create({
      data: {
        name: "Narayan Maane",
        role: "Founder & Creative Director",
        bio: OWNER_BIO,
        phone: "+91 8433975695",
        whatsapp: "+91 8433975695",
        email: null,
        address:
          "Jalaram Niwas, Ganesh Gawade Road, Near Canara Bank, Mulund West",
        city: "Mumbai",
        state: "Maharashtra",
        pincode: "400080",
        country: "India",
        stats: JSON.stringify([
          { label: "Years of Passion", value: "5+" },
          { label: "Stories Told", value: "200+" },
          { label: "Frames Crafted", value: "10,000+" },
        ]),
        photoUrl: null,
      },
    });
    console.log("✅ OwnerInfo created");
  } else {
    console.log("ℹ️  OwnerInfo already exists — skipping");
  }

  // SiteContent (single row)
  const site = await db.siteContent.findFirst();
  if (!site) {
    await db.siteContent.create({
      data: {
        companyName: "IMAGES PRODUCTION",
        tagline: "Frames Alive with Imagination",
        heroHeadline: "IMAGES PRODUCTION",
        heroSubtext: "Photography • Videography • Video Editing",
        heroCtaPrimary: "VIEW OUR WORK",
        heroCtaSecondary: "CONTACT US",
        // Hero background video — leave empty by default to show the clean
        // cinematic dark background with a subtle royal-blue radial glow.
        // Valid examples when the owner is ready to set this:
        //   - YouTube:  https://www.youtube.com/watch?v=XXXXXXXXXXX
        //   - YouTube:  https://youtu.be/XXXXXXXXXXX
        //   - Vimeo:    https://vimeo.com/123456789
        //   - Direct:   https://example.com/hero.mp4  (or .webm / .mov / .ogg)
        // Direct MP4/WEBM URLs are recommended for best performance.
        heroVideoUrl: "/uploads/videos/Wedding%20Films.mp4",
        whatsappNumber: "+91 8433975695",
        email: null,
        instagram: "",
        youtube: "",
        vimeo: "",
        facebook: "",
      },
    });
    console.log("✅ SiteContent created");
  } else {
    if (!site.heroVideoUrl) {
      await db.siteContent.update({
        where: { id: site.id },
        data: { heroVideoUrl: "/uploads/videos/Wedding%20Films.mp4" },
      });
      console.log("✅ Existing SiteContent configured with the Wedding Films hero video");
    }
    console.log("ℹ️  SiteContent already exists — skipping");
  }

  // Photography categories
  for (let i = 0; i < PHOTO_CATEGORIES.length; i++) {
    const name = PHOTO_CATEGORIES[i];
    await db.photographyCategory.upsert({
      where: { slug: slugify(name) },
      update: { order: i, published: true, name },
      create: {
        name,
        slug: slugify(name),
        order: i,
        published: true,
      },
    });
  }
  console.log(`✅ ${PHOTO_CATEGORIES.length} photography categories seeded`);

  // Video categories
  for (let i = 0; i < VIDEO_CATEGORIES.length; i++) {
    const name = VIDEO_CATEGORIES[i];
    await db.videoCategory.upsert({
      where: { slug: slugify(name) },
      update: { order: i, published: true, name },
      create: { name, slug: slugify(name), order: i, published: true },
    });
  }
  console.log(`✅ ${VIDEO_CATEGORIES.length} video categories seeded`);

  // Services
  for (let i = 0; i < SERVICES.length; i++) {
    const s = SERVICES[i];
    const existing = await db.service.findFirst({ where: { title: s.title } });
    if (!existing) {
      await db.service.create({
        data: {
          title: s.title,
          description: s.description,
          icon: s.icon,
          order: i,
          published: true,
        },
      });
    } else {
      await db.service.update({
        where: { id: existing.id },
        data: { description: s.description, icon: s.icon, order: i, published: true },
      });
    }
  }
  console.log(`✅ ${SERVICES.length} services seeded`);

  console.log("🎉 Seeding complete.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
