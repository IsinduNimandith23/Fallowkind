"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { clearPendingCoupon, setPendingCoupon } from "@/lib/pendingCoupon";

type WelcomeCoupon = {
  code: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue: number;
  remaining: number | null;
};

const SKIP_PATHS = ["/checkout", "/order-success", "/admin"];

export default function WelcomePopup() {
  const pathname = usePathname();
  const [coupon, setCoupon] = useState<WelcomeCoupon | null>(null);
  const [visible, setVisible] = useState(false);
  const [closing, setClosing] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const autoShownRef = useRef(false);

  const skipped = SKIP_PATHS.some((p) => pathname?.startsWith(p));

  const fetchCoupon = useCallback(async () => {
    try {
      const res = await fetch("/api/coupons/welcome");
      const data = await res.json();
      if (data.available) {
        setCoupon(data.coupon);
      } else {
        setCoupon(null);
        setVisible(false);
        setClaimed(false);
        clearPendingCoupon();
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (skipped) return;
    if (typeof window === "undefined") return;

    fetchCoupon();

    function onVisible() {
      if (document.visibilityState === "visible") fetchCoupon();
    }
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [skipped, fetchCoupon]);

  useEffect(() => {
    if (!coupon || skipped) return;
    if (autoShownRef.current || claimed) return;

    function checkScroll() {
      const scrolled = window.scrollY;
      const trigger = window.innerHeight * 0.3;
      if (scrolled >= trigger) {
        autoShownRef.current = true;
        setVisible(true);
        window.removeEventListener("scroll", checkScroll);
      }
    }

    window.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();

    return () => window.removeEventListener("scroll", checkScroll);
  }, [coupon, skipped, claimed]);

  function close() {
    setClosing(true);
    setTimeout(() => {
      setVisible(false);
      setClosing(false);
    }, 200);
  }

  function open() {
    setVisible(true);
  }

  function claim() {
    if (!coupon) return;
    setPendingCoupon(coupon.code);
    setClaimed(true);
    close();
  }

  if (skipped || !coupon) return null;

  const discountLabel =
    coupon.discountType === "percentage"
      ? `${coupon.discountValue}% OFF`
      : `Rs. ${coupon.discountValue.toLocaleString("en-LK")} OFF`;

  return (
    <>
      {!visible && (
        <button
          type="button"
          onClick={open}
          aria-label={claimed ? "View your welcome discount" : "Claim your welcome discount"}
          className="fixed bottom-6 right-6 z-[90] group flex items-center gap-3 pl-4 pr-5 py-3 rounded-full bg-forest text-linen shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
        >
          <span className="relative flex items-center justify-center w-6 h-6">
            {claimed ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            ) : (
              <>
                <span className="absolute inset-0 rounded-full bg-sage/40 animate-ping" />
                <svg className="relative w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </>
            )}
          </span>
          <span className="text-[11px] tracking-widest uppercase font-medium">
            {claimed ? "Discount saved" : `${discountLabel}`}
          </span>
        </button>
      )}

      {visible && (
        <div
          className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-200 ${
            closing ? "opacity-0" : "opacity-100"
          }`}
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-labelledby="welcome-popup-title"
        >
          <div className="absolute inset-0 bg-forest/70 backdrop-blur-md" />

          <div
            onClick={(e) => e.stopPropagation()}
            className={`relative max-w-md w-full bg-linen border border-forest/15 shadow-2xl rounded-2xl p-8 sm:p-10 text-center transition-all duration-300 ${
              closing ? "scale-95" : "scale-100"
            }`}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center text-forest/40 hover:text-forest transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <p className="text-xs tracking-[0.3em] uppercase text-moss mb-3">
              {claimed ? "Discount saved" : "Welcome to Fallowkind"}
            </p>
            <h2
              id="welcome-popup-title"
              className="font-display text-3xl sm:text-4xl text-forest mb-4 leading-tight"
            >
              {discountLabel}
              <span className="block text-base font-normal text-forest/75 mt-2 font-sans">
                on your first order
              </span>
            </h2>

            <p className="text-sm text-forest/75 leading-relaxed mb-6">
              {claimed ? (
                <>
                  Your discount is locked in. It will apply automatically at
                  checkout once you add something to your cart.
                </>
              ) : (
                <>
                  We&apos;re giving the first {coupon.remaining ?? "few"} customers a
                  little something to say thanks for being early.
                  {coupon.minOrderValue > 0 && (
                    <>
                      {" "}
                      Minimum order Rs. {coupon.minOrderValue.toLocaleString("en-LK")}.
                    </>
                  )}
                </>
              )}
            </p>

            {claimed ? (
              <button
                type="button"
                onClick={close}
                className="w-full btn-primary text-xs tracking-widest uppercase py-4"
              >
                Got it
              </button>
            ) : (
              <button
                type="button"
                onClick={claim}
                className="w-full btn-primary text-xs tracking-widest uppercase py-4"
              >
                Claim my discount
              </button>
            )}

            {!claimed && (
              <p className="text-[10px] tracking-widest uppercase text-forest/45 mt-4">
                Auto-applied at checkout
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
