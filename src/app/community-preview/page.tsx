import type { Metadata } from "next";
import Image from "next/image";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import CommunityFormModal from "@/components/CommunityFormModal";
import CommunityQuotes from "@/components/CommunityQuotes";
import CommunityStoriesModal from "@/components/CommunityStoriesModal";
import CommunityGalleryModal from "@/components/CommunityGalleryModal";
import CommunityReelsModal from "@/components/CommunityReelsModal";
import { getInstagramFeed } from "@/lib/instagram";
import { getFacebookFeed } from "@/lib/facebook";
import { getApprovedCommunityReviews } from "@/lib/communityReviews";
import { getSiteSettings } from "@/lib/siteSettings";

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
/* DUMMY CONTENT - swap images in /public and copy below for real data */
/* ------------------------------------------------------------------ */

// Placeholder images (replace with the real ones you'll send later).
const IMG = ["/banner.png", "/Rooted in Land.jpg", "/Untitled design.png"];
const pick = (i: number) => IMG[i % IMG.length];

// Until real Instagram/Facebook posts come through the tagged feeds, every
// Community Gallery placeholder tile shows the Fallowkind logo card.
const GALLERY_PLACEHOLDER = "/logo with background.png";

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
// (auto-updating via the Graph API - see src/lib/instagram.ts & facebook.ts).
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
    image: GALLERY_PLACEHOLDER,
    caption: "Morning walk in Kandy wearing my Fallowkind tee 🌿",
    isVideo: false,
    platform: "instagram",
  },
  {
    href: "https://www.instagram.com/p/DZFuCpsH-Mt/",
    image: GALLERY_PLACEHOLDER,
    caption: "Ocean breeze & organic cotton = my kind of therapy 🌊",
    isVideo: false,
    platform: "facebook",
  },
  {
    href: "https://www.instagram.com/p/DZp2ggGKPCw/",
    image: GALLERY_PLACEHOLDER,
    caption: "Exploring more, consuming less. That's the vibe. 🏔️",
    isVideo: false,
    platform: "instagram",
  },
  {
    href: "https://www.instagram.com/p/DZFuCpsH-Mt/",
    image: GALLERY_PLACEHOLDER,
    caption: "Sunsets, slow living and sustainable choices ✨",
    isVideo: false,
    platform: "facebook",
  },
  {
    href: "https://www.instagram.com/fallowkind",
    image: GALLERY_PLACEHOLDER,
    caption: "Linen days and quiet mornings 🤍",
    isVideo: false,
    platform: "instagram",
  },
  {
    href: "https://www.instagram.com/fallowkind",
    image: GALLERY_PLACEHOLDER,
    caption: "Rooted in the land, made to last 🌱",
    isVideo: false,
    platform: "facebook",
  },
  {
    href: "https://www.instagram.com/fallowkind",
    image: GALLERY_PLACEHOLDER,
    caption: "Conscious closet, clear conscience ✨",
    isVideo: false,
    platform: "instagram",
  },
  {
    href: "https://www.instagram.com/fallowkind",
    image: GALLERY_PLACEHOLDER,
    caption: "Everyday essentials, kinder to the planet 🌍",
    isVideo: false,
    platform: "facebook",
  },
];

// Icons paired by position with the two editable perk labels (see admin →
// Community → Monthly Community Spotlight). Labels are admin-managed; icons
// stay fixed here to keep the card's look consistent.
const SPOTLIGHT_PERK_ICONS = [IconTag, IconCamera];

// Icons paired by position with the admin-managed "Our Impact Together" stats
// (see admin → Site → Community page). The value + label of each stat are
// editable; icons stay fixed here to keep the section's look consistent.
const IMPACT_STAT_ICONS = [
  IconSprout,
  IconBottle,
  IconTree,
  IconTag,
  IconPeople,
  IconGlobe,
];

