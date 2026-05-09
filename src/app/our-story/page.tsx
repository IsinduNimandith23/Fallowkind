import type { Metadata } from "next";

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
      {/* Hero */}
      <section className="bg-forest section-padding">
        <div className="page-container max-w-3xl">
          <p className="text-xs tracking-[0.3em] uppercase text-fern mb-6">Who we are</p>
          <h1 className="text-linen text-5xl md:text-6xl leading-tight mb-8">
            Rooted in the land.
          </h1>
          <p className="text-linen/70 text-lg leading-relaxed">
            Fallowkind began as a question: what would clothing look like if it honoured the earth
            it came from? The answer is a small, considered brand — built season by season, stitch
            by stitch.
          </p>
        </div>
      </section>

      {/* Story body */}
      <section className="section-padding page-container grid md:grid-cols-2 gap-16 items-start">
        <div>
          <h2 className="text-3xl mb-6">Where it started</h2>
          <div className="space-y-4 text-forest/70 leading-relaxed">
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
        </div>
        <div className="bg-cream aspect-square rounded-sm" />
      </section>

      {/* Values */}
      <section className="bg-cream section-padding">
        <div className="page-container">
          <h2 className="text-3xl md:text-4xl mb-12 text-center">What we stand for</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((v) => (
              <div key={v.label} className="border-t-2 border-sage pt-6">
                <h3 className="text-lg mb-3">{v.label}</h3>
                <p className="text-forest/60 leading-relaxed text-sm">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pull quote */}
      <section className="section-padding page-container text-center max-w-3xl mx-auto">
        <blockquote className="text-3xl md:text-4xl text-forest leading-snug">
          &ldquo;The future is conscious — and it starts with what we wear.&rdquo;
        </blockquote>
      </section>
    </>
  );
}
