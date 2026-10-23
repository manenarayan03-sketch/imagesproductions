"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Play, MessageCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ClayFilmReel } from "@/components/clay";
import {
  apiGetSafe,
  buildWhatsAppLink,
  getEmbedSrc,
  scrollToId,
} from "@/lib/site-utils";

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  order: number;
  _count: { videos: number };
};

type Video = {
  id: string;
  title: string;
  description?: string | null;
  videoUrl: string;
  thumbnailUrl?: string | null;
  duration?: string | null;
  categoryId: string;
  order: number;
  category: { id: string; name: string; slug: string };
};

export function Films({ whatsapp }: { whatsapp: string }) {
  const [cats, setCats] = React.useState<Category[]>([]);
  const [videos, setVideos] = React.useState<Video[]>([]);
  const [activeCat, setActiveCat] = React.useState<string>("all");
  const [loading, setLoading] = React.useState(true);
  const [activeIdx, setActiveIdx] = React.useState<number | null>(null);

  React.useEffect(() => {
    (async () => {
      const c = await apiGetSafe<{ categories: Category[] }>(
        "/api/videos/categories"
      );
      if (c) setCats(c.categories);
      const v = await apiGetSafe<{ videos: Video[] }>("/api/videos");
      if (v) setVideos(v.videos);
      setLoading(false);
    })();
  }, []);

  const filtered =
    activeCat === "all"
      ? videos
      : videos.filter((v) => v.categoryId === activeCat);

  return (
    <section
      id="films"
      className="section-scroll-target relative py-24 md:py-40 cinematic-radial overflow-hidden"
    >
      <div className="absolute -top-32 left-1/4 h-72 w-[60%] rounded-full bg-electric/8 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="text-gold text-[10px] sm:text-xs tracking-[0.34em] uppercase font-medium">
            Cinematography
          </div>
          <h2 className="mt-5 font-heading text-cream text-4xl md:text-6xl tracking-tight heading-underline heading-underline-center">
            Films That Move You
          </h2>
          <p className="mt-10 text-cream/70 text-base md:text-lg leading-relaxed">
            Wedding films, brand stories, music videos &amp; social reels —
            scored, paced, and crafted like cinema.
          </p>
        </motion.div>

        {!loading && cats.length > 0 && (
          <div className="mt-14 flex flex-wrap items-center justify-center gap-2">
            <FilterChip
              active={activeCat === "all"}
              onClick={() => setActiveCat("all")}
              label="All"
              count={videos.length}
            />
            {cats.map((c) => (
              <FilterChip
                key={c.id}
                active={activeCat === c.id}
                onClick={() => setActiveCat(c.id)}
                label={c.name}
                count={c._count?.videos ?? 0}
              />
            ))}
          </div>
        )}

        <div className="mt-14">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-video rounded-2xl bg-gold/5 border border-gold/10 animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyFilms whatsapp={whatsapp} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {filtered.map((v, i) => (
                <motion.button
                  key={v.id}
                  onClick={() => setActiveIdx(i)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="group relative aspect-video rounded-2xl overflow-hidden border border-gold/15 bg-black/40 text-left"
                >
                  {v.thumbnailUrl ? (
                    <img
                      src={v.thumbnailUrl}
                      alt={v.title}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-royal/40 via-violet/20 to-ink" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="h-14 w-14 rounded-full bg-gold/20 backdrop-blur-md flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:bg-gold/30">
                      <Play className="h-5 w-5 text-gold ml-0.5" />
                    </span>
                  </div>
                  <div className="absolute inset-x-0 bottom-0 p-4">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-gold/85">
                      {v.category.name}
                    </div>
                    <div className="font-heading text-cream text-lg sm:text-xl mt-1">
                      {v.title}
                    </div>
                    {v.duration && (
                      <div className="mt-1 flex items-center gap-1 text-cream/55 text-xs">
                        <Clock className="h-3 w-3" /> {v.duration}
                      </div>
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Browse all categories CTA */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 text-center"
        >
          <button
            onClick={() => scrollToId("categories")}
            className="btn-editorial rounded-full px-6 py-3 font-heading tracking-[0.18em] text-xs uppercase inline-flex items-center"
          >
            Browse all categories
          </button>
        </motion.div>
      </div>

      <Dialog
        open={activeIdx !== null}
        onOpenChange={(o) => !o && setActiveIdx(null)}
      >
        <DialogContent className="max-w-4xl bg-black/95 border-gold/25 text-cream p-0 overflow-hidden">
          <DialogTitle className="sr-only">Video</DialogTitle>
          <DialogDescription className="sr-only">
            Plays the selected film in a lightbox.
          </DialogDescription>
          {activeIdx !== null && filtered[activeIdx] && (
            <div>
              <div className="aspect-video bg-black">
                <FilmFrame url={filtered[activeIdx].videoUrl} />
              </div>
              <div className="px-6 py-4 bg-black/80 border-t border-gold/15">
                <div className="text-[10px] uppercase tracking-[0.3em] text-gold/85">
                  {filtered[activeIdx].category.name}
                </div>
                <div className="font-heading text-cream text-xl mt-1">
                  {filtered[activeIdx].title}
                </div>
                {filtered[activeIdx].description && (
                  <p className="mt-2 text-cream/65 text-sm leading-relaxed">
                    {filtered[activeIdx].description}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
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
  const isFile = /\.(mp4|webm|ogg)$/i.test(url);
  if (isFile) {
    return (
      <video src={src} controls className="w-full h-full object-contain bg-black" />
    );
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

function FilterChip({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] sm:text-xs tracking-[0.18em] uppercase transition-all border ${
        active
          ? "bg-gold text-ink border-gold"
          : "bg-transparent text-cream/70 border-gold/20 hover:border-gold/50 hover:text-gold"
      }`}
    >
      {label}
      <span
        className={`text-[9px] rounded-full px-1.5 py-0.5 ${
          active ? "bg-ink/15 text-ink/70" : "bg-gold/10 text-gold/70"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function EmptyFilms({ whatsapp }: { whatsapp: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto max-w-2xl text-center glass-card rounded-lg p-8 md:p-12 border border-gold/20"
    >
      <div className="flex items-center justify-center mb-6">
        <ClayFilmReel size={140} />
      </div>
      <h3 className="font-heading text-cream text-2xl md:text-3xl tracking-tight">
        Our Film Reel Is Being Curated
      </h3>
      <p className="mt-4 text-cream/65 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
        Our film reel is being curated with selected cinematic work. Reach
        out to discuss your film project — we would love to bring your story
        to life.
      </p>
      <div className="mt-8">
        <a
          href={buildWhatsAppLink(
            whatsapp,
            "Hi Images Production, I'd like to discuss a film project."
          )}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="bg-gold text-ink hover:bg-gold/90 rounded-full px-6 py-3 font-heading tracking-[0.16em] text-xs uppercase">
            <MessageCircle className="h-4 w-4 mr-2" />
            Discuss Your Film
          </Button>
        </a>
      </div>
    </motion.div>
  );
}
