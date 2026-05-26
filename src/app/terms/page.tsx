import type { Metadata } from "next";
import AnimateOnScroll from "@/components/AnimateOnScroll";

export const metadata: Metadata = { title: "Terms & Conditions" };

const sections = [
  {
    label: "Using the site",
    body:
      "By browsing or shopping at fallowkind.com you agree to these terms. Please use the site lawfully and respectfully - don't attempt to interfere with its operation, security, or other people's use of it.",
  },
  {
    label: "Products and pricing",
    body:
      "We do our best to describe each piece accurately, but small variation is part of how things are made by hand. Colours may also appear slightly different on screen. Prices and availability are subject to change without notice, and we reserve the right to correct any errors before an order is processed.",
  },
  {
    label: "Orders and payment",
    body:
      "Placing an order is an offer to purchase. We may cancel or decline orders at our discretion - for example, if an item is out of stock or if we suspect fraud. Payment is taken at checkout, and your order is confirmed by email once it's been accepted.",
  },
  {
    label: "Shipping, returns and refunds",
    body:
      "Shipping timelines and our returns process are covered on our Shipping and Return Policy pages, which form part of these terms. Please review them before placing an order.",
  },
  {
    label: "Intellectual property",
    body:
      "All content on this site - including text, photography, logos, and design - belongs to Fallowkind or our partners and is protected by copyright. You may not reproduce, distribute, or use it commercially without our written permission.",
  },
  {
    label: "User content",
    body:
      "If you share content with us (a review, a photo, a message) you grant Fallowkind a non-exclusive licence to use it in connection with the brand. You're responsible for what you share - please make sure it's yours to share.",
  },
  {
    label: "Limitation of liability",
    body:
      "Fallowkind is provided on an “as-is” basis. To the fullest extent allowed by law, we aren't liable for indirect or consequential losses arising from your use of the site or our products. Nothing in these terms limits rights you have under applicable consumer law.",
  },
  {
    label: "Changes to these terms",
    body:
      "We may update these terms from time to time. The latest version will always be posted here, and continued use of the site means you accept any changes.",
  },
];

export default function TermsPage() {
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
            Legal
          </p>
          <h1
            className="text-linen text-4xl sm:text-5xl md:text-7xl lg:text-8xl mb-8 md:mb-10 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
          >
            Terms &amp;<br />conditions.
          </h1>
          <p
            className="text-linen/65 text-base sm:text-lg leading-relaxed max-w-xl opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.65s", animationFillMode: "forwards" }}
          >
            The fine print that keeps everything fair. These terms cover how you
            can use the site, our products, and the relationship between us.
          </p>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="section-padding page-container max-w-3xl">
        <AnimateOnScroll className="mb-12">
          <p className="text-forest/75 leading-relaxed">
            These terms and conditions govern your use of fallowkind.com and any
            purchases you make through it. Please read them carefully - by using
            the site or placing an order, you agree to be bound by them.
          </p>
        </AnimateOnScroll>

        <div className="space-y-6">
          {sections.map((s, i) => (
            <AnimateOnScroll key={s.label} delay={i * 60}>
              <div className="glass-card p-6 sm:p-8">
                <p className="text-[10px] tracking-widest uppercase text-moss mb-3">
                  {s.label}
                </p>
                <p className="text-forest/80 leading-relaxed">{s.body}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        <AnimateOnScroll delay={200} className="mt-14">
          <div className="border border-forest/15 rounded-2xl p-6 sm:p-8 md:p-10 bg-cream/40">
            <p className="text-[10px] tracking-widest uppercase text-moss mb-3">
              Get in touch
            </p>
            <p className="text-forest/75 leading-relaxed">
              Questions about these terms? Email us at{" "}
              <a
                href="mailto:fallowkind@gmail.com"
                className="text-forest underline decoration-sage decoration-2 underline-offset-4 hover:decoration-forest transition-colors"
              >
                fallowkind@gmail.com
              </a>{" "}
              and we&apos;ll be glad to help.
            </p>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={250} className="mt-10 text-center">
          <p className="text-forest/55 text-sm italic">
            Last updated: May 2026
          </p>
        </AnimateOnScroll>
      </section>
    </>
  );
}
