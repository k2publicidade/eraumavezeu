import Link from "next/link";
import { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "🧾" },
  { href: "/admin/producao", label: "Produção", icon: "🎨" },
  { href: "/admin/produtos", label: "Produtos", icon: "📚" },
  { href: "/admin/clientes", label: "Clientes", icon: "👥" },
  { href: "/admin/mensagens", label: "Mensagens", icon: "💬" },
  { href: "/admin/conteudo", label: "Conteúdo", icon: "✏️" },
] as const;

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cream">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-cream-deep/25 bg-primary text-cream lg:flex lg:flex-col">
        <div className="border-b border-white/5 px-6 py-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-gold">Painel Administrativo</p>
          <Link href="/admin" className="mt-2 block font-serif text-2xl font-semibold text-cream">
            Era Uma Vez, <span className="text-gold italic font-normal">Eu</span>
          </Link>
          <p className="mt-2 text-xs text-cream/60 leading-normal">Gestão de vendas, produção e conteúdo.</p>
        </div>

        <nav className="flex-1 space-y-1.5 px-4 py-6" aria-label="Navegação administrativa">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-xs font-semibold uppercase tracking-wider text-cream/80 transition-all duration-200 hover:bg-white/5 hover:text-gold hover:translate-x-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
            >
              <span className="text-sm" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/5 px-6 py-5 text-xs">
          <Link href="/" className="text-cream/60 transition hover:text-gold font-semibold uppercase tracking-wider">
            ← Voltar ao site público
          </Link>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-cream-deep/30 bg-cream/90 backdrop-blur lg:hidden">
        <div className="px-4 py-4">
          <Link href="/admin" className="font-serif text-xl font-semibold text-primary">
            Era Uma Vez, <span className="text-gold font-normal italic">Eu</span>
          </Link>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Navegação administrativa mobile">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-full border border-cream-deep/40 bg-white px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary shadow-sm hover:border-gold"
              >
                {item.icon} {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="lg:pl-72">
        <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10 lg:py-10">{children}</div>
      </main>
    </div>
  );
}
