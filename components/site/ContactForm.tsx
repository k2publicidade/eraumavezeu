"use client";

import { useState, useTransition } from "react";
import { submitContactMessage } from "@/app/actions/contact";

export default function ContactForm() {
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [phone, setPhone] = useState("");

  // Formata o número de telefone em tempo real: (XX) XXXXX-XXXX
  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, "");
    if (value.length <= 11) {
      let formatted = "";
      if (value.length > 0) formatted += `(${value.slice(0, 2)}`;
      if (value.length > 2) formatted += `) ${value.slice(2, 7)}`;
      if (value.length > 7) formatted += `-${value.slice(7, 11)}`;
      setPhone(formatted);
    }
  }

  function handleSubmit(formData: FormData) {
    setFeedback(null);

    // Adiciona o telefone limpo/formatado manualmente do state
    formData.set("phone", phone);

    startTransition(async () => {
      const res = await submitContactMessage(null, formData);
      if (res.success) {
        setFeedback({
          type: "success",
          message: "Mensagem enviada com sucesso! Recebemos o seu contato e responderemos em até 1 hora no horário comercial.",
        });
        setPhone("");
      } else {
        setFeedback({
          type: "error",
          message: res.error || "Ocorreu um erro ao enviar. Verifique as informações.",
        });
      }
    });
  }

  if (feedback?.type === "success") {
    return (
      <div className="rounded-3xl border border-gold/20 bg-cream-light p-8 text-center shadow-sm animate-fade-up">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-forest/15 text-forest-dark border border-forest/30">
          <svg
            className="h-8 w-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="3"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="mt-6 font-serif text-2xl text-primary font-semibold">Contato Enviado!</h3>
        <p className="mt-4 text-sm text-dark/70 leading-relaxed max-w-sm mx-auto">
          {feedback.message}
        </p>
        <button
          type="button"
          onClick={() => setFeedback(null)}
          className="btn-primary mt-8 px-8 py-3.5"
        >
          Enviar outra mensagem
        </button>
      </div>
    );
  }

  return (
    <form
      action={handleSubmit}
      className="rounded-3xl border border-gold/25 bg-cream-light p-6 shadow-sm space-y-5 animate-fade-up"
    >
      <h2 className="font-serif text-2xl text-primary font-semibold">Envie uma mensagem</h2>
      <p className="text-xs text-dark/60 leading-relaxed">
        Preencha o formulário abaixo e nossa equipe retornará o contato o mais rápido possível.
      </p>

      {feedback?.type === "error" && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-xs text-red-900 leading-relaxed">
          ⚠️ {feedback.message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Nome Completo *</span>
          <input
            name="name"
            type="text"
            required
            placeholder="Seu nome"
            className="input-field mt-1.5"
            disabled={isPending}
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">E-mail *</span>
          <input
            name="email"
            type="email"
            required
            placeholder="seu@email.com"
            className="input-field mt-1.5"
            disabled={isPending}
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">WhatsApp / Celular</span>
          <input
            name="phone"
            type="tel"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="(11) 99999-9999"
            className="input-field mt-1.5"
            disabled={isPending}
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">Assunto *</span>
          <select
            name="subject"
            required
            className="input-field mt-1.5 bg-cream-light text-dark h-[50px] appearance-none"
            disabled={isPending}
            defaultValue=""
          >
            <option value="" disabled>Selecione um assunto</option>
            <option value="Dúvida sobre Pedido">Dúvida sobre Pedido</option>
            <option value="Problema no Pagamento">Problema no Pagamento</option>
            <option value="Personalização do Livro">Personalização do Livro</option>
            <option value="Parcerias e Imprensa">Parcerias e Imprensa</option>
            <option value="Outros Assuntos">Outros Assuntos</option>
          </select>
        </label>
      </div>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">Mensagem *</span>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Escreva sua mensagem aqui..."
          className="input-field mt-1.5 resize-none"
          disabled={isPending}
        />
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="w-full btn-primary py-4 font-bold tracking-wider text-xs uppercase shadow-md flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed hover:shadow-lg transition duration-200"
      >
        {isPending ? (
          <>
            <svg className="animate-spin h-4.5 w-4.5 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Enviando...</span>
          </>
        ) : (
          <span>Enviar Mensagem ✨</span>
        )}
      </button>
    </form>
  );
}
