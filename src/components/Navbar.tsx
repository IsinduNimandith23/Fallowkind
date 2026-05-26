"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/contexts/CartContext";

const links = [
  { href: "/",          label: "Home"      },
  { href: "/shop",      label: "Shop"      },
  { href: "/our-story", label: "Our Story" },
  { href: "/contact",   label: "Contact"   },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { totalItems, openCart } = useCart();

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-40">
      <div className="relative flex items-center justify-between px-4 sm:px-12 md:px-32 h-20">

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-2 z-10 -ml-6 sm:ml-0">
          <span
            aria-hidden
            className={`absolute left-1/2 top-[calc(50%+2px)] -translate-x-1/2 -translate-y-1/2 w-44 h-10 sm:w-44 sm:h-10 md:w-52 md:h-10 rounded-full bg-white/35 backdrop-blur-md border border-white/60 shadow-md transition-opacity duration-300 ${
              scrolled ? "opacity-100" : "opacity-0"
            }`}
          />
          <Image
            src="/Untitled design.png"
            alt="Fallowkind"
            width={520}
            height={520}
            sizes="(min-width: 768px) 240px, 208px"
            quality={95}
            className="w-52 h-52 sm:w-52 sm:h-52 md:w-60 md:h-60 object-contain relative"
            priority
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-1 bg-white/35 backdrop-blur-md border border-white/60 rounded-full px-2 py-1.5 shadow-md">
          {links.map((l) => {
            const isActive = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-5 py-1.5 rounded-full text-xs tracking-widest uppercase transition-all duration-300 ${
                  isActive
                    ? "bg-forest text-linen shadow-sm"
                    : "text-forest hover:bg-forest/10 font-medium"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        {/* Right icons */}
        <div className="hidden md:flex items-center gap-4 text-forest">
          <button
            onClick={openCart}
            aria-label="Open cart"
            className={`hover:text-sage transition-all duration-300 relative w-10 h-10 flex items-center justify-center rounded-full ${
              scrolled
                ? "bg-white/35 backdrop-blur-md border border-white/60 shadow-md"
                : "bg-transparent border border-transparent"
            }`}
          >
            <CartIcon className="w-6 h-6" />
            {totalItems > 0 && (
              <span className="absolute top-0 right-0 w-[18px] h-[18px] bg-sage rounded-full text-[9px] text-linen flex items-center justify-center leading-none font-medium">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className={`md:hidden text-forest relative z-10 w-11 h-11 flex flex-col items-center justify-center rounded-full transition-all duration-300 ${
            scrolled || menuOpen
              ? "bg-white/35 backdrop-blur-md border border-white/60 shadow-md"
              : "bg-transparent border border-transparent"
          }`}
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className={`block transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[6px]" : ""} w-5 h-[2px] bg-forest rounded-full mb-1`} />
          <span className={`block transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""} w-5 h-[2px] bg-forest rounded-full mb-1`} />
          <span className={`block transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[6px]" : ""} w-5 h-[2px] bg-forest rounded-full`} />
          {totalItems > 0 && !menuOpen && (
            <span
              aria-label={`${totalItems} item${totalItems === 1 ? "" : "s"} in cart`}
              className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"
            />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`md:hidden overflow-hidden px-4 transition-[max-height] duration-500 ease-in-out ${
          menuOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="bg-white/25 backdrop-blur-xl border border-white/50 rounded-3xl shadow-lg px-7 pb-6 pt-5 flex flex-col gap-1">
          {links.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              style={{ transitionDelay: menuOpen ? `${i * 60}ms` : "0ms" }}
              className={`py-3 text-xs tracking-widest uppercase border-b border-forest/10 last:border-0 transition-all duration-300 ${
                menuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              } ${pathname === l.href ? "text-forest font-semibold" : "text-forest/65 hover:text-forest"}`}
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={() => { setMenuOpen(false); openCart(); }}
            className="flex items-center gap-2 pt-4 text-forest/70 hover:text-forest transition-colors duration-200"
            aria-label="Open cart"
          >
            <CartIcon className="w-4 h-4" />
            <span className="text-xs tracking-widest uppercase">Cart</span>
            {totalItems > 0 && (
              <span className="ml-1 min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center leading-none font-semibold">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
    </svg>
  );
}
