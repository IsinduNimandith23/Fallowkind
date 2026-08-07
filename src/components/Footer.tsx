import Link from "next/link";
import Image from "next/image";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2c-2.716 0-3.056.012-4.123.06-1.064.049-1.791.218-2.427.465a4.9 4.9 0 0 0-1.772 1.153A4.9 4.9 0 0 0 2.525 5.45c-.247.636-.416 1.363-.465 2.427C2.012 8.944 2 9.284 2 12s.012 3.056.06 4.123c.049 1.064.218 1.791.465 2.427a4.9 4.9 0 0 0 1.153 1.772 4.9 4.9 0 0 0 1.772 1.153c.636.247 1.363.416 2.427.465 1.067.048 1.407.06 4.123.06s3.056-.012 4.123-.06c1.064-.049 1.791-.218 2.427-.465a4.9 4.9 0 0 0 1.772-1.153 4.9 4.9 0 0 0 1.153-1.772c.247-.636.416-1.363.465-2.427.048-1.067.06-1.407.06-4.123s-.012-3.056-.06-4.123c-.049-1.064-.218-1.791-.465-2.427a4.9 4.9 0 0 0-1.153-1.772 4.9 4.9 0 0 0-1.772-1.153c-.636-.247-1.363-.416-2.427-.465C15.056 2.012 14.716 2 12 2zm0 1.802c2.67 0 2.987.01 4.042.059.975.044 1.504.207 1.857.344.467.182.8.399 1.15.748.35.35.566.683.748 1.15.137.353.3.882.344 1.857.048 1.055.059 1.371.059 4.042 0 2.67-.01 2.987-.059 4.042-.044.975-.207 1.504-.344 1.857a3.1 3.1 0 0 1-.748 1.15 3.1 3.1 0 0 1-1.15.748c-.353.137-.882.3-1.857.344-1.054.048-1.37.059-4.042.059-2.67 0-2.987-.01-4.042-.059-.975-.044-1.504-.207-1.857-.344a3.1 3.1 0 0 1-1.15-.748 3.1 3.1 0 0 1-.748-1.15c-.137-.353-.3-.882-.344-1.857-.048-1.055-.059-1.371-.059-4.042 0-2.67.01-2.987.059-4.042.044-.975.207-1.504.344-1.857.182-.467.399-.8.748-1.15.35-.35.683-.566 1.15-.748.353-.137.882-.3 1.857-.344 1.055-.048 1.372-.059 4.042-.059zm0 3.063a5.135 5.135 0 1 0 0 10.27 5.135 5.135 0 0 0 0-10.27zm0 8.468a3.333 3.333 0 1 1 0-6.666 3.333 3.333 0 0 1 0 6.666zm6.538-8.671a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z"
      />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 md:gap-12">

          {/* Brand */}
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <Image
              src="/logo.webp"
              alt="Fallowkind"
              width={300}
              height={300}
              className="w-48 h-48 sm:w-56 sm:h-56 object-contain -ml-6 sm:-ml-6 -mt-[5.5rem] sm:-mt-[6.5rem] -mb-[4.75rem] sm:-mb-[5.5rem] brightness-0 invert"
              unoptimized
            />
            <p className="text-linen/60 text-sm leading-relaxed max-w-xs">
              Kind to your skin,
              <br />
              Kinder to the Earth
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
                href="https://www.facebook.com/share/1JDmSAPmjp/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="rounded-full text-[10px] tracking-widest uppercase text-linen/55 hover:text-linen transition-all duration-200 bg-linen/10 backdrop-blur-md border border-linen/25 hover:bg-linen/20 hover:border-linen/45 w-10 h-10 flex items-center justify-center"
              >
                <FacebookIcon className="w-4 h-4 text-linen" />
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

          {/* Customer care links */}
          <div className="flex flex-col gap-3">
            <p className="text-xs tracking-widest uppercase text-linen/40 mb-1">Customer Service</p>
            {[
              { href: "/shipping", label: "Shipping" },
              { href: "/faq",      label: "FAQ"      },
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

          {/* Info links */}
          <div className="flex flex-col gap-3">
            <p className="text-xs tracking-widest uppercase text-linen/40 mb-1">Info</p>
            {[
              { href: "/returns", label: "Return Policy"      },
              { href: "/privacy", label: "Privacy Policy"     },
              { href: "/terms",   label: "Terms & Conditions" },
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
          <p className="flex items-center gap-3">
            <span>© {new Date().getFullYear()} Fallowkind. All rights reserved.</span>
            <span className="text-linen/15">|</span>
            <span>
              Built by{" "}
              <a
                href="https://dkaylabs.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-linen/60 hover:text-linen transition-colors"
              >
                DKayLabs
              </a>
            </span>
          </p>
          <p>Regenerative living.</p>
        </div>
      </div>
    </footer>
  );
}
