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
  if (typeof body.description === "string") data.description = body.description;
  if (typeof body.icon === "string") data.icon = body.icon;
  if (typeof body.order === "number") data.order = body.order;
  if (typeof body.published === "boolean") data.published = body.published;
  const svc = await db.service.update({ where: { id }, data });
  return NextResponse.json({ service: svc });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await ctx.params;
  await db.service.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
