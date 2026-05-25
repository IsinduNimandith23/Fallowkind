import Image from "next/image";
import Link from "next/link";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { getAllProducts } from "@/lib/products";
import { getSiteSettings } from "@/lib/siteSettings";

// Cache the rendered page. Admin mutations call revalidatePath("/") to bust it.
export const revalidate = 3600;

const marqueeItems = [
  "Grounded In Nature",
  "Wear Better Everyday",
  "Natural Fabrics Only",
  "Slow Fashion Essentials",
  "Made With Intention",
  "Honest Clothing",
  "Soft On Skin",
  "No Hidden Plastics",
  "Less Waste More Purpose",
  "Thoughtfully Made",
  "Better Fabrics Better Future",
  "Comfort In Natural Form",
  "Designed To Last",
  "Pure Fabrics Pure Comfort",
  "Nature First Always",
  "Everyday Sustainability",
  "Simplicity Meets Sustainability",
  "Clean Materials Clean Living",
  "Timeless Sustainable Wear",
  "Fallowkind For The Future",
];

const testimonials = [
  {
    name: "Kavindu S.",
    quote: "The quality is honestly amazing. Soft fabric and super comfortable for everyday wear.",
    rating: 5,
  },
  {
    name: "Nethmi P.",
    quote: "You can feel the difference straight away. Lightweight, breathable, and premium.",
    rating: 5,
  },
  {
    name: "Tharushi D.",
    quote: "Love the simple designs and natural fabric feel. Exactly what I was searching for.",
    rating: 5,
  },
  {
    name: "Yashen K.",
    quote: "Finally found clothing that feels good on the skin and still looks clean and minimal.",
    rating: 5,
  },
  {
    name: "Dinara W.",
    quote: "The fit, comfort, and fabric quality are all perfect. Definitely ordering again.",
    rating: 5,
  },
];

