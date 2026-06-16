import type { Metadata } from "next";
import Image from "next/image";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import ReviewForm from "@/components/ReviewForm";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Real Fallowkind customers, real comfort. See how our community lives in natural fibres - photos, kind words and everyday moments shared by the people who wear Fallowkind.",
  alternates: { canonical: "/community" },
  openGraph: {
    title: "Community | Fallowkind",
    description:
      "Real people, real comfort - photos and kind words from the Fallowkind community.",
    url: "/community",
    type: "website",
  },
};
export const revalidate = 3600;

// Big, wide customer-feedback photos. Swap these placeholder images in /public
// for real customer photos (landscape works best for the wide layout).
const feedbackWall = [
  {
    image: "/banner.png",
    name: "Kavindu S.",
    location: "Colombo",
    rating: 5,
    quote:
      "Honestly the softest thing I own. I wore it three days in a row and it still felt fresh - the fabric just breathes.",
  },
  {
    image: "/ModuraShop.jpg",
    name: "Nethmi P.",
    location: "Kandy",
    rating: 5,
    quote:
      "You can feel the difference the second you put it on. Lightweight, natural, and it looks even better in person.",
  },
  {
    image: "/Rooted in Land.jpg",
    name: "Tharushi D.",
    location: "Galle",
    rating: 5,
    quote:
      "Finally clothing that feels kind on my skin. Simple, minimal, and made to actually last.",
  },
  {
    image: "/ModuraShop.jpg",
    name: "Yashen K.",
    location: "Negombo",
    rating: 5,
    quote:
      "Knowing there are no hidden plastics makes me feel good about every wear. Comfort without the compromise.",
  },
  {
    image: "/Rooted in Land.jpg",
    name: "Anjana F.",
    location: "Kurunegala",
    rating: 5,
    quote:
      "Easily the most comfortable tee in my wardrobe. Soft, breathable, and it holds up wash after wash.",
  },
  {
    image: "/banner.png",
    name: "Ruwan J.",
    location: "Anuradhapura",
    rating: 5,
    quote:
      "The quality genuinely surprised me. Feels premium, fits perfectly, and the colour hasn't faded at all.",
  },
  {
    image: "/ModuraShop.jpg",
    name: "Senuri A.",
    location: "Batticaloa",
    rating: 5,
    quote:
      "So light and airy in the heat. I keep reaching for it over everything else I own.",
  },
  {
    image: "/Rooted in Land.jpg",
    name: "Kasun L.",
    location: "Gampaha",
    rating: 5,
    quote:
      "Clean, minimal, and made to last. You can feel the care that went into every stitch.",
  },
  {
    image: "/banner.png",
    name: "Tharindi S.",
    location: "Nuwara Eliya",
    rating: 5,
    quote:
      "Sustainable and actually stylish - finally a brand that gets both right. Couldn't be happier.",
  },
];

// Short written notes from the community (text only).
const kindWords = [
  {
    name: "Dinara W.",
    location: "Colombo",
    rating: 5,
    quote: "The fit, comfort, and fabric quality are all perfect. Definitely ordering again.",
  },
  {
    name: "Sahan M.",
    location: "Matara",
    rating: 5,
    quote: "Packaging, fabric, the whole experience felt thoughtful. You can tell it's made with care.",
  },
  {
    name: "Ishara R.",
    location: "Jaffna",
    rating: 5,
    quote: "Breathable in our heat and still looks clean and minimal. Exactly what I was searching for.",
  },
];

function Stars({ rating, className = "" }: { rating: number; className?: string }) {
  return (
    <div className={`flex gap-1 ${className}`} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: rating }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
          <path d="M12 2.5l2.95 6.34 6.95.74-5.2 4.74 1.47 6.83L12 17.77l-6.17 3.38 1.47-6.83-5.2-4.74 6.95-.74L12 2.5z" />
        </svg>
      ))}
    </div>
  );
}

