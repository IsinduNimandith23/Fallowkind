const KEY = "fk_pending_coupon";

export function setPendingCoupon(code: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, code);
  } catch {}
}

export function getPendingCoupon(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function clearPendingCoupon() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}