export default async function HomePage() {
  const [products, settings] = await Promise.all([
    getAllProducts(),
    getSiteSettings(),
  ]);
  const featured = products.slice(0, 3);
  const heroVideo = settings.heroVideoUrl || "/mp5.mp4";
  const heroEyebrow      = settings.heroEyebrow;
  const heroHeadingLine1 = settings.heroHeadingLine1;
  const heroHeadingLine2 = settings.heroHeadingLine2;
  const commitmentBanner = settings.commitmentBannerUrl;

  return (
    <>
      {/* ── Hero ── */}
      <section className="relative -mt-20 h-screen min-h-[600px] sm:min-h-[680px] overflow-hidden bg-forest">
        <div className="absolute inset-0">
          <video
            key={heroVideo}
            autoPlay muted loop playsInline
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src={heroVideo} type="video/mp4" />
          </video>
          {/* Subtle top/bottom darkening for legibility — no side tint */}
          <div className="absolute inset-0 bg-gradient-to-t from-forest/70 via-transparent to-forest/25" />
          {/* Soft vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_50%,transparent_45%,rgba(42,61,42,0.35)_100%)]" />
        </div>

        {/* Main content */}
        <div className="relative h-full flex flex-col items-center md:items-start justify-center text-center md:text-left px-4 sm:px-6 md:px-12 lg:px-24 pt-32 pb-20 sm:pt-48 sm:pb-24 max-w-[1400px]">
          {heroEyebrow && (
            <div
              className="flex items-center gap-4 mb-8 opacity-0 animate-fade-in"
              style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}
            >
              <span className="w-10 h-px bg-fern/70" />
              <p className="text-[11px] tracking-[0.4em] uppercase text-fern/95">
                {heroEyebrow}
              </p>
            </div>
          )}

          <h1
            className="text-linen mb-10 md:mb-12 max-w-5xl font-bold"
            style={{
              fontFamily:
                '"Myriad Pro", "Myriad Pro Regular", Myriad, "Helvetica Neue", Helvetica, Arial, sans-serif',
            }}
          >
            {heroHeadingLine1 && (
              <span
                className="block uppercase whitespace-nowrap leading-[0.92] tracking-tight text-[clamp(2.1rem,9.2vw,3.6rem)] sm:text-6xl md:text-7xl lg:text-8xl xl:text-[7rem] opacity-0 animate-fade-in-up"
                style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}
              >
                {heroHeadingLine1}
              </span>
            )}
            {heroHeadingLine2 && (
              <span
                className="block italic normal-case leading-[1.05] tracking-tight text-[clamp(1.35rem,5.6vw,2.1rem)] sm:text-3xl md:text-4xl lg:text-5xl xl:text-[3.75rem] text-linen/95 mt-3 md:mt-4 opacity-0 animate-fade-in-up"
                style={{ animationDelay: "0.75s", animationFillMode: "forwards" }}
              >
                {heroHeadingLine2}
              </span>
            )}
          </h1>

          <div
            className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-4 sm:gap-x-10 sm:gap-y-5 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "1s", animationFillMode: "forwards" }}
          >
            <Link
              href="/shop"
              className="group inline-flex items-center gap-3 rounded-full bg-linen text-forest pl-5 sm:pl-7 pr-2 py-2 text-[10px] sm:text-xs tracking-[0.22em] uppercase shadow-lg shadow-forest/30 transition-all duration-300 hover:bg-fern hover:shadow-xl hover:shadow-forest/40"
            >
              <span>Shop the Collection</span>
              <span className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-forest text-linen transition-transform duration-300 group-hover:translate-x-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                </svg>
              </span>
            </Link>
            <Link
              href="/our-story"
              className="group relative text-linen text-[11px] tracking-[0.35em] uppercase pb-2"
            >
              <span className="relative z-10">Discover our story</span>
              <span className="absolute left-0 bottom-0 h-px w-full bg-linen/40 transition-all duration-500 group-hover:bg-linen" />
              <span className="absolute left-0 bottom-0 h-px w-0 bg-fern transition-all duration-500 group-hover:w-full" />
            </Link>
          </div>
        </div>

        {/* Scroll indicator — right edge, lifted above the welcome-popup FAB */}
        <div
          className="absolute right-6 lg:right-10 bottom-24 z-10 hidden sm:flex flex-col items-center gap-3 opacity-0 animate-fade-in"
          style={{ animationDelay: "1.3s", animationFillMode: "forwards" }}
        >
          <span className="vertical-text text-[10px] tracking-[0.4em] uppercase text-linen/55">Scroll</span>
          <div className="w-px h-12 bg-linen/25 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full bg-fern animate-[scrollDown_2s_ease-in-out_infinite]" style={{ height: "40%" }} />
          </div>
        </div>

        {/* Hairline divider above marquee */}
        <div
          className="absolute bottom-0 inset-x-0 z-10 opacity-0 animate-fade-in"
          style={{ animationDelay: "1.3s", animationFillMode: "forwards" }}
        >
          <div className="h-px bg-gradient-to-r from-transparent via-linen/20 to-transparent" />
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
        <AnimateOnScroll className="flex items-end justify-between mb-10 md:mb-12 gap-4">
          <div className="min-w-0">
            <p className="text-xs tracking-[0.3em] uppercase text-moss mb-3">Fresh in</p>
            <h2 className="text-4xl sm:text-5xl md:text-7xl text-forest">New Arrivals</h2>
          </div>
          <Link
            href="/shop"
            className="shrink-0 text-[11px] sm:text-xs tracking-widest uppercase text-sage hover:text-forest transition-colors duration-200 group flex items-center gap-2"
          >
            View all
            <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
          </Link>
        </AnimateOnScroll>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-10 md:gap-x-8 md:gap-y-14">
          {featured.map((item, i) => (
            <AnimateOnScroll key={item.id} delay={i * 100}>
              <Link href={`/shop/${item.id}`} className="group block">
                <ProductCard {...item} />
              </Link>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* ── Commitment strip ── */}
      <AnimateOnScroll>
        <section className="relative bg-linen overflow-hidden">
          {commitmentBanner && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={commitmentBanner}
              alt=""
              className="block w-full h-[220px] object-cover object-center sm:h-auto"
            />
          )}
        </section>
      </AnimateOnScroll>

      {/* ── Values row ── */}
      <section className="section-padding page-container">
        <AnimateOnScroll className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl md:text-7xl text-forest">What we stand for</h2>
        </AnimateOnScroll>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { label: "Ethically\nMade", body: "Honest craftsmanship that honours people & planet.", Icon: SproutIcon },
            { label: "Sustainable &\nEco-Friendly", body: "Everyday essentials made with lower environmental impact.", Icon: ShirtIcon },
            { label: "No Hidden Plastics", body: "No polyester, no microfibre shedding, no synthetic blends.", Icon: FlaskIcon },
          ].map((v, i) => (
            <AnimateOnScroll key={v.label} delay={i * 120}>
              <div className="glass-card p-8 h-full text-center">
                <div className="w-14 h-14 mb-5 mx-auto">
                  <v.Icon />
                </div>
                <h3 className="text-2xl mb-3 whitespace-pre-line">{v.label}</h3>
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
          <h2 className="text-4xl sm:text-5xl md:text-7xl mb-7">Rooted in<br />the land.</h2>
          <p className="text-forest/65 leading-relaxed mb-10 max-w-md text-justify">
            Most modern clothing contains synthetic materials like polyester and nylon, which release
            microplastics over time. These fabrics often rely on heavy chemical processing and artificial
            dyes that come into direct contact with your skin every day. At Fallowkind, we chose a
            different path. Our pieces are made with natural cotton and linen, focusing on breathable
            comfort, no hidden plastics, and slow fashion designed for everyday living.
          </p>
          <Link href="/our-story" className="btn-outline inline-block">
            Our Story
          </Link>
        </AnimateOnScroll>

        <AnimateOnScroll delay={150}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl group shadow-lg border border-white/40">
            <Image
              src="/Rooted in Land.jpg"
              alt="Rooted in the land"
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
          </div>
        </AnimateOnScroll>
      </section>

      {/* ── Testimonials (auto-scrolling) ── */}
      <section className="bg-cream/40 py-24 overflow-hidden">
        <AnimateOnScroll className="text-center mb-14 px-6">
          <p className="text-xs tracking-[0.3em] uppercase text-moss mb-3">Kind words</p>
          <h2 className="text-4xl sm:text-5xl md:text-7xl text-forest">From our community</h2>
          <p className="text-forest/60 leading-relaxed mt-5 max-w-xl mx-auto text-sm">
            Early voices from supporters who have lived with the pieces.
          </p>
        </AnimateOnScroll>

        <div className="testimonial-mask overflow-hidden">
          <div className="testimonial-track py-4">
            {[...testimonials, ...testimonials].map((t, i) => (
              <article
                key={i}
                className="glass-card p-7 mx-3 w-[320px] md:w-[380px] flex-shrink-0 flex flex-col"
              >
                <div className="flex gap-1 mb-4" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: t.rating }).map((_, s) => (
                    <StarIcon key={s} />
                  ))}
                </div>
                <p className="text-forest/75 leading-relaxed text-sm font-serif italic normal-case tracking-normal mb-6">
                  “{t.quote}”
                </p>
                <div className="mt-auto pt-4 border-t border-forest/10">
                  <p className="text-sm text-forest">{t.name}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

    </>
  );
}

