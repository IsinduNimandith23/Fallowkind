"use client";

import { useState } from "react";

export default function FaqItem({
  q,
  a,
  defaultOpen = false,
}: {
  q: string;
  a: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-forest/15">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left flex items-center justify-between gap-6 py-6 group"
        aria-expanded={open}
      >
        <span className="text-lg md:text-xl text-forest font-semibold transition-colors group-hover:text-moss">
          {q}
        </span>
        <span
          className={`shrink-0 w-8 h-8 rounded-full border border-forest/25 flex items-center justify-center transition-transform duration-300 ${
            open ? "rotate-45 bg-forest text-linen border-forest" : "text-forest"
          }`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
            <path
              d="M12 5v14M5 12h14"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="text-forest/75 leading-relaxed max-w-2xl whitespace-pre-line">{a}</p>
        </div>
      </div>
    </div>
  );
}
