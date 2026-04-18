import Link from "next/link";

/**
 * Shell compartilhado para as rotas /login e /cadastro.
 * Sem header da loja — foca o usuário no formulário.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-light p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-md p-6 space-y-6">
        <Link
          href="/"
          className="block text-center font-serif text-3xl text-primary"
        >
          Era Uma Vez Eu
        </Link>
        {children}
      </div>
    </main>
  );
}
