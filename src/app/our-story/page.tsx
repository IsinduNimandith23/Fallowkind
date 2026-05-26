import type { Metadata } from "next";
import Image from "next/image";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import { getSiteSettings } from "@/lib/siteSettings";

export const metadata: Metadata = { title: "Our Story" };
export const revalidate = 0;

export default async function OurStoryPage() {
  const settings = await getSiteSettings();

  const principles = [
    {
      number: "01",
      label: "Pure Materials, Pure Living",
      image: settings.ourStoryPrinciple1Url,
      paragraphs: [
        "At Fallowkind, we choose materials that align with human health and natural living. We use only natural fibers like cotton, linen, and hemp. These fabrics come from the earth and return to the earth. They breathe with your body, stay soft on your skin, and support comfort through daily wear.",
        "Natural fibers allow air flow and reduce heat buildup. They help your skin stay dry and calm. They avoid heavy chemical processing and reduce contact with synthetic plastics found in many modern garments. Our focus stays on simple, clean materials that support long-term wear without unnecessary additives. Each fabric choice reflects respect for your body and respect for nature.",
      ],
    },
    {
      number: "02",
      label: "Slow Fashion, Thoughtful Production",
      image: settings.ourStoryPrinciple2Url,
      paragraphs: [
        "At Fallowkind, we follow a slow fashion approach built on care and intention. We produce small batches to reduce waste and avoid overproduction. Each piece is made in limited quantities, based on real need instead of mass demand. This approach helps us focus on quality, detail, and durability in every garment.",
        "Small batch production reduces excess stock, lowers environmental impact, and supports more responsible use of materials. It also allows better control over ethical practices in every stage of making. We design clothing to last longer, feel better, and stay relevant beyond seasons.",
      ],
    },
    {
      number: "03",
      label: "Cruelty-Free by Nature",
      image: settings.ourStoryPrinciple3Url,
      paragraphs: [
        "At Fallowkind, we create clothing with respect for all living beings. We use only natural, plant based fabrics that avoid harm to animals and reduce dependency on animal-derived materials. Our choices support a cleaner supply chain where clothing does not come at the cost of animal suffering.",
        "We believe every life deserves care and dignity. Clothing needs should not create pain or exploitation for other living beings. Nature already provides strong, soft, and durable plant fibers that meet human needs without harm. Each piece we design reflects a simple idea, people can live well, dress well, and still protect the lives around them.",
      ],
    },
  ];

  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-forest section-padding pt-20 md:pt-24 relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full border border-fern/10" />
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full border border-fern/10" />

        <div className="page-container max-w-5xl relative text-center">
          <h1
            className="text-linen text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-8 md:mb-10 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
          >
            Our Vision
          </h1>
          <div
            className="grid md:grid-cols-2 gap-8 md:gap-12 text-linen/65 text-base sm:text-lg leading-relaxed text-justify opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.65s", animationFillMode: "forwards" }}
          >
            <p>
              At Fallowkind, we envision a future where fashion protects human health instead of
              harming it. Your skin is the largest organ in your body. What you wear touches your
              skin every day for hours at a time. Many modern clothes contain synthetic fibers,
              plastics, toxic dyes, chemical finishes, and harmful treatments that people absorb
              through constant skin contact and daily exposure.
            </p>
            <div>
              <p className="text-xs tracking-[0.3em] uppercase text-fern mb-4 text-left">
                We believe people deserve better
              </p>
              <p>
                Our vision is to create clothing made with safer, natural, and non-toxic materials
                that support both personal well-being and environmental health. We want to help
                people become more aware of what they wear and how those choices affect their
                bodies, their lifestyle, and the planet.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Story body ── */}
      <section className="section-padding page-container grid md:grid-cols-2 gap-12 md:gap-16 items-start">
        <AnimateOnScroll>
          <h2 className="text-2xl sm:text-3xl md:text-4xl mb-7 md:mb-8">We imagine a world where</h2>
          <ul className="space-y-4 text-forest/65 leading-relaxed text-base sm:text-lg">
            {[
              "Clothing is made without harmful toxins and unnecessary chemicals",
              "Natural fabrics replace plastic-based synthetic materials",
              "Fashion supports healthier living and conscious consumption",
              "People choose quality, longevity, and sustainability over fast fashion",
              "The fashion industry becomes cleaner, ethical, and environmentally responsible",
            ].map((point) => (
              <li key={point} className="flex gap-3">
                <span className="inline-block w-4 h-px bg-sage flex-shrink-0 translate-y-[0.85em]" />
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </AnimateOnScroll>

        <AnimateOnScroll delay={150}>
          <div className="relative aspect-[4/5] overflow-hidden rounded-3xl group shadow-lg border border-white/40">
            <Image
              src={settings.ourStoryBeginningUrl}
              alt="Our beginning"
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

      {/* ── Principles (What we stand for) ── */}
      <section className="relative section-padding pt-16 sm:pt-20 md:pt-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cream/55 via-linen/30 to-fern/20" />
        <div className="absolute -top-32 -right-20 w-96 h-96 rounded-full bg-fern/25 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-moss/20 blur-3xl" />

        <div className="relative page-container">
          <div className="space-y-8 md:space-y-10">
            {principles.map((p, i) => {
              const reversed = i % 2 === 1;
              return (
                <div
                  key={p.label}
                  className={`grid md:grid-cols-12 gap-8 md:gap-14 items-start ${
                    reversed ? "md:[&>*:first-child]:order-2" : ""
                  }`}
                >
                  {/* Image */}
                  <AnimateOnScroll
                    className={`md:col-span-5 ${reversed ? "md:order-2" : ""}`}
                  >
                    <div className="relative group max-w-xl mx-auto">
                      {/* Offset accent frame */}
                      <div
                        aria-hidden
                        className={`absolute inset-0 border border-moss/40 pointer-events-none transition-transform duration-500 ease-out ${
                          reversed
                            ? "translate-x-3 translate-y-3 sm:translate-x-4 sm:translate-y-4"
                            : "-translate-x-3 translate-y-3 sm:-translate-x-4 sm:translate-y-4"
                        } group-hover:translate-x-0 group-hover:translate-y-0`}
                      />
                      <div className="relative aspect-[4/5] overflow-hidden shadow-lg border border-white/40">
                        <Image
                          src={p.image}
                          alt={p.label}
                          fill
                          sizes="(min-width: 768px) 40vw, 100vw"
                          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
                        />
                        {/* subtle bottom fade for depth */}
                        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-forest/30 to-transparent" />
                      </div>
                    </div>
                  </AnimateOnScroll>

                  {/* Text */}
                  <AnimateOnScroll
                    delay={180}
                    className={`md:col-span-7 md:pt-8 lg:pt-12 ${reversed ? "md:order-1 md:pr-6" : "md:pl-6"}`}
                  >
                    <h3 className="text-2xl sm:text-3xl md:text-4xl mb-5 leading-tight">
                      {p.label}
                    </h3>
                    <div className="space-y-4 text-forest/70 leading-relaxed text-base sm:text-lg text-justify">
                      {p.paragraphs.map((para, idx) => (
                        <p key={idx}>{para}</p>
                      ))}
                    </div>
                  </AnimateOnScroll>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      {/* <section className="section-padding page-container">
        <AnimateOnScroll className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
          {[
            { number: "100%", label: "Natural fibres" },
            { number: "0",    label: "Synthetic fibres" },
            { number: "∞",    label: "Built for life" },
            { number: "2026", label: "Founded" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-4xl sm:text-5xl md:text-7xl font-display text-forest mb-2 leading-none">{s.number}</p>
              <p className="text-[11px] sm:text-xs tracking-widest uppercase text-moss">{s.label}</p>
            </div>
          ))}
        </AnimateOnScroll>
      </section> */}

      {/* ── Pull quote ── */}
      <AnimateOnScroll>
        <section className="relative section-padding overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-cream/60 via-linen/40 to-fern/25" />
          <div className="absolute -top-32 left-1/4 w-96 h-96 rounded-full bg-fern/25 blur-3xl" />
          <div className="absolute -bottom-32 right-1/4 w-96 h-96 rounded-full bg-moss/20 blur-3xl" />
          <div className="relative page-container text-center max-w-3xl mx-auto">
            <p className="text-2xl sm:text-4xl md:text-5xl text-forest font-serif italic leading-snug normal-case tracking-normal">
              &ldquo;The future is conscious - and it starts with what we wear.&rdquo;
            </p>
            <p className="mt-6 text-xs tracking-[0.3em] uppercase text-moss">- Fallowkind</p>
          </div>
        </section>
      </AnimateOnScroll>
    </>
  );
}
