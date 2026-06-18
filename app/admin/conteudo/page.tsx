import FaqItemForm from "@/components/admin/FaqItemForm";
import SiteSettingsForm from "@/components/admin/SiteSettingsForm";
import { getFaqItems, getSiteSettings } from "@/lib/site-content";

export default async function AdminContentPage() {
  const [settings, faqItems] = await Promise.all([
    getSiteSettings(),
    getFaqItems({ includeInactive: true }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.22em] text-fox">Conteúdo</p>
          <h1 className="mt-1 font-serif text-3xl text-primary md:text-4xl">
            Site e FAQ
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-dark/60">
            Atualize textos institucionais, contatos, redes sociais e perguntas frequentes sem
            alterar código.
          </p>
        </div>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-gold/35 bg-white px-4 py-2 text-sm font-medium text-primary transition hover:bg-gold/10"
        >
          Ver site público →
        </a>
      </div>

      <SiteSettingsForm settings={settings} />
      <FaqItemForm items={faqItems} />
    </div>
  );
}
