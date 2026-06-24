import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FallowFam",
  description:
    "Rooted Together - the Fallowkind community of people choosing comfort, nature and conscious living. Coming soon.",
  alternates: { canonical: "/fallowfam" },
  openGraph: {
    title: "FallowFam | Fallowkind",
    description:
      "A community of people choosing comfort, nature and conscious living. Coming soon.",
    url: "/fallowfam",
    type: "website",
  },
};

export default function FallowFamPage() {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center -mt-20 px-6 overflow-hidden">
      {/* Soft decorative glows */}
      <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-fern/10 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-sage/10 blur-3xl" />

      <div className="relative max-w-2xl text-center">
        <div className="flex justify-center mb-6 text-sage">
          <IconSprout className="w-10 h-10" />
        </div>

        <p
          className="text-xs tracking-[0.3em] uppercase text-sage opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}
        >
          Rooted Together
        </p>

        <h1
          className="mt-4 text-forest text-5xl sm:text-6xl md:text-7xl normal-case opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.25s", animationFillMode: "forwards" }}
        >
          Coming Soon
        </h1>

        <p
          className="mt-6 text-forest/70 text-lg sm:text-xl leading-relaxed opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}
        >
          We&apos;re growing a space for our community - photos, stories,
          reels and the collective impact of people choosing comfort, nature and
          conscious living. It&apos;s on its way.
        </p>

        <div
          className="mt-10 opacity-0 animate-fade-in-up"
          style={{ animationDelay: "0.55s", animationFillMode: "forwards" }}
        >
          <a href="/shop" className="btn-primary">
            Explore the Shop
          </a>
        </div>
      </div>
    </section>
  );
}

function IconSprout({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20v-7" />
      <path d="M12 13c0-3-2-5-6-5 0 4 3 5 6 5Z" />
      <path d="M12 11c0-3 2-5 6-5 0 4-3 5-6 5Z" />
    </svg>
  );
}
