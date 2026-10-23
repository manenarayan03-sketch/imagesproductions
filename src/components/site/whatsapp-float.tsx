"use client";

import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { MessageCircle } from "lucide-react";
import { buildWhatsAppLink } from "@/lib/site-utils";

export function WhatsAppFloat({
  phone,
  message = "Hi Images Production, I'd like to discuss a project.",
}: {
  phone: string;
  message?: string;
}) {
  const reduce = useReducedMotion();
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.a
      href={buildWhatsAppLink(phone, message)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Images Production on WhatsApp"
      initial={{ scale: 0, opacity: 0 }}
      animate={visible ? { scale: 1, opacity: 1 } : undefined}
      transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 h-14 w-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-[0_12px_30px_-6px_rgba(37,211,102,0.65)] hover:scale-105 transition-transform"
    >
      <span className="absolute inset-0 rounded-full animate-pulse-ring pointer-events-none" />
      <MessageCircle className={reduce ? "h-6 w-6" : "h-6 w-6 animate-floaty"} />
      <span className="sr-only">Chat on WhatsApp</span>
    </motion.a>
  );
}
