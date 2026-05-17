"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const tokenHash = searchParams.get("token_hash");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/admin/accept-invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token_hash: tokenHash, password }),
    });

    if (res.ok) {
      window.location.assign("/admin/dashboard");
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body?.error || "Could not accept invite. Try again.");
      setLoading(false);
    }
  }

  if (!tokenHash) {
    return (
      <div className="bg-linen p-8 rounded-sm">
        <p className="text-sm text-red-600">
          Missing invite token. Open the link from your invitation email.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-linen p-8 rounded-sm">
      <p className="text-xs text-forest/60 mb-6">
        Set a password to finish creating your admin account.
      </p>

      <label className="block text-[10px] tracking-widest uppercase text-forest/50 mb-2">
        New password
      </label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border border-forest/20 bg-transparent px-4 py-3 text-sm text-forest focus:outline-none focus:border-forest/60 transition-colors duration-200 mb-4"
        placeholder="At least 8 characters"
        autoFocus
        required
      />

      <label className="block text-[10px] tracking-widest uppercase text-forest/50 mb-2">
        Confirm password
      </label>
      <input
        type="password"
        value={confirm}
        onChange={(e) => setConfirm(e.target.value)}
        className="w-full border border-forest/20 bg-transparent px-4 py-3 text-sm text-forest focus:outline-none focus:border-forest/60 transition-colors duration-200 mb-4"
        placeholder="Repeat your password"
        required
      />

      {error && <p className="text-xs text-red-600 mb-4">{error}</p>}

      <button
        type="submit"
        disabled={loading || !password || !confirm}
        className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Saving…" : "Set password & sign in →"}
      </button>
    </form>
  );
}

export default function AcceptInvitePage() {
  return (
    <div className="min-h-screen bg-forest flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-fern text-xs tracking-[0.4em] uppercase mb-2">Fallowkind</p>
          <h1 className="text-linen font-display text-3xl">Accept invite</h1>
        </div>

        <Suspense fallback={<div className="bg-linen p-8 rounded-sm text-sm text-forest/60">Loading…</div>}>
          <AcceptInviteForm />
        </Suspense>

        <p className="text-center mt-6 text-fern/40 text-xs tracking-widest">
          <a href="/admin/login" className="hover:text-fern transition-colors duration-200">
            Already have a password? Sign in →
          </a>
        </p>
      </div>
    </div>
  );
}
