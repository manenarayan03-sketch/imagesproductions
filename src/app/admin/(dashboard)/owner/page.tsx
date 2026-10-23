"use client";

import * as React from "react";
import { Plus, Trash2, Upload, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useAdminFetch, useUpload, AdminPageHeader } from "@/components/admin/hooks";
import { Skeleton } from "@/components/ui/skeleton";

type Stat = { label: string; value: string };
type Owner = {
  id?: string;
  name: string;
  role: string;
  bio: string;
  phone: string;
  whatsapp: string;
  email: string | null;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  stats: Stat[];
  photoUrl: string | null;
};

const DEFAULT_OWNER: Owner = {
  name: "Narayan Maane",
  role: "Founder & Creative Director",
  bio: "Welcome to Images Production.\n\nI am Narayan Maane, Founder and Creative Director of Images Production, based in Mulund West, Mumbai.",
  phone: "+91 8433975695",
  whatsapp: "+91 8433975695",
  email: null,
  address:
    "Jalaram Niwas, Ganesh Gawade Road, Near Canara Bank, Mulund West",
  city: "Mumbai",
  state: "Maharashtra",
  pincode: "400080",
  country: "India",
  stats: [
    { label: "Years of Passion", value: "5+" },
    { label: "Stories Told", value: "200+" },
    { label: "Frames Crafted", value: "10,000+" },
  ],
  photoUrl: null,
};

export default function OwnerPage() {
  const { call } = useAdminFetch();
  const upload = useUpload();
  const [owner, setOwner] = React.useState<Owner | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await call("/api/admin/owner", {}, { silent: true });
    if (res.ok && res.data?.owner) {
      setOwner(res.data.owner);
    } else {
      setOwner(DEFAULT_OWNER);
    }
    setLoading(false);
  }, [call]);

  React.useEffect(() => {
    load();
  }, [load]);

  const update = (patch: Partial<Owner>) =>
    setOwner((o) => (o ? { ...o, ...patch } : o));

  const onPhoto = async (file: File) => {
    setUploading(true);
    const url = await upload(file);
    setUploading(false);
    if (url) update({ photoUrl: url });
  };

  const save = async () => {
    if (!owner) return;
    setSaving(true);
    await call("/api/admin/owner", {
      method: "PUT",
      body: JSON.stringify(owner),
    }, { successMessage: "Owner info saved" });
    setSaving(false);
  };

  if (loading || !owner) {
    return (
      <div>
        <AdminPageHeader title="Owner Info" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title="Owner Info"
        description="The founder bio and contact details shown in the public About section."
      />
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Photo */}
        <Card className="p-5 h-fit">
          <Label>Owner photo</Label>
          <div className="mt-3 aspect-[4/5] rounded-md overflow-hidden border border-border bg-muted">
            {owner.photoUrl ? (
               
              <img
                src={owner.photoUrl}
                alt={owner.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                No photo yet
              </div>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <label className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-accent">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              Upload photo
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onPhoto(f);
                }}
              />
            </label>
            {owner.photoUrl && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => update({ photoUrl: null })}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>

        {/* Form */}
        <Card className="p-5 lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={owner.name}
                onChange={(e) => update({ name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Input
                id="role"
                value={owner.role}
                onChange={(e) => update({ role: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="bio">Bio (separate paragraphs with a blank line)</Label>
            <Textarea
              id="bio"
              value={owner.bio}
              onChange={(e) => update({ bio: e.target.value })}
              rows={10}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={owner.phone}
                onChange={(e) => update({ phone: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input
                id="whatsapp"
                value={owner.whatsapp}
                onChange={(e) => update({ whatsapp: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={owner.email || ""}
              onChange={(e) => update({ email: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              value={owner.address}
              onChange={(e) => update({ address: e.target.value })}
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" value={owner.city} onChange={(e) => update({ city: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" value={owner.state} onChange={(e) => update({ state: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="pincode">Pincode</Label>
              <Input id="pincode" value={owner.pincode} onChange={(e) => update({ pincode: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={owner.country} onChange={(e) => update({ country: e.target.value })} />
            </div>
          </div>

          {/* Stats */}
          <div>
            <div className="flex items-center justify-between">
              <Label>Stats strip</Label>
              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  update({
                    stats: [...owner.stats, { label: "", value: "" }],
                  })
                }
              >
                <Plus className="h-4 w-4 mr-1" /> Add stat
              </Button>
            </div>
            <div className="mt-3 space-y-2">
              {owner.stats.map((s, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="Label (e.g. Years of Passion)"
                    value={s.label}
                    onChange={(e) => {
                      const stats = [...owner.stats];
                      stats[i] = { ...stats[i], label: e.target.value };
                      update({ stats });
                    }}
                  />
                  <Input
                    placeholder="Value (e.g. 5+)"
                    value={s.value}
                    onChange={(e) => {
                      const stats = [...owner.stats];
                      stats[i] = { ...stats[i], value: e.target.value };
                      update({ stats });
                    }}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      const stats = owner.stats.filter((_, idx) => idx !== i);
                      update({ stats });
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button onClick={save} disabled={saving} className="rounded-full">
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
