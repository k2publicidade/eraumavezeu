import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guards";

export const metadata: Metadata = {
  title: "Admin — Era Uma Vez Eu",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // middleware já bloqueia /admin para não-admins; defesa em profundidade
  await requireAdmin();

  return (
    <div className="min-h-screen bg-cream-warm">
      <header className="bg-primary text-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/admin" className="font-serif text-xl">
            Era Uma Vez Eu — Admin
          </Link>
          <nav className="flex gap-6 text-sm">
            <Link href="/admin" className="hover:text-gold transition-colors">
              Pedidos
            </Link>
            <Link href="/" className="hover:text-gold transition-colors">
              Ver site →
            </Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
