import type { Metadata } from "next";
import AnimateOnScroll from "@/components/AnimateOnScroll";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="section-padding page-container">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <AnimateOnScroll className="mb-14">
          <p className="text-xs tracking-[0.3em] uppercase text-moss mb-4">Get in touch</p>
          <h1 className="text-4xl md:text-6xl mb-6">Say hello.</h1>
          <p className="text-forest/55 leading-relaxed max-w-md">
            Questions about an order, wholesale enquiries, or just want to talk about
            regenerative living — we&apos;re here for it.
          </p>
        </AnimateOnScroll>

        {/* Contact form */}
        <AnimateOnScroll delay={100}>
          <form className="flex flex-col gap-7">
            <div className="grid md:grid-cols-2 gap-6">
              <FormField id="name"  label="Name"          type="text"  />
              <FormField id="email" label="Email address"  type="email" />
            </div>
            <FormField id="subject" label="Subject" type="text" />
            <div className="flex flex-col gap-2">
              <label htmlFor="message" className="text-[10px] tracking-widest uppercase text-forest/45">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                required
                className="bg-cream border border-transparent focus:border-sage/60 focus:outline-none focus:bg-linen px-5 py-4 text-sm text-forest placeholder:text-forest/30 resize-none transition-all duration-200"
                placeholder="Your message..."
              />
            </div>
            <div>
              <button type="submit" className="btn-primary">
                Send message
              </button>
            </div>
          </form>
        </AnimateOnScroll>

        {/* Divider */}
        <div className="my-16 border-t border-cream" />

        {/* Contact info */}
        <AnimateOnScroll>
          <div className="grid gap-10 text-sm sm:grid-cols-2">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-forest/40 mb-3">Email</p>
              <a
                href="mailto:fallowkind@gmail.com"
                className="text-forest/70 hover:text-forest transition-colors duration-200"
              >
                fallowkind@gmail.com
              </a>
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase text-forest/40 mb-3">Phone</p>
              <div className="flex flex-col gap-1.5">
                <a href="tel:+61407610465" className="text-forest/70 hover:text-forest transition-colors duration-200">
                  +61 407 610 465
                </a>
                <a href="tel:+94767357660" className="text-forest/70 hover:text-forest transition-colors duration-200">
                  +94 76 735 7660
                </a>
              </div>
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase text-forest/40 mb-3">Address</p>
              <p className="text-forest/70 leading-relaxed">
                164/1, Rathmaldeniya Road,<br />Erewwala, Pannipitiya
              </p>
            </div>
            <div>
              <p className="text-[10px] tracking-widest uppercase text-forest/40 mb-3">Response time</p>
              <p className="text-forest/70">We reply within 2 business days.</p>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </div>
  );
}

function FormField({ id, label, type }: { id: string; label: string; type: string }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[10px] tracking-widest uppercase text-forest/45">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required
        className="bg-cream border border-transparent focus:border-sage/60 focus:outline-none focus:bg-linen px-5 py-3.5 text-sm text-forest placeholder:text-forest/30 transition-all duration-200"
        placeholder={label}
      />
    </div>
  );
}
