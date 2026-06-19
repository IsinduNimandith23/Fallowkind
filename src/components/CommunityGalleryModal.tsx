"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Platform = "instagram" | "facebook";
type GalleryTile = {
  href: string;
  image: string;
  caption: string;
  isVideo: boolean;
  platform: Platform;
};

// "View All" trigger for the Community Gallery section. Opens a modal with
// every Instagram + Facebook post (the grid only shows the newest few).
export default function CommunityGalleryModal({ tiles }: { tiles: GalleryTile[] }) {
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
        className="text-xs tracking-widest uppercase text-sage hover:text-forest transition-colors shrink-0"
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
            aria-label="Community gallery"
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
                    Community Gallery
                  </h2>
                  <p className="text-xs text-moss mt-1">
                    {tiles.length} post{tiles.length !== 1 ? "s" : ""} from our
                    Instagram &amp; Facebook.
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {tiles.map((t, i) => (
                    <a
                      key={`${t.href}-${i}`}
                      href={t.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative aspect-square overflow-hidden rounded-2xl border border-forest/10 bg-white/40 shadow-sm"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={t.image}
                        alt={t.caption}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="pointer-events-none absolute inset-0 bg-forest/0 transition-colors duration-300 group-hover:bg-forest/15" />
                      <span className="absolute top-2 right-2 flex items-center justify-center w-6 h-6 rounded-full bg-white/85 text-forest shadow-sm">
                        {t.platform === "facebook" ? (
                          <IconFacebook className="w-3.5 h-3.5" />
                        ) : (
                          <IconInstagram className="w-3.5 h-3.5" />
                        )}
                      </span>
                      {t.isVideo && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 text-forest shadow-md transition-transform group-hover:scale-110">
                            <IconPlayFill className="w-4 h-4 ml-0.5" />
                          </span>
                        </span>
                      )}
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

/* Icons (mirrors the inline set on the community page) */
type IconProps = { className?: string };
function IconInstagram({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17" cy="7" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function IconFacebook({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13.5 21v-7h2.3l.4-2.8h-2.7V9.4c0-.8.2-1.4 1.4-1.4h1.4V5.5c-.7-.1-1.5-.2-2.3-.2-2.3 0-3.8 1.4-3.8 3.9v2.1H7.8V14h2.3v7h3.4Z" />
    </svg>
  );
}
function IconPlayFill({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M8 5v14l11-7L8 5Z" />
    </svg>
  );
}
