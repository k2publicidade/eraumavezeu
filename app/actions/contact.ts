"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import { ContactStatus } from "@prisma/client";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Nome deve ter pelo menos 2 caracteres").max(100, "Nome muito longo"),
  email: z.string().trim().email("E-mail inválido"),
  phone: z.string().trim().optional().transform(val => val || null),
  subject: z.string().trim().min(2, "Selecione um assunto válido").max(100),
  message: z.string().trim().min(5, "Mensagem deve ter pelo menos 5 caracteres").max(5000, "Mensagem muito longa"),
});

const statusSchema = z.nativeEnum(ContactStatus);

export async function submitContactMessage(prevState: any, formData: FormData) {
  try {
    const raw = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    const parsed = contactSchema.safeParse(raw);

    if (!parsed.success) {
      return {
        success: false,
        error: parsed.error.issues[0]?.message ?? "Dados inválidos",
      };
    }

    await db.contactMessage.create({
      data: {
        ...parsed.data,
        status: ContactStatus.NOVA,
      },
    });

    revalidatePath("/admin/mensagens");

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    console.error("Error submitting contact message:", error);
    return {
      success: false,
      error: "Ocorreu um erro ao enviar sua mensagem. Tente novamente mais tarde.",
    };
  }
}

export async function updateContactStatus(id: string, status: ContactStatus) {
  await requireAdmin();

  const parsedStatus = statusSchema.safeParse(status);
  if (!parsedStatus.success) {
    throw new Error("Status inválido");
  }

  await db.contactMessage.update({
    where: { id },
    data: { status: parsedStatus.data },
  });

  revalidatePath("/admin/mensagens");
}

export async function updateContactNotes(id: string, notes: string) {
  await requireAdmin();

  await db.contactMessage.update({
    where: { id },
    data: { notes: notes.trim() || null },
  });

  revalidatePath("/admin/mensagens");
}

export async function deleteContactMessage(id: string) {
  await requireAdmin();

  await db.contactMessage.delete({
    where: { id },
  });

  revalidatePath("/admin/mensagens");
}
