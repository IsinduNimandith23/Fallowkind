import type { Metadata } from "next";
import AnimateOnScroll from "@/components/AnimateOnScroll";

export const metadata: Metadata = { title: "Shipping" };

const details = [
  {
    label: "Processing time",
    body:
      "Orders are processed within 2–3 business days. We don't ship on weekends or public holidays.",
  },
  {
    label: "Domestic delivery",
    body:
      "Standard shipping arrives within 3–7 business days from dispatch, depending on your location.",
  },
  {
    label: "Tracking",
    body:
      "Once your order ships, you'll receive an email with a tracking number so you can follow it the rest of the way home.",
  },
];

export default function ShippingPage() {
  return (
    <>
      {/* ── Hero ── */}
      <section className="bg-forest section-padding relative overflow-hidden">
        <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full border border-fern/10" />
        <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full border border-fern/10" />

        <div className="page-container max-w-3xl relative">
          <p
            className="text-xs tracking-[0.35em] uppercase text-fern mb-7 opacity-0 animate-fade-in"
            style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}
          >
            Customer care
          </p>
          <h1
            className="text-linen text-4xl sm:text-5xl md:text-7xl lg:text-8xl mb-8 md:mb-10 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
          >
            Shipping.
          </h1>
          <p
            className="text-linen/65 text-base sm:text-lg leading-relaxed max-w-xl opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.65s", animationFillMode: "forwards" }}
          >
            Each order is packed by hand in recyclable materials. Here&apos;s what to
            expect once your pieces are on the way.
          </p>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="section-padding page-container max-w-3xl">
        <div className="space-y-6">
          {details.map((d, i) => (
            <AnimateOnScroll key={d.label} delay={i * 80}>
              <div className="glass-card p-6 sm:p-8">
                <p className="text-[10px] tracking-widest uppercase text-moss mb-3">
                  {d.label}
                </p>
                <p className="text-forest/80 leading-relaxed">{d.body}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        <AnimateOnScroll delay={200} className="mt-14">
          <div className="border border-forest/15 rounded-2xl p-6 sm:p-8 md:p-10 bg-cream/40">
            <p className="text-[10px] tracking-widest uppercase text-moss mb-3">
              Lost or delayed?
            </p>
            <p className="text-forest/75 leading-relaxed">
              If your order hasn&apos;t arrived within the estimated window, reach out at{" "}
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=fallowkind@gmail.com&su=Lost%20or%20delayed%20order"
                target="_blank"
                rel="noopener noreferrer"
                className="text-forest underline decoration-sage decoration-2 underline-offset-4 hover:decoration-forest transition-colors"
              >
                fallowkind@gmail.com
              </a>{" "}
              and we&apos;ll help track it down.
            </p>
          </div>
        </AnimateOnScroll>
      </section>
    </>
  );
}
