import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";
import { slugify } from "@/lib/site-utils";

export async function PUT(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Bad body" }, { status: 400 });
  const data: any = {};
  if (typeof body.name === "string") {
    data.name = body.name.slice(0, 120);
    if (body.slug) data.slug = slugify(body.slug);
  }
  if (typeof body.description === "string") data.description = body.description || null;
  if (typeof body.order === "number") data.order = body.order;
  if (typeof body.published === "boolean") data.published = body.published;
  if (data.slug) {
    const clash = await db.photographyCategory.findFirst({
      where: { slug: data.slug, NOT: { id: id } },
    });
    if (clash) delete data.slug;
  }
  const cat = await db.photographyCategory.update({ where: { id }, data });
  return NextResponse.json({ category: cat });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  await db.photographyCategory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
