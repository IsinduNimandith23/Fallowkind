import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Launching soon",
  description: "Clothing rooted in the land. Fallowkind is launching soon.",
  robots: { index: false, follow: false },
};

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z" />
    </svg>
  );
}

export default function ComingSoonPage() {
  return (
    <div
      className="relative min-h-screen w-full overflow-hidden bg-forest text-linen flex flex-col items-center justify-center px-6"
      style={{
        backgroundImage:
          "radial-gradient(60% 50% at 15% 10%, rgba(168, 184, 154, 0.18) 0%, rgba(168, 184, 154, 0) 70%), radial-gradient(50% 40% at 85% 90%, rgba(122, 144, 112, 0.22) 0%, rgba(122, 144, 112, 0) 70%)",
      }}
    >
      <main className="relative z-10 flex flex-col items-center text-center max-w-2xl">
        <Image
          src="/Untitled design.png"
          alt="Fallowkind"
          width={640}
          height={640}
          priority
          className="w-[14rem] sm:w-[18rem] md:w-[26rem] h-20 sm:h-24 md:h-36 object-cover brightness-0 invert"
        />

        <h1 className="font-display text-4xl sm:text-5xl md:text-8xl tracking-tight uppercase text-linen mt-6 sm:mt-8 mb-5 sm:mb-6 leading-[0.95]">
          Launching Soon
        </h1>

        <p className="text-[10px] sm:text-xs md:text-sm tracking-[0.3em] sm:tracking-[0.4em] uppercase text-linen/55 px-2">
          Kind to your Skin, Kinder to the Earth
        </p>

        <p className="mt-5 sm:mt-6 max-w-md text-linen/70 text-sm sm:text-base md:text-lg leading-relaxed">
          Fallowkind is preparing something honest, slow, and made to last.
          Clothing for those who believe the future is conscious.
        </p>

        <div className="mt-10 flex flex-col items-center gap-5">
          <p className="text-[10px] tracking-[0.35em] uppercase text-linen/40">
            Follow the journey
          </p>
          <div className="flex gap-3">
            <a
              href="https://www.instagram.com/fallowkind"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="rounded-full transition-all duration-200 bg-linen/10 backdrop-blur-md border border-linen/25 hover:bg-linen/20 hover:border-linen/55 w-11 h-11 flex items-center justify-center"
            >
              <InstagramIcon className="w-4 h-4 text-linen" />
            </a>
            <a
              href="https://www.tiktok.com/@fallowkind"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="rounded-full transition-all duration-200 bg-linen/10 backdrop-blur-md border border-linen/25 hover:bg-linen/20 hover:border-linen/55 w-11 h-11 flex items-center justify-center"
            >
              <TikTokIcon className="w-4 h-4 text-linen" />
            </a>
          </div>
          <a
            href="mailto:fallowkind@gmail.com"
            className="text-xs tracking-[0.3em] uppercase text-linen/50 hover:text-linen transition-colors"
          >
            fallowkind@gmail.com
          </a>
        </div>
      </main>

      <footer className="absolute bottom-6 left-0 right-0 flex justify-center text-[10px] tracking-[0.3em] uppercase text-linen/30">
        © {new Date().getFullYear()} Fallowkind
      </footer>
    </div>
  );
}
