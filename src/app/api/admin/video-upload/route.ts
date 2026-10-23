import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { createWriteStream } from "fs";
import { Readable } from "stream";
import { pipeline } from "stream/promises";
import { randomUUID } from "crypto";
import { requireAdmin } from "@/lib/auth/require-admin";

export const runtime = "nodejs";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "videos");
const MAX_BYTES = 250 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(["mp4", "webm"]);

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No video file provided" }, { status: 400 });
    }

    const extension = path.extname(file.name).slice(1).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return NextResponse.json(
        { error: "Only MP4 and WebM videos are supported" },
        { status: 415 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Video too large. Maximum upload size is 250MB." },
        { status: 413 }
      );
    }

    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    const filename = `${randomUUID()}.${extension}`;
    const filePath = path.join(UPLOAD_DIR, filename);
    try {
      await pipeline(
        Readable.fromWeb(file.stream() as import("stream/web").ReadableStream),
        createWriteStream(filePath, { flags: "wx" })
      );
    } catch (error) {
      await fs.rm(filePath, { force: true });
      throw error;
    }

    return NextResponse.json({
      url: `/uploads/videos/${filename}`,
      filename,
      size: file.size,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Video upload failed", detail: String(error) },
      { status: 500 }
    );
  }
}