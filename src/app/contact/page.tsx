import type { Metadata } from "next";
import AnimateOnScroll from "@/components/AnimateOnScroll";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with the Fallowkind team — questions about orders, wholesale enquiries, or anything else. We reply within a business day.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact | Fallowkind",
    description: "Questions about an order or wholesale enquiry? We reply within a business day.",
    url: "/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="section-padding page-container">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <AnimateOnScroll className="mb-14">
          <p className="text-xs tracking-[0.3em] uppercase text-moss mb-4">Get in touch</p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl mb-8">Say hello.</h1>
          <p className="text-forest/75 leading-relaxed max-w-md">
            Questions about an order or simply want to chat
            about regenerative living? We&apos;d love to hear from you.
          </p>
        </AnimateOnScroll>

        {/* Contact form */}
        <AnimateOnScroll delay={100}>
          <ContactForm />
        </AnimateOnScroll>

        {/* Or — Instagram */}
        <AnimateOnScroll delay={150} className="mt-10">
          <div className="flex items-center gap-4" aria-hidden="true">
            <div className="flex-1 border-t border-forest/15" />
            <span className="text-sm tracking-[0.3em] uppercase text-forest/70">or</span>
            <div className="flex-1 border-t border-forest/15" />
          </div>
          <div className="mt-6 flex justify-center">
            <a
              href="https://www.instagram.com/fallowkind"
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center rounded-full bg-forest px-0.5 py-1.5 transition-all duration-300 hover:bg-sage hover:shadow-md hover:scale-x-105"
            >
              <span
                aria-label="Instagram"
                role="img"
                className="block h-12 w-44 bg-fern transition-transform duration-300 group-hover:scale-x-110"
                style={{
                  WebkitMaskImage: "url('/ig.webp')",
                  maskImage: "url('/ig.webp')",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskPosition: "center",
                  maskPosition: "center",
                }}
              />
            </a>
          </div>
        </AnimateOnScroll>

        <div className="mt-16" />

        {/* Contact info */}
        <AnimateOnScroll>
          <div className="grid gap-10 text-sm sm:grid-cols-2">
            <div>
              <p className="text-[10px] tracking-widest uppercase text-forest/75 mb-3">Email</p>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=fallowkind@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-forest/85 hover:text-forest transition-colors duration-200"
              >
                fallowkind@gmail.com
              </a>
            </div>

            <div className="sm:justify-self-end">
              <p className="text-[10px] tracking-widest uppercase text-forest/75 mb-3">Response time</p>
              <p className="text-forest/85">We reply within a business day</p>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </div>
  );
}
