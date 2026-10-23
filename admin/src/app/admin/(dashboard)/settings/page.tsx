"use client";

import * as React from "react";
import { Lock, Loader2, KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAdminFetch, AdminPageHeader } from "@/components/admin/hooks";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const { call } = useAdminFetch();
  const { toast } = useToast();
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== confirm) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must be the same.",
        variant: "destructive",
      });
      return;
    }
    if (next.length < 8) {
      toast({
        title: "Password too short",
        description: "New password must be at least 8 characters.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    const res = await call(
      "/api/admin/auth/change-password",
      {
        method: "POST",
        body: JSON.stringify({ currentPassword: current, newPassword: next }),
      },
      { successMessage: "Password changed. Please sign in again on next visit." }
    );
    setSaving(false);
    if (res.ok) {
      setCurrent("");
      setNext("");
      setConfirm("");
    }
  };

  return (
    <div>
      <AdminPageHeader
        title="Settings"
        description="Security & environment overview."
      />

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="font-heading text-lg flex items-center gap-2">
            <KeyRound className="h-5 w-5" /> Change password
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Update the admin account password. Use a strong, unique password.
          </p>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <div>
              <Label htmlFor="cur">Current password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="cur"
                  type="password"
                  value={current}
                  onChange={(e) => setCurrent(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="new">New password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="new"
                  type="password"
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="conf">Confirm new password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="conf"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="pl-10"
                />
              </div>
            </div>
            <Button type="submit" disabled={saving} className="rounded-full">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Update password
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="font-heading text-lg flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" /> Security & environment
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Production-readiness checklist.
          </p>
          <ul className="mt-5 space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
              <div>
                <div className="font-medium">Default credentials shown on /admin/login</div>
                <div className="text-muted-foreground text-xs">
                  admin@imagesproduction.in · ChangeMe!2024
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-amber-500" />
              <div>
                <div className="font-medium">Change the default password</div>
                <div className="text-muted-foreground text-xs">
                  Use the form on this page before going live.
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-sky-500" />
              <div>
                <div className="font-medium">Supabase config stored in .env.local</div>
                <div className="text-muted-foreground text-xs">
                  Reserved for future production storage. The local sandbox uses Prisma + SQLite.
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-violet-500" />
              <div>
                <div className="font-medium">NextAuth session</div>
                <div className="text-muted-foreground text-xs">
                  JWT-based, 7-day expiry. Sign out from the sidebar to clear it.
                </div>
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-rose-500" />
              <div>
                <div className="font-medium">Image uploads</div>
                <div className="text-muted-foreground text-xs">
                  Saved locally to /public/uploads. Move to Supabase Storage in production.
                </div>
              </div>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
