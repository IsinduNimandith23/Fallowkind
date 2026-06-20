"use client";

type Quote = { quote: string; author: string };

export default function CommunityQuotes({ quotes }: { quotes: Quote[] }) {
  // Duplicate the list so the vertical marquee loops seamlessly.
  const loop = [...quotes, ...quotes];

  return (
    <div className="group relative max-h-[28rem] overflow-hidden">
      {/* Fade masks top & bottom so cards ease in/out of view */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10 bg-gradient-to-b from-linen to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-linen to-transparent" />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 animate-marquee-y group-hover:[animation-play-state:paused] motion-reduce:animate-none">
        {loop.map((q, i) => (
          <article key={`${q.author}-${i}`} className="glass-card p-4">
            <span className="text-2xl text-fern leading-none font-serif">
              &ldquo;
            </span>
            <p className="text-forest/75 leading-relaxed text-sm font-serif italic normal-case tracking-normal -mt-2 line-clamp-5">
              {q.quote}
            </p>
            <p className="mt-3 text-[11px] tracking-wide uppercase text-moss">
              – {q.author}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
