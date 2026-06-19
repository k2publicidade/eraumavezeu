import { requireAdmin } from "@/lib/auth-guards";
import { db } from "@/lib/db";
import ContactMessagesDashboard from "@/components/admin/ContactMessagesDashboard";

export const dynamic = "force-dynamic";

export default async function AdminMessagesPage() {
  await requireAdmin();

  // Busca todas as mensagens ordenadas por data de criação
  const messages = await db.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  // Converte as datas em ISO strings ou repassa os objetos Date brutos (suportados pelo Next.js Server-to-Client)
  const serializedMessages = messages.map(msg => ({
    ...msg,
    createdAt: msg.createdAt.toISOString(),
    updatedAt: msg.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.22em] text-fox">Admin</p>
          <h1 className="mt-2 font-serif text-4xl text-primary font-semibold">Mensagens de Contato</h1>
          <p className="mt-2 text-dark/60">
            Gerencie e responda às dúvidas e feedbacks recebidos pelo formulário do site.
          </p>
        </div>
      </div>

      <ContactMessagesDashboard initialMessages={serializedMessages} />
    </div>
  );
}
