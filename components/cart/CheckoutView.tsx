"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { createOrder } from "@/app/actions/create-order";
import { lookupCep } from "@/lib/cep";
import { useCartStore } from "@/lib/cart/store";
import { formatBRL } from "@/lib/format";
import { checkoutSchema } from "@/lib/validators/order";

// buyer + address vêm do form; items entram programaticamente do carrinho
const formSchema = checkoutSchema.pick({ buyer: true, address: true });
type FormValues = z.output<typeof formSchema>;

function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

export default function CheckoutView() {
  const hydrated = useHydrated();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const getTotals = useCartStore((s) => s.getTotals);
  const totals = hydrated ? getTotals() : { subtotal: 0, discount: 0, total: 0, discountedUnits: 0 };

  const [serverError, setServerError] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("PAC");
  const [selectedCost, setSelectedCost] = useState<number>(0);
  const [shippingOptions, setShippingOptions] = useState<{ method: string; cost: number; days: number }[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      buyer: { name: "", email: "", phone: "", whatsappOptIn: true },
      address: {
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        district: "",
        city: "",
        state: "",
      },
    },
  });

  const watchedState = watch("address.state");

  function calculateShipping(state: string) {
    const uf = state.toUpperCase().trim();
    if (!uf) return [];
    if (["SP", "RJ", "ES", "MG"].includes(uf)) {
      return [
        { method: "PAC", cost: 0, days: 5 },
        { method: "SEDEX", cost: 14.9, days: 2 },
      ];
    }
    if (["PR", "SC", "RS", "DF", "GO", "MS", "MT"].includes(uf)) {
      return [
        { method: "PAC", cost: 9.9, days: 7 },
        { method: "SEDEX", cost: 22.9, days: 3 },
      ];
    }
    return [
      { method: "PAC", cost: 14.9, days: 10 },
      { method: "SEDEX", cost: 29.9, days: 4 },
    ];
  }

  useEffect(() => {
    if (watchedState && watchedState.length === 2) {
      const options = calculateShipping(watchedState);
      setShippingOptions(options);
      const exists = options.find((o) => o.method === selectedMethod);
      if (!exists && options.length > 0) {
        setSelectedMethod(options[0].method);
        setSelectedCost(options[0].cost);
      } else if (exists) {
        setSelectedCost(exists.cost);
      }
    } else {
      setShippingOptions([]);
      setSelectedCost(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedState]);

  async function handleCepBlur(e: React.FocusEvent<HTMLInputElement>) {
    const cep = e.target.value.replace(/\D/g, "");
    if (cep.length !== 8) return;
    setCepLoading(true);
    const found = await lookupCep(cep);
    setCepLoading(false);
    if (!found) return;
    // só preenche o que veio — CEPs gerais não trazem logradouro
    if (found.street) setValue("address.street", found.street);
    if (found.district) setValue("address.district", found.district);
    if (found.city) setValue("address.city", found.city);
    if (found.state) {
      setValue("address.state", found.state);
      const options = calculateShipping(found.state);
      setShippingOptions(options);
      if (options.length > 0) {
        setSelectedMethod(options[0].method);
        setSelectedCost(options[0].cost);
      }
    }
  }

  const onSubmit = handleSubmit(async (data) => {
    setServerError(null);
    const res = await createOrder({
      buyer: data.buyer,
      address: data.address,
      items: items.map((it) => ({
        slug: it.slug,
        quantity: it.quantity,
        customization: it.customization,
      })),
      shippingMethod: selectedMethod,
      shippingCost: selectedCost,
    });
    if (res.ok) {
      clear();
      if (res.paymentUrl) {
        window.location.href = res.paymentUrl;
      } else {
        router.push(`/pedido/${res.orderId}`);
      }
    } else {
      setServerError(res.error);
    }
  });

  if (!hydrated) {
    return <div className="text-center py-20 text-dark/60">Carregando checkout…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="card-premium p-10 text-center max-w-xl mx-auto">
        <h1 className="font-serif text-3xl text-primary">Carrinho vazio</h1>
        <p className="mt-3 text-dark/65">Personalize um livro antes de finalizar.</p>
        <Link href="/personalizar" className="btn-primary-lg mt-6 inline-flex">
          Criar meu livro
        </Link>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8">
      <section className="card-premium p-6 md:p-8">
        <p className="badge-gold">Quase lá!</p>
        <h1 className="mt-4 font-serif text-3xl md:text-4xl text-primary">
          Dados para finalizar o pedido
        </h1>
        <p className="mt-3 text-dark/70 leading-relaxed">
          Confirme seus dados e o endereço de entrega. Depois do registro do pedido,
          nossa equipe envia o link de pagamento e acompanha tudo com você pelo WhatsApp.
        </p>

        <form onSubmit={onSubmit} noValidate>
          <fieldset className="mt-8 grid md:grid-cols-2 gap-4" disabled={isSubmitting}>
            <legend className="sr-only">Dados do comprador</legend>
            <label className="block">
              <span className="text-sm font-medium text-primary">Nome completo</span>
              <input
                {...register("buyer.name")}
                className="input-field mt-1"
                autoComplete="name"
                placeholder="Ex.: Mariana Souza"
                aria-invalid={!!errors.buyer?.name}
              />
              {errors.buyer?.name && (
                <span className="mt-1 block text-xs text-red-600">Informe seu nome completo.</span>
              )}
            </label>
            <label className="block">
              <span className="text-sm font-medium text-primary">E-mail</span>
              <input
                {...register("buyer.email")}
                className="input-field mt-1"
                type="email"
                autoComplete="email"
                placeholder="voce@email.com"
                aria-invalid={!!errors.buyer?.email}
              />
              {errors.buyer?.email && (
                <span className="mt-1 block text-xs text-red-600">E-mail inválido.</span>
              )}
            </label>
            <label className="block">
              <span className="text-sm font-medium text-primary">WhatsApp / Telefone</span>
              <input
                {...register("buyer.phone")}
                className="input-field mt-1"
                inputMode="tel"
                autoComplete="tel-national"
                placeholder="(11) 99999-9999"
                aria-invalid={!!errors.buyer?.phone}
              />
              {errors.buyer?.phone && (
                <span className="mt-1 block text-xs text-red-600">
                  Telefone inválido — use DDD + número.
                </span>
              )}
            </label>
            <label className="flex items-end gap-2 pb-2">
              <input
                {...register("buyer.whatsappOptIn")}
                type="checkbox"
                className="h-4 w-4 accent-primary"
              />
              <span className="text-sm text-dark/70">
                Quero receber atualizações do pedido pelo WhatsApp
              </span>
            </label>
          </fieldset>

          <fieldset className="mt-8 grid md:grid-cols-2 gap-4" disabled={isSubmitting}>
            <legend className="font-serif text-xl text-primary md:col-span-2">
              Endereço de entrega
            </legend>
            <label className="block">
              <span className="text-sm font-medium text-primary">
                CEP{cepLoading && <span className="ml-2 text-xs text-dark/50">buscando…</span>}
              </span>
              <input
                {...register("address.zipCode")}
                className="input-field mt-1"
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="00000-000"
                onBlur={handleCepBlur}
                aria-invalid={!!errors.address?.zipCode}
              />
              {errors.address?.zipCode && (
                <span className="mt-1 block text-xs text-red-600">CEP inválido.</span>
              )}
            </label>
            <label className="block">
              <span className="text-sm font-medium text-primary">Rua / Avenida</span>
              <input
                {...register("address.street")}
                className="input-field mt-1"
                autoComplete="address-line1"
                placeholder="Rua das Histórias"
                aria-invalid={!!errors.address?.street}
              />
              {errors.address?.street && (
                <span className="mt-1 block text-xs text-red-600">Informe a rua.</span>
              )}
            </label>
            <label className="block">
              <span className="text-sm font-medium text-primary">Número</span>
              <input
                {...register("address.number")}
                className="input-field mt-1"
                placeholder="123"
                aria-invalid={!!errors.address?.number}
              />
              {errors.address?.number && (
                <span className="mt-1 block text-xs text-red-600">Informe o número.</span>
              )}
            </label>
            <label className="block">
              <span className="text-sm font-medium text-primary">Complemento (opcional)</span>
              <input
                {...register("address.complement")}
                className="input-field mt-1"
                placeholder="Apto 42"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-primary">Bairro</span>
              <input
                {...register("address.district")}
                className="input-field mt-1"
                placeholder="Jardim Encantado"
                aria-invalid={!!errors.address?.district}
              />
              {errors.address?.district && (
                <span className="mt-1 block text-xs text-red-600">Informe o bairro.</span>
              )}
            </label>
            <label className="block">
              <span className="text-sm font-medium text-primary">Cidade</span>
              <input
                {...register("address.city")}
                className="input-field mt-1"
                autoComplete="address-level2"
                placeholder="São Paulo"
                aria-invalid={!!errors.address?.city}
              />
              {errors.address?.city && (
                <span className="mt-1 block text-xs text-red-600">Informe a cidade.</span>
              )}
            </label>
            <label className="block">
              <span className="text-sm font-medium text-primary">UF</span>
              <input
                {...register("address.state")}
                className="input-field mt-1 uppercase"
                maxLength={2}
                placeholder="SP"
                aria-invalid={!!errors.address?.state}
              />
              {errors.address?.state && (
                <span className="mt-1 block text-xs text-red-600">UF inválida — ex.: SP.</span>
              )}
            </label>
          </fieldset>

          {shippingOptions.length > 0 && (
            <fieldset className="mt-8 border-t border-gold/15 pt-8" disabled={isSubmitting}>
              <legend className="font-serif text-xl text-primary mb-4">
                Opção de Envio
              </legend>
              <div className="grid sm:grid-cols-2 gap-4">
                {shippingOptions.map((opt) => (
                  <label
                    key={opt.method}
                    className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                      selectedMethod === opt.method
                        ? "border-primary bg-white shadow-md shadow-gold/10"
                        : "border-gold/20 bg-white/40 hover:border-gold/45"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        value={opt.method}
                        checked={selectedMethod === opt.method}
                        onChange={() => {
                          setSelectedMethod(opt.method);
                          setSelectedCost(opt.cost);
                        }}
                        className="h-4 w-4 accent-primary"
                      />
                      <div>
                        <span className="block text-sm font-semibold text-primary">{opt.method}</span>
                        <span className="block text-xs text-dark/65">Chega em até {opt.days} dias úteis</span>
                      </div>
                    </div>
                    <span className="font-semibold text-sm text-dark">
                      {opt.cost === 0 ? "Grátis" : formatBRL(opt.cost)}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}

          {serverError && (
            <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary-lg mt-8 w-full justify-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Registrando pedido…" : "Confirmar pedido →"}
          </button>
          <p className="mt-3 text-center text-xs text-dark/55">
            Pagamento seguro via Mercado Pago (PIX, Cartão ou Boleto). Você será
            redirecionado para a página de pagamento após confirmar o pedido.
          </p>
        </form>
      </section>

      <aside className="card-premium p-6 h-fit sticky top-24">
        <h2 className="font-serif text-2xl text-primary">Resumo do pedido</h2>
        <div className="mt-5 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex gap-3 justify-between border-b border-gold/20 pb-3">
              <div>
                <p className="font-medium text-primary">{item.name}</p>
                <p className="text-xs text-dark/60">Qtd. {item.quantity}</p>
              </div>
              <p className="font-semibold text-dark">{formatBRL(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <dl className="mt-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-dark/65">Subtotal</dt>
            <dd>{formatBRL(totals.subtotal)}</dd>
          </div>
          {totals.discount > 0 && (
            <div className="flex justify-between text-forest">
              <dt>Desconto combo</dt>
              <dd>- {formatBRL(totals.discount)}</dd>
            </div>
          )}
          {shippingOptions.length > 0 && (
            <div className="flex justify-between text-primary">
              <dt>Frete ({selectedMethod})</dt>
              <dd>{selectedCost === 0 ? "Grátis" : formatBRL(selectedCost)}</dd>
            </div>
          )}
          <div className="flex justify-between border-t border-gold/25 pt-3 text-lg">
            <dt className="font-semibold text-primary">Total</dt>
            <dd className="font-serif text-fox font-bold">{formatBRL(totals.total + selectedCost)}</dd>
          </div>
        </dl>

        <Link href="/carrinho" className="mt-6 block text-center text-sm text-dark/60 hover:text-primary">
          Voltar ao carrinho
        </Link>
      </aside>
    </div>
  );
}
