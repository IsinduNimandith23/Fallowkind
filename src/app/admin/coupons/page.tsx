import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import CreateCouponForm from "./CreateCouponForm";
import ToggleButton from "./ToggleButton";
import CouponRowActions from "./CouponRowActions";

export const metadata: Metadata = { title: "Coupons" };

export default async function CouponsPage() {
  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  const rows = coupons ?? [];

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-gray-900">Coupons</h1>
          <p className="text-sm text-gray-500 mt-1">{rows.length} coupon{rows.length !== 1 ? "s" : ""}</p>
        </div>
      </div>

      <div className="mb-6">
        <CreateCouponForm />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          {rows.length === 0 ? (
            <p className="text-center py-16 text-sm text-gray-400">No coupons yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <Th>Code</Th>
                  <Th>Discount</Th>
                  <Th>Min Order</Th>
                  <Th>Uses</Th>
                  <Th>Expires</Th>
                  <Th>Active</Th>
                  <Th>Actions</Th>
                </tr>
              </thead>
              <tbody>
                {rows.map((coupon) => {
                  const expired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
                  const maxedOut = coupon.max_uses != null && coupon.used_count >= coupon.max_uses;

                  return (
                    <tr key={coupon.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-4 md:px-6 py-3.5">
                        <span className="font-mono font-semibold text-gray-800 tracking-wider">{coupon.code}</span>
                        {(expired || maxedOut) && (
                          <span className="ml-2 text-[10px] bg-red-50 text-red-400 px-1.5 py-0.5 rounded">
                            {expired ? "Expired" : "Maxed out"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 md:px-6 py-3.5 text-gray-700">
                        {coupon.discount_type === "percentage"
                          ? `${coupon.discount_value}% off`
                          : `Rs. ${Number(coupon.discount_value).toLocaleString("en-LK")} off`}
                      </td>
                      <td className="px-4 md:px-6 py-3.5 text-gray-500">
                        {coupon.min_order_value > 0
                          ? `Rs. ${Number(coupon.min_order_value).toLocaleString("en-LK")}`
                          : "—"}
                      </td>
                      <td className="px-4 md:px-6 py-3.5 text-gray-500">
                        {coupon.used_count}
                        {coupon.max_uses != null ? ` / ${coupon.max_uses}` : " / ∞"}
                      </td>
                      <td className="px-4 md:px-6 py-3.5 text-gray-500">
                        {coupon.expires_at
                          ? new Date(coupon.expires_at).toLocaleDateString("en-LK")
                          : "Never"}
                      </td>
                      <td className="px-4 md:px-6 py-3.5">
                        <ToggleButton id={coupon.id} active={coupon.active} />
                      </td>
                      <td className="px-4 md:px-6 py-3.5">
                        <CouponRowActions
                          coupon={{
                            id: coupon.id,
                            code: coupon.code,
                            discount_type: coupon.discount_type,
                            discount_value: coupon.discount_value,
                            min_order_value: coupon.min_order_value,
                            max_uses: coupon.max_uses,
                            expires_at: coupon.expires_at,
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
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
