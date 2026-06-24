"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/contexts/CartContext";
import { clearPendingCoupon, getPendingCoupon } from "@/lib/pendingCoupon";
import { trackInitiateCheckout, trackPurchase } from "@/lib/metaPixel";

const SHIPPING = 425;
const SAVED_INFO_KEY = "fallowkind_saved_checkout_info";

const BANK_DETAILS = {
  accountName: "S Sepala Dahanayake",
  accountNumber: "8024217640",
  bank: "Commercial Bank",
  branch: "Kottawa",
};

type PaymentMethod = "bank_transfer" | "cod";

type Form = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phone2: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
};

type AppliedCoupon = {
  code: string;
  discountType: string;
  discountValue: number;
  discountAmount: number;
};

type UploadedReceipt = {
  path: string;
  filename: string;
  displayName: string;
};

type SuccessOrder = {
  id: string;
  number: string;
  method: PaymentMethod;
};

const INITIAL_FORM: Form = {
  firstName: "", lastName: "", email: "", phone: "", phone2: "",
  address: "", city: "", postalCode: "", notes: "",
};

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart } = useCart();
  const [form, setForm] = useState<Form>(INITIAL_FORM);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("bank_transfer");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Form>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const [receipt, setReceipt] = useState<UploadedReceipt | null>(null);
  const [receiptError, setReceiptError] = useState("");
  const [receiptUploading, setReceiptUploading] = useState(false);

  const [successOrder, setSuccessOrder] = useState<SuccessOrder | null>(null);
  const [saveInfo, setSaveInfo] = useState(false);

  useEffect(() => {
    if (items.length === 0 && !successOrder) router.replace("/shop");
  }, [items, router, successOrder]);

  // Fire a Meta Pixel InitiateCheckout once, when the checkout loads with items.
  const initiateTrackedRef = useRef(false);
  useEffect(() => {
    if (initiateTrackedRef.current || items.length === 0) return;
    initiateTrackedRef.current = true;
    trackInitiateCheckout({
      contents: items.map((i) => ({
        id: String(i.productId),
        quantity: i.quantity,
        item_price: i.priceValue,
      })),
      numItems: items.reduce((sum, i) => sum + i.quantity, 0),
      value: subtotal,
    });
  }, [items, subtotal]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SAVED_INFO_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as Partial<Form>;
      setForm((f) => ({ ...f, ...saved }));
      setSaveInfo(true);
    } catch {}
  }, []);

  const autoAppliedRef = useRef(false);
  useEffect(() => {
    if (autoAppliedRef.current) return;
    if (appliedCoupon || subtotal <= 0) return;
    const pending = getPendingCoupon();
    if (!pending) return;

    autoAppliedRef.current = true;
    (async () => {
      try {
        const res = await fetch("/api/coupons/validate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: pending, subtotal }),
        });
        const data = await res.json();
        if (data.valid) {
          setAppliedCoupon(data.coupon);
        } else {
          clearPendingCoupon();
        }
      } catch {
        autoAppliedRef.current = false;
      }
    })();
  }, [subtotal, appliedCoupon]);

  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const total = subtotal - discountAmount + SHIPPING;

  function setField(field: keyof Form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  }

  function validate(): boolean {
    const next: Partial<Form> = {};
    if (!form.firstName.trim()) next.firstName = "Required";
    if (!form.lastName.trim()) next.lastName = "Required";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Enter a valid email address";
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 9)
      next.phone = "Enter a valid phone number";
    if (form.phone2.trim() && form.phone2.replace(/\D/g, "").length < 9)
      next.phone2 = "Enter a valid phone number";
    if (!form.address.trim()) next.address = "Required";
    if (!form.city.trim()) next.city = "Required";
    if (!form.postalCode.trim()) next.postalCode = "Required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function applyCoupon() {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponInput.trim(), subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedCoupon(data.coupon);
      } else {
        setCouponError(data.error || "Invalid coupon");
        setAppliedCoupon(null);
      }
    } catch {
      setCouponError("Could not validate coupon. Try again.");
    } finally {
      setCouponLoading(false);
    }
  }

  async function handleReceiptChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setReceiptError("");
    setReceiptUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/upload/receipt", { method: "POST", body: data });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setReceiptError(json.error || "Could not upload receipt");
        setReceipt(null);
      } else {
        setReceipt({ path: json.path, filename: json.filename, displayName: file.name });
      }
    } catch {
      setReceiptError("Network error while uploading. Try again.");
    } finally {
      setReceiptUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (paymentMethod === "bank_transfer" && !receipt) {
      setReceiptError("Please upload your payment receipt before placing the order.");
      return;
    }

    setLoading(true);
    setServerError("");

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: form,
          items,
          paymentMethod,
          couponCode: appliedCoupon?.code,
          discountAmount,
          receipt: paymentMethod === "bank_transfer" ? receipt : undefined,
        }),
      });
      const data = await res.json();

      if (!data.success) {
        setServerError(data.error || "Something went wrong. Please try again.");
        return;
      }

      setSuccessOrder({
        id: data.orderId,
        number: data.orderNumber,
        method: paymentMethod,
      });

      // Fire a Meta Pixel Purchase before the cart is cleared.
      trackPurchase({
        contents: items.map((i) => ({
          id: String(i.productId),
          quantity: i.quantity,
          item_price: i.priceValue,
        })),
        numItems: items.reduce((sum, i) => sum + i.quantity, 0),
        value: total,
        orderId: data.orderId,
      });

      clearCart();
      clearPendingCoupon();

      try {
        if (saveInfo) {
          const toSave = {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            phone2: form.phone2,
            address: form.address,
            city: form.city,
            postalCode: form.postalCode,
          };
          localStorage.setItem(SAVED_INFO_KEY, JSON.stringify(toSave));
        } else {
          localStorage.removeItem(SAVED_INFO_KEY);
        }
      } catch {}
    } catch {
      setServerError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  if (successOrder) return <OrderSuccessModal order={successOrder} />;
  if (items.length === 0) return null;

  return (
    <div className="section-padding page-container">
      <p className="text-xs tracking-[0.3em] uppercase text-moss mb-3">Secure checkout</p>
      <h1 className="font-display text-3xl md:text-4xl text-forest mb-10 md:mb-12">Checkout</h1>

      <form onSubmit={handleSubmit} noValidate>
        <div className="grid lg:grid-cols-[3fr_2fr] gap-10 md:gap-12 xl:gap-20">
          {/* ── Left: Form ── */}
          <div className="space-y-10">
            {/* Contact */}
            <section>
              <h2 className="text-xs tracking-[0.3em] uppercase text-moss mb-5">Contact</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="First name" error={errors.firstName}>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => setField("firstName", e.target.value)}
                      className={inputCls(!!errors.firstName)}
                      placeholder="Your first name"
                    />
                  </Field>
                  <Field label="Last name" error={errors.lastName}>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => setField("lastName", e.target.value)}
                      className={inputCls(!!errors.lastName)}
                      placeholder="Your last name"
                    />
                  </Field>
                </div>
                <Field label="Email address" error={errors.email}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    className={inputCls(!!errors.email)}
                    placeholder="you@example.com"
                  />
                </Field>
                <Field label="Phone number" error={errors.phone}>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    className={inputCls(!!errors.phone)}
                    placeholder="+94 7X XXX XXXX"
                  />
                </Field>
                <Field label="Additional number (optional)" error={errors.phone2}>
                  <input
                    type="tel"
                    value={form.phone2}
                    onChange={(e) => setField("phone2", e.target.value)}
                    className={inputCls(!!errors.phone2)}
                    placeholder="+94 7X XXX XXXX"
                  />
                </Field>
              </div>
            </section>

            {/* Shipping address */}
            <section>
              <h2 className="text-xs tracking-[0.3em] uppercase text-moss mb-5">Shipping address</h2>
              <div className="space-y-4">
                <Field label="Street address" error={errors.address}>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => setField("address", e.target.value)}
                    className={inputCls(!!errors.address)}
                    placeholder="Street address"
                  />
                </Field>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="City" error={errors.city}>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => setField("city", e.target.value)}
                      className={inputCls(!!errors.city)}
                      placeholder="Your city"
                    />
                  </Field>
                  <Field label="Postal code" error={errors.postalCode}>
                    <input
                      type="text"
                      value={form.postalCode}
                      onChange={(e) => setField("postalCode", e.target.value)}
                      className={inputCls(!!errors.postalCode)}
                      placeholder="Postal code"
                    />
                  </Field>
                </div>
                <label className="flex items-center gap-3 pt-2 cursor-pointer select-none group">
                  <span
                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-colors duration-200 ${
                      saveInfo
                        ? "bg-forest border-forest"
                        : "bg-white/40 border-forest/30 group-hover:border-forest/55"
                    }`}
                  >
                    {saveInfo && (
                      <svg className="w-3 h-3 text-linen" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                    )}
                  </span>
                  <input
                    type="checkbox"
                    checked={saveInfo}
                    onChange={(e) => setSaveInfo(e.target.checked)}
                    className="sr-only"
                  />
                  <span className="text-sm text-forest/80">Save this information for next time</span>
                </label>
              </div>
            </section>

            {/* Order notes */}
            <section>
              <h2 className="text-xs tracking-[0.3em] uppercase text-moss mb-5">
                Order notes <span className="normal-case tracking-normal text-forest/55">(optional)</span>
              </h2>
              <textarea
                value={form.notes}
                onChange={(e) => setField("notes", e.target.value)}
                rows={3}
                className="w-full glass-input-soft px-4 py-3 text-sm text-forest placeholder:text-forest/50 resize-none border-forest/30 hover:border-forest/50"
                placeholder="Special instructions, delivery notes…"
              />
            </section>

            {/* Discount code */}
            <section>
              <h2 className="text-xs tracking-[0.3em] uppercase text-moss mb-5">Discount code</h2>
              {appliedCoupon ? (
                <div className="flex items-center justify-between glass-tinted px-4 py-3">
                  <div>
                    <p className="text-sm font-medium text-forest">{appliedCoupon.code}</p>
                    <p className="text-xs text-moss mt-0.5">
                      {appliedCoupon.discountType === "percentage"
                        ? `${appliedCoupon.discountValue}% off`
                        : `Rs. ${appliedCoupon.discountValue.toLocaleString("en-LK")} off`}
                      {" - "}
                      saving Rs. {appliedCoupon.discountAmount.toLocaleString("en-LK")}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedCoupon(null);
                      setCouponInput("");
                      clearPendingCoupon();
                    }}
                    className="text-forest/35 hover:text-forest transition-colors duration-200 text-xs tracking-widest uppercase"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setCouponError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyCoupon())}
                      className="flex-1 glass-input px-5 py-3 text-sm text-forest placeholder:text-forest/50 uppercase tracking-widest border-forest/30 hover:border-forest/50"
                      placeholder="ENTER CODE"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={couponLoading || !couponInput.trim()}
                      className="px-5 btn-outline text-xs tracking-widest uppercase disabled:opacity-40"
                    >
                      {couponLoading ? "…" : "Apply"}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-red-500/70 mt-2">{couponError}</p>
                  )}
                </>
              )}
            </section>

            {/* Payment method */}
            <section>
              <h2 className="text-xs tracking-[0.3em] uppercase text-moss mb-5">Payment method</h2>
              <div className="space-y-3">
                <PaymentOption
                  selected={paymentMethod === "bank_transfer"}
                  onSelect={() => setPaymentMethod("bank_transfer")}
                  icon={<BankIcon />}
                  label="Direct Bank Transfer"
                  description="Transfer to our account and upload the receipt below. Your order ships once payment clears."
                />
                <PaymentOption
                  selected={paymentMethod === "cod"}
                  onSelect={() => setPaymentMethod("cod")}
                  icon={<CodIcon />}
                  label="Cash on Delivery"
                  description="Pay in cash when your order is delivered to your door."
                />
              </div>

              {paymentMethod === "bank_transfer" && (
                <div className="mt-5 space-y-5">
                  {/* Bank details panel */}
                  <div className="glass-card p-5 sm:p-6">
                    <p className="text-[10px] tracking-widest uppercase text-moss mb-3">
                      Transfer to this account
                    </p>
                    <dl className="grid grid-cols-[auto_1fr] gap-x-4 sm:gap-x-6 gap-y-1.5 text-sm break-words">
                      <dt className="text-forest/75">Account name</dt>
                      <dd className="text-forest font-medium">{BANK_DETAILS.accountName}</dd>
                      <dt className="text-forest/75">Account number</dt>
                      <dd className="text-forest font-medium font-mono break-all">{BANK_DETAILS.accountNumber}</dd>
                      <dt className="text-forest/75">Bank</dt>
                      <dd className="text-forest font-medium">{BANK_DETAILS.bank}</dd>
                      <dt className="text-forest/75">Branch</dt>
                      <dd className="text-forest font-medium">{BANK_DETAILS.branch}</dd>
                      <dt className="text-forest/55 pt-2 border-t border-forest/10 mt-1">Amount</dt>
                      <dd className="text-forest font-semibold pt-2 border-t border-forest/10 mt-1">
                        Rs. {total.toLocaleString("en-LK")}
                      </dd>
                    </dl>
                    <p className="text-xs text-forest/75 mt-4 leading-relaxed">
                      Use your <strong className="text-forest">full name</strong> as the payment reference,
                      then upload your receipt or screenshot below.
                      Online, in-bank, and ATM deposits are all accepted.
                    </p>
                  </div>

                  {/* Receipt upload */}
                  <Field
                    label="Payment receipt"
                    error={receiptError}
                  >
                    {receipt ? (
                      <div className="flex items-center justify-between glass-tinted px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <svg className="w-4 h-4 text-sage shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          <span className="text-sm text-forest truncate">{receipt.displayName}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => { setReceipt(null); setReceiptError(""); }}
                          className="text-forest/35 hover:text-forest transition-colors duration-200 text-xs tracking-widest uppercase ml-3 shrink-0"
                        >
                          Replace
                        </button>
                      </div>
                    ) : (
                      <label className={`flex items-center justify-center gap-3 rounded-2xl border-2 border-dashed bg-white/25 backdrop-blur-md ${receiptError ? "border-red-400/70" : "border-forest/25"} px-4 py-6 cursor-pointer hover:border-forest/45 hover:bg-white/40 transition-all duration-200`}>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
                          onChange={handleReceiptChange}
                          disabled={receiptUploading}
                          className="hidden"
                        />
                        {receiptUploading ? (
                          <span className="text-sm text-forest/60">Uploading…</span>
                        ) : (
                          <>
                            <svg className="w-5 h-5 text-forest/45" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                            </svg>
                            <span className="text-sm text-forest/80">
                              Click to upload your receipt
                              <span className="block text-xs text-forest/60 mt-0.5">JPG, PNG, WEBP, HEIC or PDF · max 5 MB</span>
                            </span>
                          </>
                        )}
                      </label>
                    )}
                  </Field>
                </div>
              )}
            </section>

            {serverError && (
              <p className="text-sm text-red-600/90 bg-red-50/60 backdrop-blur-md border border-red-200/70 rounded-2xl px-4 py-3">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || receiptUploading}
              className="w-full btn-primary text-xs tracking-widest uppercase py-4 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Processing…" : "Place Order →"}
            </button>
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="lg:sticky lg:top-28 self-start">
            <h2 className="text-xs tracking-[0.3em] uppercase text-moss mb-6">Order summary</h2>

            <ul className="space-y-4 mb-6">
              {items.map((item) => {
                const summaryImage = item.imageUrl ?? item.imageUrl2;
                return (
                <li
                  key={`${item.productId}-${item.color}-${item.size}`}
                  className="flex gap-4"
                >
                  <div
                    className="relative w-16 h-20 shrink-0 rounded-2xl border border-white/40 shadow-sm overflow-hidden"
                    style={
                      summaryImage
                        ? undefined
                        : { background: `linear-gradient(145deg, ${item.colorHex}66, ${item.colorHex}22)` }
                    }
                  >
                    {summaryImage && (
                      <Image
                        src={summaryImage}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-forest leading-tight">{item.name}</p>
                    <p className="text-[11px] text-moss mt-0.5">{item.color} · Size {item.size}</p>
                    <div className="flex justify-between mt-2">
                      <span className="text-xs text-forest/70">Qty: {item.quantity}</span>
                      <span className="text-sm text-forest">
                        Rs. {(item.priceValue * item.quantity).toLocaleString("en-LK")}
                      </span>
                    </div>
                  </div>
                </li>
                );
              })}
            </ul>

            <div className="border-t border-forest/10 pt-5 space-y-2.5">
              <SummaryRow label="Subtotal" value={`Rs. ${subtotal.toLocaleString("en-LK")}`} />
              {discountAmount > 0 && (
                <SummaryRow
                  label={`Discount (${appliedCoupon?.code})`}
                  value={`−Rs. ${discountAmount.toLocaleString("en-LK")}`}
                  accent
                />
              )}
              <SummaryRow label="Shipping" value={`Rs. ${SHIPPING.toLocaleString("en-LK")}`} />
              <div className="border-t border-forest/10 pt-3 flex justify-between">
                <span className="text-base font-semibold text-forest">Total</span>
                <span className="text-base font-semibold text-forest">
                  Rs. {total.toLocaleString("en-LK")}
                </span>
              </div>
            </div>

            <div className="mt-6 border-t border-forest/10 pt-5">
              <div className="flex items-center gap-3 text-forest/70">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                <span className="text-xs">Secure, encrypted checkout</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// ── Small helpers ────────────────────────────────────────────────

function inputCls(hasError: boolean) {
  return `w-full glass-input px-5 py-3 text-sm text-forest placeholder:text-forest/50 border-forest/30 hover:border-forest/50 ${hasError ? "!border-red-400/70" : ""}`;
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[10px] tracking-widest uppercase text-forest/75 mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500/70 mt-1">{error}</p>}
    </div>
  );
}

function PaymentOption({
  selected, onSelect, icon, label, description,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  label: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-start gap-4 p-4 rounded-2xl backdrop-blur-md text-left transition-all duration-200 ${
        selected
          ? "bg-fern/25 border border-forest/40 shadow-sm"
          : "bg-white/30 border border-white/50 hover:bg-white/45 hover:border-forest/30"
      }`}
    >
      <div className={`w-4 h-4 rounded-full border-2 mt-0.5 shrink-0 flex items-center justify-center transition-colors duration-200 ${selected ? "border-forest" : "border-forest/30"}`}>
        {selected && <div className="w-2 h-2 rounded-full bg-forest" />}
      </div>
      <div className="text-forest/40 shrink-0 mt-0.5">{icon}</div>
      <div>
        <p className="text-sm font-medium text-forest">{label}</p>
        <p className="text-xs text-forest/70 mt-0.5 leading-relaxed">{description}</p>
      </div>
    </button>
  );
}

function SummaryRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-sm text-forest/75">{label}</span>
      <span className={`text-sm ${accent ? "text-sage" : "text-forest"}`}>{value}</span>
    </div>
  );
}

function OrderSuccessModal({ order }: { order: SuccessOrder }) {
  const isBankTransfer = order.method === "bank_transfer";

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-success-title"
    >
      <div className="absolute inset-0 bg-forest/70 backdrop-blur-md" />

      <div className="relative max-w-md w-full bg-linen border border-forest/15 shadow-2xl rounded-2xl p-6 sm:p-10 text-center">
        <div className="w-20 h-20 rounded-full bg-sage/25 backdrop-blur-md border border-sage/30 shadow-lg flex items-center justify-center mx-auto mb-6 relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-fern/40 to-sage/0 blur-xl -z-10" />
          <svg className="w-9 h-9 text-sage" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>

        <p className="text-xs tracking-[0.3em] uppercase text-moss mb-3">
          {isBankTransfer ? "Receipt received" : "Order placed"}
        </p>
        <h2
          id="order-success-title"
          className="font-display text-3xl sm:text-4xl text-forest mb-3 leading-tight"
        >
          Order placed successfully!
        </h2>

        {order.number && (
          <p className="text-lg text-sage font-medium mb-4">{order.number}</p>
        )}

        <p className="text-sm text-forest/75 leading-relaxed mb-6">
          {isBankTransfer
            ? "We've received your receipt and will verify your payment within 1–2 business days. A confirmation email is on its way."
            : "Your order has been placed and our team will pack and ship it soon. You'll receive a confirmation email shortly."}
        </p>

        {order.id && (
          <p className="text-[10px] tracking-widest uppercase text-forest/35 mb-8">
            Order ID: {order.id.slice(0, 8).toUpperCase()}
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

function BankIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l9 4.5H3L12 3zM4.5 9v9m4-9v9m7-9v9m4-9v9M3 21h18" />
    </svg>
  );
}

function CodIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
    </svg>
  );
}
