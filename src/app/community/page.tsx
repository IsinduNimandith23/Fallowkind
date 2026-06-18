import type { Metadata } from "next";
import Image from "next/image";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import ReviewForm from "@/components/ReviewForm";
import { getInstagramFeed } from "@/lib/instagram";
import { getFacebookFeed } from "@/lib/facebook";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Rooted Together - a community of people choosing comfort, nature and conscious living. Photos, stories, reels and the collective impact of the Fallowkind community.",
  alternates: { canonical: "/community" },
  openGraph: {
    title: "Community | Fallowkind",
    description:
      "A community of people choosing comfort, nature and conscious living.",
    url: "/community",
    type: "website",
  },
};
export const revalidate = 3600;

/* ------------------------------------------------------------------ */
/* DUMMY CONTENT — swap images in /public and copy below for real data */
/* ------------------------------------------------------------------ */

// Placeholder images (replace with the real ones you'll send later).
const IMG = ["/banner.png", "/Rooted in Land.jpg", "/Untitled design.png"];
const pick = (i: number) => IMG[i % IMG.length];

const categories = [
  { label: "Gallery", sub: "Customer photos", Icon: IconCamera },
  { label: "Stories", sub: "Community stories", Icon: IconLeaf },
  { label: "Reels", sub: "Videos & Reels", Icon: IconPlay },
  { label: "Nature Moments", sub: "Nature in daily life", Icon: IconSprout },
  { label: "Around the World", sub: "Our global community", Icon: IconGlobe },
  { label: "Spotlight", sub: "Monthly community spotlight", Icon: IconTrophy },
  { label: "Impact", sub: "Our collective impact", Icon: IconTree },
];

// The Community Gallery renders the brand's live Instagram + Facebook feeds
// (auto-updating via the Graph API — see src/lib/instagram.ts & facebook.ts).
// Until the access tokens are configured, these manual posts are shown as a
// fallback so the section is never empty.
const INSTAGRAM_PROFILE = "https://www.instagram.com/fallowkind";

type Platform = "instagram" | "facebook";
type GalleryTile = {
  href: string;
  image: string;
  caption: string;
  isVideo: boolean;
  platform: Platform;
};

const fallbackPosts: GalleryTile[] = [
  {
    href: "https://www.instagram.com/p/DZp2ggGKPCw/",
    image: pick(1),
    caption: "Morning walk in Kandy wearing my Fallowkind tee 🌿",
    isVideo: false,
    platform: "instagram",
  },
  {
    href: "https://www.instagram.com/p/DZFuCpsH-Mt/",
    image: pick(2),
    caption: "Ocean breeze & organic cotton = my kind of therapy 🌊",
    isVideo: false,
    platform: "facebook",
  },
  {
    href: "https://www.instagram.com/p/DZp2ggGKPCw/",
    image: pick(3),
    caption: "Exploring more, consuming less. That's the vibe. 🏔️",
    isVideo: false,
    platform: "instagram",
  },
  {
    href: "https://www.instagram.com/p/DZFuCpsH-Mt/",
    image: pick(4),
    caption: "Sunsets, slow living and sustainable choices ✨",
    isVideo: false,
    platform: "facebook",
  },
];

const spotlight = {
  handle: "@nimeshi",
  perks: [
    { label: "15% Off Discount Code", Icon: IconTag },
    { label: "Free Shipping", Icon: IconBox },
    { label: "Featured on Instagram", Icon: IconCamera },
  ],
};

const impactStats = [
  { value: "12,580", label: "Plastic-free garments sold", Icon: IconBottle },
  { value: "4,320+", label: "Community members", Icon: IconPeople },
  { value: "2,350", label: "Trees supported", Icon: IconTree },
  { value: "1,250+", label: "Photos shared", Icon: IconPhotoStack },
  { value: "18", label: "Countries reached", Icon: IconGlobe },
];

