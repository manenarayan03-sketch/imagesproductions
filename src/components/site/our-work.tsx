"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Camera, Film, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClayPhotoFrame, ClayFilmReel } from "@/components/clay";
import { apiGetSafe, buildWhatsAppLink, scrollToId } from "@/lib/site-utils";

type Photo = {
  id: string;
  title: string;
  imageUrl: string;
  category: { id: string; name: string };
};

type Video = {
  id: string;
  title: string;
  thumbnailUrl?: string | null;
  category: { id: string; name: string };
};

export function OurWork({ whatsapp }: { whatsapp: string }) {
  const [tab, setTab] = React.useState<"all" | "photos" | "videos">("all");
  const [photos, setPhotos] = React.useState<Photo[]>([]);
  const [videos, setVideos] = React.useState<Video[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      const [p, v] = await Promise.all([
        apiGetSafe<{ photos: Photo[] }>("/api/photography/photos"),
        apiGetSafe<{ videos: Video[] }>("/api/videos"),
      ]);
      if (p) setPhotos(p.photos);
      if (v) setVideos(v.videos);
      setLoading(false);
    })();
  }, []);

  const total = photos.length + videos.length;

  return (
    <section
      id="our-work"
      className="section-scroll-target relative py-24 sm:py-32 cinematic-radial overflow-hidden"
    >
      <div className="absolute -top-32 right-1/3 h-72 w-[60%] rounded-full bg-violet/10 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 text-gold text-[10px] sm:text-xs tracking-[0.34em] uppercase">
            <span className="h-px w-8 bg-gold/60" />
            Selected Work
            <span className="h-px w-8 bg-gold/60" />
          </div>
          <h2 className="mt-5 font-heading text-cream text-4xl sm:text-5xl md:text-6xl text-balance">
            Our Work
          </h2>
          <p className="mt-4 text-cream/65 text-base sm:text-lg">
            A single stage for the photographs and films we craft — curated,
            framed, and ready to share.
          </p>
        </motion.div>

        {/* Tabs */}
        {!loading && total > 0 && (
          <div className="mt-10 flex items-center justify-center gap-2">
            {([
              ["all", "All"],
              ["photos", "Photography"],
              ["videos", "Films"],
            ] as const).map(([k, label]) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={`px-4 py-2 rounded-full text-[11px] sm:text-xs tracking-[0.18em] uppercase border transition-all ${
                  tab === k
                    ? "bg-gold text-ink border-gold"
                    : "bg-transparent text-cream/70 border-gold/20 hover:border-gold/50 hover:text-gold"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {/* Empty / showcase */}
        <div className="mt-12">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-video rounded-2xl bg-gold/5 border border-gold/10 animate-pulse"
                />
              ))}
            </div>
          ) : total === 0 ? (
            <EmptyOurWork whatsapp={whatsapp} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {tab !== "videos" &&
                photos.map((p, i) => (
                  <motion.button
                    key={p.id}
                    onClick={() => scrollToId("photography")}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-gold/15"
                  >
                    { }
                    <img
                      src={p.imageUrl}
                      alt={p.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 p-4">
                      <div className="text-[10px] uppercase tracking-[0.3em] text-gold/85 flex items-center gap-1">
                        <Camera className="h-3 w-3" /> {p.category.name}
                      </div>
                      <div className="font-heading text-cream text-lg mt-1">
                        {p.title}
                      </div>
                    </div>
                  </motion.button>
                ))}
              {tab !== "photos" &&
                videos.map((v, i) => (
                  <motion.button
                    key={v.id}
                    onClick={() => scrollToId("films")}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: i * 0.05 }}
                    className="group relative aspect-video rounded-2xl overflow-hidden border border-gold/15"
                  >
                    {v.thumbnailUrl ? (
                       
                      <img
                        src={v.thumbnailUrl}
                        alt={v.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-royal/40 via-violet/20 to-ink" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 p-4">
                      <div className="text-[10px] uppercase tracking-[0.3em] text-gold/85 flex items-center gap-1">
                        <Film className="h-3 w-3" /> {v.category.name}
                      </div>
                      <div className="font-heading text-cream text-lg mt-1">
                        {v.title}
                      </div>
                    </div>
                  </motion.button>
                ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function EmptyOurWork({ whatsapp }: { whatsapp: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="mx-auto max-w-3xl text-center glass-card rounded-3xl p-8 sm:p-12 border border-gold/20"
    >
      <div className="flex items-center justify-center gap-6 mb-6">
        <ClayPhotoFrame size={140} />
        <ClayFilmReel size={120} />
      </div>
      <h3 className="font-heading text-cream text-2xl sm:text-3xl tracking-wide">
        OUR SELECTED WORK IS COMING SOON
      </h3>
      <p className="mt-4 text-cream/65 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
        Our portfolio of selected photographs and films is being curated.
        Visit the dedicated{" "}
        <button
          className="text-gold underline decoration-gold/40 hover:decoration-gold"
          onClick={() =>
            document
              .getElementById("photography")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          Photography
        </button>{" "}
        and{" "}
        <button
          className="text-gold underline decoration-gold/40 hover:decoration-gold"
          onClick={() =>
            document
              .getElementById("films")
              ?.scrollIntoView({ behavior: "smooth" })
          }
        >
          Films
        </button>{" "}
        sections, or contact us to begin your project.
      </p>
      <div className="mt-8">
        <a
          href={buildWhatsAppLink(
            whatsapp,
            "Hi Images Production, I'd like to see examples of your work and discuss a project."
          )}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button className="bg-gold text-ink hover:bg-gold/90 rounded-full px-6 py-3 font-heading tracking-[0.16em] text-xs uppercase">
            <MessageCircle className="h-4 w-4 mr-2" />
            Start a Project
          </Button>
        </a>
      </div>
    </motion.div>
  );
}
