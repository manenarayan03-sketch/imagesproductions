import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const services = await db.service.findMany({
      where: { published: true },
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        title: true,
        description: true,
        icon: true,
        order: true,
      },
    });
    return NextResponse.json({ services });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to load services", detail: String(e) },
      { status: 500 }
    );
  }
}
