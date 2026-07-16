import { db } from "@/lib/db";
import AdminShell from "@/components/admin/AdminShell";
import EnviosDashboard, { EnviosOrder } from "@/components/admin/EnviosDashboard";

export const dynamic = "force-dynamic";

export default async function AdminEnviosPage() {
  // Query all orders that have been paid (and are in production or shipping flow)
  const orders = await db.order.findMany({
    where: {
      status: {
        in: [
          "PAGAMENTO_CONFIRMADO",
          "EM_PRODUCAO",
          "AGUARDANDO_ENVIO",
          "ENVIADO",
          "ENTREGUE",
        ],
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // Map Prisma Decimal types to JS numbers to avoid serialization errors in client components
  const formattedOrders: EnviosOrder[] = orders.map((order) => ({
    id: order.id,
    guestName: order.guestName,
    guestEmail: order.guestEmail,
    guestPhone: order.guestPhone,
    guestCpf: order.guestCpf,
    status: order.status,
    total: Number(order.total),
    createdAt: order.createdAt,
    trackingCode: order.trackingCode,
    nfeKey: order.nfeKey,
    nfeStatus: order.nfeStatus,
    nfeNumber: order.nfeNumber,
    nfeSeries: order.nfeSeries,
    nfeXml: order.nfeXml,
    shippingLabelId: order.shippingLabelId,
    shippingLabelUrl: order.shippingLabelUrl,
    shippingLabelStatus: order.shippingLabelStatus,
  }));

  return (
    <AdminShell>
      <EnviosDashboard initialOrders={formattedOrders} />
    </AdminShell>
  );
}
