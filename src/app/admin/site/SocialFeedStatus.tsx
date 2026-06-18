"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Tone = "green" | "amber" | "red" | "gray";

type Props = {
  instagram: {
    configured: boolean;
    source: "database" | "env" | "none";
    expiresAt: string | null;
    daysLeft: number | null;
    count: number;
    refreshable: boolean;
  };
  facebook: {
    configured: boolean;
    count: number;
  };
};

function Badge({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const tones: Record<Tone, string> = {
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
    gray: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-gray-500">{label}</span>
      <span className="text-gray-900 font-medium text-right">{value}</span>
    </div>
  );
}

export default function SocialFeedStatus({ instagram, facebook }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ tone: Tone; text: string } | null>(null);

  async function refresh() {
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/instagram/refresh", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setMsg({ tone: "red", text: data.error || "Refresh failed" });
      } else {
        const until = data.expiresAt
          ? new Date(data.expiresAt).toLocaleDateString()
          : "";
        setMsg({ tone: "green", text: `Token refreshed. Valid until ${until}.` });
        router.refresh();
      }
    } catch {
      setMsg({ tone: "red", text: "Network error - please try again." });
    } finally {
      setBusy(false);
    }
  }

  // Instagram status badge
  let igBadge: { tone: Tone; text: string };
  if (!instagram.configured) {
    igBadge = { tone: "red", text: "Not connected" };
  } else if (instagram.count === 0) {
    igBadge = { tone: "amber", text: "Connected · no posts returned" };
  } else if (instagram.daysLeft !== null && instagram.daysLeft <= 7) {
    igBadge = { tone: "amber", text: `Expires in ${instagram.daysLeft}d` };
  } else {
    igBadge = { tone: "green", text: "Connected" };
  }

  const expiryText = !instagram.refreshable
    ? "Never (non-expiring Page token)"
    : instagram.source === "env"
      ? "Unknown (env token - not yet refreshed)"
      : instagram.expiresAt
        ? `${new Date(instagram.expiresAt).toLocaleDateString()}${
            instagram.daysLeft !== null ? ` (${instagram.daysLeft} days)` : ""
          }`
        : "-";

  const fbBadge: { tone: Tone; text: string } = !facebook.configured
    ? { tone: "gray", text: "Not configured" }
    : facebook.count === 0
      ? { tone: "amber", text: "Connected · no posts returned" }
      : { tone: "green", text: "Connected" };

  return (
    <div className="space-y-6">
      {/* Instagram */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800">Instagram</h3>
          <Badge tone={igBadge.tone}>{igBadge.text}</Badge>
        </div>
        <div className="divide-y divide-gray-100">
          <Row
            label="Token source"
            value={
              !instagram.refreshable
                ? "Facebook Page token"
                : instagram.source === "database"
                  ? "Database (auto-refreshed)"
                  : instagram.source === "env"
                    ? "Environment variable"
                    : "None"
            }
          />
          <Row label="Token expires" value={expiryText} />
          <Row label="Posts loaded" value={instagram.count} />
        </div>

        {instagram.refreshable ? (
          <>
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                onClick={refresh}
                disabled={busy || !instagram.configured}
                className="px-4 py-2 rounded-lg bg-forest text-white text-sm font-medium hover:bg-sage transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? "Refreshing…" : "Refresh token now"}
              </button>
              {msg && (
                <span
                  className={`text-sm ${
                    msg.tone === "red" ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {msg.text}
                </span>
              )}
            </div>

            {instagram.source === "env" && (
              <p className="mt-3 text-xs text-amber-600">
                Using the env-var token. Run migration 018 and click “Refresh
                token now” to persist it in the database so the weekly cron can
                keep it alive automatically.
              </p>
            )}
          </>
        ) : (
          <p className="mt-4 text-xs text-gray-500">
            This is a non-expiring Facebook Page token, so no refresh is needed.
          </p>
        )}
      </div>

      {/* Facebook */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-800">Facebook Page</h3>
          <Badge tone={fbBadge.tone}>{fbBadge.text}</Badge>
        </div>
        <div className="divide-y divide-gray-100">
          <Row label="Posts loaded" value={facebook.count} />
        </div>
        {!facebook.configured && (
          <p className="mt-3 text-xs text-gray-500">
            Set FACEBOOK_PAGE_ID and FACEBOOK_PAGE_ACCESS_TOKEN to enable the
            Facebook feed. Page tokens minted from a long-lived user token don’t
            expire, so no refresh is needed.
          </p>
        )}
      </div>
    </div>
  );
}
