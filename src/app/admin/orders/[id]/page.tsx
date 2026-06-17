import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import StatusUpdater from "./StatusUpdater";
import MarkPaidButton from "./MarkPaidButton";

export const metadata: Metadata = { title: "Order Detail" };

function statusBadge(status: string) {
  const map: Record<string, string> = {
    pending:    "bg-amber-100 text-amber-800",
    processing: "bg-blue-100 text-blue-800",
    delivered:  "bg-emerald-100 text-emerald-800",
  };
  return map[status] ?? "bg-gray-100 text-gray-600";
}

function paymentMethodLabel(method: string) {
  if (method === "cod") return "Cash on Delivery";
  if (method === "bank_transfer") return "Bank Transfer";
  if (method === "card") return "Card (PayHere)";
  return method;
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const [{ data: order }, { data: items }] = await Promise.all([
    supabase
      .from("orders")
      .select("*")
      .eq("id", id)
      .single(),
    supabase
      .from("order_items")
      .select("*")
      .eq("order_id", id),
  ]);

  if (!order) notFound();

  const orderItems = items ?? [];

  let receiptUrl: string | null = null;
  if (order.receipt_path) {
    const { data: signed } = await supabase.storage
      .from("payment-receipts")
      .createSignedUrl(order.receipt_path, 60 * 60); // 1 hour
    receiptUrl = signed?.signedUrl ?? null;
  }

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-6 md:mb-8">
        <Link href="/admin/orders" className="text-sm text-gray-400 hover:text-forest transition-colors">
          ← Orders
        </Link>
        <span className="text-gray-200 hidden md:inline">/</span>
        <h1 className="text-xl md:text-2xl font-semibold text-gray-900 break-all">{order.order_number}</h1>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium capitalize ${statusBadge(order.order_status)}`}>
          {order.order_status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <section className="bg-white rounded-lg border border-gray-100 shadow-sm">
            <h2 className="px-4 md:px-6 py-4 border-b border-gray-100 font-semibold text-gray-800 text-sm">
              Items ({orderItems.length})
            </h2>
            <div className="divide-y divide-gray-50">
              {orderItems.map((item) => (
                <div key={item.id} className="px-4 md:px-6 py-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{item.product_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Color: {item.color} · Size: {item.size} · Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium text-gray-800 text-sm">
                    Rs. {(Number(item.price_value) * item.quantity).toLocaleString("en-LK")}
                  </p>
                </div>
              ))}
            </div>
            {/* Totals */}
            <div className="px-4 md:px-6 py-4 border-t border-gray-100 space-y-2">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>Rs. {Number(order.subtotal).toLocaleString("en-LK")}</span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex justify-between text-sm text-emerald-600">
                  <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ""}</span>
                  <span>− Rs. {Number(order.discount_amount).toLocaleString("en-LK")}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span>Rs. {Number(order.shipping_fee).toLocaleString("en-LK")}</span>
              </div>
              <div className="flex justify-between text-sm font-semibold text-gray-900 pt-2 border-t border-gray-100">
                <span>Total</span>
                <span>Rs. {Number(order.total).toLocaleString("en-LK")}</span>
              </div>
            </div>
          </section>

          {/* Update Status */}
          <section className="bg-white rounded-lg border border-gray-100 shadow-sm px-4 md:px-6 py-5">
            <h2 className="font-semibold text-gray-800 text-sm mb-4">Update Order Status</h2>
            <StatusUpdater
              orderId={order.id}
              currentStatus={order.order_status}
              currentTrackingNumber={order.tracking_number ?? null}
            />
          </section>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Customer */}
          <section className="bg-white rounded-lg border border-gray-100 shadow-sm">
            <h2 className="px-4 md:px-6 py-4 border-b border-gray-100 font-semibold text-gray-800 text-sm">Customer</h2>
            <div className="px-4 md:px-6 py-4 space-y-2 text-sm">
              <p className="font-medium text-gray-800">{order.customer_name}</p>
              <p className="text-gray-500">{order.customer_email}</p>
              <p className="text-gray-500">{order.customer_phone}</p>
              {order.customer_phone_2 && (
                <p className="text-gray-500">{order.customer_phone_2}</p>
              )}
            </div>
          </section>

          {/* Shipping Address */}
          <section className="bg-white rounded-lg border border-gray-100 shadow-sm">
            <h2 className="px-4 md:px-6 py-4 border-b border-gray-100 font-semibold text-gray-800 text-sm">Shipping Address</h2>
            <div className="px-4 md:px-6 py-4 text-sm text-gray-600 space-y-0.5">
              <p>{order.address}</p>
              <p>{order.city}{order.postal_code ? `, ${order.postal_code}` : ""}</p>
            </div>
          </section>

          {/* Payment */}
          <section className="bg-white rounded-lg border border-gray-100 shadow-sm">
            <h2 className="px-4 md:px-6 py-4 border-b border-gray-100 font-semibold text-gray-800 text-sm">Payment</h2>
            <div className="px-4 md:px-6 py-4 text-sm space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Method</span>
                <span className="font-medium text-gray-800">
                  {paymentMethodLabel(order.payment_method)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className={`font-medium capitalize ${
                  order.payment_status === "paid" ? "text-emerald-600" :
                  order.payment_status === "failed" ? "text-red-600" : "text-amber-600"
                }`}>
                  {order.payment_status}
                </span>
              </div>

              {order.payment_method === "bank_transfer" && (
                <div className="pt-3 border-t border-gray-100 space-y-3">
                  {receiptUrl ? (
                    <a
                      href={receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2 px-3 py-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors"
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        <span className="truncate text-gray-700">{order.receipt_filename ?? "View receipt"}</span>
                      </span>
                      <span className="text-xs text-gray-400 shrink-0">Open ↗</span>
                    </a>
                  ) : (
                    <p className="text-xs text-gray-400">No receipt on file.</p>
                  )}

                  {order.payment_status !== "paid" && (
                    <MarkPaidButton orderId={order.id} />
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Notes */}
          {order.notes && (
            <section className="bg-white rounded-lg border border-gray-100 shadow-sm">
              <h2 className="px-4 md:px-6 py-4 border-b border-gray-100 font-semibold text-gray-800 text-sm">Notes</h2>
              <p className="px-4 md:px-6 py-4 text-sm text-gray-600">{order.notes}</p>
            </section>
          )}

          {/* Meta */}
          <section className="bg-white rounded-lg border border-gray-100 shadow-sm">
            <h2 className="px-4 md:px-6 py-4 border-b border-gray-100 font-semibold text-gray-800 text-sm">Order Info</h2>
            <div className="px-4 md:px-6 py-4 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Placed</span>
                <span className="text-gray-700">
                  {new Date(order.created_at).toLocaleDateString("en-LK", { timeZone: "Asia/Colombo" })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span className="text-gray-700">
                  {new Date(order.created_at).toLocaleTimeString("en-LK", { timeZone: "Asia/Colombo", hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Order ID</span>
                <span className="text-gray-400 text-xs font-mono">{order.id.slice(0, 8)}…</span>
              </div>
              {order.tracking_number && (
                <div className="flex justify-between gap-3">
                  <span className="text-gray-500">Tracking</span>
                  <a
                    href={`https://domex.lk/Order-Details.php?wbno=${encodeURIComponent(order.tracking_number)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-forest font-mono text-xs hover:underline truncate"
                  >
                    {order.tracking_number}
                  </a>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
