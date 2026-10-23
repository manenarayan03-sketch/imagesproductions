"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Instagram, Youtube, Facebook, Video, MessageCircle, Phone } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/site-utils";

type Socials = {
  instagram?: string | null;
  youtube?: string | null;
  vimeo?: string | null;
  facebook?: string | null;
};

export function Footer({
  companyName = "IMAGES PRODUCTION",
  tagline = "FRAMES ALIVE WITH IMAGINATION",
  whatsapp,
  socials,
}: {
  companyName?: string;
  tagline?: string;
  whatsapp: string;
  socials?: Socials;
}) {
  const year = new Date().getFullYear();

  const navLinks = [
    { href: "#about", label: "About" },
    { href: "#services", label: "Services" },
    { href: "#categories", label: "Portfolio" },
    { href: "#contact", label: "Contact" },
  ];

  const onNav = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    document
      .getElementById(href.replace("#", ""))
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const socialArr = [
    { url: socials?.instagram, icon: <Instagram className="h-4 w-4" />, label: "Instagram" },
    { url: socials?.youtube, icon: <Youtube className="h-4 w-4" />, label: "YouTube" },
    { url: socials?.vimeo, icon: <Video className="h-4 w-4" />, label: "Vimeo" },
    { url: socials?.facebook, icon: <Facebook className="h-4 w-4" />, label: "Facebook" },
  ].filter((s) => s.url);

  return (
    <footer className="mt-auto bg-[#06060a] border-t border-gold/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand column */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="font-heading tracking-[0.24em] text-cream text-xl md:text-2xl">
              {companyName}
            </div>
            <div className="mt-3 font-heading italic text-gold text-sm tracking-wide">
              {tagline}
            </div>
            <p className="mt-6 text-cream/55 text-sm leading-relaxed max-w-xs">
              Photography, videography, cinematography and professional
              video editing — crafted for clients across Mumbai and beyond.
            </p>
            <div className="mt-4 text-cream/45 text-[10px] tracking-[0.32em] uppercase">
              Mulund West, Mumbai
            </div>
          </motion.div>

          {/* Quick links */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="text-[10px] tracking-[0.34em] uppercase text-gold/85 mb-5 font-medium">
              Explore
            </div>
            <ul className="space-y-3">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={(e) => onNav(e, l.href)}
                    className="gold-underline-link text-cream/70 hover:text-gold transition-colors text-sm tracking-[0.08em]"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact + socials */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="text-[10px] tracking-[0.34em] uppercase text-gold/85 mb-5 font-medium">
              Connect
            </div>
            <div className="space-y-3 text-cream/70 text-sm">
              <div className="flex items-start gap-2.5">
                <MessageCircle className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                <a
                  href={buildWhatsAppLink(whatsapp, "Hi Images Production!")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gold transition-colors"
                >
                  {whatsapp}
                </a>
              </div>
              <div className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-gold mt-0.5 shrink-0" />
                <a
                  href={`tel:+${(whatsapp || "").replace(/[^\d]/g, "")}`}
                  className="hover:text-gold transition-colors"
                >
                  {whatsapp}
                </a>
              </div>
              <div className="text-cream/45 text-[13px] leading-relaxed pt-2">
                Jalaram Niwas, Ganesh Gawade Road, Near Canara Bank, Mulund
                West, Mumbai, Maharashtra 400080, India.
              </div>
            </div>
            {socialArr.length > 0 && (
              <div className="mt-5 flex items-center gap-2">
                {socialArr.map((s) => (
                  <a
                    key={s.label}
                    href={s.url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    className="h-9 w-9 rounded-full border border-gold/25 text-cream/70 hover:text-gold hover:border-gold/55 transition-colors inline-flex items-center justify-center"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        <div className="mt-14 pt-6 border-t border-gold/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-cream/50 text-xs">
          <div>
            © {year} {companyName}. All rights reserved.
          </div>
          <div className="tracking-[0.22em] uppercase text-[10px]">
            Crafted in Mulund West, Mumbai.
          </div>
        </div>
      </div>
    </footer>
  );
}
