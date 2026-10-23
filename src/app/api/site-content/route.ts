import { NextResponse } from "next/server";
import { db } from "@/lib/db";

// Hero copy defaults for IMAGES PRODUCTION (Task ID 5).
const FALLBACK = {
  companyName: "IMAGES PRODUCTION",
  tagline: "Frames Alive with Imagination",
  heroHeadline: "IMAGES PRODUCTION",
  heroSubtext: "Photography • Videography • Video Editing",
  heroCtaPrimary: "VIEW OUR WORK",
  heroCtaSecondary: "CONTACT US",
  heroVideoUrl: null,
  whatsappNumber: "+91 8433975695",
  email: null,
  instagram: "",
  youtube: "",
  vimeo: "",
  facebook: "",
};

export async function GET() {
  try {
    const site = await db.siteContent.findFirst();
    if (!site) {
      return NextResponse.json({ site: FALLBACK });
    }
    return NextResponse.json({ site });
  } catch (e) {
    return NextResponse.json({ site: FALLBACK, error: String(e) }, { status: 200 });
  }
}
