import type { Metadata } from "next";
import AnimateOnScroll from "@/components/AnimateOnScroll";

export const metadata: Metadata = { title: "Privacy Policy" };

const sections = [
  {
    label: "Information we collect",
    body:
      "When you shop with us, sign up for our newsletter, or contact our team, we collect details like your name, email, shipping address, and order history. Payment information is handled securely by our payment processor — we never see or store your full card details.",
  },
  {
    label: "How we use your information",
    body:
      "We use your information to process and ship your orders, send order updates and receipts, respond to your questions, and — if you've opted in — share occasional updates about new collections and stories from the brand.",
  },
  {
    label: "Cookies and analytics",
    body:
      "Our site uses cookies and similar technologies to remember your cart, keep you signed in, and understand how the site is used. We use this information to improve the experience, not to track you across the web.",
  },
  {
    label: "Sharing your information",
    body:
      "We share only what's necessary with the partners who help us run the shop — payment processors, shipping carriers, and email providers. We never sell your data to third parties.",
  },
  {
    label: "Your rights",
    body:
      "You can request a copy of the personal information we hold about you, ask us to correct it, or ask us to delete it. You can unsubscribe from marketing emails at any time using the link at the bottom of each message.",
  },
  {
    label: "Data retention and security",
    body:
      "We keep your information only as long as needed to fulfill orders, meet legal obligations, and run the business. We use industry-standard safeguards to protect it, though no method of transmission over the internet is ever completely secure.",
  },
];

export default function PrivacyPage() {
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
            className="text-linen text-5xl md:text-7xl lg:text-8xl mb-10 opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
          >
            Privacy<br />policy.
          </h1>
          <p
            className="text-linen/65 text-lg leading-relaxed max-w-xl opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.65s", animationFillMode: "forwards" }}
          >
            Your trust matters to us. Here&apos;s a straightforward look at what we
            collect, why we collect it, and the choices you have along the way.
          </p>
        </div>
      </section>

      {/* ── Body ── */}
      <section className="section-padding page-container max-w-3xl">
        <AnimateOnScroll className="mb-12">
          <p className="text-forest/75 leading-relaxed">
            This policy explains how Fallowkind collects, uses, and protects your
            personal information when you visit our website or shop with us. By
            using the site, you agree to the practices described below.
          </p>
        </AnimateOnScroll>

        <div className="space-y-6">
          {sections.map((s, i) => (
            <AnimateOnScroll key={s.label} delay={i * 80}>
              <div className="glass-card p-8">
                <p className="text-[10px] tracking-widest uppercase text-moss mb-3">
                  {s.label}
                </p>
                <p className="text-forest/80 leading-relaxed">{s.body}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        <AnimateOnScroll delay={200} className="mt-14">
          <div className="border border-forest/15 rounded-2xl p-8 md:p-10 bg-cream/40">
            <p className="text-[10px] tracking-widest uppercase text-moss mb-3">
              Questions about your data?
            </p>
            <p className="text-forest/75 leading-relaxed">
              If you&apos;d like to access, correct, or delete the information we hold
              about you, email us at{" "}
              <a
                href="mailto:fallowkind@gmail.com"
                className="text-forest underline decoration-sage decoration-2 underline-offset-4 hover:decoration-forest transition-colors"
              >
                fallowkind@gmail.com
              </a>{" "}
              and we&apos;ll take it from there.
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