function ProductCard({ name, price, originalPrice, tag, imageUrl, imageUrl2 }: { name: string; category: string; price: string; originalPrice?: string; tag?: string; imageUrl?: string; imageUrl2?: string }) {
  return (
    <>
      <div className="relative card-img bg-cream/40 backdrop-blur-sm border border-white/40 shadow-sm aspect-[4/5] mb-4 overflow-hidden">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={name}
              fill
              sizes="(min-width: 768px) 33vw, 50vw"
              className={`object-cover transition-all duration-500 ease-out ${
                imageUrl2
                  ? "group-hover:opacity-0 group-hover:scale-105"
                  : "group-hover:scale-105"
              }`}
            />
            {imageUrl2 && (
              <Image
                src={imageUrl2}
                alt=""
                fill
                sizes="(min-width: 768px) 33vw, 50vw"
                className="object-cover opacity-0 scale-105 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500 ease-out"
              />
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-fern/30 to-sage/15" />
        )}
        {tag && (
          <span className="absolute top-3 left-3 tag-pill z-10">
            {tag}
          </span>
        )}
        <div className="absolute bottom-0 inset-x-0 bg-forest/80 backdrop-blur-md text-linen text-[10px] tracking-widest uppercase text-center py-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
          View Product
        </div>
      </div>
      <div className="px-3 space-y-1">
        <p className="text-sm text-forest group-hover:text-sage transition-colors duration-200">{name}</p>
        <p className="text-sm text-forest/70">
          {price}
          {originalPrice && (
            <span className="ml-2 text-forest/40 line-through">{originalPrice}</span>
          )}
        </p>
      </div>
    </>
  );
}

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-sage">
      <path d="M12 2.5l2.95 6.34 6.95.74-5.2 4.74 1.47 6.83L12 17.77l-6.17 3.38 1.47-6.83-5.2-4.74 6.95-.74L12 2.5z" />
    </svg>
  );
}

function SproutIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="text-sage w-full h-full">
      <circle cx="32" cy="32" r="29" />
      <path d="M20 48c4-2 8-3 12-3s8 1 12 3" />
      <path d="M32 45V28" />
      <path d="M32 32c0-6 4-11 11-12-.5 6-4 11-11 12z" />
      <path d="M32 38c0-5-4-9-10-10 .5 5 4 9 10 10z" />
      <path d="M28 45c1-1 2-1.5 4-1.5s3 .5 4 1.5" />
    </svg>
  );
}

function ShirtIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="text-sage w-full h-full">
      <circle cx="32" cy="32" r="29" />
      <path d="M27 18 L20 22 L15 29 L22 32 L22 47 L42 47 L42 32 L49 29 L44 22 L37 18" />
      <path d="M27 18 C28 22 30 23 32 23 C34 23 36 22 37 18" />
      <path d="M32 48 C32 39 40 33 50 34 C49 44 42 49 32 48 Z" />
      <path d="M28 51 L49 34" />
    </svg>
  );
}

function FlaskIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" className="text-sage w-full h-full">
      <circle cx="32" cy="32" r="29" />
      <path d="M27 16h10" />
      <path d="M28 16v9L19 44a3 3 0 0 0 2.7 4.3h20.6A3 3 0 0 0 45 44l-9-19v-9" />
      <path d="M23 38h18" />
      <circle cx="29" cy="42" r="1" />
      <circle cx="34" cy="44" r="1" />
      <circle cx="32" cy="40" r="0.7" />
      <line x1="12" y1="12" x2="52" y2="52" />
    </svg>
  );
}
