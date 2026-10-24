import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import portfolioFallback from "@/lib/portfolio-fallback.json";

export async function GET() {
  try {
    const owner = await db.ownerInfo.findFirst();
    if (!owner) {
      return NextResponse.json({ owner: portfolioFallback.owner });
    }
    let stats: { label: string; value: string }[] = [];
    try {
      stats = JSON.parse(owner.stats || "[]");
    } catch {
      stats = [];
    }
    return NextResponse.json({
      owner: {
        id: owner.id,
        name: owner.name,
        role: owner.role,
        bio: owner.bio,
        phone: owner.phone,
        whatsapp: owner.whatsapp,
        address: owner.address,
        city: owner.city,
        state: owner.state,
        pincode: owner.pincode,
        country: owner.country,
        stats,
        photoUrl:
          owner.photoUrl?.startsWith("/uploads/")
            ? portfolioFallback.owner?.photoUrl ?? null
            : owner.photoUrl,
      },
    });
  } catch (e) {
    return NextResponse.json({ owner: portfolioFallback.owner });
  }
}
