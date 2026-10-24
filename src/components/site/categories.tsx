"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  MessageCircle,
  ChevronRight,
  ChevronLeft,
  X,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Play,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ClayPhotoFrame, ClayFilmReel } from "@/components/clay";
import {
  apiGetSafe,
  buildWhatsAppLink,
  getEmbedSrc,
} from "@/lib/site-utils";

/* ---------------- Types ---------------- */
type PhotoCat = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  order: number;
  _count: { photos: number };
  photos: Pick<Photo, "id" | "title" | "imageUrl">[];
};

type VideoCat = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  order: number;
  _count: { videos: number };
  videos: Pick<Video, "id" | "title" | "videoUrl" | "thumbnailUrl">[];
};

type Photo = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  categoryId: string;
  category: { id: string; name: string; slug: string };
};

type Video = {
  id: string;
  title: string;
  description?: string | null;
  videoUrl: string;
  thumbnailUrl?: string | null;
  duration?: string | null;
  categoryId: string;
  category: { id: string; name: string; slug: string };
};

type TabKind = "photos" | "videos";

type ActiveCat = { kind: TabKind; id: string; name: string };

const pauseCategoryPreviews = new Set<() => void>();

function pauseAllCategoryPreviews() {
  pauseCategoryPreviews.forEach((pause) => pause());
}

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "wedding-photography": "Emotion-filled wedding moments, preserved in timeless frames.",
  "traditional-wedding-photography": "The rituals, details, and emotion of your wedding, captured with a timeless editorial eye.",
  "pre-wedding-photography": "Romantic portraits shaped around each couple's story.",
  "baby-shower-photography": "Joyful details and memories from a beautiful new beginning.",
  "candid-photography": "Natural expressions and unscripted moments, captured as they happen.",
  "cinematic-wedding-highlights": "Cinematic wedding stories, cut to bring every moment back to life.",
  "pre-wedding-films": "A moving portrait of the chemistry and anticipation before the day.",
  "corporate-videos": "Polished films that bring teams, brands, and ideas into focus.",
  "event-videos": "The energy, people, and highlights of every celebration.",
  "promotional-videos": "Purposeful video stories created to introduce and promote your brand.",
  "social-media-reels": "Short, share-ready films with a visual story in every second.",
};

const VIDEO_POSTERS: Record<string, string> = {
  "cinematic-wedding-highlights": "/uploads/portfolio/wedding-photography/_KPL4474.JPG",
  "pre-wedding-films": "/uploads/portfolio/pre-wedding-photography/_RTP4259.jpg",
  "corporate-videos": "/uploads/portfolio/brand/logo.jpeg",
  "event-videos": "/uploads/portfolio/baby-shower/179A9323.JPG",
  "social-media-reels": "/uploads/portfolio/brand/logo.jpeg",
};

