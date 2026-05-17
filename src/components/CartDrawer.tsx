"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart, type CartItem } from "@/contexts/CartContext";

const SHIPPING = 400;

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQty, subtotal, totalItems } = useCart();

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const total = subtotal + SHIPPING;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-forest/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeCart}
        aria-hidden
      />

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full z-50 w-full max-w-md bg-linen/85 backdrop-blur-2xl border-l border-white/40 flex flex-col shadow-2xl transition-transform duration-400 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label="Shopping cart"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-forest/10">
          <div className="flex items-center gap-3">
            <h2 className="font-display text-xl text-forest">Your Cart</h2>
            {totalItems > 0 && (
              <span className="text-[10px] tracking-widest uppercase text-moss bg-fern/30 backdrop-blur-md border border-white/40 rounded-full px-2.5 py-0.5">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            className="text-forest/40 hover:text-forest transition-colors duration-200 p-1"
            aria-label="Close cart"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto py-4 px-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <BagIcon />
              <p className="text-sm tracking-widest uppercase text-forest/40">Your cart is empty</p>
              <button
                onClick={closeCart}
                className="text-xs tracking-widest uppercase text-moss underline underline-offset-4 hover:text-forest transition-colors duration-200"
              >
                Continue shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-5">
              {items.map((item) => (
                <CartLineItem
                  key={`${item.productId}-${item.color}-${item.size}`}
                  item={item}
                  onRemove={() => removeItem(item.productId, item.color, item.size)}
                  onUpdateQty={(qty) => updateQty(item.productId, item.color, item.size, qty)}
                />
              ))}
            </ul>
          )}
        </div>

        {/* Footer — only shown when cart has items */}
        {items.length > 0 && (
          <div className="border-t border-forest/10 px-6 pt-5 pb-6 space-y-3 bg-linen/40 backdrop-blur-xl">
            <div className="flex justify-between text-sm text-forest/60">
              <span>Subtotal</span>
              <span>Rs. {subtotal.toLocaleString("en-LK")}</span>
            </div>
            <div className="flex justify-between text-sm text-forest/60">
              <span>Shipping</span>
              <span>Rs. {SHIPPING.toLocaleString("en-LK")}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-forest border-t border-forest/10 pt-3">
              <span>Total</span>
              <span>Rs. {total.toLocaleString("en-LK")}</span>
            </div>
            <Link
              href="/checkout"
              onClick={closeCart}
              className="block w-full btn-primary text-center text-xs tracking-widest uppercase mt-2"
            >
              Checkout →
            </Link>
            <button
              onClick={closeCart}
              className="block w-full text-center text-xs tracking-widest uppercase text-forest/40 hover:text-forest transition-colors duration-200 py-1"
            >
              Continue shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function CartLineItem({
  item,
  onRemove,
  onUpdateQty,
}: {
  item: CartItem;
  onRemove: () => void;
  onUpdateQty: (qty: number) => void;
}) {
  const lineTotal = item.priceValue * item.quantity;

  return (
    <li className="flex gap-4">
      {/* Image placeholder */}
      <div
        className="w-20 h-24 shrink-0 rounded-2xl border border-white/40 shadow-sm"
        style={{
          background: `linear-gradient(145deg, ${item.colorHex}66, ${item.colorHex}22)`,
        }}
      />

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start gap-2">
          <p className="text-sm font-medium text-forest leading-tight">{item.name}</p>
          <button
            onClick={onRemove}
            className="text-forest/25 hover:text-forest transition-colors duration-200 shrink-0"
            aria-label="Remove item"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-[11px] text-moss mt-0.5 mb-3">
          {item.color} &middot; Size {item.size}
        </p>

        <div className="flex items-center justify-between">
          {/* Qty stepper */}
          <div className="inline-flex items-center rounded-full bg-white/40 backdrop-blur-md border border-white/55 shadow-sm">
            <button
              onClick={() => onUpdateQty(item.quantity - 1)}
              className="pl-3 pr-1.5 py-1 text-forest/60 hover:text-forest transition-colors duration-200 text-sm leading-none"
            >
              −
            </button>
            <span className="px-2 py-1 text-xs font-medium text-forest min-w-[28px] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdateQty(item.quantity + 1)}
              className="pl-1.5 pr-3 py-1 text-forest/60 hover:text-forest transition-colors duration-200 text-sm leading-none"
            >
              +
            </button>
          </div>

          <p className="text-sm font-medium text-forest">
            Rs. {lineTotal.toLocaleString("en-LK")}
          </p>
        </div>
      </div>
    </li>
  );
}

function BagIcon() {
  return (
    <svg className="w-10 h-10 text-forest/15" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
    </svg>
  );
}
