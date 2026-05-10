import type { Metadata } from "next";
import Link from "next/link";
import AnimateOnScroll from "@/components/AnimateOnScroll";

export const metadata: Metadata = { title: "Home" };

const featured = [
  { id: 1, name: "Field Tee",       category: "Tops",     price: "$48",  tag: "New"        },
  { id: 2, name: "Canvas Tote",     category: "Bags",     price: "$36"                     },
  { id: 3, name: "Harvest Beanie",  category: "Headwear", price: "$32",  tag: "Bestseller" },
  { id: 4, name: "Linen Overshirt", category: "Tops",     price: "$95",  tag: "New"        },
];

const marqueeItems = [
  "Binatural Materials",
  "Slow Production",
  "Regenerative Living",
  "Made to Last",
  "Conscious Fashion",
  "Rooted in the Land",
];

export default function HomePage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="relative -mt-16 h-screen min-h-[640px] overflow-hidden bg-forest flex items-end">
        <div className="absolute inset-0">
          <video
            autoPlay muted loop playsInline
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src="/mp5.mp4" type="video/mp4" />
          </video>
          {/* Gradient overlay — heavier at bottom for text legibility */}
          <div className="absolute inset-0 bg-gradient-to-t from-forest/80 via-forest/20 to-transparent" />
        </div>

        <div className="relative section-padding page-container w-full pb-24">
          <p
            className="text-xs tracking-[0.35em] uppercase text-fern mb-5 opacity-0 animate-fade-in"
            style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}
          >
            The Fallowkind Issue — Regenerative Living
          </p>
          <h1
            className="text-linen text-5xl md:text-7xl lg:text-8xl leading-[1.05] max-w-3xl mb-10 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}
          >
            The Future<br />is Conscious.
          </h1>
          <div
            className="flex flex-wrap gap-4 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.8s", animationFillMode: "forwards" }}
          >
            <Link href="/shop" className="btn-primary">
              Shop the Collection
            </Link>
            <Link href="/our-story" className="rounded-lg border border-linen/50 text-linen px-7 py-3.5 text-xs tracking-widest uppercase transition-all duration-300 hover:border-linen hover:bg-linen/10 hover:tracking-[0.22em]">
              Our Story
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 right-10 flex flex-col items-center gap-2 opacity-0 animate-fade-in"
          style={{ animationDelay: "1.2s", animationFillMode: "forwards" }}
        >
          <span className="text-[10px] tracking-[0.25em] uppercase text-linen/50 rotate-90 origin-center mb-4">Scroll</span>
          <div className="w-px h-12 bg-linen/30 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full bg-fern animate-[fadeInUp_2s_ease-in-out_infinite]" style={{ height: "40%" }} />
          </div>
        </div>
      </section>

      {/* ── Marquee strip ── */}
      <div className="bg-forest py-4 overflow-hidden select-none">
        <div className="marquee-track">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="flex items-center gap-6 px-6 text-xs tracking-[0.3em] uppercase text-fern whitespace-nowrap">
              {item}
              <span className="w-1 h-1 rounded-full bg-fern/40 flex-shrink-0" />
            </span>
          ))}
        </div>
      </div>

      {/* ── New Arrivals ── */}
      <section className="section-padding page-container">
        <AnimateOnScroll className="flex items-end justify-between mb-12">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-moss mb-3">Fresh in</p>
            <h2 className="text-3xl md:text-4xl text-forest">New Arrivals</h2>
          </div>
          <Link
            href="/shop"
            className="text-xs tracking-widest uppercase text-sage hover:text-forest transition-colors duration-200 group flex items-center gap-2"
          >
            View all
            <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </Link>
        </AnimateOnScroll>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {featured.map((item, i) => (
            <AnimateOnScroll key={item.id} delay={i * 100}>
              <ProductCard {...item} />
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* ── Commitment strip ── */}
      <AnimateOnScroll>
        <section className="bg-sage py-24 overflow-hidden">
          <div className="page-container text-center px-6">
            <p className="text-xs tracking-[0.35em] uppercase text-linen/50 mb-5">Our commitment</p>
            <h2 className="text-linen text-3xl md:text-5xl lg:text-6xl max-w-3xl mx-auto leading-tight font-display">
              Binatural materials,<br />made to last.
            </h2>
            <div className="mt-10 flex justify-center">
              <Link href="/our-story" className="rounded-lg border border-linen/40 text-linen/80 px-7 py-3 text-xs tracking-widest uppercase transition-all duration-300 hover:border-linen hover:text-linen hover:tracking-[0.22em]">
                Learn more
              </Link>
            </div>
          </div>
        </section>
      </AnimateOnScroll>

      {/* ── Values row ── */}
      <section className="section-padding page-container">
        <AnimateOnScroll className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] uppercase text-moss mb-3">Why Fallowkind</p>
          <h2 className="text-3xl md:text-4xl text-forest">What we stand for</h2>
        </AnimateOnScroll>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { label: "Binatural Materials", body: "Every fibre is chosen for its relationship to the earth — linen, organic cotton, recycled wool." },
            { label: "Slow Production", body: "Small workshops that value craft over speed. Limited runs, made with intention." },
            { label: "Regenerative Roots", body: "A portion of every sale funds soil health projects. The land gives; we give back." },
          ].map((v, i) => (
            <AnimateOnScroll key={v.label} delay={i * 120}>
              <div className="border-t-2 border-sage pt-7">
                <div className="w-6 h-6 mb-5">
                  <LeafIcon />
                </div>
                <h3 className="text-lg mb-3 font-display">{v.label}</h3>
                <p className="text-forest/60 leading-relaxed text-sm">{v.body}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* ── Story teaser ── */}
      <section className="section-padding page-container grid md:grid-cols-2 gap-16 items-center">
        <AnimateOnScroll delay={0} className="reveal-left">
          <p className="text-xs tracking-[0.3em] uppercase text-moss mb-5">Who we are</p>
          <h2 className="text-3xl md:text-4xl mb-7 leading-snug">Rooted in<br />the land.</h2>
          <p className="text-forest/65 leading-relaxed mb-10 max-w-md">
            Fallowkind was born from a belief that clothing can be a gentle act — a choice that honours
            the soil, the seasons, and the people who work with their hands.
          </p>
          <Link href="/our-story" className="btn-outline inline-block">
            Our Story
          </Link>
        </AnimateOnScroll>

        <AnimateOnScroll delay={150}>
          <div className="relative aspect-[4/5] bg-cream overflow-hidden rounded-sm group">
            <div className="absolute inset-0 bg-gradient-to-br from-fern/30 to-sage/20 group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-xs tracking-[0.25em] uppercase text-forest/50 mb-1">Est. 2023</p>
              <p className="text-forest/80 text-sm font-display italic leading-relaxed">
                &ldquo;We started with one tee and a market stall.&rdquo;
              </p>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* ── Pull quote ── */}
      <AnimateOnScroll>
        <section className="bg-cream section-padding">
          <div className="page-container text-center max-w-3xl mx-auto">
            <p className="text-4xl md:text-5xl text-forest font-display leading-snug">
              &ldquo;The future is conscious — and it starts with what we wear.&rdquo;
            </p>
            <p className="mt-6 text-xs tracking-[0.3em] uppercase text-moss">— Fallowkind</p>
          </div>
        </section>
      </AnimateOnScroll>
    </>
  );
}

