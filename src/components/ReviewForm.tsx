"use client";

import { useState } from "react";

type Status = "idle" | "sending" | "sent" | "error";

export default function ReviewForm() {
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
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      review: String(data.get("review") ?? ""),
      rating,
    };

    setStatus("sending");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/review", {
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
      <div className="text-center py-6">
        <p className="text-linen text-xl sm:text-2xl mb-3">Thank you for sharing.</p>
        <p className="text-linen/65 leading-relaxed max-w-md mx-auto">
          Your review has been received - we may feature it here for the rest of the community to see.
        </p>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-4 text-left" onSubmit={handleSubmit} noValidate>
      {/* Rating */}
      <div className="flex flex-col items-center gap-1.5">
        <label className="text-[10px] tracking-widest uppercase text-fern">Your rating</label>
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
                  (hover || rating) >= n ? "text-fern" : "text-linen/25"
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
        <ReviewField id="name" label="Name" type="text" placeholder="Your name" />
        <ReviewField
          id="email"
          label="Email (optional)"
          type="email"
          required={false}
          placeholder="you@example.com"
        />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="review" className="text-[10px] tracking-widest uppercase text-fern">
          Your review
        </label>
        <textarea
          id="review"
          name="review"
          rows={5}
          required
          maxLength={1000}
          className="bg-linen/10 backdrop-blur-md border border-linen/25 rounded-2xl px-5 py-4 text-sm text-linen placeholder:text-linen/40 resize-none focus:bg-linen/15 focus:border-linen/50 focus:outline-none focus:ring-2 focus:ring-linen/10 transition-all duration-200"
          placeholder="Tell us how Fallowkind feels to wear..."
        />
      </div>

      <div className="flex flex-col items-center gap-3">
        <button type="submit" className="btn-glass-dark" disabled={status === "sending"}>
          {status === "sending" ? "Submitting..." : "Submit review"}
        </button>
        {status === "error" && errorMsg && (
          <p className="text-sm text-red-300">{errorMsg}</p>
        )}
      </div>
    </form>
  );
}

function ReviewField({
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
      <label htmlFor={id} className="text-[10px] tracking-widest uppercase text-fern">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        required={required}
        className="bg-linen/10 backdrop-blur-md border border-linen/25 rounded-full px-5 py-3.5 text-sm text-linen placeholder:text-linen/40 focus:bg-linen/15 focus:border-linen/50 focus:outline-none focus:ring-2 focus:ring-linen/10 transition-all duration-200"
        placeholder={placeholder}
      />
    </div>
  );
}
