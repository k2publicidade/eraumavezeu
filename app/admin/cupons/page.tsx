import { db } from "@/lib/db";
import CouponManager from "@/components/admin/CouponManager";

export const dynamic = "force-dynamic";

export default async function AdminCouponsPage() {
  const coupons = await db.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Serialize Decimal values and dates for client-side consumption
  const serializedCoupons = coupons.map((c) => ({
    id: c.id,
    code: c.code,
    type: c.type,
    value: Number(c.value),
    maxUses: c.maxUses,
    uses: c.uses,
    active: c.active,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  return <CouponManager initialCoupons={serializedCoupons} />;
}
