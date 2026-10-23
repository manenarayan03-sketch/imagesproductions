import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const owner = await db.ownerInfo.findFirst();
  if (!owner) return NextResponse.json({ owner: null });
  let stats: any[] = [];
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
      email: owner.email,
      address: owner.address,
      city: owner.city,
      state: owner.state,
      pincode: owner.pincode,
      country: owner.country,
      stats,
      photoUrl: owner.photoUrl,
    },
  });
}

export async function PUT(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad body" }, { status: 400 });

  const data: any = {};
  for (const k of [
    "name",
    "role",
    "bio",
    "phone",
    "whatsapp",
    "address",
    "city",
    "state",
    "pincode",
    "country",
  ]) {
    if (typeof body[k] === "string") data[k] = body[k];
  }
  if (typeof body.email === "string") data.email = body.email || null;
  if (typeof body.photoUrl === "string") data.photoUrl = body.photoUrl || null;
  if (Array.isArray(body.stats)) {
    data.stats = JSON.stringify(
      body.stats
        .filter((s: any) => s && (s.label || s.value))
        .map((s: any) => ({ label: String(s.label || ""), value: String(s.value || "") }))
    );
  }

  const existing = await db.ownerInfo.findFirst();
  let owner;
  if (existing) {
    owner = await db.ownerInfo.update({ where: { id: existing.id }, data });
  } else {
    owner = await db.ownerInfo.create({
      data: {
        name: data.name || "Narayan Maane",
        role: data.role || "Founder & Creative Director",
        bio: data.bio || "",
        phone: data.phone || "",
        whatsapp: data.whatsapp || "",
        email: data.email ?? null,
        address: data.address || "",
        city: data.city || "Mumbai",
        state: data.state || "Maharashtra",
        pincode: data.pincode || "400080",
        country: data.country || "India",
        stats: data.stats || "[]",
        photoUrl: data.photoUrl ?? null,
      },
    });
  }
  return NextResponse.json({ owner });
}
