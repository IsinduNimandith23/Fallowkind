"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Reel = { title: string; handle: string; image: string; href?: string };

// "View All" trigger for the Reels & Videos section. Opens a modal with
// every reel (the row only shows the first few).
export default function CommunityReelsModal({ reels }: { reels: Reel[] }) {
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
            aria-label="Reels and videos"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-forest/60 backdrop-blur-sm animate-fade-in"
              onClick={() => setOpen(false)}
            />

            {/* Card */}
            <div className="relative flex flex-col w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-3xl bg-linen border border-forest/10 shadow-2xl">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 px-6 py-6 sm:px-8 border-b border-forest/10">
                <div>
                  <h2 className="text-forest text-2xl normal-case tracking-normal">
                    Reels &amp; Videos
                  </h2>
                  <p className="text-xs text-moss mt-1">
                    {reels.length} video{reels.length !== 1 ? "s" : ""} · watch,
                    get inspired, share.
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

              {/* Scrollable grid */}
              <div className="min-h-0 overflow-y-auto px-6 py-6 sm:px-8">
                <div className="flex flex-wrap justify-center gap-4">
                  {reels.map((r, i) => (
                    <a
                      key={`${r.title}-${i}`}
                      href={r.href ?? "#"}
                      {...(r.href
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="group glass-card overflow-hidden flex flex-col w-[150px] sm:w-[168px] shrink-0"
                    >
                      <div className="relative aspect-[9/14] card-img rounded-none">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={r.image}
                          alt={r.title}
                          loading="lazy"
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute inset-0 bg-forest/20 group-hover:bg-forest/30 transition-colors" />
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 text-forest backdrop-blur-md shadow-md transition-transform group-hover:scale-110">
                            <IconPlayFill className="w-4 h-4 ml-0.5" />
                          </span>
                        </span>
                      </div>
                      <div className="p-3">
                        <p className="text-[12px] leading-snug text-forest/80 font-sans normal-case tracking-normal line-clamp-2">
                          {r.title}
                        </p>
                        <p className="text-[10px] text-moss mt-1">{r.handle}</p>
                      </div>
                    </a>
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

function IconPlayFill({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8 5v14l11-7L8 5Z" />
    </svg>
  );
}
