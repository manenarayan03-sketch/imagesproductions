import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Images, Play } from "lucide-react";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { buildWhatsAppLink } from "@/lib/site-utils";
import portfolioFallback from "@/lib/portfolio-fallback.json";

export const dynamic = "force-dynamic";

const VIDEO_POSTERS: Record<string, string> = {
  "cinematic-wedding-highlights": "/portfolio-media/traditional-wedding-photography/cmvldegiq001zvm50eww7t0o8.webp",
  "pre-wedding-films": "/portfolio-media/pre-wedding-photography/cmvldegkr002nvm50c7yuqb8r.webp",
  "corporate-videos": "/portfolio-media/candid-photography/cmvldegdm000bvm50x4upissg.webp",
  "event-videos": "/portfolio-media/baby-shower-photography/cmvldegqr004lvm50u14bgq8f.webp",
  "social-media-reels": "/portfolio-media/candid-photography/cmvldegdm000bvm50x4upissg.webp",
};

type PortfolioPageProps = {
  params: Promise<{ kind: string; slug: string }>;
};

export default async function PortfolioCategoryPage({ params }: PortfolioPageProps) {
  const { kind, slug } = await params;
  if (kind !== "photos" && kind !== "videos") notFound();

  const isPhotos = kind === "photos";
  const fallbackCategories = isPhotos
    ? portfolioFallback.photoCategories
    : portfolioFallback.videoCategories;
  const fallbackCategory = fallbackCategories.find((item) => item.slug === slug);
  const categoryQuery = isPhotos
    ? db.photographyCategory.findFirst({
        where: { slug, published: true, photos: { some: { published: true } } },
        select: {
          id: true,
          name: true,
          description: true,
          _count: { select: { photos: { where: { published: true } } } },
        },
      })
    : db.videoCategory.findFirst({
        where: { slug, published: true, videos: { some: { published: true } } },
        select: {
          id: true,
          name: true,
          description: true,
          _count: { select: { videos: { where: { published: true } } } },
        },
        });
      let category = await categoryQuery.catch(() => null);
  if (!category && fallbackCategory) category = fallbackCategory;

  if (!category) notFound();

  const [photos, videos, site] = await Promise.all([
    isPhotos
      ? db.photo.findMany({
          where: { categoryId: category.id, published: true },
          orderBy: [{ order: "asc" }, { createdAt: "desc" }],
          select: { id: true, title: true, description: true, imageUrl: true },
        }).catch(() => [])
      : Promise.resolve([]),
    isPhotos
      ? Promise.resolve([])
      : db.video.findMany({
          where: { categoryId: category.id, published: true },
          orderBy: [{ order: "asc" }, { createdAt: "desc" }],
          select: {
            id: true,
            title: true,
            description: true,
            videoUrl: true,
            thumbnailUrl: true,
          },
        }).catch(() => []),
    db.siteContent.findFirst({ select: { companyName: true, whatsappNumber: true } }).catch(() => null),
  ]);

  const fallbackPhotos = portfolioFallback.photos.filter((photo) => photo.categoryId === category.id);
  const fallbackVideos = portfolioFallback.videos.filter((video) => video.categoryId === category.id);
  const galleryPhotos = photos.length
    ? photos.map((photo) => ({
        ...photo,
        imageUrl:
          portfolioFallback.photos.find((fallbackPhoto) => fallbackPhoto.id === photo.id)?.imageUrl ??
          photo.imageUrl,
      }))
    : fallbackPhotos;
  const galleryVideos = videos.length
    ? videos.map((video) => {
        const fallbackVideo = portfolioFallback.videos.find((item) => item.id === video.id);
        return {
          ...video,
          videoUrl: video.videoUrl.startsWith("/uploads/") ? null : video.videoUrl,
          thumbnailUrl: fallbackVideo?.thumbnailUrl ?? video.thumbnailUrl,
        };
      })
    : fallbackVideos;
  const count = isPhotos ? galleryPhotos.length : galleryVideos.length;
  const companyName = site?.companyName || portfolioFallback.site?.companyName || "IMAGES PRODUCTION";
  const whatsapp = site?.whatsappNumber || portfolioFallback.site?.whatsappNumber || "+91 8433975695";

  return (
    <main className="min-h-screen bg-[#08080d] text-cream">
      <header className="border-b border-gold/15 bg-black/30">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-5 sm:px-6">
          <Link href="/" className="font-heading text-sm tracking-[0.2em] sm:text-base">
            {companyName.split(" ").slice(0, -1).join(" ") || "IMAGES"}{" "}
            <span className="text-gold">{companyName.split(" ").at(-1)}</span>
          </Link>
          <Link
            href="/#categories"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-cream/70 transition hover:text-gold"
          >
            <ArrowLeft className="h-4 w-4" />
            All categories
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-20">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-gold sm:text-xs">
            <span className="h-px w-7 bg-gold/60" />
            {isPhotos ? "Photography Collection" : "Films & Videos"}
            <span className="h-px w-7 bg-gold/60" />
          </div>
          <h1 className="mt-5 font-heading text-4xl tracking-tight sm:text-5xl md:text-6xl">
            {category.name}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-cream/65">
            {category.description ||
              `A curated collection of ${isPhotos ? "photographs" : "films"} by ${companyName}.`}
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/20 bg-white/[0.03] px-4 py-2 text-xs text-cream/70">
            {isPhotos ? <Images className="h-4 w-4 text-gold" /> : <Play className="h-4 w-4 text-gold" />}
            {count} {isPhotos ? (count === 1 ? "photo" : "photos") : (count === 1 ? "video" : "videos")}
          </div>
        </div>

        {isPhotos ? (
          <div className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3">
            {galleryPhotos.map((photo) => (
              <article
                key={photo.id}
                className="group relative mb-5 break-inside-avoid overflow-hidden rounded-xl border border-gold/15 bg-black/40"
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  loading="lazy"
                  decoding="async"
                  className="h-auto w-full object-cover transition duration-700 group-hover:scale-[1.025] group-hover:saturate-110"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/45 to-transparent p-5 pt-12">
                  <h2 className="font-heading text-lg text-cream">{photo.title}</h2>
                  {photo.description && (
                    <p className="mt-1 text-sm leading-relaxed text-cream/65">{photo.description}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {galleryVideos.map((video) => (
              <article
                key={video.id}
                className="overflow-hidden rounded-xl border border-gold/15 bg-white/[0.025]"
              >
                {video.videoUrl ? (
                <video
                  src={video.videoUrl}
                  poster={video.thumbnailUrl || VIDEO_POSTERS[slug]}
                  controls
                  playsInline
                  preload="metadata"
                  aria-label={video.title}
                  className="aspect-video w-full bg-black object-cover"
                />
                ) : (
                  <div className="relative flex aspect-video items-center justify-center bg-black">
                    <img
                      src={video.thumbnailUrl || VIDEO_POSTERS[slug]}
                      alt={`${video.title} poster`}
                      className="absolute inset-0 h-full w-full object-contain opacity-80"
                    />
                    <p className="relative z-10 rounded-lg bg-black/75 px-4 py-3 text-center text-sm text-cream/85">
                      This film is not hosted online yet. Contact us to view it.
                    </p>
                  </div>
                )}
                <div className="p-5">
                  <h2 className="font-heading text-lg text-cream">{video.title}</h2>
                  {video.description && (
                    <p className="mt-2 text-sm leading-relaxed text-cream/65">{video.description}</p>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-14 text-center">
          <a
            href={buildWhatsAppLink(whatsapp, `Hi ${companyName}, I'm interested in your ${category.name} collection.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-xs font-medium uppercase tracking-[0.16em] text-ink transition hover:bg-cream"
          >
            Enquire about this collection
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </main>
  );
}
