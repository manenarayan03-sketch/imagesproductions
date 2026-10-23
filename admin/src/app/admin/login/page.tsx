"use client";

import * as React from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, Mail, ShieldAlert } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const { toast } = useToast();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [show, setShow] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      toast({
        title: "Sign in failed",
        description: "Check your email and password, then try again.",
        variant: "destructive",
      });
      return;
    }
    toast({ title: "Welcome back", description: "Redirecting to your dashboard…" });
    const callback = params.get("callbackUrl") || "/admin";
    router.push(callback);
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[radial-gradient(1100px_700px_at_12%_-10%,rgba(65,105,225,0.18),transparent_60%),radial-gradient(900px_600px_at_100%_10%,rgba(109,40,217,0.16),transparent_55%),#08080b]">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="font-heading tracking-[0.22em] text-cream text-xl sm:text-2xl">
            IMAGES <span className="text-gold">PRODUCTION</span>
          </div>
          <div className="mt-2 text-[10px] tracking-[0.32em] uppercase text-cream/55">
            Studio Dashboard
          </div>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl border border-gold/20 bg-[rgba(20,22,30,0.55)] backdrop-blur-xl p-7 space-y-5"
        >
          <h1 className="font-heading text-cream text-2xl text-center">
            Welcome Back
          </h1>
          <p className="text-cream/60 text-sm text-center -mt-3">
            Sign in to manage your portfolio.
          </p>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-cream/75 text-xs tracking-[0.18em] uppercase">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/60" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@imagesproduction.in"
                className="bg-ink/50 border-gold/20 text-cream placeholder:text-cream/40 pl-10 rounded-md"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-cream/75 text-xs tracking-[0.18em] uppercase">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gold/60" />
              <Input
                id="password"
                type={show ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="bg-ink/50 border-gold/20 text-cream placeholder:text-cream/40 pl-10 pr-10 rounded-md"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-cream/60 hover:text-gold"
                aria-label={show ? "Hide password" : "Show password"}
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gold text-ink hover:bg-gold/90 rounded-full font-heading tracking-[0.16em] text-xs uppercase"
          >
            {loading ? "Signing in…" : "Sign in"}
          </Button>

          <div className="rounded-md border border-amber-400/30 bg-amber-400/10 p-3 text-amber-200 text-xs flex gap-2">
            <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0 text-amber-300" />
            <div>
              <div className="font-medium text-amber-100">Default credentials</div>
              <div className="text-amber-200/85 mt-0.5">
                <code className="text-amber-100">admin@imagesproduction.in</code>{" "}
                /{" "}
                <code className="text-amber-100">ChangeMe!2024</code>
              </div>
              <div className="mt-1 text-amber-200/70">
                Change this password immediately under Settings → Change Password.
              </div>
            </div>
          </div>
        </form>

        <div className="mt-4 text-center text-cream/40 text-xs">
          IMAGES PRODUCTION — Frames Alive with Imagination
        </div>
      </div>
    </div>
  );
}
