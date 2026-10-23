import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";

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
  if (typeof body.title === "string") data.title = body.title.slice(0, 200);
  if (typeof body.description === "string") data.description = body.description || null;
  if (typeof body.videoUrl === "string") data.videoUrl = body.videoUrl;
  if (typeof body.thumbnailUrl === "string") data.thumbnailUrl = body.thumbnailUrl || null;
  if (typeof body.duration === "string") data.duration = body.duration || null;
  if (typeof body.categoryId === "string") data.categoryId = body.categoryId;
  if (typeof body.order === "number") data.order = body.order;
  if (typeof body.published === "boolean") data.published = body.published;
  const video = await db.video.update({ where: { id }, data });
  return NextResponse.json({ video });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  await db.video.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
