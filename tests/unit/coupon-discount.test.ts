import { describe, expect, it } from "vitest";
import { calculateCouponDiscount } from "@/lib/cart/coupon";

describe("calculateCouponDiscount", () => {
  it("calcula cupom percentual com precisão monetária", () => {
    expect(calculateCouponDiscount({ id: "1", code: "DEZ", type: "PERCENTAGE", value: 10 }, 99.9)).toBe(9.99);
  });

  it("limita cupom fixo ao subtotal elegível", () => {
    expect(calculateCouponDiscount({ id: "1", code: "FIXO", type: "FIXED", value: 50 }, 30)).toBe(30);
  });

  it("não aplica desconto sem cupom ou subtotal positivo", () => {
    expect(calculateCouponDiscount(null, 100)).toBe(0);
    expect(calculateCouponDiscount({ id: "1", code: "DEZ", type: "PERCENTAGE", value: 10 }, 0)).toBe(0);
  });
});
