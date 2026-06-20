"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import ReviewForm from "./ReviewForm";

export default function CommunityFormModal({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
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
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {label}
      </button>

      {open &&
        mounted &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Share your Fallowkind story"
          >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-forest/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setOpen(false)}
          />

          {/* Card */}
          <div className="relative flex flex-col w-full max-w-xl max-h-[90vh] overflow-hidden rounded-3xl bg-forest border border-white/10 shadow-2xl">
            <div className="absolute -right-24 -bottom-24 w-80 h-80 rounded-full border border-fern/10 pointer-events-none" />
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-fern/10 blur-3xl pointer-events-none" />

            {/* Close */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute top-4 right-4 z-10 flex items-center justify-center w-9 h-9 rounded-full bg-linen/10 text-linen/80 hover:bg-linen/20 hover:text-linen transition-colors"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            <div className="relative min-h-0 overflow-y-auto px-6 py-10 sm:px-10 sm:py-12">
            <div className="relative max-w-md mx-auto text-center">
              <p className="text-xs tracking-[0.3em] uppercase text-fern mb-3">
                Be part of it
              </p>
              <h2 className="text-linen text-3xl sm:text-4xl mb-4">
                Share your Fallowkind
              </h2>
              <p className="text-linen/65 leading-relaxed mb-8">
                Tag <span className="text-linen">fallowkind</span> in your
                Instagram or Facebook posts - or fill in this form - to be
                featured in our{" "}
                <span className="text-linen">From Our Community</span> section.
              </p>

              <ReviewForm />
            </div>
            </div>
          </div>
          </div>,
          document.body
        )}
    </>
  );
}
