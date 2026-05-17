import Link from "next/link";

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
              {["IG", "TK", "PN"].map((s) => (
                <button
                  key={s}
                  className="rounded-full text-[10px] tracking-widest uppercase text-linen/55 hover:text-linen transition-all duration-200 bg-linen/10 backdrop-blur-md border border-linen/25 hover:bg-linen/20 hover:border-linen/45 w-10 h-10 flex items-center justify-center"
                >
                  {s}
                </button>
              ))}
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