function ProductCard({ name, category, price, tag }: { name: string; category: string; price: string; tag?: string }) {
  return (
    <div className="group cursor-pointer">
      <div className="relative card-img bg-cream aspect-[3/4] mb-4">
        <div className="w-full h-full bg-gradient-to-br from-fern/25 to-sage/15" />
        {tag && (
          <span className="absolute top-3 left-3 text-[9px] tracking-widest uppercase bg-forest text-linen px-2.5 py-1 z-10">
            {tag}
          </span>
        )}
        {/* Quick add — slides up on hover */}
        <div className="absolute bottom-0 inset-x-0 bg-forest/90 backdrop-blur-sm text-linen text-[10px] tracking-widest uppercase text-center py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          Quick Add
        </div>
      </div>
      <p className="text-[10px] tracking-widest uppercase text-moss mb-1">{category}</p>
      <div className="flex justify-between items-baseline">
        <p className="text-sm font-medium text-forest group-hover:text-sage transition-colors duration-200">{name}</p>
        <p className="text-sm text-sage">{price}</p>
      </div>
    </div>
  );
}

function LeafIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="text-sage w-full h-full">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c-4.97 0-9 4.03-9 9 0 2.49 1.01 4.74 2.64 6.37C7.27 19.99 9.51 21 12 21s4.73-1.01 6.36-2.63C19.99 16.74 21 14.49 21 12c0-4.97-4.03-9-9-9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18" />
    </svg>
  );
}
