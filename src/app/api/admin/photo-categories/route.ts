import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { slugify } from "@/lib/site-utils";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const cats = await db.photographyCategory.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
    include: { _count: { select: { photos: true } } },
  });
  return NextResponse.json({ categories: cats });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || !body.name) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }
  let slug = body.slug ? slugify(body.slug) : slugify(body.name);
  const exists = await db.photographyCategory.findUnique({ where: { slug } });
  if (exists) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }
  const maxOrder = await db.photographyCategory.count();
  const cat = await db.photographyCategory.create({
    data: {
      name: String(body.name).slice(0, 120),
      slug,
      description: body.description ? String(body.description) : null,
      order: typeof body.order === "number" ? body.order : maxOrder,
      published: !!body.published,
    },
  });
  return NextResponse.json({ category: cat }, { status: 201 });
}
