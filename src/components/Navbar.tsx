"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { GENDER_OPTIONS } from "@/lib/gender";
import { CATEGORY_OPTIONS } from "@/lib/categories";

type NavItem = {
  href: string;
  label: string;
  children?: NavItem[];
};

// Men and Women fan out into garment categories; Unisex stays a leaf.
function genderChildren(gender: string): NavItem[] {
  if (gender === "Unisex") return [];
  return CATEGORY_OPTIONS.map((c) => ({
    href: `/shop?gender=${gender.toLowerCase()}&category=${encodeURIComponent(c)}`,
    label: c,
  }));
}

// `children` renders as a hover dropdown on desktop and as an indented group in
// the mobile menu. Every parent stays a normal link to its own broader view.
const links: NavItem[] = [
  { href: "/",          label: "Home"      },
  {
    href: "/shop",
    label: "Shop",
    children: GENDER_OPTIONS.map((g) => {
      const kids = genderChildren(g);
      return {
        href: `/shop?gender=${g.toLowerCase()}`,
        label: g,
        ...(kids.length ? { children: kids } : {}),
      };
    }),
  },
  { href: "/our-story", label: "Our Story" },
  { href: "/fallowfam", label: "FallowFam"  },
  { href: "/contact",   label: "Contact"   },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  // hrefs of the desktop nav items whose dropdown / flyout are showing, if any
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [openSub, setOpenSub] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname() ?? "/";
  const { totalItems, openCart } = useCart();

  // Mobile only: hrefs of the nav rows whose sub-levels are expanded. Collapsed
  // by default so the drawer opens at a readable length.
  const [expanded, setExpanded] = useState<string[]>([]);
  const isExpanded = (href: string) => expanded.includes(href);
  const toggleExpanded = (href: string) =>
    setExpanded((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    );

  const closeMenus = () => {
    setOpenMenu(null);
    setOpenSub(null);
  };

  useEffect(() => { setMenuOpen(false); closeMenus(); setExpanded([]); }, [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-40">
      <div className="relative flex items-center justify-between px-4 sm:px-6 lg:px-10 xl:px-20 h-20">

        {/* Logo */}
        <Link href="/" className="relative flex items-center gap-2 z-10 -ml-6 sm:ml-0">
          <span
            aria-hidden
            className={`absolute left-1/2 top-[calc(50%+2px)] -translate-x-1/2 -translate-y-1/2 w-40 h-10 sm:w-44 sm:h-10 lg:w-48 lg:h-10 rounded-full bg-white/35 backdrop-blur-md border border-white/60 shadow-md transition-opacity duration-300 ${
              scrolled ? "opacity-100" : "opacity-0"
            }`}
          />
          <Image
            src="/logo.webp"
            alt="Fallowkind"
            width={520}
            height={520}
            sizes="(min-width: 1024px) 208px, 176px"
            className="w-44 h-44 sm:w-48 sm:h-48 lg:w-52 lg:h-52 object-contain relative"
            priority
            unoptimized
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 items-center gap-1 bg-white/35 backdrop-blur-md border border-white/60 rounded-full px-2 py-1.5 shadow-md">
          {links.map((l) => {
            const isActive = pathname === l.href;
            const linkClass = `px-5 py-1.5 rounded-full text-xs tracking-widest uppercase transition-all duration-300 ${
              isActive
                ? "bg-forest text-linen shadow-sm"
                : "text-forest hover:bg-forest/10 font-medium"
            }`;

            if (!l.children) {
              return (
                <Link key={l.href} href={l.href} className={linkClass}>
                  {l.label}
                </Link>
              );
            }

            // Hover/focus dropdown. The trigger itself still navigates to the
            // unfiltered page; the panel offers the gender-filtered views.
            // Driven by state rather than :hover/:focus-within so that clicking
            // an item closes it - these links only change the query string, so
            // the component is never remounted and a focused anchor would
            // otherwise keep the panel pinned open.
            const open = openMenu === l.href;
            return (
              <div
                key={l.href}
                className="relative"
                onMouseEnter={() => setOpenMenu(l.href)}
                onMouseLeave={closeMenus}
                onFocus={() => setOpenMenu(l.href)}
                onBlur={(e) => {
                  // Only close when focus leaves the group entirely, so tabbing
                  // between the trigger and its items keeps the panel open.
                  if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                    closeMenus();
                  }
                }}
              >
                <Link
                  href={l.href}
                  onClick={closeMenus}
                  className={`${linkClass} inline-block`}
                >
                  {l.label}
                </Link>
                {/* Bridges the gap so the panel survives the cursor crossing it */}
                <div className="absolute left-1/2 -translate-x-1/2 top-full h-3 w-full" />
                <div
                  className={`absolute left-1/2 -translate-x-1/2 top-full pt-3 min-w-[168px] transition-all duration-200 ease-out ${
                    open
                      ? "opacity-100 visible translate-y-0 pointer-events-auto"
                      : "opacity-0 invisible translate-y-1 pointer-events-none"
                  }`}
                >
                  <div className="bg-white/85 backdrop-blur-xl border border-white/70 rounded-2xl shadow-lg py-1.5">
                    {l.children.map((c) => {
                      const itemClass =
                        "block px-5 py-2.5 text-xs tracking-widest uppercase text-forest/75 hover:text-forest hover:bg-forest/10 transition-colors duration-200";

                      if (!c.children) {
                        return (
                          <Link
                            key={c.href}
                            href={c.href}
                            onClick={closeMenus}
                            className={itemClass}
                          >
                            {c.label}
                          </Link>
                        );
                      }

                      // Second level (Men/Women -> categories). The flyout is a
                      // DOM child of this wrapper, so moving the cursor into it
                      // never fires the parent panel's mouseleave.
                      const subOpen = openSub === c.href;
                      return (
                        <div
                          key={c.href}
                          className="relative"
                          onMouseEnter={() => setOpenSub(c.href)}
                          onMouseLeave={() => setOpenSub(null)}
                          onFocus={() => setOpenSub(c.href)}
                          onBlur={(e) => {
                            if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
                              setOpenSub(null);
                            }
                          }}
                        >
                          <Link
                            href={c.href}
                            onClick={closeMenus}
                            className={`${itemClass} flex items-center justify-between gap-3`}
                          >
                            {c.label}
                            <svg
                              className="w-2.5 h-2.5 shrink-0 opacity-50"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth={2.5}
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                          <div
                            className={`absolute left-full top-0 pl-2 min-w-[150px] transition-all duration-200 ease-out ${
                              subOpen
                                ? "opacity-100 visible translate-x-0 pointer-events-auto"
                                : "opacity-0 invisible -translate-x-1 pointer-events-none"
                            }`}
                          >
                            <div className="bg-white/85 backdrop-blur-xl border border-white/70 rounded-2xl shadow-lg overflow-hidden py-1.5">
                              {c.children.map((g) => (
                                <Link
                                  key={g.href}
                                  href={g.href}
                                  onClick={closeMenus}
                                  className={itemClass}
                                >
                                  {g.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Right icons */}
        <div className="hidden lg:flex items-center gap-4 text-forest">
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
          className={`lg:hidden text-forest relative z-10 w-11 h-11 flex flex-col items-center justify-center rounded-full transition-all duration-300 ${
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
        className={`lg:hidden overflow-hidden px-4 transition-[max-height] duration-500 ease-in-out ${
          menuOpen ? "max-h-[46rem]" : "max-h-0"
        }`}
      >
        {/* Three levels of nav can outgrow a short viewport - let it scroll */}
        <div className="bg-white/25 backdrop-blur-xl border border-white/50 rounded-3xl shadow-lg px-7 pb-6 pt-5 flex flex-col gap-1 max-h-[calc(100vh-6.5rem)] overflow-y-auto">
          {links.map((l, i) => (
            <div
              key={l.href}
              style={{ transitionDelay: menuOpen ? `${i * 60}ms` : "0ms" }}
              className={`border-b border-forest/10 last:border-0 transition-all duration-300 ${
                menuOpen ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
              }`}
            >
              {/* The label navigates; the chevron expands. Keeping them as two
                  separate targets means tapping "Shop" still reaches the shop. */}
              <div className="flex items-center">
                <Link
                  href={l.href}
                  className={`flex-1 py-3 text-xs tracking-widest uppercase ${
                    pathname === l.href ? "text-forest font-semibold" : "text-forest/65 hover:text-forest"
                  }`}
                >
                  {l.label}
                </Link>
                {l.children && (
                  <button
                    type="button"
                    onClick={() => toggleExpanded(l.href)}
                    aria-expanded={isExpanded(l.href)}
                    aria-label={`${isExpanded(l.href) ? "Hide" : "Show"} ${l.label} categories`}
                    className="shrink-0 w-9 h-9 -mr-2 flex items-center justify-center text-forest/45 hover:text-forest transition-colors"
                  >
                    <Chevron open={isExpanded(l.href)} className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {l.children && (
                <div
                  className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
                    isExpanded(l.href) ? "max-h-[30rem] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div className="flex flex-col pb-2">
                    {l.children.map((c) => (
                      <div key={c.href}>
                        <div className="flex items-center">
                          <Link
                            href={c.href}
                            // Only the query string changes when jumping between
                            // gender views, so the pathname-based auto-close in
                            // the effect above never fires - close it here.
                            onClick={() => setMenuOpen(false)}
                            className="flex-1 py-2 pl-4 text-[11px] tracking-widest uppercase text-forest/50 hover:text-forest transition-colors duration-200"
                          >
                            {c.label}
                          </Link>
                          {c.children && (
                            <button
                              type="button"
                              onClick={() => toggleExpanded(c.href)}
                              aria-expanded={isExpanded(c.href)}
                              aria-label={`${isExpanded(c.href) ? "Hide" : "Show"} ${c.label} categories`}
                              className="shrink-0 w-9 h-8 -mr-2 flex items-center justify-center text-forest/35 hover:text-forest transition-colors"
                            >
                              <Chevron open={isExpanded(c.href)} className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        {c.children && (
                          <div
                            className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
                              isExpanded(c.href) ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                            }`}
                          >
                            <div className="flex flex-col">
                              {c.children.map((g) => (
                                <Link
                                  key={g.href}
                                  href={g.href}
                                  onClick={() => setMenuOpen(false)}
                                  className="py-1.5 pl-9 text-[10px] tracking-widest uppercase text-forest/35 hover:text-forest transition-colors duration-200"
                                >
                                  {g.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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

function Chevron({ open, className }: { open: boolean; className?: string }) {
  return (
    <svg
      className={`${className ?? ""} transition-transform duration-300 ${open ? "rotate-180" : ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
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
