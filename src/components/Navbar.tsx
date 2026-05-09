"use client";

import Link from "next/link";
import { useState } from "react";

const links = [
  { href: "/",          label: "Home"      },
  { href: "/shop",      label: "Shop"      },
  { href: "/our-story", label: "Our Story" },
  { href: "/contact",   label: "Contact"   },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-linen/90 backdrop-blur-sm border-b border-cream">
      <div className="page-container flex items-center justify-between px-6 h-16">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-1.5 group">
          <LeafIcon className="w-4 h-4 text-sage group-hover:text-forest transition-colors" />
          <span className="text-forest tracking-[0.2em] text-sm font-semibold uppercase">
            Fallowk<span className="relative">i</span>nd
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-xs tracking-widest uppercase text-forest/70 hover:text-forest transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Cart icon (placeholder) */}
        <div className="hidden md:flex items-center gap-4">
          <button aria-label="Cart" className="text-forest/70 hover:text-forest transition-colors">
            <CartIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-forest"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-linen border-t border-cream px-6 pb-6 pt-4 flex flex-col gap-4">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className="text-xs tracking-widest uppercase text-forest/70 hover:text-forest transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

function LeafIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20C19 20 22 3 22 3c-1 2-8 2-9 8Z" />
    </svg>
  );
}

function CartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  );
}

function MenuIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
