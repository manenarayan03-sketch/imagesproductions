"use client";

import * as React from "react";
import Link from "next/link";
import {
  Image as ImageIcon,
  Film,
  FolderOpen,
  Briefcase,
  TrendingUp,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { apiGetSafe } from "@/lib/site-utils";

type Stats = {
  photoCategories: number;
  videoCategories: number;
  photos: number;
  videos: number;
  services: number;
  admins: number;
  photosPublished: number;
  photosHidden: number;
  videosPublished: number;
  videosHidden: number;
  catsPublishedPhoto: number;
  catsPublishedVideo: number;
};

export default function DashboardPage() {
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [meta, setMeta] = React.useState<{ hasOwner: boolean; hasSiteContent: boolean } | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      const d = await apiGetSafe<{ stats: Stats; hasOwner: boolean; hasSiteContent: boolean }>(
        "/api/admin/stats"
      );
      if (d) {
        setStats(d.stats);
        setMeta({ hasOwner: d.hasOwner, hasSiteContent: d.hasSiteContent });
      }
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading tracking-wide">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back to the IMAGES PRODUCTION studio dashboard.
        </p>
      </div>

      {/* Setup warnings */}
      {meta && !meta.hasOwner && (
        <SetupCard
          href="/admin/owner"
          label="Owner information is missing"
          hint="Add Narayan Maane's bio and contact details so the public About section renders correctly."
        />
      )}
      {meta && !meta.hasSiteContent && (
        <SetupCard
          href="/admin/site-content"
          label="Site content is missing"
          hint="Add company name, hero text and contact details so the public site renders correctly."
        />
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading || !stats ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))
        ) : (
          <>
            <StatCard
              icon={<FolderOpen className="h-5 w-5" />}
              label="Photo Categories"
              value={stats.photoCategories}
              hint={`${stats.catsPublishedPhoto} published`}
            />
            <StatCard
              icon={<ImageIcon className="h-5 w-5" />}
              label="Photos"
              value={stats.photos}
              hint={`${stats.photosPublished} published`}
            />
            <StatCard
              icon={<FolderOpen className="h-5 w-5" />}
              label="Video Categories"
              value={stats.videoCategories}
              hint={`${stats.catsPublishedVideo} published`}
            />
            <StatCard
              icon={<Film className="h-5 w-5" />}
              label="Videos"
              value={stats.videos}
              hint={`${stats.videosPublished} published`}
            />
            <StatCard
              icon={<Briefcase className="h-5 w-5" />}
              label="Services"
              value={stats.services}
              hint="On the public Services grid"
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5" />}
              label="Published Photos"
              value={stats.photosPublished}
              hint={`${stats.photosHidden} hidden`}
            />
            <StatCard
              icon={<Eye className="h-5 w-5" />}
              label="Live Photos"
              value={stats.photosPublished}
              hint="Visible on /"
            />
            <StatCard
              icon={<EyeOff className="h-5 w-5" />}
              label="Hidden Items"
              value={stats.photosHidden + stats.videosHidden}
              hint="Photos + videos"
            />
          </>
        )}
      </div>

      {/* Quick actions */}
      <Card className="p-6">
        <h2 className="font-heading text-xl">Quick actions</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Jump straight to the studio tools you use most.
        </p>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <QuickLink href="/admin/photos" label="Upload a photo" />
          <QuickLink href="/admin/videos" label="Add a video" />
          <QuickLink href="/admin/photo-categories" label="Reorder photo categories" />
          <QuickLink href="/admin/services" label="Edit services" />
          <QuickLink href="/admin/owner" label="Edit owner bio" />
          <QuickLink href="/admin/settings" label="Change password" />
        </div>
      </Card>

      {/* Recent activity / getting started */}
      <Card className="p-6 bg-gradient-to-br from-amber-50 to-white border-amber-200/60">
        <h2 className="font-heading text-xl text-amber-900">Getting started</h2>
        <p className="text-amber-800/80 text-sm mt-1">
          Your portfolio is in its clean empty state. Here's how to fill it
          with real work:
        </p>
        <ol className="mt-4 space-y-2 text-sm text-amber-900/85 list-decimal list-inside">
          <li>Open Photography Categories and confirm your categories are ordered the way you want.</li>
          <li>Open Photography → Upload Photo. Add a caption, description, category, and publish toggle.</li>
          <li>Open Films &amp; Videos → Add Video. Paste a YouTube/Vimeo URL, upload a thumbnail, set duration.</li>
          <li>Open Services and tune each description for your tone of voice.</li>
          <li>Open Owner Info to refine Narayan's bio, stats, and contact details.</li>
        </ol>
      </Card>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between">
        <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
          {icon}
        </div>
        <div className="text-right">
          <div className="text-2xl sm:text-3xl font-heading">{value}</div>
        </div>
      </div>
      <div className="mt-3 text-xs tracking-[0.18em] uppercase text-muted-foreground">
        {label}
      </div>
      <div className="text-[11px] text-muted-foreground/80 mt-1">{hint}</div>
    </Card>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between gap-2 rounded-md border border-border bg-card px-4 py-3 hover:border-primary/40 hover:bg-accent/50 transition-colors"
    >
      <span className="text-sm">{label}</span>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </Link>
  );
}

function SetupCard({
  href,
  label,
  hint,
}: {
  href: string;
  label: string;
  hint: string;
}) {
  return (
    <Link
      href={href}
      className="block"
    >
      <div className="rounded-xl border border-amber-300/60 bg-amber-50 px-5 py-4 flex items-start gap-3 hover:bg-amber-100/60 transition-colors">
        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
        <div>
          <div className="font-medium text-amber-900 text-sm">{label}</div>
          <div className="text-amber-800/80 text-xs mt-0.5">{hint}</div>
        </div>
      </div>
    </Link>
  );
}
