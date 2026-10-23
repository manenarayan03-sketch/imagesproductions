import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth/auth-options";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/require-admin";

export async function POST(req: NextRequest) {
  const auth = await requireAdmin();
  if (!auth.ok) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.currentPassword || !body?.newPassword) {
    return NextResponse.json(
      { error: "currentPassword and newPassword are required" },
      { status: 400 }
    );
  }
  if (body.newPassword.length < 8) {
    return NextResponse.json(
      { error: "New password must be at least 8 characters" },
      { status: 400 }
    );
  }

  const session = await getServerSession(authOptions);
  const user = await db.adminUser.findUnique({
    where: { email: session!.user.email },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  const ok = bcrypt.compareSync(body.currentPassword, user.passwordHash);
  if (!ok) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 400 }
    );
  }
  const newHash = bcrypt.hashSync(body.newPassword, 10);
  await db.adminUser.update({
    where: { id: user.id },
    data: { passwordHash: newHash },
  });
  return NextResponse.json({ ok: true });
}
