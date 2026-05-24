import type { Metadata } from "next";
import Image from "next/image";
import AnimateOnScroll from "@/components/AnimateOnScroll";

export const metadata: Metadata = { title: "Our Story" };

const values = [
  {
    label: "Binatural Materials",
    body:  "Every fibre we use is chosen for its relationship to the earth — linen, organic cotton, and recycled wool that returns, rather than extracts.",
  },
  {
    label: "Slow Production",
    body:  "We work with small workshops that value craft over speed. Limited runs, made with care.",
  },
  {
    label: "Regenerative Roots",
    body:  "A portion of every sale funds soil health projects. The land gives; we give back.",
  },
];

export default function OurStoryPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-forest section-padding relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full border border-fern/10" />
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full border border-fern/10" />

        <div className="page-container max-w-3xl relative">
          <h1
            className="text-linen text-5xl md:text-7xl lg:text-8xl mb-10 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
          >
            Our Vision
          </h1>
          <p
            className="text-linen/65 text-lg leading-relaxed max-w-xl opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.65s", animationFillMode: "forwards" }}
          >
            To shape a future where what we wear honours the earth that made it - clothing crafted
            with intention, worn with meaning, and made to leave the land better than we found it.
          </p>
        </div>
      </section>

      {/* ── Story body ── */}
      <section className="section-padding page-container grid md:grid-cols-2 gap-16 items-start">
        <AnimateOnScroll>
          <h2 className="text-5xl md:text-6xl mb-8">Where it started</h2>
          <div className="space-y-5 text-forest/65 leading-relaxed">
            <p>
              We grew up around fields — the kind that get left fallow between seasons so the soil
              can breathe and rebuild. That rhythm of rest and renewal became the heartbeat of
              Fallowkind.
            </p>
            <p>
              We started with one tee, a market stall, and a belief that people were ready for
              something quieter. Something that didn&apos;t shout.
            </p>
            <p>
              Years later, the collection has grown — but the intention hasn&apos;t changed. Every piece
              is an invitation to slow down and choose well.
            </p>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={150}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl group shadow-lg border border-white/40">
            <Image
              src="/ModuraShop.jpg"
              alt="Modura Shop - Our beginning"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute bottom-6 left-6 right-6 glass-panel p-5">
              <p className="text-[10px] tracking-widest uppercase text-moss mb-2">Our beginning</p>
              <p className="text-forest/80 text-sm font-serif italic leading-relaxed normal-case tracking-normal">
                &ldquo;One tee. A market stall. A belief.&rdquo;
              </p>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* ── Values ── */}
      <section className="relative section-padding overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cream/55 via-linen/30 to-fern/20" />
        <div className="absolute -top-32 -right-20 w-96 h-96 rounded-full bg-fern/25 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-moss/20 blur-3xl" />

        <div className="relative page-container">
          <AnimateOnScroll className="text-center mb-16">
            <p className="text-xs tracking-[0.3em] uppercase text-moss mb-3">Principles</p>
            <h2 className="text-5xl md:text-7xl">What we stand for</h2>
          </AnimateOnScroll>

          <div className="grid md:grid-cols-3 gap-8">
            {values.map((v, i) => (
              <AnimateOnScroll key={v.label} delay={i * 120}>
                <div className="glass-card p-8 h-full">
                  <span className="inline-block w-8 h-px bg-sage mb-7" />
                  <h3 className="text-2xl mb-4">{v.label}</h3>
                  <p className="text-forest/60 leading-relaxed text-sm">{v.body}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="section-padding page-container">
        <AnimateOnScroll className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { number: "100%", label: "Natural fibres" },
            { number: "12",   label: "Workshop partners" },
            { number: "3%",   label: "Revenue to soil projects" },
            { number: "2026", label: "Founded" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-5xl md:text-7xl font-display text-forest mb-2 leading-none">{s.number}</p>
              <p className="text-xs tracking-widest uppercase text-moss">{s.label}</p>
            </div>
          ))}
        </AnimateOnScroll>
      </section>

      {/* ── Pull quote ── */}
      <AnimateOnScroll>
        <section className="relative section-padding overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cream/60 via-linen/40 to-fern/25" />
          <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-fern/25 blur-3xl" />
          <div className="absolute -bottom-32 right-1/4 w-96 h-96 rounded-full bg-moss/20 blur-3xl" />
          <div className="relative page-container text-center max-w-3xl mx-auto">
            <p className="text-4xl md:text-5xl text-forest font-serif italic leading-snug normal-case tracking-normal">
              &ldquo;The future is conscious — and it starts with what we wear.&rdquo;
            </p>
            <p className="mt-6 text-xs tracking-[0.3em] uppercase text-moss">— Fallowkind</p>
          </div>
        </section>
      </AnimateOnScroll>
    </>
  );
}