/* ---------------- Main Categories Section ---------------- */
export function Categories({ whatsapp }: { whatsapp: string }) {
  const reduce = useReducedMotion();
  const [tab, setTab] = React.useState<TabKind>("photos");
  const [photoCats, setPhotoCats] = React.useState<PhotoCat[]>([]);
  const [videoCats, setVideoCats] = React.useState<VideoCat[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Active category modal state
  const [activeCat, setActiveCat] = React.useState<ActiveCat | null>(null);

  React.useEffect(() => {
    (async () => {
      const [pc, vc] = await Promise.all([
        apiGetSafe<{ categories: PhotoCat[] }>("/api/photography/categories"),
        apiGetSafe<{ categories: VideoCat[] }>("/api/videos/categories"),
      ]);
      if (pc) setPhotoCats(pc.categories);
      if (vc) setVideoCats(vc.categories);
      setLoading(false);
    })();
  }, []);

  const cats: (PhotoCat | VideoCat)[] = tab === "photos" ? photoCats : videoCats;

  // Open category modal — also flips the active tab so prev/next
  // navigation cycles through the correct list.
  const openCategory = (kind: TabKind, c: PhotoCat | VideoCat) => {
    pauseAllCategoryPreviews();
    setTab(kind);
    setActiveCat({ kind, id: c.id, name: c.name });
  };

  // Cycle to the prev/next category within the current tab list
  const cycleCategory = (dir: 1 | -1) => {
    if (!activeCat) return;
    const list =
      activeCat.kind === "photos" ? photoCats : videoCats;
    if (!list.length) return;
    const idx = list.findIndex((c) => c.id === activeCat.id);
    if (idx < 0) return;
    const nextIdx = (idx + dir + list.length) % list.length;
    const next = list[nextIdx];
    setActiveCat({ kind: activeCat.kind, id: next.id, name: next.name });
  };

  return (
    <section
      id="categories"
      className="section-scroll-target relative py-24 md:py-40 bg-[#0a0a10] overflow-hidden"
    >
      <div className="absolute -top-32 left-1/4 h-72 w-[60%] rounded-full bg-royal/8 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="text-gold text-[10px] tracking-[0.34em] uppercase font-medium">
            Browse By Category
          </div>
          <h2 className="mt-5 font-heading text-cream text-4xl md:text-6xl tracking-tight heading-underline heading-underline-center">
            Find Your Frame
          </h2>
          <p className="mt-10 text-cream/65 text-base md:text-lg leading-relaxed">
            Explore our photography and cinematography work, organised by
            category. Select any collection to see the full gallery.
          </p>
        </motion.div>

        {/* Toggle tabs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 flex items-center justify-center"
        >
          <div className="inline-flex items-center rounded-full border border-gold/25 bg-black/40 backdrop-blur-md p-1">
            {([
              ["photos", "Photography"],
              ["videos", "Films & Videos"],
            ] as const).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`relative px-5 sm:px-6 py-2.5 rounded-full text-[11px] sm:text-xs tracking-[0.22em] uppercase font-heading transition-colors ${
                  tab === k
                    ? "bg-gold text-ink"
                    : "text-cream/65 hover:text-gold"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Grid */}
        <div className="mt-14">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] rounded-lg bg-gold/5 border border-gold/10 animate-pulse"
                />
              ))}
            </div>
          ) : cats.length === 0 ? (
            <div className="text-center text-cream/55 py-12">
              No categories published yet. Please check back soon.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {cats.map((c, i) => {
                const featuredPhoto = tab === "photos" ? (c as PhotoCat).photos?.[0] : undefined;
                const featuredVideo = tab === "videos" ? (c as VideoCat).videos?.[0] : undefined;
                return (
                  <CategoryCard
                    key={c.id}
                    name={c.name}
                    slug={c.slug}
                    description={c.description || CATEGORY_DESCRIPTIONS[c.slug] || "Explore a curated collection from Images Production."}
                    count={tab === "photos" ? (c as PhotoCat)._count?.photos ?? 0 : (c as VideoCat)._count?.videos ?? 0}
                    kind={tab}
                    featuredPhoto={featuredPhoto}
                    featuredVideo={featuredVideo}
                    reduce={!!reduce}
                    delay={(i % 4) * 0.08}
                    onClick={() => openCategory(tab, c)}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Category modal */}
      <CategoryModal
        active={activeCat}
        onClose={() => setActiveCat(null)}
        onCycle={cycleCategory}
        whatsapp={whatsapp}
      />
    </section>
  );
}

/* ---------------- Category Card ---------------- */
function CategoryCard({
  name,
  slug,
  description,
  count,
  kind,
  featuredPhoto,
  featuredVideo,
  reduce,
  delay,
  onClick,
}: {
  name: string;
  slug: string;
  description: string;
  count: number;
  kind: TabKind;
  featuredPhoto?: Pick<Photo, "id" | "title" | "imageUrl">;
  featuredVideo?: Pick<Video, "id" | "title" | "videoUrl" | "thumbnailUrl">;
  reduce: boolean;
  delay: number;
  onClick: () => void;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
      className="group relative w-full text-left rounded-2xl border border-gold/20 bg-[#0b0b11] overflow-hidden transition-all duration-500 hover:border-gold/50 hover:-translate-y-1"
    >
      <button
        type="button"
        onClick={onClick}
        aria-label={`Quick view ${name}`}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-[#08080b] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-gold"
      >
        {kind === "photos" && featuredPhoto ? (
          <img
            src={featuredPhoto.imageUrl}
            alt={featuredPhoto.title || name}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.04] group-hover:saturate-110"
          />
        ) : kind === "videos" && featuredVideo ? (
          <CategoryVideoPreview
            src={featuredVideo.videoUrl}
            poster={featuredVideo.thumbnailUrl || VIDEO_POSTERS[slug]}
            title={featuredVideo.title}
            reduce={reduce}
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
          <div className="mb-2 inline-flex items-center rounded-full border border-white/20 bg-black/35 px-3 py-1 text-[10px] tracking-[0.18em] uppercase text-cream/85 backdrop-blur-sm">
            {count} {kind === "photos" ? (count === 1 ? "photo" : "photos") : (count === 1 ? "video" : "videos")}
          </div>
          <h3 className="font-heading text-cream text-2xl md:text-3xl leading-tight tracking-tight">
            {name}
          </h3>
        </div>
      </button>

      <div className="flex min-h-36 flex-col justify-between gap-5 p-5 sm:p-6">
        <p className="text-sm leading-relaxed text-cream/65 line-clamp-3">
          {description}
        </p>
        <div className="flex items-center justify-between gap-4">
          <Link
            href={`/portfolio/${kind}/${encodeURIComponent(slug)}`}
            className="inline-flex items-center gap-2 rounded-full bg-gold px-4 py-2 text-[10px] font-medium tracking-[0.16em] uppercase text-ink transition-colors hover:bg-cream focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b11]"
          >
            Explore Category
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
          <ChevronRight className="h-5 w-5 text-gold transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </motion.article>
  );
}

function CategoryVideoPreview({
  src,
  poster,
  title,
  reduce,
}: {
  src: string;
  poster?: string;
  title: string;
  reduce: boolean;
}) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = React.useState(false);
  const [failed, setFailed] = React.useState(false);
  const [videoReady, setVideoReady] = React.useState(false);
  const [framePoster, setFramePoster] = React.useState<string | undefined>(poster);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const pause = () => {
      video.pause();
      if (video.currentTime > 0) video.currentTime = 0;
    };
    pauseCategoryPreviews.add(pause);

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting && entry.intersectionRatio >= 0.25),
      { threshold: [0, 0.25, 0.5], rootMargin: "80px" }
    );
    observer.observe(video);
    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") pause();
      else if (video.getBoundingClientRect().bottom > 0 && video.getBoundingClientRect().top < window.innerHeight) {
        setVisible(true);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      pause();
      pauseCategoryPreviews.delete(pause);
    };
  }, []);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || failed) return;
    if (!visible || reduce || document.visibilityState !== "visible") {
      video.pause();
      return;
    }

    pauseAllCategoryPreviews();
    video.play().catch(() => video.pause());
  }, [visible, reduce, failed]);

  const capturePoster = () => {
    const video = videoRef.current;
    if (!video || framePoster || video.videoWidth === 0) return;
    try {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
      setFramePoster(canvas.toDataURL("image/jpeg", 0.78));
    } catch {
      // The video remains visible as the preview if the browser blocks poster capture.
    }
  };

  if (failed && framePoster) {
    return (
      <img
        src={framePoster}
        alt={title}
        className="absolute inset-0 h-full w-full object-cover"
      />
    );
  }

  return (
    <>
      {framePoster && !failed && (
        <img
          src={framePoster}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
      {!failed && (
        <video
          ref={videoRef}
          src={src}
          poster={framePoster}
          muted
          autoPlay
          loop
          playsInline
          preload="none"
          aria-label={`${title} video preview`}
          onLoadedData={() => {
            capturePoster();
            setVideoReady(true);
          }}
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${framePoster && !videoReady ? "opacity-0" : "opacity-100"}`}
        />
      )}
      {failed && !framePoster && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#16131a] to-[#08080b]" aria-hidden="true" />
      )}
    </>
  );
}

/* ---------------- Category Album Modal ---------------- */
function CategoryModal({
  active,
  onClose,
  onCycle,
  whatsapp,
}: {
  active: ActiveCat | null;
  onClose: () => void;
  onCycle: (dir: 1 | -1) => void;
  whatsapp: string;
}) {
  const [items, setItems] = React.useState<Photo[] | Video[]>([]);
  const [loading, setLoading] = React.useState(false);
  const reduce = useReducedMotion();

  React.useEffect(() => {
    if (!active) {
      setItems([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setItems([]);
    (async () => {
      const url =
        active.kind === "photos"
          ? `/api/photography/photos?categoryId=${encodeURIComponent(active.id)}`
          : `/api/videos?categoryId=${encodeURIComponent(active.id)}`;
      const data = await apiGetSafe<{ photos?: Photo[]; videos?: Video[] }>(url);
      if (!cancelled && data) {
        setItems(
          active.kind === "photos"
            ? (data.photos as Photo[]) ?? []
            : (data.videos as Video[]) ?? []
        );
      }
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [active]);

  const open = active !== null;
  const count = items.length;
  const kind = active?.kind;
  const subtitle =
    loading
      ? "Loading…"
      : count > 0
        ? `${count} ${kind === "videos" ? "film" : "frame"}${count === 1 ? "" : "s"}`
        : "Curated collection — coming soon";

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-7xl max-h-[85vh] bg-[#0a0a10] border-gold/30 text-cream p-0 overflow-hidden flex flex-col">
        <DialogTitle className="sr-only">
          {active?.name ?? "Category"}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {active
            ? `${kind === "videos" ? "Curated films" : "Curated frames"} from ${active.name}.`
            : "Category album"}
        </DialogDescription>

        {/* Modal header strip */}
        <div className="px-6 md:px-10 pt-8 pb-5 border-b border-gold/15 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="text-gold text-[10px] tracking-[0.32em] uppercase font-medium">
              {kind === "videos" ? "Films Category" : "Photography Category"}
            </div>
            <h3 className="mt-1.5 font-heading text-cream text-2xl md:text-4xl tracking-tight truncate">
              {active?.name}
            </h3>
            <div className="mt-1.5 text-cream/55 text-xs sm:text-sm tracking-[0.18em] uppercase">
              {subtitle}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Prev category chevron */}
            <button
              onClick={() => onCycle(-1)}
              aria-label="Previous category"
              className="h-9 w-9 rounded-full border border-gold/25 text-cream/70 hover:text-gold hover:border-gold/55 transition-colors inline-flex items-center justify-center"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            {/* Next category chevron */}
            <button
              onClick={() => onCycle(1)}
              aria-label="Next category"
              className="h-9 w-9 rounded-full border border-gold/25 text-cream/70 hover:text-gold hover:border-gold/55 transition-colors inline-flex items-center justify-center"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            {/* Close × */}
            <button
              onClick={onClose}
              aria-label="Close album"
              className="h-9 w-9 rounded-full border border-gold/25 text-cream/70 hover:text-gold hover:border-gold/55 transition-colors inline-flex items-center justify-center"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Modal body — vertical scroll with custom scrollbar */}
        <div className="px-6 md:px-10 py-6 overflow-y-auto scrollbar-cinematic flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/5] rounded-lg bg-gold/5 border border-gold/10 animate-pulse"
                />
              ))}
            </div>
          ) : count === 0 ? (
            <EmptyAlbum kind={kind!} whatsapp={whatsapp} />
          ) : kind === "photos" ? (
            <PhotoAlbum items={items as Photo[]} whatsapp={whatsapp} reduce={!!reduce} />
          ) : (
            <VideoAlbum items={items as Video[]} whatsapp={whatsapp} reduce={!!reduce} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Photography album — masonry ---------------- */
function PhotoAlbum({
  items,
  whatsapp,
  reduce,
}: {
  items: Photo[];
  whatsapp: string;
  reduce: boolean;
}) {
  const [lightboxIdx, setLightboxIdx] = React.useState<number | null>(null);

  const next = () =>
    setLightboxIdx((i) => (i === null ? i : (i + 1) % items.length));
  const prev = () =>
    setLightboxIdx((i) => (i === null ? i : (i - 1 + items.length) % items.length));

  React.useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx, items.length]);

  return (
    <>
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
        }}
        className="columns-1 sm:columns-2 lg:columns-3 gap-5"
      >
        {items.map((p, i) => (
          <PhotoTile
            key={p.id}
            photo={p}
            reduce={reduce}
            onClick={() => setLightboxIdx(i)}
          />
        ))}
      </motion.div>

      {/* Nested lightbox */}
      <Dialog
        open={lightboxIdx !== null}
        onOpenChange={(o) => !o && setLightboxIdx(null)}
      >
        <DialogContent className="max-w-5xl bg-black/95 border-gold/30 text-cream p-0 overflow-hidden">
          <DialogTitle className="sr-only">Photograph</DialogTitle>
          <DialogDescription className="sr-only">
            Full size view of the selected photograph.
          </DialogDescription>
          {lightboxIdx !== null && items[lightboxIdx] && (
            <LightboxBody
              item={items[lightboxIdx]}
              kind="photos"
              hasNext={items.length > 1}
              onPrev={prev}
              onNext={next}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/* Single photo tile in the masonry — natural aspect ratio, hover caption */
function PhotoTile({
  photo,
  reduce,
  onClick,
}: {
  photo: Photo;
  reduce: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group relative w-full mb-5 rounded-lg overflow-hidden border border-gold/15 hover:border-gold/55 transition-all duration-500 text-left break-inside-avoid block"
    >
      <img
        src={photo.imageUrl}
        alt={photo.title}
        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.02]"
      />
      {/* Hover caption slide-up */}
      <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
        <div className="font-heading italic text-cream text-sm sm:text-base">
          {photo.title}
        </div>
        {photo.description && (
          <p className="mt-1 text-cream/65 text-xs leading-relaxed line-clamp-2">
            {photo.description}
          </p>
        )}
      </div>
    </motion.button>
  );
}

/* ---------------- Films album — responsive grid ---------------- */
function VideoAlbum({
  items,
  whatsapp,
  reduce,
}: {
  items: Video[];
  whatsapp: string;
  reduce: boolean;
}) {
  const [lightboxIdx, setLightboxIdx] = React.useState<number | null>(null);

  const next = () =>
    setLightboxIdx((i) => (i === null ? i : (i + 1) % items.length));
  const prev = () =>
    setLightboxIdx((i) => (i === null ? i : (i - 1 + items.length) % items.length));

  React.useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIdx(null);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxIdx, items.length]);

  return (
    <>
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
        }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
      >
        {items.map((v, i) => (
          <VideoTile
            key={v.id}
            video={v}
            reduce={reduce}
            onClick={() => setLightboxIdx(i)}
          />
        ))}
      </motion.div>

      {/* Nested video lightbox */}
      <Dialog
        open={lightboxIdx !== null}
        onOpenChange={(o) => !o && setLightboxIdx(null)}
      >
        <DialogContent className="max-w-5xl bg-black/95 border-gold/30 text-cream p-0 overflow-hidden">
          <DialogTitle className="sr-only">Film</DialogTitle>
          <DialogDescription className="sr-only">
            Plays the selected film in a lightbox.
          </DialogDescription>
          {lightboxIdx !== null && items[lightboxIdx] && (
            <LightboxBody
              item={items[lightboxIdx]}
              kind="videos"
              hasNext={items.length > 1}
              onPrev={prev}
              onNext={next}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/* Single video tile — thumbnail (or clay reel) + play overlay + duration badge */
function VideoTile({
  video,
  reduce,
  onClick,
}: {
  video: Video;
  reduce: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="group relative text-left rounded-lg overflow-hidden border border-gold/15 hover:border-gold/55 hover:-translate-y-1 transition-all duration-500 bg-black/40"
    >
      {/* Thumbnail zone (16:9) */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-[#0d0e15] via-[#0a0a12] to-[#08080b]">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(65,105,225,0.12), transparent 55%)",
          }}
        />
        {video.thumbnailUrl ? (
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={reduce ? undefined : { rotate: [0, 6, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="transition-transform duration-700 group-hover:scale-105"
            >
              <ClayFilmReel size={96} />
            </motion.div>
          </div>
        )}

        {/* Play overlay — gold triangle in circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="h-14 w-14 rounded-full bg-black/40 backdrop-blur-md border border-gold/45 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-gold/20 group-hover:border-gold">
            <Play className="h-5 w-5 text-gold ml-0.5" />
          </span>
        </div>

        {/* Duration badge */}
        {video.duration && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md border border-gold/45 text-[10px] tracking-[0.18em] uppercase text-gold/90 inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {video.duration}
          </div>
        )}
      </div>

      {/* Title row */}
      <div className="px-4 py-4">
        <div className="text-[10px] uppercase tracking-[0.3em] text-gold/85">
          {video.category?.name}
        </div>
        <div className="mt-1 font-heading text-cream text-base sm:text-lg tracking-tight line-clamp-1">
          {video.title}
        </div>
        {video.description && (
          <p className="mt-1 text-cream/60 text-xs leading-relaxed line-clamp-2">
            {video.description}
          </p>
        )}
      </div>
    </motion.button>
  );
}

/* ---------------- Lightbox body — single item with prev/next ---------------- */
function LightboxBody({
  item,
  kind,
  hasNext,
  onPrev,
  onNext,
}: {
  item: Photo | Video;
  kind: TabKind;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
}) {
  const video = item as Video;
  const photo = item as Photo;
  return (
    <div className="relative">
      {kind === "photos" ? (
        <img
          src={photo.imageUrl}
          alt={photo.title}
          className="max-h-[78vh] w-full object-contain bg-black"
        />
      ) : (
        <div className="aspect-video bg-black">
          <FilmFrame url={video.videoUrl} />
        </div>
      )}
      <div className="px-6 py-4 bg-black/80 border-t border-gold/15">
        <div className="text-[10px] uppercase tracking-[0.3em] text-gold/85">
          {item.category?.name}
        </div>
        <div className="font-heading text-cream text-xl mt-1">{item.title}</div>
        {item.description && (
          <p className="mt-2 text-cream/65 text-sm leading-relaxed">
            {item.description}
          </p>
        )}
      </div>
      {hasNext && (
        <>
          <button
            onClick={onPrev}
            aria-label="Previous"
            className="absolute top-1/2 left-3 -translate-y-1/2 h-10 w-10 rounded-full bg-gold/15 hover:bg-gold/30 backdrop-blur-md flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button
            onClick={onNext}
            aria-label="Next"
            className="absolute top-1/2 right-3 -translate-y-1/2 h-10 w-10 rounded-full bg-gold/15 hover:bg-gold/30 backdrop-blur-md flex items-center justify-center"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </>
      )}
    </div>
  );
}

function FilmFrame({ url }: { url: string }) {
  const src = getEmbedSrc(url);
  if (!src) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-cream/60 text-sm">
        <Play className="h-6 w-6 text-gold" />
        Video URL not embeddable.{" "}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-gold underline"
        >
          Open in new tab
        </a>
      </div>
    );
  }
  const isFile = /\.(mp4|webm|mov|ogg)$/i.test(url);
  if (isFile) {
    return <video src={src} controls className="w-full h-full object-contain bg-black" />;
  }
  return (
    <iframe
      src={src}
      title="Video player"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="w-full h-full"
    />
  );
}

/* ---------------- Empty album state ---------------- */
function EmptyAlbum({
  kind,
  whatsapp,
}: {
  kind: TabKind;
  whatsapp: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-xl text-center py-16 sm:py-20"
    >
      <div className="flex items-center justify-center mb-8">
        {kind === "photos" ? (
          <ClayPhotoFrame size={200} />
        ) : (
          <ClayFilmReel size={170} />
        )}
      </div>
      <h4 className="font-heading text-cream text-2xl md:text-3xl tracking-tight">
        This collection is being curated.
      </h4>
      <p className="mt-4 text-cream/65 text-sm md:text-base leading-relaxed max-w-md mx-auto">
        We&apos;re hand-picking the finest frames for this collection. Reach out to
        discuss your project — we&apos;d love to bring your story to life.
      </p>
      <div className="mt-7">
        <a
          href={buildWhatsAppLink(
            whatsapp,
            "Hi Images Production, I'd like to discuss a project for this category."
          )}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="bg-gold text-ink hover:bg-gold/90 rounded-full px-6 py-3 font-heading tracking-[0.18em] text-xs uppercase">
            <MessageCircle className="h-4 w-4 mr-2" />
            Enquire on WhatsApp
          </Button>
        </a>
      </div>
    </motion.div>
  );
}
