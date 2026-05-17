import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Order Confirmed" };

type Props = { searchParams: Promise<{ id?: string; number?: string; method?: string }> };

export default async function OrderSuccessPage({ searchParams }: Props) {
  const { id, number, method } = await searchParams;
  const isBankTransfer = method === "bank_transfer";

  return (
    <div className="section-padding page-container min-h-[70vh] flex items-center justify-center">
      <div className="max-w-md w-full text-center">
        {/* Check icon */}
        <div className="w-20 h-20 rounded-full bg-sage/25 backdrop-blur-md border border-sage/30 shadow-lg flex items-center justify-center mx-auto mb-8 relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-fern/40 to-sage/0 blur-xl -z-10" />
          <svg className="w-9 h-9 text-sage" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <p className="text-xs tracking-[0.3em] uppercase text-moss mb-3">
          {isBankTransfer ? "Receipt received" : "Order placed"}
        </p>
        <h1 className="font-display text-3xl md:text-4xl text-forest mb-4">
          Order confirmed!
        </h1>

        {number && (
          <p className="text-lg text-sage font-medium mb-4">{number}</p>
        )}

        <p className="text-forest/60 text-sm leading-relaxed mb-10 max-w-sm mx-auto">
          {isBankTransfer
            ? "We have received your receipt and will verify the payment within 1–2 business days. Your order ships once the funds have cleared. A confirmation email is on its way."
            : "Your order has been placed and our team will pack and ship it soon. You'll receive a confirmation email shortly."}
        </p>

        {id && (
          <p className="text-[10px] tracking-widest uppercase text-forest/30 mb-8">
            Order ID: {id.slice(0, 8).toUpperCase()}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/shop" className="btn-primary text-xs tracking-widest uppercase">
            Continue Shopping
          </Link>
          <Link href="/" className="btn-outline text-xs tracking-widest uppercase">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
