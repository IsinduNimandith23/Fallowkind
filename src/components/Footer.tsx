import Link from "next/link";

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
      <path d="M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
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

export default function Footer() {
  return (
    <footer className="bg-forest text-linen">
      <div className="page-container section-padding">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Brand */}
          <div className="flex flex-col gap-4">
            <p className="tracking-[0.2em] text-sm font-semibold uppercase">Fallowkind</p>
            <p className="text-linen/60 text-sm leading-relaxed max-w-xs">
              Clothing rooted in the land. Made for those who believe the future is conscious.
            </p>
            <div className="flex gap-3 pt-1">
              <a
                href="https://www.instagram.com/fallowkind"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="rounded-full text-[10px] tracking-widest uppercase text-linen/55 hover:text-linen transition-all duration-200 bg-linen/10 backdrop-blur-md border border-linen/25 hover:bg-linen/20 hover:border-linen/45 w-10 h-10 flex items-center justify-center"
              >
                <InstagramIcon className="w-4 h-4 text-linen" />
              </a>

              <a
                href="https://www.tiktok.com/@fallowkind"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="TikTok"
                className="rounded-full text-[10px] tracking-widest uppercase text-linen/55 hover:text-linen transition-all duration-200 bg-linen/10 backdrop-blur-md border border-linen/25 hover:bg-linen/20 hover:border-linen/45 w-10 h-10 flex items-center justify-center"
              >
                <TikTokIcon className="w-4 h-4 text-linen" />
              </a>
            </div>
          </div>

          {/* Nav links */}
          <div className="flex flex-col gap-3">
            <p className="text-xs tracking-widest uppercase text-linen/40 mb-1">Explore</p>
            {[
              { href: "/",          label: "Home"      },
              { href: "/shop",      label: "Shop"      },
              { href: "/our-story", label: "Our Story" },
              { href: "/contact",   label: "Contact"   },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-sm text-linen/70 hover:text-linen transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Newsletter */}
          <div className="flex flex-col gap-4">
            <p className="text-xs tracking-widest uppercase text-linen/40 mb-1">Stay in the loop</p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="your@gmail.com"
                className="bg-linen/10 backdrop-blur-md border border-linen/25 rounded-full text-linen placeholder:text-linen/40 px-4 py-2 text-sm flex-1 focus:outline-none focus:bg-linen/20 focus:border-linen/55 transition-all duration-200"
              />
              <button type="submit" className="rounded-full bg-linen/90 backdrop-blur-md text-forest px-5 py-2 text-xs tracking-widest uppercase hover:bg-linen transition-colors shadow-sm">
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-linen/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-linen/30">
          <p>© {new Date().getFullYear()} Fallowkind. All rights reserved.</p>
          <p>Regenerative living.</p>
        </div>
      </div>
    </footer>
  );
}
