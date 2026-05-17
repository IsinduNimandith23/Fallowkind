"use client";

import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      // Full reload so the admin layout re-evaluates the auth cookie
      // and the sidebar appears immediately.
      window.location.assign("/admin/dashboard");
    } else {
      const body = await res.json().catch(() => ({}));
      setError(body?.error || "Incorrect email or password. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-forest flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="text-fern text-xs tracking-[0.4em] uppercase mb-2">Fallowkind</p>
          <h1 className="text-linen font-display text-3xl">Admin</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-linen p-8 rounded-sm">
          <label className="block text-[10px] tracking-widest uppercase text-forest/50 mb-2">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-forest/20 bg-transparent px-4 py-3 text-sm text-forest focus:outline-none focus:border-forest/60 transition-colors duration-200 mb-4"
            placeholder="you@example.com"
            autoFocus
            required
          />
          <label className="block text-[10px] tracking-widest uppercase text-forest/50 mb-2">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-forest/20 bg-transparent px-4 py-3 text-sm text-forest focus:outline-none focus:border-forest/60 transition-colors duration-200 mb-4"
            placeholder="Enter your admin password"
            required
          />
          {error && (
            <p className="text-xs text-red-600 mb-4">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing in…" : "Sign in →"}
          </button>
        </form>

        <p className="text-center mt-6 text-fern/40 text-xs tracking-widest">
          <a href="/" className="hover:text-fern transition-colors duration-200">
            ← Back to store
          </a>
        </p>
      </div>
    </div>
  );
}
