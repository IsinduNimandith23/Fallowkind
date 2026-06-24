import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import MonthFilter from "./MonthFilter";

export const metadata: Metadata = { title: "Dashboard" };
export const revalidate = 0;

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending:    "bg-amber-100 text-amber-800",
    processing: "bg-blue-100 text-blue-800",
    delivered:  "bg-emerald-100 text-emerald-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-600";
}

function paymentBadge(method: string, status: string) {
  if (status === "paid") return "bg-emerald-100 text-emerald-800";
  if (status === "failed") return "bg-red-100 text-red-800";
  return method === "cod" ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600";
}

function paymentLabel(method: string, status: string) {
  if (status === "paid") return "Paid";
  if (status === "failed") return "Failed";
  return method === "cod" ? "COD" : "Pending";
}

// Year-month ("YYYY-MM") of an ISO timestamp, in store time (Asia/Colombo).
function colomboYM(iso: string) {
  return new Date(iso)
    .toLocaleDateString("en-CA", { timeZone: "Asia/Colombo", year: "numeric", month: "2-digit" })
    .slice(0, 7);
}

// Human label for a "YYYY-MM" value, e.g. "June 2026".
function monthLabel(ym: string) {
  return new Date(`${ym}-01T00:00:00+05:30`).toLocaleDateString("en-LK", {
    timeZone: "Asia/Colombo",
    year: "numeric",
    month: "long",
  });
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;

  const [{ data: allOrders }, { data: recentOrders }] = await Promise.all([
    supabase.from("orders").select("id, total, shipping_fee, order_status, payment_method, payment_status, created_at"),
    supabase
      .from("orders")
      .select("id, order_number, customer_name, total, payment_method, payment_status, order_status, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
  ]);

  const orders = allOrders ?? [];
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  // ── Month filter ──────────────────────────────────────────────────
  // Build a continuous list of months from the earliest order up to the
  // current month (in store time), plus an "All time" option.
  const currentYM = colomboYM(now.toISOString());
  const earliestYM = orders.length
    ? orders.reduce((min, o) => {
        const ym = colomboYM(o.created_at);
        return ym < min ? ym : min;
      }, currentYM)
    : currentYM;

  const monthValues: string[] = [];
  for (let ym = currentYM; ym >= earliestYM; ) {
    monthValues.push(ym);
    const [y, m] = ym.split("-").map(Number);
    const prev = new Date(Date.UTC(y, m - 2, 1)); // m-2 = previous month (0-indexed)
    ym = `${prev.getUTCFullYear()}-${String(prev.getUTCMonth() + 1).padStart(2, "0")}`;
  }
  const monthOptions = [
    { value: "all", label: "All time" },
    ...monthValues.map((ym) => ({ value: ym, label: monthLabel(ym) })),
  ];

  // Resolve the selected period: "all", a valid known month, else current month.
  const isAllTime = month === "all";
  const selectedMonth =
    !isAllTime && month && /^\d{4}-\d{2}$/.test(month) && monthValues.includes(month)
      ? month
      : currentYM;
  const selectedValue = isAllTime ? "all" : selectedMonth;
  const periodLabel = isAllTime ? "All time" : monthLabel(selectedMonth);

  const periodOrders = isAllTime
    ? orders
    : (() => {
        const start = Date.parse(`${selectedMonth}-01T00:00:00+05:30`);
        const [y, m] = selectedMonth.split("-").map(Number);
        const nextMonth = new Date(Date.UTC(y, m, 1)); // m = next month (0-indexed)
        const end = Date.parse(
          `${nextMonth.getUTCFullYear()}-${String(nextMonth.getUTCMonth() + 1).padStart(2, "0")}-01T00:00:00+05:30`
        );
        return orders.filter((o) => {
          const t = new Date(o.created_at).getTime();
          return t >= start && t < end;
        });
      })();

  // ── TEMP (2026-06-24): client asked the Revenue card to restart from 0
  // as of now and keep running for the rest of this month, then reset to a
  // normal full month from July. Only the current-month Revenue figure is
  // trimmed — Orders and every other stat are untouched, and historical /
  // all-time views stay truthful. Auto-no-ops once the month rolls over;
  // safe to delete this block (and revert totalRevenue to `periodOrders`)
  // any time after June 2026. ──────────────────────────────────────────
  const REVENUE_RESET_YM = "2026-06";
  const REVENUE_RESET_AT = Date.parse("2026-06-24T00:00:00+05:30");
  const revenueReset = !isAllTime && selectedMonth === REVENUE_RESET_YM;
  const revenueOrders = revenueReset
    ? periodOrders.filter((o) => new Date(o.created_at).getTime() >= REVENUE_RESET_AT)
    : periodOrders;
  const revenueSub = revenueReset
    ? `Since ${new Date(REVENUE_RESET_AT).toLocaleDateString("en-LK", {
        timeZone: "Asia/Colombo",
        day: "numeric",
        month: "short",
        year: "numeric",
      })}`
    : periodLabel;

  const totalRevenue = revenueOrders
    .filter((o) => o.payment_status === "paid" || o.payment_method === "cod")
    .reduce((s, o) => s + (Number(o.total) - Number(o.shipping_fee ?? 0)), 0);

  // Orders card stays as the all-time total, independent of the month filter.
  const totalOrders = orders.length;

  const needsAction = orders.filter(
    (o) => o.order_status === "pending" || o.order_status === "processing"
  ).length;

  const todayOrders = orders.filter((o) => o.created_at >= today).length;

  const stats = [
    {
      label: "Revenue",
      value: `Rs. ${totalRevenue.toLocaleString("en-LK")}`,
      sub: revenueSub,
      color: "border-emerald-400",
      icon: (
        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Total Orders",
      value: totalOrders.toString(),
      sub: "All time",
      color: "border-blue-400",
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
        </svg>
      ),
    },
    {
      label: "Needs Action",
      value: needsAction.toString(),
      sub: "Pending / processing",
      color: needsAction > 0 ? "border-amber-400" : "border-gray-200",
      icon: (
        <svg className={`w-5 h-5 ${needsAction > 0 ? "text-amber-500" : "text-gray-400"}`} fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      ),
    },
    {
      label: "Today",
      value: todayOrders.toString(),
      sub: "Orders placed today",
      color: "border-violet-400",
      icon: (
        <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      ),
    },
  ];

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString("en-LK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <MonthFilter options={monthOptions} selected={selectedValue} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-10">
        {stats.map((s) => (
          <div key={s.label} className={`bg-white rounded-lg p-5 border-l-4 ${s.color} shadow-sm`}>
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-500 font-medium">{s.label}</p>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs text-forest hover:underline">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          {(recentOrders ?? []).length === 0 ? (
            <p className="text-center py-12 text-sm text-gray-400">No orders yet.</p>
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
                </tr>
              </thead>
              <tbody>
                {(recentOrders ?? []).map((order) => (
                  <tr key={order.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-4 md:px-6 py-3">
                      <Link href={`/admin/orders/${order.id}`} className="font-medium text-forest hover:underline">
                        {order.order_number}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-gray-700">{order.customer_name}</td>
                    <td className="px-6 py-3 text-gray-500">
                      {new Date(order.created_at).toLocaleDateString("en-LK")}
                    </td>
                    <td className="px-6 py-3 font-medium text-gray-800">
                      Rs. {Number(order.total).toLocaleString("en-LK")}
                    </td>
                    <td className="px-4 md:px-6 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${paymentBadge(order.payment_method, order.payment_status)}`}>
                        {paymentLabel(order.payment_method, order.payment_status)}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${statusBadge(order.order_status)}`}>
                        {order.order_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 md:px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">
      {children}
    </th>
  );
}
