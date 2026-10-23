"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Images,
  FolderOpen,
  Clapperboard,
  ListVideo,
  Briefcase,
  UserRound,
  FileText,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/photo-categories", label: "Photo Categories", icon: FolderOpen },
  { href: "/admin/photos", label: "Photography", icon: Images },
  { href: "/admin/video-categories", label: "Video Categories", icon: FolderOpen },
  { href: "/admin/videos", label: "Films & Videos", icon: Clapperboard },
  { href: "/admin/services", label: "Services", icon: Briefcase },
  { href: "/admin/owner", label: "Owner Info", icon: UserRound },
  { href: "/admin/site-content", label: "Site Content", icon: FileText },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

function BrandLine() {
  return (
    <div className="px-1">
      <Link href="/admin" className="block">
        <div className="font-heading tracking-[0.2em] text-base">
          IMAGES <span className="text-amber-600">PRODUCTION</span>
        </div>
        <div className="text-[9px] tracking-[0.32em] uppercase text-muted-foreground mt-1">
          Studio Dashboard
        </div>
      </Link>
    </div>
  );
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-0.5">
      {NAV.map((item) => {
        const Icon = item.icon;
        const active =
          item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-primary/10 text-primary font-medium"
                : "text-foreground/70 hover:text-foreground hover:bg-accent"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminSidebar() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-sidebar h-screen sticky top-0">
        <div className="p-5 border-b border-border">
          <BrandLine />
        </div>
        <div className="flex-1 overflow-y-auto p-3 scrollbar-cinematic">
          <NavLinks />
        </div>
        <div className="p-3 border-t border-border space-y-1">
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-accent"
          >
            <ExternalLink className="h-4 w-4" /> View Site
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-accent"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 bg-background border-b border-border">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <div className="p-5 border-b border-border">
              <SheetClose asChild>
                <BrandLine />
              </SheetClose>
            </div>
            <div className="p-3">
              <NavLinks onNavigate={() => setOpen(false)} />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-3 border-t border-border space-y-1">
              <SheetClose asChild>
                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-accent"
                >
                  <ExternalLink className="h-4 w-4" /> View Site
                </Link>
              </SheetClose>
              <SheetClose asChild>
                <button
                  onClick={() => {
                    setOpen(false);
                    signOut({ callbackUrl: "/admin/login" });
                  }}
                  className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-accent"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
        <BrandLine />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/")}
        >
          <ExternalLink className="h-4 w-4 mr-1" /> Site
        </Button>
      </div>
    </>
  );
}
