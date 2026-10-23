"use client";

import * as React from "react";
import { Plus, Trash2, Pencil, ArrowUp, ArrowDown, Eye, EyeOff, Upload, Loader2 } from "lucide-react";
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
import { useAdminFetch, useUpload, useConfirmDelete, AdminPageHeader } from "@/components/admin/hooks";
import { Skeleton } from "@/components/ui/skeleton";

type Category = { id: string; name: string };
type Photo = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  categoryId: string;
  order: number;
  published: boolean;
  category: { id: string; name: string };
};

export default function PhotosPage() {
  const { call } = useAdminFetch();
  const { confirm, close, state: confirmState } = useConfirmDelete();
  const [photos, setPhotos] = React.useState<Photo[]>([]);
  const [cats, setCats] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<Photo | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [filterCat, setFilterCat] = React.useState<string>("all");

  const load = React.useCallback(async () => {
    setLoading(true);
    const [pRes, cRes] = await Promise.all([
      call("/api/admin/photos", {}, { silent: true }),
      call("/api/admin/photo-categories", {}, { silent: true }),
    ]);
    if (pRes.ok && pRes.data) setPhotos(pRes.data.photos);
    if (cRes.ok && cRes.data) setCats(cRes.data.categories);
    setLoading(false);
  }, [call]);

  React.useEffect(() => {
    load();
  }, [load]);

  const remove = async (p: Photo) => {
    const ok = await confirm(`Delete "${p.title}"? This cannot be undone.`);
    if (!ok) return;
    await call(`/api/admin/photos/${p.id}`, { method: "DELETE" }, {
      successMessage: "Photo deleted",
    });
    await load();
  };

  const togglePublish = async (p: Photo) => {
    await call(`/api/admin/photos/${p.id}`, {
      method: "PUT",
      body: JSON.stringify({ published: !p.published }),
    });
    await load();
  };

  const filtered =
    filterCat === "all" ? photos : photos.filter((p) => p.categoryId === filterCat);

  return (
    <div>
      <AdminPageHeader
        title="Photography"
        description="Upload, caption and publish your photographs."
        action={
          <div className="flex items-center gap-2">
            <Select value={filterCat} onValueChange={setFilterCat}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {cats.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setCreating(true)} size="sm" className="rounded-full">
              <Plus className="h-4 w-4 mr-1" /> Upload
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No photos yet. Click <strong>Upload</strong> to add your first one.
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              { }
              <img
                src={p.imageUrl}
                alt={p.title}
                className="w-full aspect-square object-cover"
              />
              <div className="p-3">
                <div className="font-medium text-sm truncate">{p.title}</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">
                  {p.category.name}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => togglePublish(p)}
                  >
                    {p.published ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(p)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => remove(p)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <PhotoEditor
        open={!!editing || creating}
        photo={editing}
        categories={cats}
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

function PhotoEditor({
  open,
  photo,
  categories,
  onClose,
  onSaved,
}: {
  open: boolean;
  photo: Photo | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { call } = useAdminFetch();
  const upload = useUpload();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [published, setPublished] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);

  React.useEffect(() => {
    if (photo) {
      setTitle(photo.title);
      setDescription(photo.description || "");
      setImageUrl(photo.imageUrl);
      setCategoryId(photo.categoryId);
      setPublished(photo.published);
    } else {
      setTitle("");
      setDescription("");
      setImageUrl("");
      setCategoryId(categories[0]?.id || "");
      setPublished(false);
    }
  }, [photo, open, categories]);

  const onFile = async (file: File) => {
    setUploading(true);
    const url = await upload(file);
    setUploading(false);
    if (url) setImageUrl(url);
  };

  const save = async () => {
    if (!title.trim() || !imageUrl.trim() || !categoryId) return;
    if (photo) {
      await call(
        `/api/admin/photos/${photo.id}`,
        {
          method: "PUT",
          body: JSON.stringify({ title, description, imageUrl, categoryId, published }),
        },
        { successMessage: "Photo updated" }
      );
    } else {
      await call(
        "/api/admin/photos",
        {
          method: "POST",
          body: JSON.stringify({ title, description, imageUrl, categoryId, published }),
        },
        { successMessage: "Photo added" }
      );
    }
    onSaved();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{photo ? "Edit photo" : "Upload photo"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label>Image file</Label>
            <div className="mt-2 flex items-center gap-3">
              <label className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-accent">
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Choose file
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onFile(f);
                  }}
                />
              </label>
              <span className="text-xs text-muted-foreground">jpeg/png/webp, max 8MB</span>
            </div>
            {imageUrl && (
              <div className="mt-3 rounded-md overflow-hidden border border-border">
                { }
                <img src={imageUrl} alt="preview" className="max-h-52 w-full object-cover" />
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="title">Title / Caption</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Bidaai under a monsoon sky"
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
          <div>
            <Label>Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={published} onCheckedChange={setPublished} id="pub" />
            <Label htmlFor="pub">Published (visible on public site)</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} disabled={!imageUrl || !title || !categoryId || uploading}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
