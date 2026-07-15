"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notifyOrderCreated } from "@/lib/notifications/order-created";
import { buildOrderDraft, orderCodeOf, type DbProduct } from "@/lib/orders/build-order";
import { checkoutSchema } from "@/lib/validators/order";
import type { ProductType } from "@/lib/cart/types";
import { getPaymentGateway } from "@/lib/payments/gateway-registry";
import { calculateShippingOptions } from "@/lib/shipping";
import { buildProductionBrief } from "@/lib/product-customization";

export type CreateOrderResult =
  | { ok: true; orderId: string; orderCode: string; paymentUrl?: string }
  | { ok: false; error: string };

export async function createOrder(input: unknown): Promise<CreateOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Dados inválidos — revise o formulário." };
  }
  const { buyer, address, items, shippingMethod, shippingCost, paymentGateway, couponCode } = parsed.data;

  if (process.env.NODE_ENV === "production" && paymentGateway === "SIMULADO") {
    return { ok: false, error: "Forma de pagamento indisponível." };
  }

  // Validação do frete no servidor (segurança contra manipulação de preço de frete)
  const validShippingOptions = calculateShippingOptions(address.state);
  const matchedShipping = validShippingOptions.find((o) => o.method === shippingMethod);
  if (!matchedShipping) {
    return { ok: false, error: "Método de frete inválido." };
  }
  if (shippingCost === undefined) {
    return { ok: false, error: "Valor de frete não informado." };
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

  const productBySlug = new Map(dbProducts.map((product) => [product.slug, product]));
  for (const item of items) {
    const product = productBySlug.get(item.slug);
    if (!product) continue;
    if (item.customizations.length !== item.quantity) {
      return { ok: false, error: `Preencha uma ficha de personalização para cada unidade de ${product.name}.` };
    }
    if (item.customizations.some((customization) => customization.productType !== product.type)) {
      return { ok: false, error: `A ficha de ${product.name} não corresponde ao produto comprado.` };
    }
  }

  let draft;
  try {
    draft = buildOrderDraft(items, dbProducts);
  } catch {
    return { ok: false, error: "Um dos produtos não está mais disponível. Atualize o carrinho." };
  }

  // Validação do cupom de desconto no servidor
  let couponId: string | null = null;
  let couponDiscount = 0;

  if (couponCode) {
    const formattedCode = couponCode.trim().toUpperCase();
    const coupon = await db.coupon.findUnique({
      where: { code: formattedCode },
    });

    if (!coupon || !coupon.active) {
      return { ok: false, error: "O cupom informado é inválido ou não está mais ativo." };
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return { ok: false, error: "O cupom informado já expirou." };
    }

    if (coupon.maxUses !== null && coupon.uses >= coupon.maxUses) {
      return { ok: false, error: "O cupom informado atingiu o limite de usos." };
    }

    const productsRemainingValue = Math.max(0, draft.totals.subtotal - draft.totals.discount);
    const valueNum = Number(coupon.value);

    if (coupon.type === "PERCENTAGE") {
      couponDiscount = Math.round(productsRemainingValue * (valueNum / 100) * 100) / 100;
    } else {
      couponDiscount = valueNum;
    }

    couponDiscount = Math.min(couponDiscount, productsRemainingValue);
    couponId = coupon.id;
  }

  // sessão é opcional — guest checkout mantém contato nos campos guest*
  const session = await auth().catch(() => null);
  const userId = session?.user?.id || null;

  const firstCustomization = items.flatMap((item) => item.customizations)[0] ?? null;

  // IP do consentimento LGPD — registrado junto do aceite
  const hdrs = headers();
  const consentIp =
    hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    hdrs.get("x-real-ip") ||
    "unknown";

  const finalTotal = Math.max(0, draft.totals.subtotal - draft.totals.discount - couponDiscount) + (shippingCost || 0);

  try {
    const order = await db.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          userId,
          guestName: buyer.name,
          guestEmail: buyer.email,
          guestPhone: buyer.phone,
          guestCpf: buyer.cpf,
          whatsappOptIn: buyer.whatsappOptIn,
          subtotal: draft.totals.subtotal,
          discount: draft.totals.discount,
          couponId,
          couponDiscount,
          shippingMethod: shippingMethod || "PAC",
          shippingCost: shippingCost || 0,
          total: finalTotal,
          paymentGateway,
          dedication: firstCustomization?.dedication || null,
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

      for (let itemIndex = 0; itemIndex < draft.items.length; itemIndex += 1) {
        const draftItem = draft.items[itemIndex];
        const requestedItem = items[itemIndex];
        if (!draftItem || !requestedItem) continue;
        await tx.orderItem.create({
          data: {
            orderId: createdOrder.id,
            ...draftItem,
            customizations: {
              create: requestedItem.customizations.map((customization, unitIndex) => ({
                unitIndex,
                productType: customization.productType,
                childName: customization.childName,
                childAge: customization.childAge,
                childGender: customization.childGender,
                favoriteColor: customization.favoriteColor,
                theme: customization.theme,
                storyGenre: customization.storyGenre || null,
                artStyle: customization.artStyle || null,
                lineStyle: customization.lineStyle || null,
                dedication: customization.dedication || null,
                notes: customization.notes || null,
                photoKeys: customization.photoKeys,
                aiPrompt: buildProductionBrief(customization),
                consentIp,
                consentAt: new Date(customization.consentAcceptedAt),
                consentTextVersion: customization.consentTextVersion,
                confidentialityAt: new Date(customization.confidentialityAcceptedAt),
              })),
            },
          },
        });
      }

      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: { uses: { increment: 1 } },
        });
      }

      return createdOrder;
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
        if (paymentRes.success) {
          paymentUrl = paymentRes.paymentUrl;
          await db.order.update({
            where: { id: order.id },
            data: {
              paymentUrl: paymentRes.paymentUrl || null,
              pixQrCode: paymentRes.pixQrCode || null,
              pixQrCodeBase64: paymentRes.pixQrCodeBase64 || null,
            },
          });
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
