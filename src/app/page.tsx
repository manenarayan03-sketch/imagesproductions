import { db } from "@/lib/db";
import { SiteHeader } from "@/components/site/header";
import { Hero } from "@/components/site/hero";
import { About } from "@/components/site/about";
import { Services } from "@/components/site/services";
import { Categories } from "@/components/site/categories";
import { Contact } from "@/components/site/contact";
import { Footer } from "@/components/site/footer";
import { WhatsAppFloat } from "@/components/site/whatsapp-float";
import portfolioFallback from "@/lib/portfolio-fallback.json";

export const dynamic = "force-dynamic";

// Default hero background video, served from /public.
const HERO_VIDEO_URL = "/videos/hero-wedding-films 3.mp4";

async function getInitialData() {
  try {
    const [ownerRow, siteRow] = await Promise.all([
      db.ownerInfo.findFirst(),
      db.siteContent.findFirst(),
    ]);
    let owner: any = null;
    if (ownerRow) {
      let stats: any[] = [];
      try {
        stats = JSON.parse(ownerRow.stats || "[]");
      } catch {
        stats = [];
      }
      owner = {
        id: ownerRow.id,
        name: ownerRow.name,
        role: ownerRow.role,
        bio: ownerRow.bio,
        phone: ownerRow.phone,
        whatsapp: ownerRow.whatsapp,
        address: ownerRow.address,
        city: ownerRow.city,
        state: ownerRow.state,
        pincode: ownerRow.pincode,
        country: ownerRow.country,
        stats,
        photoUrl:
          ownerRow.photoUrl?.startsWith("/uploads/")
            ? portfolioFallback.owner?.photoUrl ?? null
            : ownerRow.photoUrl,
      };
    }
    const site = siteRow ?? portfolioFallback.site ?? {
      companyName: "IMAGES PRODUCTION",
      tagline: "Frames Alive with Imagination",
      heroHeadline: "IMAGES PRODUCTION",
      heroSubtext: "Photography • Videography • Video Editing",
      heroCtaPrimary: "VIEW OUR WORK",
      heroCtaSecondary: "CONTACT US",
      heroVideoUrl: HERO_VIDEO_URL,
      whatsappNumber: "+91 8433975695",
      email: null,
      instagram: null,
      youtube: null,
      vimeo: null,
      facebook: null,
    };
    return { owner: owner ?? portfolioFallback.owner, site };
  } catch (e) {
    // Fallback to hardcoded defaults if DB not yet seeded
    return {
      owner: portfolioFallback.owner,
      site: portfolioFallback.site ?? {
        companyName: "IMAGES PRODUCTION",
        tagline: "Frames Alive with Imagination",
        heroHeadline: "IMAGES PRODUCTION",
        heroSubtext: "Photography • Videography • Video Editing",
        heroCtaPrimary: "VIEW OUR WORK",
        heroCtaSecondary: "CONTACT US",
        heroVideoUrl: HERO_VIDEO_URL,
        whatsappNumber: "+91 8433975695",
        email: null,
        instagram: null,
        youtube: null,
        vimeo: null,
        facebook: null,
      },
    };
  }
}

export default async function Home() {
  const { owner, site } = await getInitialData();
  const whatsapp = site.whatsappNumber || "+91 8433975695";

  return (
    <div className="min-h-screen flex flex-col bg-ink">
      <SiteHeader whatsapp={whatsapp} brandName={site.companyName} />
      <main className="flex-1">
        <Hero
          headline={site.heroHeadline}
          subtext={site.heroSubtext}
          tagline={site.tagline}
          primaryCta={site.heroCtaPrimary}
          secondaryCta={site.heroCtaSecondary}
          whatsapp={whatsapp}
          heroVideoUrl={
            typeof site.heroVideoUrl === "string" &&
            site.heroVideoUrl.trim() &&
            !site.heroVideoUrl.startsWith("/uploads/")
              ? site.heroVideoUrl
              : HERO_VIDEO_URL
          }
        />
        <About owner={owner} whatsapp={whatsapp} />
        <Services whatsapp={whatsapp} />
        <Categories whatsapp={whatsapp} />
        <Contact owner={owner} whatsapp={whatsapp} />
      </main>
      <Footer
        companyName={site.companyName}
        tagline={site.tagline}
        whatsapp={whatsapp}
        socials={{
          instagram: site.instagram,
          youtube: site.youtube,
          vimeo: site.vimeo,
          facebook: site.facebook,
        }}
      />
      <WhatsAppFloat
        phone={whatsapp}
        message="Hi Images Production, I'd like to discuss a project."
      />
    </div>
  );
}