export default function CommunityPage() {
  const [featured, ...rest] = feedbackWall;

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-forest section-padding pt-20 md:pt-24 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -left-32 -top-32 w-96 h-96 rounded-full border border-fern/10" />
        <div className="absolute -left-20 -top-20 w-64 h-64 rounded-full border border-fern/10" />

        <div className="page-container max-w-4xl relative text-center">
          <p
            className="text-[10px] sm:text-xs tracking-[0.4em] uppercase text-fern mb-6 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}
          >
            Kind to your skin, worn by people like you
          </p>
          <h1
            className="text-linen text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-8 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.45s", animationFillMode: "forwards" }}
          >
            Our Community
          </h1>
          <p
            className="text-linen/65 text-base sm:text-lg leading-relaxed opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.65s", animationFillMode: "forwards" }}
          >
            Behind every piece is a person who chose comfort without compromise. These are real
            moments and honest words from the people who live in Fallowkind - proof that natural
            fibres simply feel better, day after day.
          </p>
        </div>
      </section>

      {/* ── Featured wide feedback ── */}
      <section className="w-full px-4 py-14 sm:py-16 md:py-20">
        <AnimateOnScroll>
          <figure className="relative overflow-hidden rounded-3xl shadow-lg border border-white/40 group">
            <div className="relative aspect-[16/10] sm:aspect-[2/1] lg:aspect-[21/9]">
              <Image
                src={featured.image}
                alt={`${featured.name} wearing Fallowkind`}
                fill
                sizes="100vw"
                priority
                className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/30 to-transparent" />
            </div>
            <figcaption className="absolute inset-x-0 bottom-0 p-6 sm:p-8 md:p-12 max-w-3xl">
              <Stars rating={featured.rating} className="text-fern mb-4" />
              <blockquote className="text-linen text-xl sm:text-2xl md:text-4xl font-serif italic normal-case tracking-normal leading-snug">
                &ldquo;{featured.quote}&rdquo;
              </blockquote>
              <p className="mt-5 text-xs tracking-[0.25em] uppercase text-linen/70">
                {featured.name} · {featured.location}
              </p>
            </figcaption>
          </figure>
        </AnimateOnScroll>
      </section>

      {/* ── Feedback wall ── */}
      <section className="w-full px-4 py-14 sm:py-16 md:py-20 pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {rest.map((f, i) => (
            <AnimateOnScroll key={f.name} delay={i * 120}>
              <figure className="relative overflow-hidden rounded-3xl shadow-lg border border-white/40 group h-full">
                <div className="relative aspect-[4/3] sm:aspect-[3/2]">
                  <Image
                    src={f.image}
                    alt={`${f.name} wearing Fallowkind`}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/25 to-transparent" />
                </div>
                <figcaption className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <Stars rating={f.rating} className="text-fern mb-3" />
                  <blockquote className="text-linen text-base sm:text-lg font-serif italic normal-case tracking-normal leading-relaxed">
                    &ldquo;{f.quote}&rdquo;
                  </blockquote>
                  <p className="mt-4 text-[11px] tracking-[0.25em] uppercase text-linen/70">
                    {f.name} · {f.location}
                  </p>
                </figcaption>
              </figure>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* ── Kind words (text only) ── */}
      <section className="relative section-padding overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cream/55 via-linen/30 to-fern/20" />
        <div className="absolute -top-32 -right-20 w-96 h-96 rounded-full bg-fern/25 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-moss/20 blur-3xl" />

        <div className="relative page-container">
          <AnimateOnScroll className="text-center mb-12 md:mb-16">
            <p className="text-xs tracking-[0.3em] uppercase text-moss mb-3">Kind words</p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl text-forest">Straight from you</h2>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {kindWords.map((t, i) => (
              <AnimateOnScroll key={t.name} delay={i * 120}>
                <article className="glass-card p-7 md:p-8 h-full flex flex-col">
                  <Stars rating={t.rating} className="text-sage mb-4" />
                  <p className="text-forest/75 leading-relaxed text-base font-serif italic normal-case tracking-normal mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-auto pt-4 border-t border-forest/10">
                    <p className="text-sm text-forest">{t.name}</p>
                    <p className="text-xs tracking-widest uppercase text-moss mt-1">{t.location}</p>
                  </div>
                </article>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Share your review ── */}
      <section className="section-padding page-container">
        <AnimateOnScroll>
          <div className="relative overflow-hidden rounded-3xl bg-forest border border-white/10 shadow-lg px-6 py-12 sm:px-12 sm:py-14 md:py-16 text-center">
            {/* Decorative circles + soft glow */}
            <div className="absolute -right-24 -bottom-24 w-80 h-80 rounded-full border border-fern/10" />
            <div className="absolute -left-24 -top-24 w-80 h-80 rounded-full border border-fern/10" />
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-fern/10 blur-3xl" />

            <div className="relative max-w-xl mx-auto">
              <p className="text-xs tracking-[0.3em] uppercase text-fern mb-3">Be part of it</p>
              <h2 className="text-linen text-3xl sm:text-4xl md:text-5xl mb-4">Share your Fallowkind</h2>
              <p className="text-linen/65 leading-relaxed mb-8 max-w-md mx-auto">
                Tell us how your Fallowkind feels to wear. We&apos;d love to hear your story - and we
                may feature it here for the rest of the community to see.
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
