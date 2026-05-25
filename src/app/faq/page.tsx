import type { Metadata } from "next";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import FaqItem from "./FaqItem";

export const metadata: Metadata = { title: "FAQ" };

const faqs = [
  {
    q: "How are Fallowkind pieces made?",
    a: "Every Fallowkind piece is made with sustainability in mind. We focus on ethical production, responsible sourcing, and long-lasting quality. Our garments are produced in small batches to reduce waste and overproduction while supporting fair working conditions for everyone involved.\n\nWe believe clothing should respect both people and nature.",
  },
  {
    q: "What fabrics do you use?",
    a: "We use natural fabrics such as 100% cotton and linen. These materials feel soft on your skin, stay breathable throughout the day, and naturally biodegrade over time.\n\nWe do not use polyester or synthetic blends. That means:\n• No hidden plastics\n• No microfibre shedding\n• No unnecessary toxins\n\nOur goal is simple. Better fabrics for you and a lower impact on the environment.",
  },
  {
    q: "How should I care for my pieces?",
    a: "To keep your Fallowkind pieces looking their best:\n• Cold hand wash or gentle machine wash\n• Wash with similar colours\n• Avoid bleach and harsh chemicals\n• Air dry in shade when possible\n• Iron on low heat if needed\n\nProper care helps your garments last longer and reduces environmental impact.",
  },
  {
    q: "What's your return policy?",
    a: "We accept returns for unworn and unwashed items within 7 days of delivery.\n\nItems must:\n• Be in original condition\n• Have tags attached (if applicable)\n• Show no signs of wear or damage\n\nFor return requests or support, please contact our team through the website contact page.",
  },
  {
    q: "How long does shipping take?",
    a: "Orders are processed within 2–3 business days. Standard delivery arrives within 3–7 business days from dispatch. You'll receive a tracking link once your order is on its way.",
  },
  {
    q: "How do I know what size to order?",
    a: "Each product page includes a size guide. If you're between sizes or unsure, email us and we'll help you find the right fit.",
  },
  {
    q: "Where can I contact you?",
    a: "Drop us an email at fallowkind@gmail.com or through the contact page. We reply within a business day.",
  },
];

export default function FaqPage() {
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
            Good to know
          </p>
          <h1
            className="text-linen text-4xl sm:text-5xl md:text-7xl lg:text-8xl mb-8 md:mb-10 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
          >
            Questions,<br />answered.
          </h1>
          <p
            className="text-linen/65 text-base sm:text-lg leading-relaxed max-w-xl opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.65s", animationFillMode: "forwards" }}
          >
            A few of the things people ask us most. Can&apos;t find what you&apos;re looking
            for? Send us an email — we read every one.
          </p>
        </div>
      </section>

      {/* ── FAQ list ── */}
      <section className="section-padding page-container max-w-3xl">
        <AnimateOnScroll>
          <div>
            {faqs.map((f, i) => (
              <FaqItem key={f.q} q={f.q} a={f.a} defaultOpen={i === 0} />
            ))}
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={150} className="mt-14 text-center">
          <p className="text-forest/65 text-sm">
            Still curious?{" "}
            <a
              href="mailto:fallowkind@gmail.com"
              className="text-forest underline decoration-sage decoration-2 underline-offset-4 hover:decoration-forest transition-colors"
            >
              Reach out
            </a>
            .
          </p>
        </AnimateOnScroll>
      </section>
    </>
  );
}
