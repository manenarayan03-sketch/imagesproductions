"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAdminFetch, AdminPageHeader } from "@/components/admin/hooks";
import { Skeleton } from "@/components/ui/skeleton";

type Site = {
  id?: string;
  companyName: string;
  tagline: string;
  heroHeadline: string;
  heroSubtext: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  heroVideoUrl: string | null;
  whatsappNumber: string;
  email: string | null;
  instagram: string | null;
  youtube: string | null;
  vimeo: string | null;
  facebook: string | null;
};

const DEFAULT_SITE: Site = {
  companyName: "IMAGES PRODUCTION",
  tagline: "Frames Alive with Imagination",
  heroHeadline: "IMAGES PRODUCTION",
  heroSubtext: "Photography • Videography • Video Editing",
  heroCtaPrimary: "VIEW OUR WORK",
  heroCtaSecondary: "CONTACT US",
  heroVideoUrl: null,
  whatsappNumber: "+91 8433975695",
  email: null,
  instagram: null,
  youtube: null,
  vimeo: null,
  facebook: null,
};

const YOUTUBE_RE =
  /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([\w-]{11})/;
const VIMEO_RE = /vimeo\.com\/(?:video\/)?(\d+)/;
const FILE_RE = /\.(mp4|webm|mov|ogg)$/i;

function describeHeroVideoHint(url: string): string {
  const trimmed = (url || "").trim();
  if (!trimmed) {
    return "Empty — using dark background";
  }
  if (FILE_RE.test(trimmed)) {
    return "Detected: direct video file";
  }
  if (YOUTUBE_RE.test(trimmed)) {
    return "Detected: YouTube video";
  }
  if (VIMEO_RE.test(trimmed)) {
    return "Detected: Vimeo video";
  }
  return "URL not recognised — hero will fall back to dark background";
}

export default function SiteContentPage() {
  const { call } = useAdminFetch();
  const [site, setSite] = React.useState<Site | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await call("/api/admin/site-content", {}, { silent: true });
    if (res.ok && res.data?.site) {
      setSite({ ...DEFAULT_SITE, ...res.data.site });
    } else {
      setSite(DEFAULT_SITE);
    }
    setLoading(false);
  }, [call]);

  React.useEffect(() => {
    load();
  }, [load]);

  const update = (patch: Partial<Site>) =>
    setSite((s) => (s ? { ...s, ...patch } : s));

  const save = async () => {
    if (!site) return;
    setSaving(true);
    await call(
      "/api/admin/site-content",
      {
        method: "PUT",
        body: JSON.stringify(site),
      },
      { successMessage: "Site content saved" }
    );
    setSaving(false);
  };

  if (loading || !site) {
    return (
      <div>
        <AdminPageHeader title="Site Content" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Site Content"
        description="Brand identity, hero text, WhatsApp number and social links."
      />
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="p-5 space-y-4">
          <h2 className="font-heading text-lg">Brand</h2>
          <div>
            <Label htmlFor="company">Company name</Label>
            <Input id="company" value={site.companyName} onChange={(e) => update({ companyName: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" value={site.tagline} onChange={(e) => update({ tagline: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="whatsapp">WhatsApp number</Label>
            <Input id="whatsapp" value={site.whatsappNumber} onChange={(e) => update({ whatsappNumber: e.target.value })} />
            <p className="text-xs text-muted-foreground mt-1">
              Used for the floating button and all WhatsApp CTAs. Include country code.
            </p>
          </div>
          <div>
            <Label htmlFor="email">Public email</Label>
            <Input id="email" type="email" value={site.email || ""} onChange={(e) => update({ email: e.target.value })} />
          </div>
        </Card>

        <Card className="p-5 space-y-4">
          <h2 className="font-heading text-lg">Hero</h2>
          <div>
            <Label htmlFor="headline">Hero headline</Label>
            <Input id="headline" value={site.heroHeadline} onChange={(e) => update({ heroHeadline: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="subtext">Hero subtext</Label>
            <Input id="subtext" value={site.heroSubtext} onChange={(e) => update({ heroSubtext: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cta1">Primary CTA label</Label>
              <Input id="cta1" value={site.heroCtaPrimary} onChange={(e) => update({ heroCtaPrimary: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="cta2">Secondary CTA label</Label>
              <Input id="cta2" value={site.heroCtaSecondary} onChange={(e) => update({ heroCtaSecondary: e.target.value })} />
            </div>
          </div>
          <div className="pt-2 border-t border-border">
            <Label htmlFor="heroVideo">Hero Background Video</Label>
            <Input
              id="heroVideo"
              value={site.heroVideoUrl || ""}
              onChange={(e) => update({ heroVideoUrl: e.target.value })}
              placeholder="https://example.com/hero.mp4 or https://www.youtube.com/watch?v=…"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Paste a YouTube link, Vimeo link, or direct MP4/WEBM URL. Leave
              empty for the clean cinematic dark background.
            </p>
            <p className="text-xs font-medium text-foreground/80 mt-1">
              {describeHeroVideoHint(site.heroVideoUrl || "")}
            </p>
          </div>
        </Card>

        <Card className="p-5 space-y-4 lg:col-span-2">
          <h2 className="font-heading text-lg">Social links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="ig">Instagram URL</Label>
              <Input id="ig" value={site.instagram || ""} onChange={(e) => update({ instagram: e.target.value })} placeholder="https://instagram.com/…" />
            </div>
            <div>
              <Label htmlFor="yt">YouTube URL</Label>
              <Input id="yt" value={site.youtube || ""} onChange={(e) => update({ youtube: e.target.value })} placeholder="https://youtube.com/…" />
            </div>
            <div>
              <Label htmlFor="vm">Vimeo URL</Label>
              <Input id="vm" value={site.vimeo || ""} onChange={(e) => update({ vimeo: e.target.value })} placeholder="https://vimeo.com/…" />
            </div>
            <div>
              <Label htmlFor="fb">Facebook URL</Label>
              <Input id="fb" value={site.facebook || ""} onChange={(e) => update({ facebook: e.target.value })} placeholder="https://facebook.com/…" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Leave a field blank to hide the icon in the footer.
          </p>
        </Card>
      </div>

      <div className="mt-6">
        <Button onClick={save} disabled={saving} className="rounded-full">
          {saving ? "Saving…" : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
