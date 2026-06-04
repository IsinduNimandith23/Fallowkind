import type { Metadata } from "next";
import AnimateOnScroll from "@/components/AnimateOnScroll";

export const metadata: Metadata = {
  title: "Return Policy",
  description:
    "Fallowkind return policy - submit returns within 7 days of delivery for eligible items. Read the full policy, eligibility, and how to start a return.",
  alternates: { canonical: "/returns" },
  openGraph: {
    title: "Return Policy | Fallowkind",
    description: "Returns within 7 days of delivery. Read the full policy and start a return.",
    url: "/returns",
  },
};

const eligible = [
  "Items must be in their original, unwashed condition.",
  "Items must be unworn.",
  "Items must be in their original packaging.",
  "Items showing signs of pilling may be denied.",
  "Items with markings or stains will not be accepted.",
  "Items with strong odors (smoke, cologne, detergent, etc.) will not be accepted.",
];

export default function ReturnsPage() {
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
            Return<br />policy.
          </h1>
          <p
            className="text-linen/65 text-base sm:text-lg leading-relaxed max-w-xl opacity-0 animate-fade-in-up"
            style={{ animationDelay: "0.65s", animationFillMode: "forwards" }}
          >
            We want you to be happy with our products, just like we enjoy making them.
            If you&apos;re not completely satisfied, we&apos;re here to help with returns
            for store credit.
          </p>
        </div>
      </section>

      {/* ── Policy body ── */}
      <section className="section-padding page-container max-w-3xl">
        <AnimateOnScroll className="mb-12">
          <p className="text-forest/75 leading-relaxed">
            We understand that things change sometimes. Our refund policy keeps the
            process simple and transparent for any eligible returns or cancellations.
            We want every experience with us to feel smooth, fair, and reliable.
          </p>
          <p className="mt-5 text-forest/75 leading-relaxed">
            Return requests must be submitted within{" "}
            <span className="text-forest font-semibold">7 days of delivery</span>. See{" "}
            <a
              href="#how-to-start-a-return"
              className="text-forest underline decoration-sage decoration-2 underline-offset-4 hover:decoration-forest transition-colors"
            >
              how to start a return
            </a>{" "}
            below.
          </p>
        </AnimateOnScroll>

        <AnimateOnScroll delay={100}>
          <div className="glass-card p-6 sm:p-8 md:p-10">
            <p className="text-[10px] tracking-widest uppercase text-moss mb-3">
              Eligibility
            </p>
            <h2 className="text-3xl md:text-4xl mb-7">What&apos;s eligible for return?</h2>
            <ul className="space-y-4">
              {eligible.map((item) => (
                <li key={item} className="flex gap-4 text-forest/80 leading-relaxed">
                  <span className="mt-[0.7em] inline-block w-6 h-px bg-sage shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={120} className="mt-12">
          <div className="glass-card p-6 sm:p-8 md:p-10">
            <p className="text-[10px] tracking-widest uppercase text-moss mb-3">
              Returns process
            </p>
            <h3 id="how-to-start-a-return" className="scroll-mt-24 text-2xl md:text-3xl mb-5">How to start a return</h3>
            <p className="text-forest/75 leading-relaxed">
              To begin, email us at{" "}
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=fallowkind@gmail.com&su=Return%20request"
                target="_blank"
                rel="noopener noreferrer"
                className="text-forest underline decoration-sage decoration-2 underline-offset-4 hover:decoration-forest transition-colors"
              >
                fallowkind@gmail.com
              </a>{" "}
              with:
            </p>
            <ul className="mt-5 space-y-4">
              {[
                "Your name and order number",
                "The item(s) you're returning",
                "The reason for your return",
              ].map((item) => (
                <li key={item} className="flex gap-4 text-forest/80 leading-relaxed">
                  <span className="mt-[0.95em] inline-block w-6 h-px bg-sage shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <p className="mt-7 text-forest/75 leading-relaxed">Then:</p>
            <ul className="mt-5 space-y-4">
              {[
                "Pack your item carefully and include the packing slip",
                "Drop it off at USPS within 15 days of receiving your order",
              ].map((item) => (
                <li key={item} className="flex gap-4 text-forest/80 leading-relaxed">
                  <span className="mt-[0.95em] inline-block w-6 h-px bg-sage shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-7 rounded-xl bg-forest/5 border border-forest/15 p-5 flex gap-4">
              <span className="text-base leading-none shrink-0" aria-hidden="true">🛑</span>
              <p className="text-forest/75 leading-relaxed text-sm">
                All returns are inspected once received. If an item doesn&apos;t meet our return standards, we may issue a partial refund or deny the return.
              </p>
            </div>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={150} className="mt-12">
          <div className="border border-forest/15 rounded-2xl p-6 sm:p-8 md:p-10 bg-cream/40">
            <p className="text-[10px] tracking-widest uppercase text-moss mb-3">
              Exchanges
            </p>
            <h3 className="text-xl mb-4">We don&apos;t offer direct exchanges at this time.</h3>
            <p className="text-forest/75 leading-relaxed">
              If you&apos;d like a different size or color, we recommend returning your
              clothing item and placing a new order.
            </p>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={200} className="mt-12">
          <div className="glass-card p-6 sm:p-8 md:p-10">
            <p className="text-[10px] tracking-widest uppercase text-moss mb-3">
              Refunds
            </p>
            <h3 className="text-xl mb-5">How refunds are processed</h3>
            <ul className="space-y-4">
              {[
                "Refunds are processed within 7–10 business days after we receive and inspect the returned item.",
                "Refunds will be issued to your original payment method.",
                "Delivery charges are non-refundable.",
              ].map((item) => (
                <li key={item} className="flex gap-4 text-forest/80 leading-relaxed">
                  <span className="mt-[0.7em] inline-block w-6 h-px bg-sage shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={250} className="mt-12">
          <div className="border border-forest/15 rounded-2xl p-6 sm:p-8 md:p-10 bg-cream/40">
            <p className="text-[10px] tracking-widest uppercase text-moss mb-3">
              Issues
            </p>
            <h3 className="text-xl mb-4">Received the wrong or a damaged item?</h3>
            <p className="text-forest/75 leading-relaxed">
              Please email us at{" "}
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=fallowkind@gmail.com&su=Damaged%20or%20incorrect%20order"
                target="_blank"
                rel="noopener noreferrer"
                className="text-forest underline decoration-sage decoration-2 underline-offset-4 hover:decoration-forest transition-colors"
              >
                fallowkind@gmail.com
              </a>{" "}
              within <span className="text-forest font-semibold">72 hours of delivery</span>. Include:
            </p>
            <ul className="mt-5 space-y-4">
              {[
                "A clear photo of the issue",
                "Your order number",
              ].map((item) => (
                <li key={item} className="flex gap-4 text-forest/80 leading-relaxed">
                  <span className="mt-[0.7em] inline-block w-6 h-px bg-sage shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-forest/75 leading-relaxed">
              If we made a mistake, we&apos;ll make it right - promise.
            </p>
            <p className="mt-5 text-forest/60 leading-relaxed text-sm italic">
              Note: Color variation due to lighting or screen settings isn&apos;t considered damage.
            </p>
          </div>
        </AnimateOnScroll>

        <AnimateOnScroll delay={300} className="mt-12 text-center">
          <p className="text-forest/65 text-sm">
            Still have questions?{" "}
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=fallowkind@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-forest underline decoration-sage decoration-2 underline-offset-4 hover:decoration-forest transition-colors"
            >
              Email our team
            </a>
            .
          </p>
        </AnimateOnScroll>
      </section>
    </>
  );
}
