"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifyOrderCreated } from "@/lib/notifications/order-created";
import { buildOrderDraft, orderCodeOf, type DbProduct } from "@/lib/orders/build-order";
import { checkoutSchema } from "@/lib/validators/order";
import { gerarPromptIA } from "@/lib/wizard/prompt";
import type { ProductType } from "@/lib/cart/types";
import { getPaymentGateway } from "@/lib/payments/gateway-registry";
import { calculateShippingOptions } from "@/lib/shipping";

export type CreateOrderResult =
  | { ok: true; orderId: string; orderCode: string; paymentUrl?: string }
  | { ok: false; error: string };

export async function createOrder(input: unknown): Promise<CreateOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos — revise o formulário." };
  }
  const { buyer, address, items, shippingMethod, shippingCost, paymentGateway } = parsed.data;

  // Validação do frete no servidor (segurança contra manipulação de preço de frete)
  const validShippingOptions = calculateShippingOptions(address.state);
  const matchedShipping = validShippingOptions.find((o) => o.method === shippingMethod);
  if (!matchedShipping) {
    return { ok: false, error: "Método de frete inválido." };
  }
  if (Math.abs(matchedShipping.cost - shippingCost) > 0.01) {
    return { ok: false, error: "Valor de frete divergente. Por favor, recalcule no checkout." };
  }

  // preço é autoridade do servidor: busca produtos ativos do banco
  const slugs = Array.from(new Set(items.map((i) => i.slug)));
  const products = await db.product.findMany({
    where: { slug: { in: slugs }, active: true },
  });
  const dbProducts: DbProduct[] = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    type: p.type as ProductType,
    price: Number(p.price),
  }));

  let draft;
  try {
    draft = buildOrderDraft(items, dbProducts);
  } catch {
    return { ok: false, error: "Um dos produtos não está mais disponível. Atualize o carrinho." };
  }

  // sessão é opcional — guest checkout mantém contato nos campos guest*
  const session = await auth().catch(() => null);
  const userId = session?.user?.id || null;

  const customization = items.find((i) => i.customization)?.customization ?? null;
  const aiPrompt = customization
    ? gerarPromptIA({
        theme: customization.theme,
        genre: customization.genre,
        artStyle: customization.artStyle,
        favoriteColor: customization.favoriteColor,
        ageRange: customization.ageRange,
        childName: customization.childName,
        dedication: customization.dedication,
        photoCount: customization.photoKeys.length,
      })
    : null;

  // IP do consentimento LGPD — registrado junto do aceite
  const hdrs = headers();
  const consentIp =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    "unknown";

  const finalTotal = draft.totals.total + (shippingCost || 0);

  try {
    const order = await db.order.create({
      data: {
        userId,
        guestName: buyer.name,
        guestEmail: buyer.email,
        guestPhone: buyer.phone,
        whatsappOptIn: buyer.whatsappOptIn,
        subtotal: draft.totals.subtotal,
        discount: draft.totals.discount,
        shippingMethod: shippingMethod || "PAC",
        shippingCost: shippingCost || 0,
        total: finalTotal,
        paymentGateway,
        dedication: customization?.dedication || null,
        items: { create: draft.items },
        shippingAddress: {
          create: {
            name: buyer.name,
            street: address.street,
            number: address.number,
            complement: address.complement || null,
            district: address.district,
            city: address.city,
            state: address.state,
            zipCode: address.zipCode,
          },
        },
        ...(customization
          ? {
              customization: {
                create: {
                  childName: customization.childName,
                  theme: customization.theme,
                  genre: customization.genre,
                  artStyle: customization.artStyle,
                  favoriteColor: customization.favoriteColor,
                  ageRange: customization.ageRange,
                  photoKeys: customization.photoKeys,
                  dedication: customization.dedication || null,
                  aiPrompt,
                  consentIp,
                  consentAt: new Date(customization.consentAcceptedAt),
                  consentTextVersion: customization.consentTextVersion,
                },
              },
            }
          : {}),
        statusHistory: {
          create: {
            toStatus: "AGUARDANDO_PAGAMENTO",
            changedBy: "system",
            note: "Pedido criado no checkout",
          },
        },
      },
      select: { id: true },
    });

    // comunicação é melhor-esforço — nunca falha um pedido já persistido
    const productById = new Map(dbProducts.map((p) => [p.id, p]));
    await notifyOrderCreated({
      orderId: order.id,
      orderCode: orderCodeOf(order.id),
      buyerName: buyer.name,
      buyerEmail: buyer.email,
      buyerPhone: buyer.phone,
      whatsappOptIn: buyer.whatsappOptIn,
      items: draft.items.map((it) => {
        const product = productById.get(it.productId);
        return {
          name: product?.name ?? it.productId,
          quantity: it.quantity,
          lineTotal: it.price * it.quantity - it.discount,
        };
      }),
      subtotal: draft.totals.subtotal,
      discount: draft.totals.discount,
      total: finalTotal,
    }).catch((err) => console.error("notifyOrderCreated failed", err));

    // Processamento do pagamento pelo Gateway escolhido
    let paymentUrl: string | undefined = undefined;
    try {
      const fullOrder = await db.order.findUnique({
        where: { id: order.id },
        include: {
          items: { include: { product: true } },
          shippingAddress: true,
        },
      });

      if (fullOrder) {
        const gateway = getPaymentGateway(paymentGateway);
        const paymentRes = await gateway.createPayment(fullOrder);
        if (paymentRes.success && paymentRes.paymentUrl) {
          paymentUrl = paymentRes.paymentUrl;
        }
      }
    } catch (paymentErr) {
      console.error(`Erro ao gerar link de pagamento (${paymentGateway}):`, paymentErr);
    }

    return { ok: true, orderId: order.id, orderCode: orderCodeOf(order.id), paymentUrl };
  } catch (err) {
    console.error("createOrder failed", err);
    return { ok: false, error: "Não foi possível criar o pedido. Tente novamente." };
  }
}
