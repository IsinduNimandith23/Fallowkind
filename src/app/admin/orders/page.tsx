import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const metadata: Metadata = { title: "Orders" };

const STATUS_TABS = [
  { label: "All", value: "" },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Delivered", value: "delivered" },
  { label: "Returned", value: "returned" },
];

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending:    "bg-amber-100 text-amber-800",
    processing: "bg-blue-100 text-blue-800",
    delivered:  "bg-emerald-100 text-emerald-800",
    returned:   "bg-rose-100 text-rose-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-600";
}

function paymentBadge(method: string, status: string) {
  if (status === "paid") return "bg-emerald-100 text-emerald-800";
  if (status === "failed") return "bg-red-100 text-red-800";
  if (method === "cod") return "bg-amber-100 text-amber-800";
  if (method === "bank_transfer") return "bg-sky-100 text-sky-800";
  return "bg-gray-100 text-gray-600";
}

function paymentLabel(method: string, status: string) {
  if (status === "paid") {
    if (method === "bank_transfer") return "Paid (Transfer)";
    if (method === "card") return "Paid (Card)";
    return "Paid";
  }
  if (status === "failed") return "Failed";
  if (method === "cod") return "COD";
  if (method === "bank_transfer") return "Awaiting verification";
  return "Pending";
}

const PAGE_SIZE = 10;

function buildQueryString(params: Record<string, string | number | undefined>) {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "" && value !== 0) {
      sp.set(key, String(value));
    }
  }
  const qs = sp.toString();
  return qs ? `/admin/orders?${qs}` : "/admin/orders";
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  const { status, q, page: pageParam } = await searchParams;
  const search = q?.trim() ?? "";
  const page = Math.max(1, Number(pageParam) || 1);
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_email, total, payment_method, payment_status, order_status, created_at",
      { count: "exact" }
    )
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("order_status", status);
  }

  if (search) {
    const term = `%${search}%`;
    query = query.or(
      `order_number.ilike.${term},customer_name.ilike.${term},customer_email.ilike.${term}`
    );
  }

  const { data: orders, count } = await query.range(from, to);
  const rows = orders ?? [];
  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500 mt-1">{total} order{total !== 1 ? "s" : ""}</p>
      </div>

      {/* Search */}
      <form method="GET" action="/admin/orders" className="mb-5 flex gap-2 max-w-md">
        {status ? <input type="hidden" name="status" value={status} /> : null}
        <input
          type="search"
          name="q"
          defaultValue={search}
          placeholder="Search by order #, name or email…"
          className="flex-1 rounded-lg border border-gray-200 px-3.5 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest"
        />
        <button
          type="submit"
          className="rounded-lg bg-forest px-4 py-2 text-sm font-medium text-white hover:bg-forest/90 transition-colors"
        >
          Search
        </button>
        {search ? (
          <Link
            href={buildQueryString({ status })}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Clear
          </Link>
        ) : null}
      </form>

      {/* Status tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
        {STATUS_TABS.map((tab) => {
          const isActive = (status ?? "") === tab.value;
          const href = buildQueryString({ status: tab.value, q: search });
          return (
            <Link
              key={tab.value}
              href={href}
              className={`shrink-0 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors duration-150 ${
                isActive
                  ? "border-forest text-forest"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          {rows.length === 0 ? (
            <p className="text-center py-16 text-sm text-gray-400">No orders found.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <Th>Order</Th>
                  <Th>Customer</Th>
                  <Th>Date</Th>
                  <Th>Total</Th>
                  <Th>Payment</Th>
                  <Th>Status</Th>
                  <Th>{""}</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((order) => {
                  const isDelivered = order.order_status === "delivered";
                  return (
                  <tr
                    key={order.id}
                    className={`border-b border-gray-50 transition-colors ${
                      isDelivered ? "bg-gray-50/70 text-gray-400 hover:bg-gray-100" : "hover:bg-gray-50"
                    }`}
                  >
                    <td className="px-4 md:px-6 py-3.5">
                      <Link href={`/admin/orders/${order.id}`} className={`font-medium hover:underline ${isDelivered ? "text-forest/60" : "text-forest"}`}>
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-4 md:px-6 py-3.5">
                      <p className={`font-medium ${isDelivered ? "text-gray-400" : "text-gray-800"}`}>{order.customer_name}</p>
                      <p className="text-gray-400 text-xs">{order.customer_email}</p>
                    </td>
                    <td className="px-4 md:px-6 py-3.5 text-gray-500">
                      {new Date(order.created_at).toLocaleDateString("en-LK", { timeZone: "Asia/Colombo" })}
                      <p className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleTimeString("en-LK", { timeZone: "Asia/Colombo", hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </td>
                    <td className={`px-4 md:px-6 py-3.5 font-medium ${isDelivered ? "text-gray-400" : "text-gray-800"}`}>
                      Rs. {Number(order.total).toLocaleString("en-LK")}
                    </td>
                    <td className="px-4 md:px-6 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${paymentBadge(order.payment_method, order.payment_status)}`}>
                        {paymentLabel(order.payment_method, order.payment_status)}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${statusBadge(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-3.5">
                      <Link href={`/admin/orders/${order.id}`} className="text-xs text-gray-400 hover:text-forest transition-colors">
                        View →
                      </Link>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 ? (
        <div className="mt-5 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            Showing {total === 0 ? 0 : from + 1}–{Math.min(to + 1, total)} of {total}
          </p>
          <div className="flex items-center gap-1">
            <PageLink
              href={buildQueryString({ status, q: search, page: page - 1 })}
              disabled={page <= 1}
            >
              ← Prev
            </PageLink>
            <span className="px-3 text-sm text-gray-600">
              Page {page} of {totalPages}
            </span>
            <PageLink
              href={buildQueryString({ status, q: search, page: page + 1 })}
              disabled={page >= totalPages}
            >
              Next →
            </PageLink>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PageLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  const base =
    "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors";
  if (disabled) {
    return (
      <span className={`${base} border-gray-100 text-gray-300 cursor-not-allowed`}>
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className={`${base} border-gray-200 text-gray-600 hover:bg-gray-50`}>
      {children}
    </Link>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 md:px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
      {children}
    </th>
  );
}
