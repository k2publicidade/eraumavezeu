import {
  deleteFaqItem,
  saveFaqItem,
  seedDefaultFaqItems,
  toggleFaqItem,
} from "@/app/actions/admin-content";
import type { FaqItem } from "@/lib/site-content";

function FaqFields({ item }: { item?: FaqItem }) {
  return (
    <>
      {item?.id && <input type="hidden" name="id" value={item.id} />}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_120px]">
        <label>
          <span className="text-sm font-medium text-primary">Pergunta</span>
          <input
            name="question"
            defaultValue={item?.question ?? ""}
            required
            className="mt-2 w-full rounded-2xl border border-gold/30 bg-cream-light px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </label>
        <label>
          <span className="text-sm font-medium text-primary">Ordem</span>
          <input
            name="sortOrder"
            type="number"
            min="0"
            defaultValue={item?.sortOrder ?? 0}
            className="mt-2 w-full rounded-2xl border border-gold/30 bg-cream-light px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
          />
        </label>
      </div>
      <label className="mt-4 block">
        <span className="text-sm font-medium text-primary">Resposta</span>
        <textarea
          name="answer"
          defaultValue={item?.answer ?? ""}
          rows={4}
          required
          className="mt-2 w-full rounded-2xl border border-gold/30 bg-cream-light px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
        />
      </label>
      <label className="mt-4 flex items-center gap-2 text-sm text-dark/70">
        <input
          name="active"
          type="checkbox"
          defaultChecked={item?.active ?? true}
          className="h-4 w-4 rounded border-gold/40 text-primary focus:ring-primary"
        />
        Exibir no site
      </label>
    </>
  );
}

export default function FaqItemForm({ items }: { items: FaqItem[] }) {
  return (
    <section className="rounded-3xl border border-gold/25 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl text-primary">FAQ</h2>
          <p className="mt-1 text-sm text-dark/60">
            Gerencie perguntas frequentes exibidas em `/faq`. Se não houver itens cadastrados,
            o site usa respostas padrão.
          </p>
        </div>
        <form action={seedDefaultFaqItems}>
          <button type="submit" className="rounded-full border border-gold/35 px-4 py-2 text-sm font-medium text-primary transition hover:bg-gold/10">
            Carregar FAQ padrão
          </button>
        </form>
      </div>

      <form action={saveFaqItem} className="mt-6 rounded-2xl border border-primary/10 bg-cream-warm p-4">
        <h3 className="font-serif text-xl text-primary">Nova pergunta</h3>
        <div className="mt-4">
          <FaqFields />
        </div>
        <button type="submit" className="btn-primary mt-4">
          Adicionar FAQ
        </button>
      </form>

      <div className="mt-6 space-y-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gold/40 bg-cream-light p-6 text-sm text-dark/60">
            Nenhum FAQ cadastrado no banco ainda. Use o botão acima para carregar os padrões.
          </div>
        ) : (
          items.map((item) => (
            <form key={item.id} action={saveFaqItem} className="rounded-2xl border border-gold/20 bg-cream-light p-4">
              <FaqFields item={item} />
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="submit" className="btn-primary">
                  Salvar
                </button>
                <button
                  type="submit"
                  formAction={toggleFaqItem.bind(null, item.id, !item.active)}
                  className="rounded-full border border-gold/35 px-4 py-2 text-sm font-medium text-primary transition hover:bg-gold/10"
                >
                  {item.active ? "Ocultar" : "Exibir"}
                </button>
                <button
                  type="submit"
                  formAction={deleteFaqItem.bind(null, item.id)}
                  className="rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-50"
                >
                  Excluir
                </button>
              </div>
            </form>
          ))
        )}
      </div>
    </section>
  );
}
