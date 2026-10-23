"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  Clapperboard,
  Film,
  Heart,
  MessageCircle,
  Scissors,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/site-utils";

const SERVICES: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: "Wedding Photography",
    description:
      "Emotion-rich imagery shaped to preserve the beauty of your story with editorial feeling.",
    icon: Camera,
  },
  {
    title: "Wedding Cinematography",
    description:
      "Modern cinematic films that turn rituals, movement, and emotion into a living memory.",
    icon: Film,
  },
  {
    title: "Pre-Wedding",
    description:
      "A thoughtfully staged visual narrative built around chemistry, atmosphere, and intimacy.",
    icon: Heart,
  },
  {
    title: "Engagement",
    description:
      "Warm portraits and cinematic moments that reflect the beginning of your next chapter.",
    icon: Sparkles,
  },
  {
    title: "Events",
    description:
      "High-energy event coverage designed to keep the atmosphere, details, and joy alive.",
    icon: CalendarDays,
  },
  {
    title: "Reels & Social Media Content",
    description:
      "Platform-ready content that feels premium, quick, and visually magnetic for social reach.",
    icon: Clapperboard,
  },
  {
    title: "Video Editing",
    description:
      "Refined storytelling and pacing for films that feel polished, emotional, and immersive.",
    icon: Scissors,
  },
  {
    title: "Product / Brand Content",
    description:
      "Luxury visual packaging for brands that need content with texture, style, and clarity.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Custom Production",
    description:
      "Tailored creative direction for unique concepts, branded narratives, and special productions.",
    icon: Sparkles,
  },
];

export function Services({ whatsapp }: { whatsapp: string }) {
  return (
    <section
      id="services"
      className="section-scroll-target relative overflow-hidden bg-[#08080d] py-24 sm:py-32"
    >
      <div className="pointer-events-none absolute -left-40 top-1/4 h-96 w-96 rounded-full bg-violet/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-electric/10 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >
          <div className="inline-flex items-center gap-3 text-[10px] uppercase tracking-[0.34em] text-gold sm:text-xs">
            <span className="h-px w-8 bg-gold/60" />
            Our Services
            <span className="h-px w-8 bg-gold/60" />
          </div>
          <h2 className="mt-5 font-heading text-4xl text-cream sm:text-5xl md:text-6xl">
            Crafted for Memorable Stories
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-cream/60 sm:text-lg">
            Thoughtful photography, films, and creative production for every story worth keeping.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, index) => {
            const Icon = service.icon;
            return (
              <motion.article
                key={service.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: (index % 3) * 0.07 }}
                className="group relative flex min-h-64 flex-col overflow-hidden rounded-2xl border border-gold/15 bg-white/[0.025] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold/40 hover:bg-white/[0.045] sm:p-7"
              >
                <div className="flex items-start justify-between">
                  <span className="font-heading text-sm tracking-[0.2em] text-gold/75">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="flex h-11 w-11 items-center justify-center rounded-full border border-gold/20 bg-gold/5 text-gold transition-colors group-hover:bg-gold group-hover:text-ink">
                    <Icon className="h-5 w-5" />
                  </span>
                </div>

                <h3 className="mt-8 font-heading text-xl text-cream sm:text-2xl">
                  {service.title}
                </h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-cream/60">
                  {service.description}
                </p>

                <a
                  href={buildWhatsAppLink(
                    whatsapp,
                    `Hi Images Production, I'm interested in ${service.title}.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex w-fit items-center gap-2 text-[10px] font-medium uppercase tracking-[0.18em] text-gold transition-colors hover:text-cream"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Enquire about this service
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
