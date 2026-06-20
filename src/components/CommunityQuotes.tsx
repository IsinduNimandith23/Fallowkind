"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Quote = { quote: string; author: string };

export default function CommunityQuotes({ quotes }: { quotes: Quote[] }) {
  // Duplicate the list so the vertical marquee loops seamlessly.
  const loop = [...quotes, ...quotes];

  // The full comment a user clicked to read in the popup.
  const [active, setActive] = useState<Quote | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [active]);

  return (
    <div className="group relative max-h-[28rem] overflow-hidden">
      {/* Fade masks top & bottom so cards ease in/out of view */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-linen to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-linen to-transparent" />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 animate-marquee-y group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {loop.map((q, i) => (
          <button
            type="button"
            key={`${q.author}-${i}`}
            onClick={() => setActive(q)}
            aria-label={`Read full story from ${q.author}`}
            className="glass-card p-4 text-left w-full transition-shadow hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-fern"
          >
            <span className="text-2xl text-fern leading-none font-serif">
              &ldquo;
            </span>
            <p className="text-forest/75 leading-relaxed text-sm font-serif italic normal-case tracking-normal -mt-2 line-clamp-5">
              {q.quote}
            </p>
            <p className="mt-3 text-[11px] tracking-wide uppercase text-moss">
              – {q.author}
            </p>
          </button>
        ))}
      </div>

      {active &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label={`Story from ${active.author}`}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-forest/60 backdrop-blur-sm animate-fade-in"
              onClick={() => setActive(null)}
            />

            {/* Card */}
            <div className="relative flex flex-col w-full max-w-lg max-h-[90vh] overflow-hidden rounded-3xl bg-linen border border-forest/10 shadow-2xl">
              <div className="flex items-start justify-end px-6 pt-6 sm:px-8">
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  aria-label="Close"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-forest/5 text-forest/70 hover:bg-forest/10 hover:text-forest transition-colors shrink-0"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              <div className="min-h-0 overflow-y-auto px-6 pb-8 sm:px-8">
                <span className="text-4xl text-fern leading-none font-serif">
                  &ldquo;
                </span>
                <p className="text-forest/80 leading-relaxed text-base font-serif italic normal-case tracking-normal -mt-2 whitespace-pre-line">
                  {active.quote}
                </p>
                <p className="mt-5 text-xs tracking-wide uppercase text-moss">
                  – {active.author}
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
