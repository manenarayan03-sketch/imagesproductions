"use client";

import * as React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Menu, Phone, MessageCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildWhatsAppLink } from "@/lib/site-utils";

const NAV = [
  { href: "#about", label: "About" },
  { href: "#services", label: "Services" },
  { href: "#categories", label: "Portfolio" },
  { href: "#contact", label: "Contact" },
];

export function SiteHeader({
  whatsapp,
  brandName = "IMAGES PRODUCTION",
}: {
  whatsapp: string;
  brandName?: string;
}) {
  const [scrolled, setScrolled] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const reduce = useReducedMotion();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault();
    setOpen(false);
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled
          ? "py-2 bg-[rgba(8,8,11,0.72)] backdrop-blur-xl border-b border-gold/20"
          : "py-4 bg-transparent border-b border-transparent"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between gap-4">
        <a
          href="#"
          className="font-heading tracking-[0.18em] text-cream text-sm sm:text-base md:text-lg font-medium"
          style={{ letterSpacing: "0.22em" }}
        >
          IMAGES <span className="text-gold">PRODUCTION</span>
        </a>

        <nav className="hidden lg:flex items-center gap-8">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="gold-underline-link text-sm uppercase tracking-[0.18em] text-cream/85 hover:text-gold transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={buildWhatsAppLink(whatsapp, "Hi Images Production, I'd like to discuss a project.")}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp"
            className="hidden sm:inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(37,211,102,0.16)] text-[#25D366] hover:bg-[rgba(37,211,102,0.28)] transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
          <a
            href={buildWhatsAppLink(whatsapp, "Hi Images Production, I'd like to book a shoot.")}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex"
          >
            <Button
              className="bg-gold text-ink hover:bg-gold/90 font-heading tracking-[0.16em] text-xs uppercase rounded-full px-5"
              variant="default"
            >
              Book Now
            </Button>
          </a>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-cream hover:text-gold hover:bg-transparent"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[88vw] max-w-sm bg-[#0a0a10] border-l border-gold/25 text-cream p-0"
            >
              <div className="flex flex-col h-full">
                <div className="px-6 pt-6 pb-3">
                  <div className="font-heading tracking-[0.22em] text-base">
                    IMAGES <span className="text-gold">PRODUCTION</span>
                  </div>
                  <div className="text-[10px] tracking-[0.32em] text-cream/55 mt-1">
                    FRAMES ALIVE WITH IMAGINATION
                  </div>
                </div>
                <nav className="flex-1 px-3 mt-2">
                  {NAV.map((item, idx) => (
                    <motion.a
                      key={item.href}
                      href={item.href}
                      onClick={(e) => handleNavClick(e, item.href)}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.06 }}
                      className="block px-4 py-3 text-cream/85 hover:text-gold hover:bg-gold/5 rounded-md uppercase tracking-[0.18em] text-sm transition-colors"
                    >
                      {item.label}
                    </motion.a>
                  ))}
                </nav>
                <div className="p-4 mt-auto flex flex-col gap-2 border-t border-gold/15">
                  <SheetClose asChild>
                    <a
                      href={buildWhatsAppLink(whatsapp, "Hi Images Production, I'd like to book a shoot.")}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="bg-gold text-ink hover:bg-gold/90 w-full rounded-full font-heading tracking-[0.18em] text-xs uppercase">
                        Book Now
                      </Button>
                    </a>
                  </SheetClose>
                  <SheetClose asChild>
                    <a href={`tel:+${(whatsapp || "").replace(/[^\d]/g, "")}`} className="w-full">
                      <Button variant="outline" className="w-full rounded-full border-gold/30 text-cream hover:text-gold hover:bg-gold/5">
                        <Phone className="h-4 w-4 mr-2" /> Call
                      </Button>
                    </a>
                  </SheetClose>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
