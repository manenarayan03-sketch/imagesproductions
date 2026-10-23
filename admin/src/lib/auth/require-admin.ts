import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth-options";

export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return { ok: false as const, session: null };
  }
  return { ok: true as const, session };
}
