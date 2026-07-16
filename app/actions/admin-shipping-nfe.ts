"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { NfeService } from "@/lib/nfe/nfe-service";
import { MelhorEnvioService } from "@/lib/shipping/melhor-envio-service";

export type AdminActionResult = { ok: true } | { ok: false; error: string };

export type BulkActionResult = {
  ok: true;
  successes: number;
  failures: number;
  errors: string[];
};

/**
 * Verification that the current user is an Admin
 */
async function getAdminUser() {
  const session = await auth().catch(() => null);
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session.user;
}

/**
 * Issue an NF-e for a single order.
 */
export async function issueNfe(
  orderId: string,
  simulate: boolean = true
): Promise<AdminActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Acesso negado." };

  const res = await NfeService.issueNfe(orderId, simulate);
  if (res.ok) {
    revalidatePath("/admin");
    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/envios");
    revalidatePath(`/admin/pedidos/${orderId}`);
    return { ok: true };
  } else {
    return { ok: false, error: res.error };
  }
}

/**
 * Cancel an NF-e for a single order.
 */
export async function cancelNfe(orderId: string): Promise<AdminActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Acesso negado." };

  const res = await NfeService.cancelNfe(orderId);
  if (res.ok) {
    revalidatePath("/admin");
    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/envios");
    revalidatePath(`/admin/pedidos/${orderId}`);
    return { ok: true };
  } else {
    return { ok: false, error: res.error || "Erro ao cancelar NF-e." };
  }
}

/**
 * Issue a shipping label for a single order.
 */
export async function issueShippingLabel(
  orderId: string,
  simulate: boolean = true
): Promise<AdminActionResult> {
  const admin = await getAdminUser();
  if (!admin) return { ok: false, error: "Acesso negado." };

  const res = await MelhorEnvioService.generateLabel(orderId, simulate);
  if (res.ok) {
    revalidatePath("/admin");
    revalidatePath("/admin/pedidos");
    revalidatePath("/admin/envios");
    revalidatePath(`/admin/pedidos/${orderId}`);
    return { ok: true };
  } else {
    return { ok: false, error: res.error };
  }
}

/**
 * Bulk issue NF-es.
 */
export async function bulkIssueNfe(
  orderIds: string[],
  simulate: boolean = true
): Promise<BulkActionResult> {
  const admin = await getAdminUser();
  if (!admin) {
    return {
      ok: true,
      successes: 0,
      failures: orderIds.length,
      errors: ["Acesso negado. Usuário não é administrador."],
    };
  }

  let successes = 0;
  let failures = 0;
  const errors: string[] = [];

  for (const id of orderIds) {
    const res = await NfeService.issueNfe(id, simulate);
    if (res.ok) {
      successes++;
    } else {
      failures++;
      errors.push(`Pedido #${id.slice(-8).toUpperCase()}: ${res.error}`);
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/envios");
  return {
    ok: true,
    successes,
    failures,
    errors,
  };
}

/**
 * Bulk issue shipping labels.
 */
export async function bulkIssueShippingLabels(
  orderIds: string[],
  simulate: boolean = true
): Promise<BulkActionResult> {
  const admin = await getAdminUser();
  if (!admin) {
    return {
      ok: true,
      successes: 0,
      failures: orderIds.length,
      errors: ["Acesso negado. Usuário não é administrador."],
    };
  }

  let successes = 0;
  let failures = 0;
  const errors: string[] = [];

  for (const id of orderIds) {
    const res = await MelhorEnvioService.generateLabel(id, simulate);
    if (res.ok) {
      successes++;
    } else {
      failures++;
      errors.push(`Pedido #${id.slice(-8).toUpperCase()}: ${res.error}`);
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin/envios");
  return {
    ok: true,
    successes,
    failures,
    errors,
  };
}
