import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const services = await db.service.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ services });
}

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || !body.title || !body.description) {
    return NextResponse.json(
      { error: "title and description required" },
      { status: 400 }
    );
  }
  const maxOrder = await db.service.count();
  const svc = await db.service.create({
    data: {
      title: String(body.title).slice(0, 200),
      description: String(body.description),
      icon: body.icon ? String(body.icon) : "camera",
      order: typeof body.order === "number" ? body.order : maxOrder,
      published: typeof body.published === "boolean" ? body.published : true,
    },
  });
  return NextResponse.json({ service: svc }, { status: 201 });
}
