"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ArrowRight } from "lucide-react";
import { scrollToId } from "@/lib/site-utils";

/* ------------ URL detection helpers (kept local for clarity) ------------ */

const YOUTUBE_RE =
  /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([\w-]{11})/;
const VIMEO_RE = /vimeo\.com\/(?:video\/)?(\d+)/;
const FILE_RE = /\.(mp4|webm|mov|ogg)$/i;

type HeroVideo =
  | { kind: "file"; src: string }
  | { kind: "youtube"; id: string }
  | { kind: "vimeo"; id: string }
  | null;

function parseHeroVideo(url: string | null | undefined): HeroVideo {
  const u = (url || "").trim();
  if (!u) return null;
  if (FILE_RE.test(u)) return { kind: "file", src: u };
  const yt = u.match(YOUTUBE_RE);
  if (yt) return { kind: "youtube", id: yt[1] };
  const vm = u.match(VIMEO_RE);
  if (vm) return { kind: "vimeo", id: vm[1] };
  return null;
}

/* ---------------- Hero component ---------------- */

export function Hero({
  headline = "IMAGES PRODUCTION",
  subtext = "Photography • Videography • Video Editing",
  tagline = "Frames Alive with Imagination",
  primaryCta = "VIEW OUR WORK",
  secondaryCta = "CONTACT US",
  heroVideoUrl = null,
}: {
  headline?: string;
  subtext?: string;
  tagline?: string;
  primaryCta?: string;
  secondaryCta?: string;
  whatsapp?: string;
  heroVideoUrl?: string | null;
}) {
  const reduce = useReducedMotion();
  const [curtainOpen, setCurtainOpen] = React.useState(false);
  const video = parseHeroVideo(heroVideoUrl);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setCurtainOpen(true), 250);
    return () => clearTimeout(t);
  }, []);

  // Respect reduced-motion: pause any <video> element if reduced motion is preferred.
  React.useEffect(() => {
    if (!videoRef.current) return;
    if (reduce) {
      videoRef.current.pause();
    } else {
      // Try to play; ignore rejection (autoplay policies)
      const p = videoRef.current.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    }
  }, [reduce, video]);

  const stagger = {
    hidden: {},
    show: {
      transition: { staggerChildren: 0.08, delayChildren: 0.35 },
    },
  };
  const item = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: reduce ? 0.2 : 0.6, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section className="relative min-h-screen overflow-hidden flex items-center pt-28 pb-16 bg-ink">
      {/* ---- Background layer (video/iframe OR clean dark) ---- */}
      <HeroBackground video={video} videoRef={videoRef} reduce={!!reduce} />

      {/* Dark cinematic gradient overlay for text readability */}
      <div
        className="absolute inset-0 z-[2] pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(8,8,11,0.85) 0%, rgba(8,8,11,0.45) 35%, rgba(8,8,11,0.45) 65%, rgba(8,8,11,0.88) 100%)",
        }}
        aria-hidden
      />

      {/* Top corner gold line */}
      <div className="absolute top-24 left-0 right-0 h-px gold-divider opacity-60 z-[3]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 text-center">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={curtainOpen ? "show" : "hidden"}
          className="flex flex-col items-center"
        >
          <motion.div variants={item}>
            <div className="inline-flex items-center gap-4 text-gold font-heading italic text-xs sm:text-sm md:text-base tracking-[0.08em]">
              <span className="h-px w-8 sm:w-12 bg-gold/60" />
              {tagline}
              <span className="h-px w-8 sm:w-12 bg-gold/60" />
            </div>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-8 font-heading text-cream text-balance text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.92] tracking-tight text-glow-gold"
          >
            {headline}
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-8 font-heading italic text-cream/70 text-lg sm:text-xl md:text-2xl max-w-2xl mx-auto"
          >
            {subtext}
          </motion.p>

          <motion.div
            variants={item}
            className="mt-12 flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
          >
            <button
              onClick={() => scrollToId("categories")}
              className="btn-editorial rounded-full px-8 py-3.5 font-heading tracking-[0.22em] text-xs uppercase"
            >
              {primaryCta}
            </button>
            <button
              onClick={() => scrollToId("contact")}
              className="group inline-flex items-center gap-2 text-cream/80 hover:text-gold transition-colors text-sm tracking-[0.2em] uppercase font-heading bg-transparent border-0 cursor-pointer"
            >
              {secondaryCta}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll cue */}
      <motion.button
        onClick={() => scrollToId("about")}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-cream/55 hover:text-gold transition-colors"
        aria-label="Scroll to about"
        initial={{ opacity: 0 }}
        animate={{ opacity: curtainOpen ? 1 : 0 }}
        transition={{ delay: 1.0, duration: 0.6 }}
      >
        <span className="text-[10px] uppercase tracking-[0.32em]">Scroll</span>
        <motion.div
          animate={reduce ? {} : { y: [0, 5, 0] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.button>

      {/* Cinematic curtain overlay */}
      <motion.div
        initial={{ scaleY: 1 }}
        animate={{ scaleY: curtainOpen ? 0 : 1 }}
        transition={{ duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformOrigin: "top" }}
        className="absolute inset-0 z-30 bg-ink"
        aria-hidden
      />
    </section>
  );
}

