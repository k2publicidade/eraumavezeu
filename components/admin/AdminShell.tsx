import Link from "next/link";
import { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/pedidos", label: "Pedidos", icon: "🧾" },
  { href: "/admin/producao", label: "Produção", icon: "🎨" },
  { href: "/admin/produtos", label: "Produtos", icon: "📚" },
  { href: "/admin/clientes", label: "Clientes", icon: "👥" },
  { href: "/admin/conteudo", label: "Conteúdo", icon: "✏️" },
] as const;

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cream-warm">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-gold/25 bg-primary text-white lg:flex lg:flex-col">
        <div className="border-b border-white/10 px-6 py-6">
          <p className="text-xs uppercase tracking-[0.28em] text-gold-warm/80">Painel</p>
          <Link href="/admin" className="mt-2 block font-serif text-2xl text-gold-warm">
            Era Uma Vez Eu
          </Link>
          <p className="mt-2 text-sm text-white/65">Vendas, produção e catálogo</p>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-5" aria-label="Navegação administrativa">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-white/82 transition hover:bg-white/10 hover:text-gold-warm focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold"
            >
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-white/10 px-6 py-5 text-sm">
          <Link href="/" className="text-white/75 transition hover:text-gold-warm">
            Ver site público →
          </Link>
        </div>
      </aside>

      <header className="sticky top-0 z-20 border-b border-gold/25 bg-cream-light/95 backdrop-blur lg:hidden">
        <div className="px-4 py-4">
          <Link href="/admin" className="font-serif text-xl text-primary">
            Era Uma Vez Eu — Admin
          </Link>
          <nav className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Navegação administrativa mobile">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="shrink-0 rounded-full border border-gold/35 bg-white px-3 py-1.5 text-xs text-primary"
              >
                {item.icon} {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="lg:pl-72">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
