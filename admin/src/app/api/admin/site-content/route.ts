import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const site = await db.siteContent.findFirst();
  return NextResponse.json({ site });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad body" }, { status: 400 });

  const data: any = {};
  for (const k of [
    "companyName",
    "tagline",
    "heroHeadline",
    "heroSubtext",
    "heroCtaPrimary",
    "heroCtaSecondary",
    "whatsappNumber",
  ]) {
    if (typeof body[k] === "string") data[k] = body[k];
  }
  // heroVideoUrl is optional — store null if empty string or not a string.
  if (typeof body.heroVideoUrl === "string") {
    data.heroVideoUrl = body.heroVideoUrl.trim() ? body.heroVideoUrl.trim() : null;
  }
  for (const k of ["email", "instagram", "youtube", "vimeo", "facebook"]) {
    if (typeof body[k] === "string") data[k] = body[k] || null;
  }

  const existing = await db.siteContent.findFirst();
  let site;
  if (existing) {
    site = await db.siteContent.update({ where: { id: existing.id }, data });
  } else {
    site = await db.siteContent.create({
      data: {
        companyName: data.companyName || "IMAGES PRODUCTION",
        tagline: data.tagline || "Frames Alive with Imagination",
        heroHeadline: data.heroHeadline || "IMAGES PRODUCTION",
        heroSubtext:
          data.heroSubtext || "Photography • Videography • Video Editing",
        heroCtaPrimary: data.heroCtaPrimary || "VIEW OUR WORK",
        heroCtaSecondary: data.heroCtaSecondary || "CONTACT US",
        heroVideoUrl: data.heroVideoUrl ?? null,
        whatsappNumber: data.whatsappNumber || "+91 8433975695",
        email: data.email ?? null,
        instagram: data.instagram ?? null,
        youtube: data.youtube ?? null,
        vimeo: data.vimeo ?? null,
        facebook: data.facebook ?? null,
      },
    });
  }
  return NextResponse.json({ site });
}
