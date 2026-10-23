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
import { useAdminFetch, useConfirmDelete, AdminPageHeader } from "@/components/admin/hooks";
import { Skeleton } from "@/components/ui/skeleton";

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  order: number;
  published: boolean;
  _count?: { videos?: number };
};

export default function VideoCategoriesPage() {
  const { call } = useAdminFetch();
  const { confirm, close, state: confirmState } = useConfirmDelete();
  const [cats, setCats] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<Category | null>(null);
  const [creating, setCreating] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    const res = await call("/api/admin/video-categories", {}, { silent: true });
    if (res.ok && res.data) setCats(res.data.categories);
    setLoading(false);
  }, [call]);

  React.useEffect(() => {
    load();
  }, [load]);

  const reorder = async (c: Category, dir: -1 | 1) => {
    const idx = cats.findIndex((x) => x.id === c.id);
    const target = cats[idx + dir];
    if (!target) return;
    await call(`/api/admin/video-categories/${c.id}`, {
      method: "PUT",
      body: JSON.stringify({ order: target.order }),
    });
    await call(`/api/admin/video-categories/${target.id}`, {
      method: "PUT",
      body: JSON.stringify({ order: c.order }),
    });
    await load();
  };

  const togglePublish = async (c: Category) => {
    await call(`/api/admin/video-categories/${c.id}`, {
      method: "PUT",
      body: JSON.stringify({ published: !c.published }),
    });
    await load();
  };

  const remove = async (c: Category) => {
    const ok = await confirm(
      `Delete "${c.name}"? This will also delete ${c._count?.videos ?? 0} video(s) inside.`
    );
    if (!ok) return;
    await call(`/api/admin/video-categories/${c.id}`, { method: "DELETE" }, {
      successMessage: "Category deleted",
    });
    await load();
  };

  return (
    <div>
      <AdminPageHeader
        title="Video Categories"
        description="Manage the category filter bar for the public Films section."
        action={
          <Button onClick={() => setCreating(true)} size="sm" className="rounded-full">
            <Plus className="h-4 w-4 mr-1" /> New
          </Button>
        }
      />
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      ) : cats.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No video categories yet. Click <strong>New</strong> to add your first one.
        </Card>
      ) : (
        <div className="space-y-2">
          {cats.map((c, i) => (
            <Card key={c.id} className="p-4 flex items-center gap-4">
              <div className="flex flex-col gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  disabled={i === 0}
                  onClick={() => reorder(c, -1)}
                  aria-label="Move up"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  disabled={i === cats.length - 1}
                  onClick={() => reorder(c, 1)}
                  aria-label="Move down"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{c.name}</div>
                <div className="text-xs text-muted-foreground truncate">
                  /{c.slug} · {c._count?.videos ?? 0} video(s) · order {c.order}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => togglePublish(c)}>
                  {c.published ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                  <span className="ml-1 text-xs">
                    {c.published ? "Published" : "Hidden"}
                  </span>
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(c)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => remove(c)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <CategoryEditor
        open={!!editing || creating}
        category={editing}
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

function CategoryEditor({
  open,
  category,
  onClose,
  onSaved,
}: {
  open: boolean;
  category: Category | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const { call } = useAdminFetch();
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [published, setPublished] = React.useState(true);

  React.useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setDescription(category.description || "");
      setPublished(category.published);
    } else {
      setName("");
      setSlug("");
      setDescription("");
      setPublished(true);
    }
  }, [category, open]);

  const save = async () => {
    if (!name.trim()) return;
    if (category) {
      await call(
        `/api/admin/video-categories/${category.id}`,
        { method: "PUT", body: JSON.stringify({ name, slug, description, published }) },
        { successMessage: "Category updated" }
      );
    } else {
      await call(
        "/api/admin/video-categories",
        { method: "POST", body: JSON.stringify({ name, slug, description, published }) },
        { successMessage: "Category created" }
      );
    }
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{category ? "Edit category" : "New category"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Wedding Films"
            />
          </div>
          <div>
            <Label htmlFor="slug">Slug (optional)</Label>
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="wedding-films"
            />
          </div>
          <div>
            <Label htmlFor="desc">Description (optional)</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
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
