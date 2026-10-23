"use client";

import * as React from "react";
import { Plus, Trash2, Pencil, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAdminFetch, useConfirmDelete, AdminPageHeader } from "@/components/admin/hooks";
import { Skeleton } from "@/components/ui/skeleton";

type Service = {
  id: string;
  title: string;
  description: string;
  icon: string;
  order: number;
  published: boolean;
};

const ICONS = [
  { key: "camera", label: "Camera" },
  { key: "film", label: "Film Reel" },
  { key: "edit", label: "Lens / Edit" },
  { key: "event", label: "Aperture / Event" },
  { key: "portrait", label: "Photo Frame / Portrait" },
  { key: "corporate", label: "Play / Corporate" },
  { key: "product", label: "Gold Orb / Product" },
  { key: "social", label: "Violet Orb / Social" },
];

export default function ServicesPage() {
  const { call } = useAdminFetch();
  const { confirm, close, state: confirmState } = useConfirmDelete();
  const [items, setItems] = React.useState<Service[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<Service | null>(null);
  const [creating, setCreating] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await call("/api/admin/services", {}, { silent: true });
    if (res.ok && res.data) setItems(res.data.services);
    setLoading(false);
  }, [call]);

  React.useEffect(() => {
    load();
  }, [load]);

  const reorder = async (s: Service, dir: -1 | 1) => {
    const idx = items.findIndex((x) => x.id === s.id);
    const target = items[idx + dir];
    if (!target) return;
    await call(`/api/admin/services/${s.id}`, {
      method: "PUT",
      body: JSON.stringify({ order: target.order }),
    });
    await call(`/api/admin/services/${target.id}`, {
      method: "PUT",
      body: JSON.stringify({ order: s.order }),
    });
    await load();
  };

  const togglePublish = async (s: Service) => {
    await call(`/api/admin/services/${s.id}`, {
      method: "PUT",
      body: JSON.stringify({ published: !s.published }),
    });
    await load();
  };

  const remove = async (s: Service) => {
    const ok = await confirm(`Delete "${s.title}"?`);
    if (!ok) return;
    await call(`/api/admin/services/${s.id}`, { method: "DELETE" }, {
      successMessage: "Service deleted",
    });
    await load();
  };

  return (
    <div>
      <AdminPageHeader
        title="Services"
        description="Edit the service cards shown on the public Services section."
        action={
          <Button onClick={() => setCreating(true)} size="sm" className="rounded-full">
            <Plus className="h-4 w-4 mr-1" /> New
          </Button>
        }
      />
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No services yet.
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((s, i) => (
            <Card key={s.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    disabled={i === 0}
                    onClick={() => reorder(s, -1)}
                    aria-label="Move up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    disabled={i === items.length - 1}
                    onClick={() => reorder(s, 1)}
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground rounded bg-muted px-2 py-0.5">
                      {s.icon}
                    </span>
                    <span className="font-medium">{s.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {s.description}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Button size="sm" variant="ghost" onClick={() => togglePublish(s)}>
                    {s.published ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(s)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => remove(s)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ServiceEditor
        open={!!editing || creating}
        service={editing}
        onClose={() => {
          setEditing(null);
          setCreating(false);
        }}
        onSaved={async () => {
          setEditing(null);
          setCreating(false);
          await load();
        }}
      />

      <AlertDialog open={confirmState.open} onOpenChange={(o) => close(o)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>{confirmState.message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => close(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => close(true)}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ServiceEditor({
  open,
  service,
  onClose,
  onSaved,
}: {
  open: boolean;
  service: Service | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { call } = useAdminFetch();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [icon, setIcon] = React.useState("camera");
  const [published, setPublished] = React.useState(true);

  React.useEffect(() => {
    if (service) {
      setTitle(service.title);
      setDescription(service.description);
      setIcon(service.icon);
      setPublished(service.published);
    } else {
      setTitle("");
      setDescription("");
      setIcon("camera");
      setPublished(true);
    }
  }, [service, open]);

  const save = async () => {
    if (!title.trim() || !description.trim()) return;
    if (service) {
      await call(
        `/api/admin/services/${service.id}`,
        { method: "PUT", body: JSON.stringify({ title, description, icon, published }) },
        { successMessage: "Service updated" }
      );
    } else {
      await call(
        "/api/admin/services",
        { method: "POST", body: JSON.stringify({ title, description, icon, published }) },
        { successMessage: "Service created" }
      );
    }
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{service ? "Edit service" : "New service"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Wedding Photography & Films"
            />
          </div>
          <div>
            <Label>Icon</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ICONS.map((ic) => (
                  <SelectItem key={ic.key} value={ic.key}>
                    {ic.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={10}
            />
            <div className="text-xs text-muted-foreground mt-1">
              {description.trim().split(/\s+/).filter(Boolean).length} words · aim for 150+ for SEO depth.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={published} onCheckedChange={setPublished} id="pub" />
            <Label htmlFor="pub">Published</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
