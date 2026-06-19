import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orderCodeOf } from "@/lib/orders/build-order";
import { STATUS_LABELS, type OrderStatusValue } from "@/lib/orders/status";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Defesa em profundidade: verifica se o usuário é administrador
    const session = await auth().catch(() => null);
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return new Response("Acesso negado. Apenas administradores podem exportar dados.", { status: 403 });
    }

    const orders = await db.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        shippingAddress: true,
        customization: true,
      },
    });

    // Cabeçalho do CSV
    const csvHeaders = [
      "Codigo",
      "Data",
      "Status",
      "Status Pagamento",
      "Metodo Pagamento",
      "Cliente Nome",
      "Cliente Email",
      "Cliente Telefone",
      "Opt-in WhatsApp",
      "Total (R$)",
      "Endereco",
      "Bairro",
      "Cidade",
      "Estado",
      "CEP",
      "Nome da Crianca",
      "Tema",
      "Dedicatoria",
      "Prompt de IA",
    ];

    // Helper para escapar strings no formato CSV
    const escapeCsv = (val: string | null | undefined): string => {
      if (val === null || val === undefined) return "";
      const text = String(val).replace(/[\r\n]+/g, " ");
      if (text.includes(",") || text.includes('"') || text.includes(";")) {
        return `"${text.replace(/"/g, '""')}"`;
      }
      return text;
    };

    const csvRows = orders.map((o) => {
      const address = o.shippingAddress;
      const custom = o.customization;
      
      const fullAddress = address 
        ? `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ""}` 
        : "";

      return [
        `#${orderCodeOf(o.id)}`,
        o.createdAt.toISOString(),
        STATUS_LABELS[o.status as OrderStatusValue] || o.status,
        o.paymentStatus,
        o.paymentMethod || "—",
        escapeCsv(o.guestName),
        escapeCsv(o.guestEmail),
        escapeCsv(o.guestPhone),
        o.whatsappOptIn ? "Sim" : "Nao",
        o.total.toFixed(2),
        escapeCsv(fullAddress),
        escapeCsv(address?.district),
        escapeCsv(address?.city),
        escapeCsv(address?.state),
        escapeCsv(address?.zipCode),
        escapeCsv(custom?.childName),
        escapeCsv(custom?.theme),
        escapeCsv(custom?.dedication),
        escapeCsv(custom?.aiPrompt),
      ];
    });

    // Converte para CSV usando delimitador ','
    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row) => row.join(",")),
    ].join("\n");

    // Adiciona o byte order mark (BOM) UTF-8 (\uFEFF) para garantir suporte a acentos no Excel
    const bom = "\uFEFF";
    
    return new Response(bom + csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=pedidos_eraumavezeu.csv",
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("Erro ao exportar pedidos para CSV:", error);
    return new Response("Erro interno ao exportar arquivo.", { status: 500 });
  }
}
