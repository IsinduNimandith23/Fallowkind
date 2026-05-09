import type { Metadata } from "next";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <div className="section-padding page-container">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <p className="text-xs tracking-[0.3em] uppercase text-moss mb-4">Get in touch</p>
        <h1 className="text-4xl md:text-5xl mb-6">Say hello.</h1>
        <p className="text-forest/60 mb-12 leading-relaxed">
          Questions about an order, wholesale enquiries, or just want to talk about
          regenerative living — we&apos;re here for it.
        </p>

        {/* Contact form */}
        <form className="flex flex-col gap-6">
          <div className="grid md:grid-cols-2 gap-6">
            <FormField id="name"  label="Name"         type="text"  />
            <FormField id="email" label="Email address" type="email" />
          </div>
          <FormField id="subject" label="Subject" type="text" />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="message" className="text-xs tracking-widest uppercase text-forest/50">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              rows={6}
              required
              className="bg-cream border border-cream focus:border-sage focus:outline-none px-4 py-3 text-sm text-forest placeholder:text-forest/30 resize-none"
              placeholder="Your message..."
            />
          </div>
          <button type="submit" className="btn-primary self-start">
            Send message
          </button>
        </form>

        {/* Divider */}
        <div className="my-16 border-t border-cream" />

        {/* Info */}
        <div className="grid gap-8 text-sm text-forest/60 sm:grid-cols-2">
          <div>
            <p className="text-xs tracking-widest uppercase text-forest mb-2">Email</p>
            <a href="mailto:fallowkind@gmail.com" className="hover:text-forest transition-colors">
              fallowkind@gmail.com
            </a>
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase text-forest mb-2">Phone</p>
            <div className="flex flex-col gap-1">
              <a href="tel:+61407610465" className="hover:text-forest transition-colors">
                +61 407 610 465
              </a>
              <a href="tel:+94767357660" className="hover:text-forest transition-colors">
                +94 76 735 7660
              </a>
            </div>
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase text-forest mb-2">Address</p>
            <p className="max-w-sm leading-relaxed">
              164/1, Rathmaldeniya Road, Erewwala, Pannipitiya
            </p>
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase text-forest mb-2">Response time</p>
            <p>We reply within 2 business days.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function FormField({ id, label, type }: { id: string; label: string; type: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs tracking-widest uppercase text-forest/50">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required
        className="bg-cream border border-cream focus:border-sage focus:outline-none px-4 py-3 text-sm text-forest placeholder:text-forest/30"
        placeholder={label}
      />
    </div>
  );
}
