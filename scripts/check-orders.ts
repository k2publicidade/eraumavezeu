// Must run from project root with: npx tsx scripts/check-orders.ts
import { PrismaClient } from "@prisma/client";
const db = new PrismaClient();

async function main() {
  const orders = await db.order.findMany({
    select: {
      id: true,
      status: true,
      guestName: true,
      guestEmail: true,
      guestCpf: true,
      guestPhone: true,
      nfeStatus: true,
      nfeKey: true,
      shippingLabelStatus: true,
      shippingLabelUrl: true,
      trackingCode: true,
      shippingAddress: {
        select: {
          name: true,
          street: true,
          city: true,
          state: true,
          zipCode: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  console.log("=== RECENT ORDERS ===");
  for (const o of orders) {
    console.log(`\nOrder: ${o.id}`);
    console.log(`  Status: ${o.status}`);
    console.log(`  Name: ${o.guestName}`);
    console.log(`  Email: ${o.guestEmail}`);
    console.log(`  CPF: ${o.guestCpf || "NULL ⚠️"}`);
    console.log(`  Phone: ${o.guestPhone}`);
    console.log(`  NFe Status: ${o.nfeStatus || "NENHUMA"}`);
    console.log(`  NFe Key: ${o.nfeKey || "—"}`);
    console.log(`  Label Status: ${o.shippingLabelStatus || "NENHUMA"}`);
    console.log(`  Label URL: ${o.shippingLabelUrl || "—"}`);
    console.log(`  Tracking: ${o.trackingCode || "—"}`);
    console.log(`  Address: ${o.shippingAddress ? `${o.shippingAddress.street}, ${o.shippingAddress.city}/${o.shippingAddress.state} - ${o.shippingAddress.zipCode}` : "NULL ⚠️"}`);
  }
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
