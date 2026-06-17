import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ReviewRowActions from "./ReviewRowActions";

export const metadata: Metadata = { title: "Reviews" };

const FILTER_TABS = [
  { label: "Pending", value: "pending" },
  { label: "Approved", value: "approved" },
  { label: "All", value: "all" },
];

type ReviewRow = {
  id: number;
  product_id: number;
  name: string;
  email: string | null;
  rating: number;
  review: string;
  approved: boolean;
  created_at: string;
  products: { name: string } | null;
};

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-amber-500 tracking-wide" aria-label={`${rating} out of 5`}>
      {"★".repeat(rating)}
      <span className="text-gray-300">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const { filter } = await searchParams;
  const active = filter ?? "pending";

  let query = supabase
    .from("product_reviews")
    .select("id, product_id, name, email, rating, review, approved, created_at, products(name)")
    .order("created_at", { ascending: false });

  if (active === "pending") query = query.eq("approved", false);
  else if (active === "approved") query = query.eq("approved", true);

  const { data } = await query;
  const rows = (data ?? []) as unknown as ReviewRow[];

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Reviews</h1>
        <p className="text-sm text-gray-500 mt-1">
          {rows.length} review{rows.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
        {FILTER_TABS.map((tab) => {
          const selected = active === tab.value;
          return (
            <Link
              key={tab.label}
              href={`/admin/reviews?filter=${tab.value}`}
              className={`shrink-0 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors duration-150 ${
                selected
                  ? "border-forest text-forest"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {rows.length === 0 ? (
        <p className="text-center py-16 text-sm text-gray-400">No reviews here.</p>
      ) : (
        <div className="space-y-4">
          {rows.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 md:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Stars rating={r.rating} />
                    <span className="font-semibold text-gray-800">{r.name}</span>
                    {!r.approved && (
                      <span className="text-[10px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded uppercase tracking-wide">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {r.products?.name ? (
                      <Link
                        href={`/shop/${r.product_id}`}
                        target="_blank"
                        className="hover:text-forest underline underline-offset-2"
                      >
                        {r.products.name}
                      </Link>
                    ) : (
                      `Product #${r.product_id}`
                    )}
                    {" · "}
                    {new Date(r.created_at).toLocaleDateString("en-LK")}
                    {r.email ? ` · ${r.email}` : ""}
                  </p>
                </div>
                <ReviewRowActions id={r.id} approved={r.approved} />
              </div>
              <p className="text-sm text-gray-600 leading-relaxed mt-3 whitespace-pre-wrap">
                {r.review}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
