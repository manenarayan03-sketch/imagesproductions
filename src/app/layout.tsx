import type { Metadata } from "next";
import { Marcellus, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

const marcellus = Marcellus({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "IMAGES PRODUCTION — Frames Alive with Imagination",
  description:
    "IMAGES PRODUCTION is a photography, videography, cinematography and video editing studio in Mulund West, Mumbai, founded by Narayan Maane. We turn moments into cinema.",
  keywords: [
    "IMAGES PRODUCTION",
    "Narayan Maane",
    "Mumbai photographer",
    "wedding photography Mumbai",
    "cinematography Mumbai",
    "video editing Mumbai",
    "Mulund West",
    "pre-wedding shoot",
    "brand films",
  ],
  authors: [{ name: "Narayan Maane" }],
  openGraph: {
    title: "IMAGES PRODUCTION — Frames Alive with Imagination",
    description:
      "Photography, Filmmaking & Creative Visual Storytelling in Mumbai. Founded by Narayan Maane.",
    siteName: "IMAGES PRODUCTION",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "IMAGES PRODUCTION",
    description: "Frames Alive with Imagination — Mumbai.",
  },
  icons: { icon: "/logo.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          marcellus.variable,
          inter.variable,
          "antialiased bg-background text-foreground min-h-screen"
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
