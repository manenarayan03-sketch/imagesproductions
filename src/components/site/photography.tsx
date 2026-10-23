"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ClayPhotoFrame } from "@/components/clay";
import { apiGetSafe, buildWhatsAppLink, scrollToId } from "@/lib/site-utils";

type Category = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  order: number;
  _count: { photos: number };
};

type Photo = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  categoryId: string;
  order: number;
  category: { id: string; name: string; slug: string };
};

export function Photography({ whatsapp }: { whatsapp: string }) {
  const [cats, setCats] = React.useState<Category[]>([]);
  const [photos, setPhotos] = React.useState<Photo[]>([]);
  const [activeCat, setActiveCat] = React.useState<string>("all");
  const [loading, setLoading] = React.useState(true);
  const [lightboxIdx, setLightboxIdx] = React.useState<number | null>(null);

  React.useEffect(() => {
    (async () => {
      const data = await apiGetSafe<{ categories: Category[] }>(
        "/api/photography/categories"
      );
      if (data) setCats(data.categories);
      const photosResp = await apiGetSafe<{ photos: Photo[] }>(
        "/api/photography/photos"
      );
      if (photosResp) setPhotos(photosResp.photos);
      setLoading(false);
    })();
  }, []);

  const filtered =
    activeCat === "all"
      ? photos
      : photos.filter((p) => p.categoryId === activeCat);

  const openLightbox = (i: number) => setLightboxIdx(i);
  const closeLightbox = () => setLightboxIdx(null);
  const next = () =>
    setLightboxIdx((i) => (i === null ? i : (i + 1) % filtered.length));
  const prev = () =>
    setLightboxIdx((i) =>
      i === null ? i : (i - 1 + filtered.length) % filtered.length
    );

  React.useEffect(() => {
    if (lightboxIdx === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
     
  }, [lightboxIdx, filtered.length]);

  return (
    <section
      id="photography"
      className="section-scroll-target relative py-24 md:py-40 bg-[#0a0a10] overflow-hidden"
    >
      <div className="absolute -top-32 right-1/4 h-72 w-[60%] rounded-full bg-royal/8 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="text-gold text-[10px] sm:text-xs tracking-[0.34em] uppercase font-medium">
            Photography
          </div>
          <h2 className="mt-5 font-heading text-cream text-4xl md:text-6xl tracking-tight heading-underline heading-underline-center">
            Our Captured Stories
          </h2>
          <p className="mt-10 text-cream/70 text-base md:text-lg leading-relaxed">
            Authentic frames from real celebrations, crafted with intention.
          </p>
        </motion.div>

        {/* Category filter bar */}
        {!loading && cats.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="mt-14 flex flex-wrap items-center justify-center gap-2"
          >
            <CatChip
              active={activeCat === "all"}
              onClick={() => setActiveCat("all")}
              label="All"
              count={photos.length}
            />
            {cats.map((c) => (
              <CatChip
                key={c.id}
                active={activeCat === c.id}
                onClick={() => setActiveCat(c.id)}
                label={c.name}
                count={c._count?.photos ?? 0}
              />
            ))}
          </motion.div>
        )}

        {/* Portfolio or empty state */}
        <div className="mt-14">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 rounded-2xl bg-gold/5 border border-gold/10 animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyPhotography whatsapp={whatsapp} />
          ) : (
            <div className="masonry columns-1 sm:columns-2 lg:columns-3 scrollbar-cinematic">
              {filtered.map((p, i) => (
                <motion.button
                  key={p.id}
                  type="button"
                  onClick={() => openLightbox(i)}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="group relative w-full rounded-xl overflow-hidden border border-gold/15 bg-black/40 text-left"
                >
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent opacity-90" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-gold/85">
                      {p.category.name}
                    </div>
                    <div className="font-heading text-cream text-lg sm:text-xl mt-1">
                      {p.title}
                    </div>
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

      {/* Lightbox */}
      <Dialog open={lightboxIdx !== null} onOpenChange={(o) => !o && closeLightbox()}>
        <DialogContent className="max-w-5xl bg-black/95 border-gold/25 text-cream p-0 overflow-hidden">
          <DialogTitle className="sr-only">Photograph</DialogTitle>
          <DialogDescription className="sr-only">
            Full size view of the selected photograph.
          </DialogDescription>
          {lightboxIdx !== null && filtered[lightboxIdx] && (
            <div className="relative">
              { }
              <img
                src={filtered[lightboxIdx].imageUrl}
                alt={filtered[lightboxIdx].title}
                className="max-h-[80vh] w-full object-contain bg-black"
              />
              <div className="px-6 py-4 bg-black/80 border-t border-gold/15">
                <div className="text-[10px] uppercase tracking-[0.3em] text-gold/85">
                  {filtered[lightboxIdx].category.name}
                </div>
                <div className="font-heading text-cream text-xl mt-1">
                  {filtered[lightboxIdx].title}
                </div>
                {filtered[lightboxIdx].description && (
                  <p className="mt-2 text-cream/65 text-sm leading-relaxed">
                    {filtered[lightboxIdx].description}
                  </p>
                )}
              </div>
              {filtered.length > 1 && (
                <>
                  <button
                    onClick={prev}
                    aria-label="Previous"
                    className="absolute top-1/2 left-3 -translate-y-1/2 h-10 w-10 rounded-full bg-gold/15 hover:bg-gold/30 backdrop-blur-md flex items-center justify-center"
                  >
                    ‹
                  </button>
                  <button
                    onClick={next}
                    aria-label="Next"
                    className="absolute top-1/2 right-3 -translate-y-1/2 h-10 w-10 rounded-full bg-gold/15 hover:bg-gold/30 backdrop-blur-md flex items-center justify-center"
                  >
                    ›
                  </button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}

function CatChip({
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
      className={`group inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] sm:text-xs tracking-[0.18em] uppercase transition-all border ${
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

function EmptyPhotography({ whatsapp }: { whatsapp: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="mx-auto max-w-2xl text-center glass-card rounded-3xl p-8 sm:p-12 border border-gold/20"
    >
      <div className="flex items-center justify-center mb-6">
        <ClayPhotoFrame size={220} />
      </div>
      <h3 className="font-heading text-cream text-2xl sm:text-3xl tracking-wide">
        OUR WORK, OUR STORIES
      </h3>
      <p className="mt-4 text-cream/65 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
        Our portfolio is being updated with selected work from Images
        Production. Please contact us to discuss your photography
        requirements.
      </p>
      <div className="mt-8">
        <a
          href={buildWhatsAppLink(
            whatsapp,
            "Hi Images Production, I'd like to discuss your photography portfolio and book a session."
          )}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="bg-gold text-ink hover:bg-gold/90 rounded-full px-6 py-3 font-heading tracking-[0.16em] text-xs uppercase">
            <MessageCircle className="h-4 w-4 mr-2" />
            Enquire on WhatsApp
          </Button>
        </a>
      </div>
    </motion.div>
  );
}
