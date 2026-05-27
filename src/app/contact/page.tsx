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
            Questions about an order, wholesale enquiries, or simply want to chat
            about regenerative living? We&apos;d love to hear from you.
          </p>
        </AnimateOnScroll>

        {/* Contact form */}
        <AnimateOnScroll delay={100}>
          <ContactForm />
        </AnimateOnScroll>

        {/* Divider */}
        <div className="my-16 border-t border-forest/15" />

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

            <div>
              <p className="text-[10px] tracking-widest uppercase text-forest/75 mb-3">Response time</p>
              <p className="text-forest/85">We reply within a business day</p>
            </div>
          </div>
        </AnimateOnScroll>
      </div>
    </div>
  );
}
