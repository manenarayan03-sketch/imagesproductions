"use client";

import * as React from "react";
import { Plus, Trash2, Pencil, Eye, EyeOff, Upload, Loader2, Play } from "lucide-react";
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
import { useAdminFetch, useUpload, useVideoUpload, useConfirmDelete, AdminPageHeader } from "@/components/admin/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { getEmbedSrc } from "@/lib/site-utils";

type Category = { id: string; name: string };
type Video = {
  id: string;
  title: string;
  description?: string | null;
  videoUrl: string;
  thumbnailUrl?: string | null;
  duration?: string | null;
  categoryId: string;
  order: number;
  published: boolean;
  category: { id: string; name: string };
};

export default function VideosPage() {
  const { call } = useAdminFetch();
  const { confirm, close, state: confirmState } = useConfirmDelete();
  const [videos, setVideos] = React.useState<Video[]>([]);
  const [cats, setCats] = React.useState<Category[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<Video | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [filterCat, setFilterCat] = React.useState<string>("all");

  const load = React.useCallback(async () => {
    setLoading(true);
    const [vRes, cRes] = await Promise.all([
      call("/api/admin/videos", {}, { silent: true }),
      call("/api/admin/video-categories", {}, { silent: true }),
    ]);
    if (vRes.ok && vRes.data) setVideos(vRes.data.videos);
    if (cRes.ok && cRes.data) setCats(cRes.data.categories);
    setLoading(false);
  }, [call]);

  React.useEffect(() => {
    load();
  }, [load]);

  const remove = async (v: Video) => {
    const ok = await confirm(`Delete "${v.title}"?`);
    if (!ok) return;
    await call(`/api/admin/videos/${v.id}`, { method: "DELETE" }, {
      successMessage: "Video deleted",
    });
    await load();
  };

  const togglePublish = async (v: Video) => {
    await call(`/api/admin/videos/${v.id}`, {
      method: "PUT",
      body: JSON.stringify({ published: !v.published }),
    });
    await load();
  };

  const filtered =
    filterCat === "all" ? videos : videos.filter((v) => v.categoryId === filterCat);

  return (
    <div>
      <AdminPageHeader
        title="Films & Videos"
        description="Add YouTube/Vimeo links or direct video files. Thumbnails optional."
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
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No videos yet. Click <strong>Add</strong> to add your first one.
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((v) => (
            <Card key={v.id} className="overflow-hidden">
              <div className="relative aspect-video bg-muted">
                {v.thumbnailUrl ? (
                   
                  <img
                    src={v.thumbnailUrl}
                    alt={v.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Play className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="font-medium text-sm truncate">{v.title}</div>
                <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground mt-0.5">
                  {v.category.name} {v.duration ? `· ${v.duration}` : ""}
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Button size="sm" variant="ghost" onClick={() => togglePublish(v)}>
                    {v.published ? (
                      <Eye className="h-4 w-4" />
                    ) : (
                      <EyeOff className="h-4 w-4" />
                    )}
                  </Button>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEditing(v)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => remove(v)}
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

      <VideoEditor
        open={!!editing || creating}
        video={editing}
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

function VideoEditor({
  open,
  video,
  categories,
  onClose,
  onSaved,
}: {
  open: boolean;
  video: Video | null;
  categories: Category[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const { call } = useAdminFetch();
  const upload = useUpload();
  const uploadVideo = useVideoUpload();
  const [title, setTitle] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [videoUrl, setVideoUrl] = React.useState("");
  const [thumbnailUrl, setThumbnailUrl] = React.useState("");
  const [duration, setDuration] = React.useState("");
  const [categoryId, setCategoryId] = React.useState("");
  const [published, setPublished] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [uploadingVideo, setUploadingVideo] = React.useState(false);

  React.useEffect(() => {
    if (video) {
      setTitle(video.title);
      setDescription(video.description || "");
      setVideoUrl(video.videoUrl);
      setThumbnailUrl(video.thumbnailUrl || "");
      setDuration(video.duration || "");
      setCategoryId(video.categoryId);
      setPublished(video.published);
    } else {
      setTitle("");
      setDescription("");
      setVideoUrl("");
      setThumbnailUrl("");
      setDuration("");
      setCategoryId(categories[0]?.id || "");
      setPublished(false);
    }
  }, [video, open, categories]);

  const onThumb = async (file: File) => {
    setUploading(true);
    const url = await upload(file);
    setUploading(false);
    if (url) setThumbnailUrl(url);
  };

  const onVideoFile = async (file: File) => {
    setUploadingVideo(true);
    const url = await uploadVideo(file);
    setUploadingVideo(false);
    if (url) setVideoUrl(url);
  };

  const save = async () => {
    if (!title.trim() || !videoUrl.trim() || !categoryId) return;
    if (video) {
      await call(
        `/api/admin/videos/${video.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            title,
            description,
            videoUrl,
            thumbnailUrl,
            duration,
            categoryId,
            published,
          }),
        },
        { successMessage: "Video updated" }
      );
    } else {
      await call(
        "/api/admin/videos",
        {
          method: "POST",
          body: JSON.stringify({
            title,
            description,
            videoUrl,
            thumbnailUrl,
            duration,
            categoryId,
            published,
          }),
        },
        { successMessage: "Video added" }
      );
    }
    onSaved();
  };

  const embeddable = getEmbedSrc(videoUrl) || /\.(mp4|webm|ogg)$/i.test(videoUrl);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{video ? "Edit video" : "Add video"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Sneha & Aman · Cinematic Wedding Highlights"
            />
          </div>
          <div>
            <Label htmlFor="url">Video URL (YouTube / Vimeo / direct file)</Label>
            <Input
              id="url"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://youtu.be/… or https://vimeo.com/…"
            />
            {videoUrl && !embeddable && (
              <div className="text-xs text-amber-600 mt-1">
                URL not embeddable. Users will see an "Open in new tab" link instead.
              </div>
            )}
          </div>
          <div>
            <Label>Or upload a video file</Label>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-accent">
                {uploadingVideo ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                {uploadingVideo ? "Uploading video…" : "Choose MP4 / WebM"}
                <input
                  type="file"
                  accept="video/mp4,video/webm,.mp4,.webm"
                  className="hidden"
                  disabled={uploadingVideo}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onVideoFile(file);
                    e.currentTarget.value = "";
                  }}
                />
              </label>
              <span className="text-xs text-muted-foreground">
                MP4/WebM, up to 250MB. Larger videos can be linked from video storage.
              </span>
            </div>
          </div>
          <div>
            <Label>Thumbnail (optional)</Label>
            <div className="mt-2 flex items-center gap-3">
              <label className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-3 py-2 text-sm cursor-pointer hover:bg-accent">
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload thumbnail
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onThumb(f);
                  }}
                />
              </label>
              <Input
                value={thumbnailUrl}
                onChange={(e) => setThumbnailUrl(e.target.value)}
                placeholder="or paste a URL"
                className="flex-1"
              />
            </div>
            {thumbnailUrl && (
              <div className="mt-3 rounded-md overflow-hidden border border-border">
                { }
                <img
                  src={thumbnailUrl}
                  alt="preview"
                  className="max-h-40 w-full object-cover"
                />
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="duration">Duration (optional)</Label>
              <Input
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="3:42"
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
          <Button onClick={save} disabled={!title || !videoUrl || !categoryId || uploadingVideo}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
