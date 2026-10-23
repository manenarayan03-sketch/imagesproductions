import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const photos = await db.photo.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    include: { category: { select: { id: true, name: true, slug: true } } },
  });
  return NextResponse.json({ photos });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || !body.title || !body.imageUrl || !body.categoryId) {
    return NextResponse.json(
      { error: "title, imageUrl, categoryId required" },
      { status: 400 }
    );
  }
  const cat = await db.photographyCategory.findUnique({
    where: { id: body.categoryId },
  });
  if (!cat) return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  const maxOrder = await db.photo.count({ where: { categoryId: cat.id } });
  const photo = await db.photo.create({
    data: {
      title: String(body.title).slice(0, 200),
      description: body.description ? String(body.description) : null,
      imageUrl: String(body.imageUrl),
      categoryId: cat.id,
      order: typeof body.order === "number" ? body.order : maxOrder,
      published: !!body.published,
    },
  });
  return NextResponse.json({ photo }, { status: 201 });
}
