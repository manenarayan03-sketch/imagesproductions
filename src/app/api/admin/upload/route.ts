import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { requireAdmin } from "@/lib/auth/require-admin";
import { randomUUID } from "crypto";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_BYTES = 8 * 1024 * 1024; // 8MB

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: "Only jpeg/png/webp files are allowed" },
        { status: 415 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "File too large. Max 8MB." },
        { status: 413 }
      );
    }
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
    const id = randomUUID();
    const filename = `${id}.${safeExt}`;
    const fp = path.join(UPLOAD_DIR, filename);
    const buf = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(fp, buf);
    return NextResponse.json({
      url: `/uploads/${filename}`,
      filename,
      size: buf.length,
    });
  } catch (e) {
    return NextResponse.json(
      { error: "Upload failed", detail: String(e) },
      { status: 500 }
    );
  }
}
