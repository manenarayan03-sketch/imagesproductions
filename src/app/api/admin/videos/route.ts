import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const videos = await db.video.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
  return NextResponse.json({ videos });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || !body.title || !body.videoUrl || !body.categoryId) {
    return NextResponse.json(
      { error: "title, videoUrl, categoryId required" },
      { status: 400 }
    );
  }
  const cat = await db.videoCategory.findUnique({
    where: { id: body.categoryId },
  });
  if (!cat) return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  const maxOrder = await db.video.count({ where: { categoryId: cat.id } });
  const video = await db.video.create({
    data: {
      title: String(body.title).slice(0, 200),
      description: body.description ? String(body.description) : null,
      videoUrl: String(body.videoUrl),
      thumbnailUrl: body.thumbnailUrl ? String(body.thumbnailUrl) : null,
      duration: body.duration ? String(body.duration) : null,
      categoryId: cat.id,
      order: typeof body.order === "number" ? body.order : maxOrder,
      published: !!body.published,
    },
  });
  return NextResponse.json({ video }, { status: 201 });
}