// Shown in the "From Our Community" section only until real submissions
// from the share-your-story form have been approved (see CommunityPage).
const fallbackQuotes = [
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

type ReelItem = { title: string; handle: string; image: string; href?: string };

// Shown in Reels & Videos until real video posts come through the tagged feeds.
const fallbackReels: ReelItem[] = [
  { title: "Unboxing my Fallowkind order", handle: "@nimeshi", image: pick(2) },
  { title: "Nature walks & cotton talks", handle: "@adventures.with.hesh", image: pick(3) },
  { title: "Day in my life in linen", handle: "@sachini.w", image: pick(4) },
  { title: "Slow living looks good on us", handle: "@roshini.j", image: pick(5) },
];

/* ------------------------------------------------------------------ */
/* PAGE                                                                 */
/* ------------------------------------------------------------------ */

export default async function CommunityPage() {
  // Live Instagram + Facebook feeds, merged newest-first. Falls back to the
  // manual posts when no tokens are configured yet.
  const [instagram, facebook, communityReviews, settings] = await Promise.all([
    getInstagramFeed(8),
    getFacebookFeed(8),
    getApprovedCommunityReviews(200),
    getSiteSettings(),
  ]);

  // Monthly Community Spotlight - admin-managed (admin → Community). An empty
  // name hides the card; the avatar falls back to a placeholder image, and only
  // non-empty perk labels are shown (paired with the fixed icons by position).
  const spotlight = {
    handle: settings.spotlightName,
    image: settings.spotlightImageUrl || GALLERY_PLACEHOLDER,
    perks: [settings.spotlightPerk1, settings.spotlightPerk2]
      .map((label, i) => ({ label, Icon: SPOTLIGHT_PERK_ICONS[i] }))
      .filter((p) => p.label.trim() !== ""),
  };

  // "Our Impact Together" stats - admin-managed (admin → Site → Community page).
  // Icons are paired by position; a stat with a blank number is hidden.
  const impactStats = settings.impactStats
    .map((stat, i) => ({ ...stat, Icon: IMPACT_STAT_ICONS[i] }))
    .filter((stat) => stat.value.trim() !== "" && stat.Icon);

  // The "From Our Community" section is driven by approved submissions from
  // the share-your-story form. Until any are approved, fall back to the
  // seed quotes so the section is never empty. The marquee shows the newest
  // few; "View All" opens a modal with every approved story.
  const allCommunityQuotes = communityReviews.length
    ? communityReviews.map((r) => ({ quote: r.review, author: r.name }))
    : fallbackQuotes;
  const communityQuotes = allCommunityQuotes.slice(0, 12);

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
      isVideo: p.isVideo,
      platform: "facebook" as const,
      ts: Date.parse(p.timestamp),
    })),
  ].sort((a, b) => b.ts - a.ts);

  // Community Gallery shows photo posts only; Reels & Videos shows video posts.
  // Both come from the tagged Instagram + Facebook feeds (customer UGC).
  const imageTiles = merged.filter((t) => !t.isVideo);
  // Always fill a 4×2 grid: real photos first, topped up with seed photos when
  // the tagged feed is short so the gallery never looks half-empty.
  const allTiles: GalleryTile[] = [...imageTiles, ...fallbackPosts].slice(
    0,
    Math.max(8, imageTiles.length)
  );
  const tiles: GalleryTile[] = allTiles.slice(0, 8);

  // Video posts become reels. Fall back to the seed reels when the feed has no
  // videos yet, so the section is never empty. "View All" opens the full set.
  const videoReels: ReelItem[] = merged
    .filter((t) => t.isVideo)
    .map((t) => ({
      title: t.caption,
      handle: t.platform === "facebook" ? "Facebook" : "Instagram",
      image: t.image,
      href: t.href,
    }));
  const allReels: ReelItem[] = videoReels.length ? videoReels : fallbackReels;
  const reelTiles: ReelItem[] = allReels.slice(0, 3);

  return (
    <>
      {/* ── Hero (sits behind the fixed navbar) ── */}
      <section className="relative -mt-20 flex items-center lg:items-start lg:aspect-[16/5] overflow-hidden">
        {/* Full-bleed banner with text overlaid. Desktop locks to a 16:5 ratio
            with text on the left half; on mobile the image fills the section
            behind the centered text (it zooms/crops, which is expected).
            Design banner images at 16:5 (e.g. 2560×800). */}
        <Image
          src={settings.communityBannerUrl || "/Community_banner.jpg"}
          alt="The Fallowkind community"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Mobile-only soft gradient behind the text so the dark overlay copy
            stays readable over the zoomed image, while the lower image stays
            crisp. Desktop text sits on the calm wall side, so no scrim there. */}
        <div className="absolute inset-0 bg-gradient-to-b from-linen/55 via-linen/20 to-transparent lg:hidden" />
        <div className="relative w-full px-6 pt-28 pb-32 sm:px-10 lg:py-0 lg:pt-28 lg:pl-28 xl:pl-40 lg:pr-20">
          {/* Text sits in the left half of the banner on desktop, so the right
              side stays clear for the photo. On mobile it centers over the image. */}
          <div className="w-full lg:w-1/2">
            <div className="text-center">
              <div className="flex justify-center mb-5 text-sage">
                <IconSprout className="w-9 h-9" />
              </div>
              <h1
                className="text-[#272a12] text-5xl sm:text-6xl xl:text-7xl sm:whitespace-nowrap normal-case leading-[1.05] opacity-0 animate-fade-in-up"
                style={{
                  fontFamily: '"geller-headline-medium", var(--font-serif)',
                  animationDelay: "0.2s",
                  animationFillMode: "forwards",
                }}
              >
                Rooted Together
              </h1>
              <p
                className="mt-6 max-w-sm mx-auto text-[#1c2010] text-lg sm:text-xl leading-relaxed opacity-0 animate-fade-in-up"
                style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
              >
                A community of people choosing comfort, nature, and conscious living.
              </p>
              <div
                className="mt-8 opacity-0 animate-fade-in-up"
                style={{ animationDelay: "0.6s", animationFillMode: "forwards" }}
              >
                <CommunityFormModal
                  label="Share Your Story"
                  className="inline-block bg-[#525d39] text-linen normal-case tracking-normal text-base px-8 py-4 rounded-lg shadow-sm transition-colors duration-300 hover:bg-forest"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Category strip (overlaps hero) ── */}
      {/* Above-the-fold: use a pure-CSS entrance (runs on first paint) instead of
          the JS-gated scroll reveal, so the glass card never flashes see-through
          while waiting for hydration. */}
      <section className="w-full px-5 sm:px-8 lg:px-12 -mt-28 relative z-10">
        <div
          className="opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}
        >
          <div className="bg-white border border-black/5 shadow-md rounded-2xl px-4 py-8 sm:px-8">
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
                  <span className="text-base text-forest">{label}</span>
                  <span className="text-xs text-moss leading-tight max-w-[8rem]">
                    {sub}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Band 1: Gallery · Spotlight · Impact ── */}
      <section className="w-full px-5 sm:px-8 lg:px-12 py-14 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 md:gap-8">
          {/* Community Gallery - live Instagram feed */}
          <AnimateOnScroll className="md:col-span-6 lg:col-span-7">
            <SectionHead
              title="Community Gallery"
              href={INSTAGRAM_PROFILE}
              action={<CommunityGalleryModal tiles={allTiles} />}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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

          {/* Monthly Community Spotlight - hidden when no customer is set */}
          {spotlight.handle.trim() !== "" && (
            <AnimateOnScroll className="md:col-span-3 lg:col-span-3" delay={120}>
              <SectionHead title="Monthly Community Spotlight" />
              <div className="glass-card p-6 sm:p-8 text-center h-[calc(100%-2.75rem)] flex flex-col items-center justify-center">
                <div className="relative w-44 h-44 sm:w-52 sm:h-52 rounded-full overflow-hidden border-2 border-fern/40">
                  <Image
                    src={spotlight.image}
                    alt={`${spotlight.handle} - community spotlight`}
                    fill
                    sizes="208px"
                    className="object-cover"
                  />
                </div>
                <p className="mt-5 text-lg text-forest/70">
                  This month we&apos;re featuring
                </p>
                <p className="mt-1 text-3xl text-sage">{spotlight.handle}</p>
                <p className="mt-3 text-base text-moss">
                  Thank you for inspiring our community!
                </p>
                {spotlight.perks.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-forest/10 w-full max-w-xs grid grid-cols-2 gap-6">
                    {spotlight.perks.map(({ label, Icon }) => (
                      <div
                        key={label}
                        className="flex flex-col items-center gap-2 text-center"
                      >
                        <Icon className="w-6 h-6 text-sage" />
                        <span className="text-xs leading-snug text-moss">
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </AnimateOnScroll>
          )}

          {/* Our Impact Together - hidden when every stat has been cleared */}
          {impactStats.length > 0 && (
            <AnimateOnScroll className="md:col-span-3 lg:col-span-2" delay={240}>
              <h3 className="text-xl sm:text-2xl text-forest normal-case tracking-normal mb-4">
                Our Impact Together
              </h3>
              <div className="glass-tinted p-5 sm:p-6 flex flex-col justify-center gap-8 h-[calc(100%-2.75rem)]">
                {impactStats.map(({ value, label, Icon }) => (
                  <div key={`${value}-${label}`} className="flex items-start gap-3">
                    <Icon className="w-6 h-6 text-sage shrink-0 mt-0.5" />
                    <div>
                      <p className="text-lg text-forest leading-none">{value}</p>
                      <p className="text-xs text-moss leading-tight mt-1">
                        {label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimateOnScroll>
          )}
        </div>
      </section>

      {/* ── Band 2: From Our Community · Reels · Join ── */}
      <section className="w-full px-5 sm:px-8 lg:px-12 pb-16 md:pb-24">
        <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-6 md:gap-8">
          {/* From Our Community */}
          <AnimateOnScroll className="md:col-span-3 lg:col-span-4">
            <SectionHead
              title="From Our Community"
              sub="Real stories from real people."
              href="#"
              action={<CommunityStoriesModal quotes={allCommunityQuotes} />}
            />
            <CommunityQuotes quotes={communityQuotes} />
          </AnimateOnScroll>

          {/* Reels & Videos */}
          <AnimateOnScroll className="md:col-span-3 lg:col-span-5" delay={120}>
            <SectionHead
              title="Reels & Videos"
              sub="Watch. Get inspired. Share."
              href={INSTAGRAM_PROFILE}
              action={<CommunityReelsModal reels={allReels} />}
            />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {reelTiles.map((r, i) => (
                <a
                  key={`${r.title}-${i}`}
                  href={r.href ?? "#"}
                  {...(r.href ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className="group glass-card overflow-hidden flex flex-col"
                >
                  <div className="relative aspect-[9/14] card-img rounded-none">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.image}
                      alt={r.title}
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute inset-0 bg-forest/20 group-hover:bg-forest/30 transition-colors" />
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 text-forest backdrop-blur-md shadow-md transition-transform group-hover:scale-110">
                        <IconPlayFill className="w-4 h-4 ml-0.5" />
                      </span>
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="text-sm leading-snug text-forest/80 font-sans normal-case tracking-normal line-clamp-2">
                      {r.title}
                    </p>
                    <p className="text-xs text-moss mt-1">{r.handle}</p>
                  </div>
                </a>
              ))}
            </div>
          </AnimateOnScroll>

          {/* Join The Circle */}
          <AnimateOnScroll className="md:col-span-6 lg:col-span-3" delay={240}>
            <div className="relative overflow-hidden glass-card bg-forest/95 p-7 h-full flex flex-col justify-center">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 rounded-full bg-fern/10 blur-2xl" />
              <IconLeafBranch className="absolute -right-4 -bottom-4 w-40 h-40 text-fern/30 rotate-12" />
              <div className="relative md:flex md:items-center md:justify-between md:gap-6 lg:block">
                <div>
                  <h3 className="text-linen text-2xl sm:text-3xl normal-case tracking-normal">
                    Join The Circle
                  </h3>
                  <p className="mt-3 text-linen/65 text-base leading-relaxed">
                    Be part of a conscious community.
                  </p>
                </div>
                <CommunityFormModal
                  label="Join Us"
                  className="btn-glass-dark mt-6 md:mt-0 lg:mt-6 inline-block shrink-0"
                />
              </div>
            </div>
          </AnimateOnScroll>
        </div>
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
  action,
}: {
  title: string;
  sub?: string;
  href?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h3 className="text-xl sm:text-2xl text-forest normal-case tracking-normal">
          {title}
        </h3>
        {sub && <p className="text-sm text-moss mt-1">{sub}</p>}
      </div>
      {action ??
        (href && (
          <a
            href={href}
            className="text-xs tracking-widest uppercase text-sage hover:text-forest transition-colors shrink-0"
          >
            View All
          </a>
        ))}
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
