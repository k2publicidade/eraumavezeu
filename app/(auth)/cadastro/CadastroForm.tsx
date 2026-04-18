"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createAccount } from "./actions";

export function CadastroForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await createAccount(fd);
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-2xl text-center">Criar conta</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block">
          <span className="text-sm text-text-muted">Nome</span>
          <input
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={80}
            autoComplete="name"
            className="mt-1 w-full border rounded-md px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm text-text-muted">E-mail</span>
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full border rounded-md px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm text-text-muted">Senha</span>
          <input
            name="password"
            type="password"
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            className="mt-1 w-full border rounded-md px-3 py-2"
          />
        </label>
        <label className="block">
          <span className="text-sm text-text-muted">Confirmar senha</span>
          <input
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            maxLength={72}
            autoComplete="new-password"
            className="mt-1 w-full border rounded-md px-3 py-2"
          />
        </label>
        {error && (
          <p className="text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-primary text-white rounded-md py-2 disabled:opacity-60 hover:bg-primary-dark transition-colors"
        >
          {isPending ? "Criando..." : "Criar conta"}
        </button>
      </form>
      <p className="text-sm text-center text-text-muted">
        Já tem conta?{" "}
        <Link href="/login" className="text-primary underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
