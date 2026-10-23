// Shared client helpers for IMAGES PRODUCTION public site.

/** Build a WhatsApp deep-link URL with optional prefilled message. */
export function buildWhatsAppLink(
  phone: string,
  message?: string
): string {
  const digits = (phone || "").replace(/[^\d]/g, "");
  // India country code 91 fallback if number is local
  const normalized = digits.length === 10 ? `91${digits}` : digits;
  const base = `https://wa.me/${normalized}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** Scroll to a section id smoothly. */
export function scrollToId(id: string) {
  if (typeof document === "undefined") return;
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/** Generic fetcher for GET endpoints returning JSON. */
export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

/** Fetch with default toast error handling. Returns null on failure. */
export async function apiGetSafe<T>(url: string): Promise<T | null> {
  try {
    return await apiGet<T>(url);
  } catch (e) {
     
    console.error("apiGetSafe error", e);
    return null;
  }
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Map a video URL to an embeddable iframe src (YouTube/Vimeo). Returns null if not embeddable. */
export function getEmbedSrc(url: string): string | null {
  if (!url) return null;
  try {
    // Direct file? Return as-is (assume browser-playable).
    if (/\.(mp4|webm|ogg|m3u8)$/i.test(url)) return url;
    // YouTube
    const yt = url.match(
      /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([\w-]{11})/
    );
    if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
    // Vimeo
    const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
    return null;
  } catch {
    return null;
  }
}
