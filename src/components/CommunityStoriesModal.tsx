"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Quote = { quote: string; author: string };

// "View All" trigger for the From Our Community section. Opens a modal
// listing every approved community story (the marquee only shows a few).
export default function CommunityStoriesModal({ quotes }: { quotes: Quote[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[11px] tracking-widest uppercase text-sage hover:text-forest transition-colors shrink-0"
      >
        View All
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="From our community"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-forest/60 backdrop-blur-sm animate-fade-in"
              onClick={() => setOpen(false)}
            />

            {/* Card */}
            <div className="relative flex flex-col w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl bg-linen border border-forest/10 shadow-2xl">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 px-6 py-6 sm:px-8 border-b border-forest/10">
                <div>
                  <h2 className="text-forest text-2xl normal-case tracking-normal">
                    From Our Community
                  </h2>
                  <p className="text-xs text-moss mt-1">
                    {quotes.length} stor{quotes.length !== 1 ? "ies" : "y"} from
                    real people.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="flex items-center justify-center w-9 h-9 rounded-full bg-forest/5 text-forest/70 hover:bg-forest/10 hover:text-forest transition-colors shrink-0"
                >
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>

              {/* Scrollable list */}
              <div className="min-h-0 overflow-y-auto px-6 py-6 sm:px-8">
                <div className="grid sm:grid-cols-2 gap-4">
                  {quotes.map((q, i) => (
                    <article
                      key={`${q.author}-${i}`}
                      className="glass-card p-5"
                    >
                      <span className="text-3xl text-fern leading-none font-serif">
                        &ldquo;
                      </span>
                      <p className="text-forest/75 leading-relaxed text-sm font-serif italic normal-case tracking-normal -mt-2">
                        {q.quote}
                      </p>
                      <p className="mt-3 text-[11px] tracking-wide uppercase text-moss">
                        – {q.author}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
