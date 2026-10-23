"use client";

import * as React from "react";
import { useToast } from "@/hooks/use-toast";

/**
 * Tiny helper for admin fetch operations with toast feedback.
 */
export function useAdminFetch() {
  const { toast } = useToast();

  const call = React.useCallback(
    async (
      url: string,
      options: RequestInit = {},
      opts: {
        successMessage?: string;
        errorMessage?: string;
        silent?: boolean;
      } = {}
    ) => {
      try {
        const res = await fetch(url, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
          },
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          const msg = data?.error || opts.errorMessage || `Failed (${res.status})`;
          if (!opts.silent) {
            toast({
              title: "Action failed",
              description: msg,
              variant: "destructive",
            });
          }
          return { ok: false as const, data: null, status: res.status };
        }
        if (opts.successMessage && !opts.silent) {
          toast({ title: "Success", description: opts.successMessage });
        }
        return { ok: true as const, data, status: res.status };
      } catch (e: any) {
        if (!opts.silent) {
          toast({
            title: "Network error",
            description: e?.message || "Could not reach server",
            variant: "destructive",
          });
        }
        return { ok: false as const, data: null, status: 0 };
      }
    },
    [toast]
  );

  return { call };
}

/** Upload a file via the /api/admin/upload multipart endpoint. */
export function useUpload() {
  const { toast } = useToast();
  return React.useCallback(
    async (file: File): Promise<string | null> => {
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          toast({
            title: "Upload failed",
            description: data?.error || "Could not upload file",
            variant: "destructive",
          });
          return null;
        }
        return data.url as string;
      } catch (e: any) {
        toast({
          title: "Upload failed",
          description: e?.message || "Network error",
          variant: "destructive",
        });
        return null;
      }
    },
    [toast]
  );
}

/** Upload an MP4/WebM file via the admin-only video endpoint. */
export function useVideoUpload() {
  const { toast } = useToast();
  return React.useCallback(
    async (file: File): Promise<string | null> => {
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/admin/video-upload", {
          method: "POST",
          body: fd,
        });
        const data = await res.json().catch(() => null);
        if (!res.ok) {
          toast({
            title: "Video upload failed",
            description: data?.error || "Could not upload video",
            variant: "destructive",
          });
          return null;
        }
        return data.url as string;
      } catch (error: any) {
        toast({
          title: "Video upload failed",
          description: error?.message || "Network error",
          variant: "destructive",
        });
        return null;
      }
    },
    [toast]
  );
}

/** A simple page title + subtitle header. */
export function AdminPageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-heading tracking-wide">{title}</h1>
        {description && (
          <p className="text-muted-foreground text-sm mt-1">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

/** Confirm before destructive action. */
export function useConfirmDelete() {
  const [state, setState] = React.useState<{
    open: boolean;
    message: string;
    resolve?: (ok: boolean) => void;
  }>({ open: false, message: "" });

  const confirm = React.useCallback((message = "Are you sure you want to delete this?") => {
    return new Promise<boolean>((resolve) => {
      setState({ open: true, message, resolve });
    });
  }, []);

  const close = React.useCallback(
    (ok: boolean) => {
      state.resolve?.(ok);
      setState({ open: false, message: "", resolve: undefined });
    },
    [state]
  );

  return { confirm, close, state };
}
