"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const links = [
  { href: "/",          label: "Home"      },
  { href: "/shop",      label: "Shop"      },
  { href: "/our-story", label: "Our Story" },
  { href: "/contact",   label: "Contact"   },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <header className="fixed top-0 inset-x-0 z-50">
      <div className="flex items-center justify-between px-6 md:px-10 h-20 max-w-7xl mx-auto">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 relative z-10">
          <Image
            src="/Untitled design.png"
            alt="Fallowkind"
            width={200}
            height={200}
            className="w-44 h-44 object-contain"
            priority
          />
        </Link>

        {/* Desktop nav — glassy pill */}
        <nav className="hidden md:flex items-center gap-1 bg-white/35 backdrop-blur-md border border-white/60 rounded-full px-2 py-1.5 shadow-md">
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
          {/* <button aria-label="Search" className="hover:text-sage transition-colors duration-200">
            <SearchIcon className="w-5 h-5" />
          </button> */}
          <button aria-label="Cart" className="hover:text-sage transition-colors duration-200 relative">
            <CartIcon className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-sage rounded-full text-[8px] text-linen flex items-center justify-center leading-none">
              0
            </span>
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-forest p-1 relative z-10"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <span className={`block transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[7px]" : ""} w-5 h-px bg-forest mb-1.5`} />
          <span className={`block transition-all duration-300 ${menuOpen ? "opacity-0 scale-x-0" : ""} w-5 h-px bg-forest mb-1.5`} />
          <span className={`block transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""} w-5 h-px bg-forest`} />
        </button>
      </div>

      {/* Mobile menu — slide down */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${
          menuOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-linen/95 backdrop-blur-md border-b border-cream px-8 pb-8 pt-4 flex flex-col gap-1">
          {links.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              style={{ transitionDelay: menuOpen ? `${i * 60}ms` : "0ms" }}
              className={`py-3 text-xs tracking-widest uppercase border-b border-cream/60 last:border-0 transition-all duration-300 ${
                menuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              } ${pathname === l.href ? "text-forest font-semibold" : "text-forest/60 hover:text-forest"}`}
            >
              {l.label}
            </Link>
          ))}
          <div className="flex gap-5 pt-4 text-forest/60">
            <button aria-label="Search"><SearchIcon className="w-4 h-4" /></button>
            <button aria-label="Cart"><CartIcon className="w-4 h-4" /></button>
          </div>
        </div>
      </div>
    </header>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
  );
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
    </svg>
  );
}
