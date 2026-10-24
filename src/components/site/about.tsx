"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWhatsAppLink, scrollToId } from "@/lib/site-utils";

type Owner = {
  name?: string;
  role?: string;
  bio?: string;
  photoUrl?: string | null;
  phone?: string;
  whatsapp?: string;
};

export function About({
  owner,
  whatsapp,
}: {
  owner: Owner | null;
  whatsapp: string;
}) {
  const reduce = useReducedMotion();

  const bio = owner?.bio
    ? owner.bio.split("\n\n").filter(Boolean)
    : [
        "Welcome to Images Production.",
        "I am Narayan Maane, Founder and Creative Director of Images Production, based in Mulund West, Mumbai.",
      ];

  const ownerName = owner?.name || "Narayan Maane";
  const ownerRole = owner?.role || "Founder & Creative Director";
  const photoUrl = owner?.photoUrl;

  return (
    <section
      id="about"
      className="section-scroll-target relative py-24 md:py-40 cinematic-radial overflow-hidden"
    >
      {/* Subtle ambient glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-[80%] rounded-full bg-royal/8 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left — Editorial framed portrait */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="order-1 flex w-full min-w-0 justify-center lg:order-1 lg:justify-start"
          >
            <EditorialPortrait
              photoUrl={photoUrl}
              name={ownerName}
              role={ownerRole}
              reduce={!!reduce}
            />
          </motion.div>

          {/* Right — Content */}
          <div className="order-2 min-w-0 lg:order-2">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="text-gold text-[10px] sm:text-xs tracking-[0.34em] uppercase font-medium">
                {ownerRole}
              </div>
              <h2 className="mt-4 font-heading text-cream text-4xl md:text-5xl lg:text-6xl tracking-tight heading-underline">
                {ownerName}
              </h2>
            </motion.div>

            <div className="mt-10 space-y-5 text-cream/70 text-base md:text-lg leading-relaxed">
              {bio.map((p, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.08 + i * 0.06 }}
                  className={
                    p.startsWith("**")
                      ? "text-gold font-heading text-lg md:text-xl tracking-wide pt-2"
                      : undefined
                  }
                >
                  {p.replace(/\*\*/g, "")}
                </motion.p>
              ))}
            </div>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <a
                href={buildWhatsAppLink(
                  whatsapp,
                  "Hi Narayan, I'd like to connect on WhatsApp about a project."
                )}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button className="bg-gold text-ink hover:bg-gold/90 rounded-full px-6 py-3 font-heading tracking-[0.18em] text-xs uppercase">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Connect on WhatsApp
                </Button>
              </a>
              <button
                onClick={() => scrollToId("categories")}
                className="btn-editorial rounded-full px-6 py-3 font-heading tracking-[0.18em] text-xs uppercase inline-flex items-center justify-center"
              >
                Browse Categories
                <ArrowRight className="h-4 w-4 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------- Editorial portrait with museum frame + corner ornaments -------- */
function EditorialPortrait({
  photoUrl,
  name,
  role,
  reduce,
}: {
  photoUrl?: string | null;
  name: string;
  role: string;
  reduce: boolean;
}) {
  // Caption from name + role
  const caption = `${name} — ${role}`;

  return (
    <div className="w-full min-w-0 max-w-[460px]">
      {/* Outer museum double-frame */}
      <div
        className="relative"
        style={{
          padding: "4px",
          background: "linear-gradient(160deg, rgba(214,173,96,0.45), rgba(214,173,96,0.18) 50%, rgba(214,173,96,0.45))",
          boxShadow:
            "0 30px 60px -15px rgba(20, 43, 101, 0.4), 0 8px 16px -4px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Inner gap + thin gold inner border */}
        <div
          className="relative"
          style={{
            padding: "4px",
            background: "#0a0a10",
            boxShadow: "inset 0 0 0 1px rgba(214,173,96,0.55)",
          }}
        >
          {/* Portrait viewport */}
          <motion.div
            className="relative overflow-hidden"
            style={{
              aspectRatio: "4 / 5",
              background:
                "radial-gradient(800px 500px at 30% 20%, rgba(65,105,225,0.18), transparent 60%), radial-gradient(700px 500px at 80% 100%, rgba(109,40,217,0.16), transparent 60%), #08080b",
            }}
            animate={reduce ? undefined : { y: [0, -3, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          >
            {/* Corner ornaments — L-shaped gold lines */}
            <span className="corner-ornament corner-ornament-tl" />
            <span className="corner-ornament corner-ornament-tr" />
            <span className="corner-ornament corner-ornament-bl" />
            <span className="corner-ornament corner-ornament-br" />

            {photoUrl ? (
              <img
                src={photoUrl}
                alt={`${name} — ${role}`}
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: "contrast(1.05) saturate(0.96)" }}
              />
            ) : (
              <OwnerPlaceholder name={name} />
            )}
          </motion.div>
        </div>
      </div>

      {/* Caption — Marcellus italic */}
      <div className="mt-5 px-2 text-center">
        <div className="font-heading italic text-cream/85 text-sm md:text-base tracking-wide text-balance">
          {caption}
        </div>
        <div className="mt-1.5 mx-auto h-px w-12 bg-gold/50" />
      </div>
    </div>
  );
}

/* -------- Sophisticated placeholder — monogram on cinematic backdrop -------- */
function OwnerPlaceholder({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase();

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Radial blue glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, rgba(65,105,225,0.22), transparent 55%)",
        }}
      />
      {/* Subtle dust particles */}
      <DustSpecks />

      {/* Monogram NM */}
      <div className="relative flex flex-col items-center">
        <div
          className="font-heading text-cream text-6xl md:text-7xl lg:text-8xl tracking-[0.05em]"
          style={{
            background: "linear-gradient(180deg, #f8f5ef 0%, #d6ad60 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {initials || "NM"}
        </div>
        <div className="mt-4 text-gold/85 text-[10px] tracking-[0.4em] uppercase font-heading">
          Founder
        </div>
        <div className="mt-1.5 h-px w-12 bg-gold/45" />
      </div>
    </div>
  );
}

function DustSpecks() {
  // Pure CSS subtle dust using box-shadow on a single dot
  const specks = Array.from({ length: 12 }).map((_, i) => {
    const x = (i * 37) % 100;
    const y = (i * 53) % 100;
    const a = 0.1 + ((i * 7) % 10) / 100;
    return { x, y, a };
  });
  return (
    <div className="absolute inset-0 pointer-events-none">
      {specks.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: 2,
            height: 2,
            background: `rgba(248,245,239,${s.a})`,
          }}
        />
      ))}
    </div>
  );
}