/* ---------------- Background layer (video/iframe OR clean dark) ---------------- */

function HeroBackground({
  video,
  videoRef,
  reduce,
}: {
  video: HeroVideo;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  reduce: boolean;
}) {
  if (video?.kind === "file") {
    return (
      <div className="absolute inset-0 z-[1] bg-ink">
        <video
          ref={videoRef}
          src={video.src}
          poster=""
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden
        />
      </div>
    );
  }
  if (video?.kind === "youtube") {
    const src = `https://www.youtube.com/embed/${video.id}?autoplay=1&mute=1&loop=1&playlist=${video.id}&controls=0&showinfo=0&modestbranding=1&rel=0&disablekb=1&playsinline=1&iv_load_policy=3`;
    return (
      <div className="absolute inset-0 z-[1] bg-ink">
        {/* Dark fallback while iframe loads */}
        <div className="absolute inset-0 cinematic-clean-radial" aria-hidden />
        <iframe
          src={src}
          title="Hero background video"
          loading="lazy"
          allow="autoplay; encrypted-media; picture-in-picture; web-orientation"
          allowFullScreen={false}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            // Cover the viewport regardless of source aspect ratio
            minWidth: "100vw",
            minHeight: "100vh",
            // Center the iframe at the viewport size to mimic object-cover
            transform: "scale(1.35)",
            border: "none",
          }}
          aria-hidden
        />
        {/* pointer-events-none overlay so clicks don't trigger YouTube UI */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden />
      </div>
    );
  }
  if (video?.kind === "vimeo") {
    const src = `https://player.vimeo.com/video/${video.id}?autoplay=1&muted=1&loop=1&background=1&autopause=0`;
    return (
      <div className="absolute inset-0 z-[1] bg-ink">
        <div className="absolute inset-0 cinematic-clean-radial" aria-hidden />
        <iframe
          src={src}
          title="Hero background video"
          loading="lazy"
          allow="autoplay; fullscreen"
          allowFullScreen={false}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            minWidth: "100vw",
            minHeight: "100vh",
            transform: "scale(1.35)",
            border: "none",
          }}
          aria-hidden
        />
        <div className="absolute inset-0 pointer-events-none" aria-hidden />
      </div>
    );
  }

  // Clean dark cinematic fallback — single subtle royal-blue radial glow,
  // NO animation, NO particles, NO clay orbs.
  return (
    <div
      className="absolute inset-0 z-[1] cinematic-clean-radial"
      aria-hidden
      data-reduce={reduce ? "1" : "0"}
    />
  );
}
