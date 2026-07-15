import type { AppliedCoupon } from "./store";

export function calculateCouponDiscount(coupon: AppliedCoupon | null, subtotal: number): number {
  const eligibleSubtotal = Math.max(0, subtotal);
  if (!coupon || eligibleSubtotal === 0) return 0;

  const discount = coupon.type === "PERCENTAGE"
    ? Math.round(eligibleSubtotal * (coupon.value / 100) * 100) / 100
    : coupon.value;

  return Math.min(Math.max(0, discount), eligibleSubtotal);
}
