import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { orderCodeOf } from "@/lib/orders/build-order";
import SimulatedCheckoutClient from "./SimulatedCheckoutClient";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: { orderId?: string };
}

export default async function SimulatedCheckoutPage({ searchParams }: PageProps) {
  const orderId = searchParams.orderId;
  if (!orderId) {
    notFound();
  }

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    notFound();
  }

  const items = order.items.map((it) => ({
    name: it.product.name,
    quantity: it.quantity,
    price: Number(it.price) - (Number(it.discount) / it.quantity),
  }));

  return (
    <div className="py-10 bg-cream-warm min-h-[80vh] flex items-center justify-center">
      <SimulatedCheckoutClient
        orderId={order.id}
        orderCode={orderCodeOf(order.id)}
        total={Number(order.total)}
        buyerName={order.guestName || "Cliente"}
        buyerEmail={order.guestEmail || ""}
        items={items}
      />
    </div>
  );
}