const communityQuotes = [
  {
    quote:
      "I choose natural fabrics because I believe what we wear shouldn't cost the earth.",
    author: "Tharindi, Sri Lanka",
  },
  {
    quote: "Supporting local, supporting nature, supporting our future.",
    author: "Mila, Seychelles",
  },
  {
    quote:
      "Natural fabrics, thoughtful designs and a purpose deeper than profit.",
    author: "Jamie, Australia",
  },
];

const reels = [
  { title: "Unboxing my Fallowkind order", handle: "@nimeshi" },
  { title: "Nature walks & cotton talks", handle: "@adventures.with.hesh" },
  { title: "Day in my life in linen", handle: "@sachini.w" },
  { title: "Slow living looks good on us", handle: "@roshini.j" },
];

/* ------------------------------------------------------------------ */
/* PAGE                                                                 */
/* ------------------------------------------------------------------ */

export default async function CommunityPage() {
  // Live Instagram + Facebook feeds, merged newest-first. Falls back to the
  // manual posts when no tokens are configured yet.
  const [instagram, facebook] = await Promise.all([
    getInstagramFeed(8),
    getFacebookFeed(8),
  ]);

  const merged: (GalleryTile & { ts: number })[] = [
    ...instagram.map((m) => ({
      href: m.permalink,
      image: m.thumbnailUrl ?? m.mediaUrl,
      caption: m.caption ?? "Instagram post",
      isVideo: m.mediaType === "VIDEO",
      platform: "instagram" as const,
      ts: Date.parse(m.timestamp),
    })),
    ...facebook.map((p) => ({
      href: p.permalink,
      image: p.image,
      caption: p.caption ?? "Facebook post",
      isVideo: false,
      platform: "facebook" as const,
      ts: Date.parse(p.timestamp),
    })),
  ].sort((a, b) => b.ts - a.ts);

  const tiles: GalleryTile[] = merged.length
    ? merged.slice(0, 8)
    : fallbackPosts;

  return (
    <>
      {/* ── Hero (sits behind the fixed navbar) ── */}
      <section className="relative flex items-center -mt-20 pt-40 pb-36 overflow-hidden">
        <Image
          src={pick(0)}
          alt="The Fallowkind community"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Light cream wash so text stays readable over the photo */}
        <div className="absolute inset-0 bg-linen/25" />

        <div className="relative w-full px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="flex justify-center mb-5 text-sage">
              <IconSprout className="w-8 h-8" />
            </div>
            <h1
              className="text-forest text-5xl sm:text-6xl md:text-7xl normal-case opacity-0 animate-fade-in-up"
              style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
            >
              Rooted Together
            </h1>
            <p
              className="mt-6 text-forest/70 text-lg sm:text-xl leading-relaxed opacity-0 animate-fade-in-up"
              style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
            >
              A community of people choosing comfort, nature, and conscious living.
            </p>
            <div
              className="mt-8 opacity-0 animate-fade-in-up"
              style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}
            >
              <a href="#share" className="btn-primary">
                Share Your Story
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category strip (overlaps hero) ── */}
      <section className="w-full px-5 sm:px-8 lg:px-12 -mt-28 relative z-10">
        <AnimateOnScroll>
          <div className="glass-panel bg-white/80 px-4 py-8 sm:px-8">
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-y-8 gap-x-4">
              {categories.map(({ label, sub, Icon }) => (
                <a
                  key={label}
                  href="#"
                  className="group flex flex-col items-center text-center gap-2"
                >
                  <span className="flex items-center justify-center w-12 h-12 rounded-full bg-fern/15 text-sage transition-colors duration-300 group-hover:bg-sage group-hover:text-linen">
                    <Icon className="w-6 h-6" />
                  </span>
                  <span className="text-sm text-forest">{label}</span>
                  <span className="text-[11px] text-moss leading-tight max-w-[8rem]">
                    {sub}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* ── Band 1: Gallery · Spotlight · Impact ── */}
      <section className="w-full px-5 sm:px-8 lg:px-12 py-14 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* Community Gallery — live Instagram feed */}
          <AnimateOnScroll className="lg:col-span-7">
            <SectionHead title="Community Gallery" href={INSTAGRAM_PROFILE} />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {tiles.map((t, i) => (
                <a
                  key={`${t.href}-${i}`}
                  href={t.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-square overflow-hidden rounded-2xl border border-white/50 bg-white/40 shadow-sm"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={t.image}
                    alt={t.caption}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="pointer-events-none absolute inset-0 bg-forest/0 transition-colors duration-300 group-hover:bg-forest/15" />
                  <span className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full bg-white/85 text-forest shadow-sm">
                    {t.platform === "facebook" ? (
                      <IconFacebook className="w-3.5 h-3.5" />
                    ) : (
                      <IconInstagram className="w-3.5 h-3.5" />
                    )}
                  </span>
                  {t.isVideo && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 text-forest shadow-md transition-transform group-hover:scale-110">
                        <IconPlayFill className="w-4 h-4 ml-0.5" />
                      </span>
                    </span>
                  )}
                </a>
              ))}
            </div>
          </AnimateOnScroll>

          {/* Monthly Community Spotlight */}
          <AnimateOnScroll className="lg:col-span-3" delay={120}>
            <SectionHead title="Monthly Community Spotlight" href="#" />
            <div className="glass-card p-6 text-center h-[calc(100%-2.75rem)] flex flex-col items-center">
              <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-fern/40">
                <Image
                  src={pick(1)}
                  alt={`${spotlight.handle} - community spotlight`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <p className="mt-4 text-sm text-forest/70">
                This month we&apos;re featuring
              </p>
              <p className="text-lg text-sage">{spotlight.handle}</p>
              <p className="mt-2 text-xs text-moss">
                Thank you for inspiring our community!
              </p>
              <div className="mt-6 pt-5 border-t border-forest/10 w-full grid grid-cols-3 gap-2">
                {spotlight.perks.map(({ label, Icon }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center gap-1.5 text-center"
                  >
                    <Icon className="w-5 h-5 text-sage" />
                    <span className="text-[9px] leading-tight text-moss">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnScroll>

          {/* Our Impact Together */}
          <AnimateOnScroll className="lg:col-span-2" delay={240}>
            <h3 className="text-base text-forest normal-case tracking-normal mb-4">
              Our Impact Together
            </h3>
            <div className="glass-tinted p-5 flex flex-col gap-5 h-[calc(100%-2.75rem)]">
              {impactStats.map(({ value, label, Icon }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon className="w-5 h-5 text-sage shrink-0 mt-0.5" />
                  <div>
                    <p className="text-base text-forest leading-none">{value}</p>
                    <p className="text-[11px] text-moss leading-tight mt-1">
                      {label}
                    </p>
                  </div>
                </div>
              ))}
              <a
                href="#"
                className="mt-auto pt-3 text-[11px] tracking-widest uppercase text-sage hover:text-forest transition-colors inline-flex items-center gap-1"
              >
                See Full Impact →
              </a>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── Band 2: From Our Community · Reels · Join ── */}
      <section className="w-full px-5 sm:px-8 lg:px-12 pb-16 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* From Our Community */}
          <AnimateOnScroll className="lg:col-span-4">
            <SectionHead title="From Our Community" sub="Real stories from real people." href="#" />
            <div className="flex flex-col gap-4">
              {communityQuotes.map((q) => (
                <article key={q.author} className="glass-card p-5">
                  <span className="text-3xl text-fern leading-none font-serif">
                    &ldquo;
                  </span>
                  <p className="text-forest/75 leading-relaxed text-sm font-serif italic normal-case tracking-normal -mt-2">
                    {q.quote}
                  </p>
                  <p className="mt-3 text-[11px] tracking-wide uppercase text-moss">
                    – {q.author}
                  </p>
                </article>
              ))}
            </div>
          </AnimateOnScroll>

          {/* Reels & Videos */}
          <AnimateOnScroll className="lg:col-span-5" delay={120}>
            <SectionHead title="Reels & Videos" sub="Watch. Get inspired. Share." href="#" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {reels.map((r, i) => (
                <a
                  key={r.title}
                  href="#"
                  className="group glass-card overflow-hidden flex flex-col"
                >
                  <div className="relative aspect-[9/14] card-img rounded-none">
                    <Image
                      src={pick(i + 2)}
                      alt={r.title}
                      fill
                      sizes="(min-width:1024px) 12vw, (min-width:640px) 25vw, 50vw"
                      className="object-cover"
                    />
                    <span className="absolute inset-0 bg-forest/20 group-hover:bg-forest/30 transition-colors" />
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 text-forest backdrop-blur-md shadow-md transition-transform group-hover:scale-110">
                        <IconPlayFill className="w-4 h-4 ml-0.5" />
                      </span>
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="text-[12px] leading-snug text-forest/80 font-sans normal-case tracking-normal">
                      {r.title}
                    </p>
                    <p className="text-[10px] text-moss mt-1">{r.handle}</p>
                  </div>
                </a>
              ))}
            </div>
          </AnimateOnScroll>

          {/* Join The Circle */}
          <AnimateOnScroll className="lg:col-span-3" delay={240}>
            <div className="relative overflow-hidden glass-card bg-forest/95 p-7 h-full flex flex-col justify-center">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-fern/10 blur-2xl" />
              <IconLeafBranch className="absolute -right-4 -bottom-4 w-40 h-40 text-fern/30 rotate-12" />
              <div className="relative">
                <h3 className="text-linen text-2xl normal-case tracking-normal">
                  Join The Circle
                </h3>
                <p className="mt-3 text-linen/65 text-sm leading-relaxed">
                  Be part of a conscious community.
                </p>
                <a href="#share" className="btn-glass-dark mt-6 inline-block">
                  Join Us
                </a>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── Share your story (keeps the review backend) ── */}
      <section id="share" className="section-padding page-container scroll-mt-24">
        <AnimateOnScroll>
          <div className="relative overflow-hidden rounded-3xl bg-forest border border-white/10 shadow-lg px-6 py-12 sm:px-12 sm:py-14 md:py-16 text-center">
            <div className="absolute -right-24 -bottom-24 w-80 h-80 rounded-full border border-fern/10" />
            <div className="absolute -left-24 -top-24 w-80 h-80 rounded-full border border-fern/10" />
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-fern/10 blur-3xl" />

            <div className="relative max-w-xl mx-auto">
              <p className="text-xs tracking-[0.3em] uppercase text-fern mb-3">
                Be part of it
              </p>
              <h2 className="text-linen text-3xl sm:text-4xl md:text-5xl mb-4">
                Share your Fallowkind
              </h2>
              <p className="text-linen/65 leading-relaxed mb-8 max-w-md mx-auto">
                Tell us how your Fallowkind feels to wear. We&apos;d love to hear
                your story - and we may feature it here for the rest of the
                community to see.
              </p>

              <ReviewForm />

              <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
                <a
                  href="https://www.instagram.com/fallowkind"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] tracking-[0.35em] uppercase text-linen/80 hover:text-linen transition-colors"
                >
                  Or tag @fallowkind on Instagram →
                </a>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </section>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Small helpers                                                        */
/* ------------------------------------------------------------------ */

function SectionHead({
  title,
  sub,
  href,
}: {
  title: string;
  sub?: string;
  href: string;
}) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h3 className="text-base sm:text-lg text-forest normal-case tracking-normal">
          {title}
        </h3>
        {sub && <p className="text-xs text-moss mt-1">{sub}</p>}
      </div>
      <a
        href={href}
        className="text-[11px] tracking-widest uppercase text-sage hover:text-forest transition-colors shrink-0"
      >
        View All
      </a>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Inline line icons (no extra deps)                                   */
/* ------------------------------------------------------------------ */

type IconProps = { className?: string };
const base = (className = "w-6 h-6") => ({
  className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

function IconCamera({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L17 6h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8Z" />
      <circle cx="12" cy="13" r="3.5" />
    </svg>
  );
}
function IconLeaf({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14Z" />
      <path d="M5 19C9 15 13 11 17 8" />
    </svg>
  );
}
function IconPlay({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M10 9l5 3-5 3V9Z" />
    </svg>
  );
}
function IconPlayFill({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8 5v14l11-7L8 5Z" />
    </svg>
  );
}
function IconSprout({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 20v-7" />
      <path d="M12 13c0-3-2-5-6-5 0 4 3 5 6 5Z" />
      <path d="M12 11c0-3 2-5 6-5 0 4-3 5-6 5Z" />
    </svg>
  );
}
function IconGlobe({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.5 2.5 15.5 0 18M12 3c-2.5 2.5-2.5 15.5 0 18" />
    </svg>
  );
}
function IconTrophy({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" />
      <path d="M16 5h3v2a3 3 0 0 1-3 3M8 5H5v2a3 3 0 0 0 3 3" />
      <path d="M12 12v4M9 20h6M10 20v-2h4v2" />
    </svg>
  );
}
function IconTree({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M12 3l5 7h-3l3 5H7l3-5H7l5-7Z" />
      <path d="M12 15v6" />
    </svg>
  );
}
function IconTag({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M3 12V5a2 2 0 0 1 2-2h7l9 9-9 9-9-9Z" />
      <circle cx="7.5" cy="7.5" r="1.2" />
    </svg>
  );
}
function IconBox({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M3 7l9-4 9 4v10l-9 4-9-4V7Z" />
      <path d="M3 7l9 4 9-4M12 11v10" />
    </svg>
  );
}
function IconBottle({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <path d="M10 2h4M10 4h4v3l1.5 2.5A4 4 0 0 1 16 11v8a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-8a4 4 0 0 1 .5-1.5L10 7V4Z" />
    </svg>
  );
}
function IconPeople({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3 3-5 6-5s6 2 6 5" />
      <path d="M16 5a3 3 0 0 1 0 6M21 20c0-2.5-1.5-4-4-4.5" />
    </svg>
  );
}
function IconPhotoStack({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <rect x="3" y="3" width="14" height="14" rx="2" />
      <path d="M3 13l4-4 4 4 3-3 3 3" />
      <path d="M21 7v12a2 2 0 0 1-2 2H7" />
    </svg>
  );
}
function IconInstagram({ className }: IconProps) {
  return (
    <svg {...base(className)}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconFacebook({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13.5 21v-7h2.3l.4-2.8h-2.7V9.4c0-.8.2-1.4 1.4-1.4h1.4V5.5c-.7-.1-1.5-.2-2.3-.2-2.3 0-3.8 1.4-3.8 3.9v2.1H7.8V14h2.3v7h3.4Z" />
    </svg>
  );
}
function IconLeafBranch({ className }: IconProps) {
  // A simple almond leaf, base at origin, pointing up
  const leaf = "M0 0 C 6 -6 6 -16 0 -22 C -6 -16 -6 -6 0 0 Z";
  const nodes = [
    { x: 84, y: 98 },
    { x: 68, y: 76 },
    { x: 54, y: 56 },
  ];
  return (
    <svg viewBox="0 0 120 120" className={className}>
      {/* curving stem */}
      <path
        d="M98 114 C70 94 56 66 48 32"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* paired leaves fanning off the stem */}
      {nodes.map((p, i) => (
        <g key={i} transform={`translate(${p.x} ${p.y})`} fill="currentColor">
          <path transform="rotate(-34)" d={leaf} />
          <path transform="rotate(34)" d={leaf} />
        </g>
      ))}
      {/* tip leaf */}
      <g transform="translate(48 32)" fill="currentColor">
        <path d={leaf} />
      </g>
    </svg>
  );
}
