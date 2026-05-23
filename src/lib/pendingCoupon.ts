let pendingCoupon: string | null = null;

export function setPendingCoupon(code: string) {
  pendingCoupon = code;
}

export function getPendingCoupon(): string | null {
  return pendingCoupon;
}

export function clearPendingCoupon() {
  pendingCoupon = null;
}
