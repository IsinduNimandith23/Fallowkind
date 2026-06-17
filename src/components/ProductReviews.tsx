"use client";

import { useMemo, useState } from "react";
import type { ProductReview } from "@/lib/reviews";

type Props = {
  productId: number;
  productName: string;
  reviews: ProductReview[];
};

type Sort = "recent" | "highest" | "lowest";
type Status = "idle" | "sending" | "sent" | "error";

function Star({ filled, className = "" }: { filled: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path
        d="M12 2.5l2.95 6.34 6.95.74-5.2 4.74 1.47 6.83L12 17.77l-6.17 3.38 1.47-6.83-5.2-4.74 6.95-.74L12 2.5z"
        opacity={filled ? 1 : 0.18}
      />
    </svg>
  );
}

function StarRow({ value, className = "" }: { value: number; className?: string }) {
  return (
    <div className={`flex ${className}`} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} filled={n <= Math.round(value)} className="w-4 h-4" />
      ))}
    </div>
  );
}

export default function ProductReviews({ productId, productName, reviews }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [sort, setSort] = useState<Sort>("recent");

  const { count, average, distribution } = useMemo(() => {
    const count = reviews.length;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const distribution = [5, 4, 3, 2, 1].map(
      (star) => reviews.filter((r) => r.rating === star).length
    );
    return { count, average: count ? sum / count : 0, distribution };
  }, [reviews]);

  const sorted = useMemo(() => {
    const copy = [...reviews];
    if (sort === "highest") copy.sort((a, b) => b.rating - a.rating);
    else if (sort === "lowest") copy.sort((a, b) => a.rating - b.rating);
    else copy.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
    return copy;
  }, [reviews, sort]);

  return (
    <div className="mt-24 border-t border-forest/10 pt-16">
      <h2 className="text-2xl md:text-3xl text-forest text-center mb-10">Customer Reviews</h2>

      {/* ── Summary ── */}
      <div className="grid gap-8 md:grid-cols-3 md:items-center pb-8 border-b border-forest/10">
        {/* Average */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <div className="flex items-center gap-2">
            <StarRow value={average} className="text-sage" />
            <span className="text-sm text-forest/70">
              {average.toFixed(2)} out of 5
            </span>
          </div>
          <p className="text-sm text-forest/50 mt-1">
            Based on {count} review{count !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Distribution */}
        <div className="md:border-x md:border-forest/10 md:px-8 space-y-1.5">
          {distribution.map((n, i) => {
            const star = 5 - i;
            const pct = count ? (n / count) * 100 : 0;
            return (
              <div key={star} className="flex items-center gap-3 text-xs">
                <StarRow value={star} className="text-sage shrink-0" />
                <div className="flex-1 h-2.5 rounded-full bg-forest/10 overflow-hidden">
                  <div
                    className="h-full bg-sage rounded-full transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-4 text-right text-forest/50 tabular-nums">{n}</span>
              </div>
            );
          })}
        </div>

        {/* Write a review toggle */}
        <div className="flex justify-center md:justify-end">
          <button
            onClick={() => setShowForm((s) => !s)}
            className={showForm ? "btn-outline text-xs tracking-widest uppercase" : "btn-primary text-xs tracking-widest uppercase"}
            aria-expanded={showForm}
          >
            {showForm ? "Cancel review" : "Write a review"}
          </button>
        </div>
      </div>

      {/* ── Inline form ── */}
      {showForm && (
        <ReviewForm
          productId={productId}
          productName={productName}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* ── Sort + list ── */}
      {count > 0 ? (
        <div className="mt-8">
          <div className="flex items-center justify-end mb-6">
            <label htmlFor="review-sort" className="sr-only">
              Sort reviews
            </label>
            <select
              id="review-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="text-sm text-forest/70 bg-white/40 border border-white/55 rounded-full px-4 py-2 focus:outline-none focus:border-forest/40 cursor-pointer"
            >
              <option value="recent">Most Recent</option>
              <option value="highest">Highest Rating</option>
              <option value="lowest">Lowest Rating</option>
            </select>
          </div>

          <div className="divide-y divide-forest/10">
            {sorted.map((r) => (
              <article key={r.id} className="py-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <StarRow value={r.rating} className="text-sage mb-2" />
                    <p className="text-sm font-medium text-forest">{r.name}</p>
                  </div>
                  <time className="text-xs text-forest/40 shrink-0">
                    {new Date(r.createdAt).toLocaleDateString("en-LK")}
                  </time>
                </div>
                <p className="text-sm text-forest/70 leading-relaxed mt-3 whitespace-pre-wrap">
                  {r.review}
                </p>
              </article>
            ))}
          </div>
        </div>
      ) : (
        !showForm && (
          <p className="mt-10 text-center text-sm text-forest/50">
            No reviews yet - be the first to share how the {productName} feels to wear.
          </p>
        )
      )}
    </div>
  );
}

function ReviewForm({
  productId,
  productName,
  onClose,
}: {
  productId: number;
  productName: string;
  onClose: () => void;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status === "sending") return;
    if (rating < 1) {
      setErrorMsg("Please choose a rating.");
      setStatus("error");
      return;
    }

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      productId,
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      review: String(data.get("review") ?? ""),
      rating,
    };

    setStatus("sending");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        setErrorMsg(body?.error || "Failed to submit review");
        setStatus("error");
        return;
      }
      form.reset();
      setRating(0);
      setStatus("sent");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div className="mt-8 rounded-3xl bg-white/35 backdrop-blur-md border border-white/55 shadow-sm p-8 text-center">
        <p className="text-forest text-xl mb-2">Thank you for sharing.</p>
        <p className="text-forest/60 leading-relaxed max-w-md mx-auto">
          Your review has been received and will appear here once it&apos;s approved.
        </p>
        <button
          onClick={onClose}
          className="btn-outline text-xs tracking-widest uppercase mt-6"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mt-8 rounded-3xl bg-white/35 backdrop-blur-md border border-white/55 shadow-sm p-6 sm:p-8 flex flex-col gap-5"
    >
      <h3 className="text-xl text-forest text-center">Write a review</h3>

      {/* Rating */}
      <div className="flex flex-col items-center gap-1.5">
        <label className="text-[10px] tracking-widest uppercase text-moss">Rating</label>
        <div className="flex gap-1.5" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              className="transition-transform duration-150 hover:scale-110"
            >
              <svg
                viewBox="0 0 24 24"
                className={`w-7 h-7 transition-colors duration-150 ${
                  (hover || rating) >= n ? "text-sage" : "text-forest/20"
                }`}
                fill="currentColor"
              >
                <path d="M12 2.5l2.95 6.34 6.95.74-5.2 4.74 1.47 6.83L12 17.77l-6.17 3.38 1.47-6.83-5.2-4.74 6.95-.74L12 2.5z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <Field id="name" label="Name" type="text" placeholder="Your name" />
        <Field
          id="email"
          label="Email (optional)"
          type="email"
          required={false}
          placeholder="you@example.com"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="review" className="text-[10px] tracking-widest uppercase text-moss">
          Your review
        </label>
        <textarea
          id="review"
          name="review"
          rows={5}
          required
          maxLength={1000}
          className="glass-input-soft px-5 py-4 text-sm text-forest placeholder:text-forest/50 resize-none border-forest/30 hover:border-forest/50"
          placeholder={`How does the ${productName} feel to wear?`}
        />
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          type="submit"
          className="btn-primary text-xs tracking-widest uppercase disabled:opacity-60 disabled:cursor-not-allowed"
          disabled={status === "sending"}
        >
          {status === "sending" ? "Submitting…" : "Submit review"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="btn-outline text-xs tracking-widest uppercase"
        >
          Cancel
        </button>
      </div>
      {status === "error" && errorMsg && (
        <p className="text-sm text-red-500/80 text-center">{errorMsg}</p>
      )}
    </form>
  );
}

function Field({
  id,
  label,
  type,
  placeholder,
  required = true,
}: {
  id: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[10px] tracking-widest uppercase text-moss">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        className="glass-input px-5 py-3.5 text-sm text-forest placeholder:text-forest/50 border-forest/30 hover:border-forest/50"
        placeholder={placeholder}
      />
    </div>
  );
}
