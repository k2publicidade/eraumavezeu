"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { createOrder } from "@/app/actions/create-order";
import { lookupCep } from "@/lib/cep";
import { useCartStore } from "@/lib/cart/store";
import { calculateCouponDiscount } from "@/lib/cart/coupon";
import { formatBRL } from "@/lib/format";
import { checkoutSchema } from "@/lib/validators/order";
import { calculateShippingOptions } from "@/lib/shipping";
import { validateCoupon } from "@/app/actions/coupons";
import ProductCustomizationForms, {
  buildCustomizationUnits,
  type CustomizationUnit,
} from "@/components/checkout/ProductCustomizationForms";
import { productCustomizationSchema, toCustomizationPayload } from "@/lib/product-customization";

// buyer + address + paymentGateway vêm do form; items entram programaticamente do carrinho
const formSchema = checkoutSchema.pick({ buyer: true, address: true, paymentGateway: true });
type FormValues = z.output<typeof formSchema>;

function useHydrated() {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

export default function CheckoutView({
  whatsappUpdatesEnabled = false,
}: {
  whatsappUpdatesEnabled?: boolean;
}) {
  const allowSimulatedGateway = process.env.NODE_ENV !== "production";
  const hydrated = useHydrated();
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const getTotals = useCartStore((s) => s.getTotals);
  const appliedCoupon = useCartStore((s) => s.appliedCoupon);
  const setAppliedCoupon = useCartStore((s) => s.setAppliedCoupon);
  const totals = hydrated ? getTotals() : { subtotal: 0, discount: 0, total: 0, discountedUnits: 0 };

  const [serverError, setServerError] = useState<string | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"customization" | "details">("customization");
  const [customizationUnits, setCustomizationUnits] = useState<CustomizationUnit[]>([]);
  const [showCustomizationErrors, setShowCustomizationErrors] = useState(false);
  const customizationSignature = useRef("");
  const [cepLoading, setCepLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<string>("PAC");
  const [selectedCost, setSelectedCost] = useState<number>(0);
  const [shippingOptions, setShippingOptions] = useState<{ method: string; cost: number; days: number }[]>([]);

  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState<string | null>(null);
  const couponBase = Math.max(0, totals.subtotal - totals.discount);
  const couponDiscountAmount = calculateCouponDiscount(appliedCoupon, couponBase);

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    setCouponSuccess(null);

    const res = await validateCoupon(couponCodeInput, couponBase);
    setCouponLoading(false);

    if (res.ok) {
      setAppliedCoupon({ id: res.coupon.id, code: res.coupon.code, type: res.coupon.type, value: res.coupon.value });
      setCouponSuccess(`Cupom ${res.coupon.code} aplicado com sucesso!`);
    } else {
      setCouponError(res.error);
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput("");
    setCouponSuccess(null);
    setCouponError(null);
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      buyer: { name: "", email: "", cpf: "", phone: "", whatsappOptIn: false },
      address: {
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        district: "",
        city: "",
        state: "",
      },
      paymentGateway: "MERCADOPAGO",
    },
  });

  const watchedState = watch("address.state");

  useEffect(() => {
    if (!hydrated) return;
    const signature = items.map((item) => `${item.id}:${item.quantity}`).join("|");
    if (signature !== customizationSignature.current) {
      customizationSignature.current = signature;
      setCustomizationUnits(buildCustomizationUnits(items));
      setCheckoutStep("customization");
    }
  }, [hydrated, items]);

  function continueToDetails() {
    setShowCustomizationErrors(true);
    const allValid = customizationUnits.length > 0 && customizationUnits.every((unit) =>
      productCustomizationSchema.safeParse(toCustomizationPayload(unit.draft)).success,
    );
    if (!allValid) {
      requestAnimationFrame(() => document.querySelector("[role='alert']")?.scrollIntoView({ behavior: "smooth", block: "center" }));
      return;
    }
    setCheckoutStep("details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    if (watchedState && watchedState.length === 2) {
      const options = calculateShippingOptions(watchedState);
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
      const options = calculateShippingOptions(found.state);
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
        customizations: customizationUnits
          .filter((unit) => unit.itemId === it.id)
          .sort((a, b) => a.unitIndex - b.unitIndex)
          .map((unit) => toCustomizationPayload(unit.draft)),
      })),
      shippingMethod: selectedMethod,
      shippingCost: selectedCost,
      paymentGateway: data.paymentGateway,
      couponCode: appliedCoupon?.code || undefined,
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
        <p className="mt-3 text-dark/65">Adicione produtos ao carrinho antes de finalizar.</p>
        <Link href="/produtos" className="btn-primary-lg mt-6 inline-flex">
          Ver produtos
        </Link>
      </div>
    );
  }

  if (checkoutStep === "customization") {
    return (
      <div className="mx-auto max-w-4xl">
        <ProductCustomizationForms
          units={customizationUnits}
          onChange={setCustomizationUnits}
          showErrors={showCustomizationErrors}
        />
        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-gold/25 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/carrinho" className="btn-ghost justify-center">Voltar ao carrinho</Link>
          <button type="button" onClick={continueToDetails} className="btn-primary-lg justify-center">
            Continuar para entrega e pagamento
          </button>
        </div>
        <p className="mt-4 text-center text-xs leading-relaxed text-dark/55">
          Seus dados ficam vinculados a este pedido e são usados somente para produzir os itens personalizados.
        </p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-8">
      <section className="card-premium p-6 md:p-8">
        <p className="text-sm font-semibold text-forest">Etapa 2 de 2</p>
        <h1 className="mt-4 font-serif text-3xl md:text-4xl text-primary">
          Dados para finalizar o pedido
        </h1>
        <p className="mt-3 text-dark/70 leading-relaxed">
          Confirme seus dados e o endereço de entrega. Ao registrar o pedido,
          você segue para o pagamento seguro e recebe as atualizações por e-mail
          {whatsappUpdatesEnabled ? " e, se desejar, pelo WhatsApp" : ""}.
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
                aria-describedby={errors.buyer?.name ? "buyer-name-error" : undefined}
              />
              {errors.buyer?.name && (
                <span id="buyer-name-error" className="mt-1 block text-xs text-red-700">Informe seu nome completo.</span>
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
                aria-describedby={errors.buyer?.email ? "buyer-email-error" : undefined}
              />
              {errors.buyer?.email && (
                <span id="buyer-email-error" className="mt-1 block text-xs text-red-700">E-mail inválido.</span>
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
                aria-describedby={errors.buyer?.phone ? "buyer-phone-error" : undefined}
              />
              {errors.buyer?.phone && (
                <span id="buyer-phone-error" className="mt-1 block text-xs text-red-700">
                  Telefone inválido — use DDD + número.
                </span>
              )}
            </label>
            {whatsappUpdatesEnabled && (
              <label className="flex min-h-11 items-center gap-3 self-end pb-1">
                <input
                  {...register("buyer.whatsappOptIn")}
                  type="checkbox"
                  className="h-6 w-6 accent-primary"
                />
                <span className="text-sm text-dark/70">
                  Quero receber atualizações do pedido pelo WhatsApp
                </span>
              </label>
            )}
          </fieldset>

          <fieldset className="mt-8 grid md:grid-cols-2 gap-4" disabled={isSubmitting}>
            <legend className="font-serif text-xl text-primary md:col-span-2">
              Endereço de entrega
            </legend>
            <label className="block">
              <span className="text-sm font-medium text-primary">CPF do comprador</span>
              <input
                {...register("buyer.cpf")}
                className="input-field mt-1"
                inputMode="numeric"
                autoComplete="off"
                placeholder="000.000.000-00"
                maxLength={14}
                aria-invalid={!!errors.buyer?.cpf}
                aria-describedby={errors.buyer?.cpf ? "buyer-cpf-error" : "buyer-cpf-help"}
              />
              {errors.buyer?.cpf ? (
                <span id="buyer-cpf-error" className="mt-1 block text-xs text-red-700">
                  Informe um CPF válido.
                </span>
              ) : (
                <span id="buyer-cpf-help" className="mt-1 block text-xs text-dark/50">
                  Necessário para emissão e identificação do envio.
                </span>
              )}
            </label>
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
                aria-describedby={errors.address?.zipCode ? "address-zipcode-error" : undefined}
              />
              {errors.address?.zipCode && (
                <span id="address-zipcode-error" className="mt-1 block text-xs text-red-700">CEP inválido.</span>
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
                aria-describedby={errors.address?.street ? "address-street-error" : undefined}
              />
              {errors.address?.street && (
                <span id="address-street-error" className="mt-1 block text-xs text-red-700">Informe a rua.</span>
              )}
            </label>
            <label className="block">
              <span className="text-sm font-medium text-primary">Número</span>
              <input
                {...register("address.number")}
                className="input-field mt-1"
                placeholder="123"
                aria-invalid={!!errors.address?.number}
                aria-describedby={errors.address?.number ? "address-number-error" : undefined}
              />
              {errors.address?.number && (
                <span id="address-number-error" className="mt-1 block text-xs text-red-700">Informe o número.</span>
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
                aria-describedby={errors.address?.district ? "address-district-error" : undefined}
              />
              {errors.address?.district && (
                <span id="address-district-error" className="mt-1 block text-xs text-red-700">Informe o bairro.</span>
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
                aria-describedby={errors.address?.city ? "address-city-error" : undefined}
              />
              {errors.address?.city && (
                <span id="address-city-error" className="mt-1 block text-xs text-red-700">Informe a cidade.</span>
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
                aria-describedby={errors.address?.state ? "address-state-error" : undefined}
              />
              {errors.address?.state && (
                <span id="address-state-error" className="mt-1 block text-xs text-red-700">UF inválida — ex.: SP.</span>
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

          <fieldset className="mt-8 border-t border-gold/15 pt-8" disabled={isSubmitting}>
            <legend className="font-serif text-xl text-primary mb-4">
              Forma de Pagamento
            </legend>
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Mercado Pago */}
              <label
                className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                  watch("paymentGateway") === "MERCADOPAGO"
                    ? "border-primary bg-white shadow-md shadow-gold/10"
                    : "border-gold/20 bg-white/40 hover:border-gold/45"
                }`}
              >
                <input
                  type="radio"
                  {...register("paymentGateway")}
                  value="MERCADOPAGO"
                  className="h-4 w-4 mt-1 accent-primary"
                />
                <div>
                  <span className="block text-sm font-semibold text-primary">Mercado Pago</span>
                  <span className="block text-xs text-dark/65 mt-0.5">
                    PIX, Cartão (até 12x) ou Boleto. Confirmação imediata para PIX/Cartão.
                  </span>
                </div>
              </label>

              {/* Gateway simulado aparece apenas em desenvolvimento. */}
              {allowSimulatedGateway && <label
                className={`flex items-start gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                  watch("paymentGateway") === "SIMULADO"
                    ? "border-primary bg-white shadow-md shadow-gold/10"
                    : "border-gold/20 bg-white/40 hover:border-gold/45"
                }`}
              >
                <input
                  type="radio"
                  {...register("paymentGateway")}
                  value="SIMULADO"
                  className="h-4 w-4 mt-1 accent-primary"
                />
                <div>
                  <span className="block text-sm font-semibold text-primary">Ambiente de Testes</span>
                  <span className="block text-xs text-dark/65 mt-0.5">
                    Simule a aprovação ou cancelamento do pagamento instantaneamente.
                  </span>
                </div>
              </label>}
            </div>
          </fieldset>

          {serverError && (
            <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
              {serverError}
            </p>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => {
              setCheckoutStep("customization");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="btn-ghost flex-1 justify-center"
            disabled={isSubmitting}
          >
            Revisar personalização
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary-lg flex-1 justify-center disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Registrando pedido…" : "Confirmar pedido →"}
          </button>
          </div>
          <p className="mt-3 text-center text-xs text-dark/55">
            {watch("paymentGateway") === "SIMULADO"
              ? "Ambiente de Testes ativo. Você será redirecionado para a tela de simulação de pagamento após confirmar."
              : "Pagamento seguro via Mercado Pago (PIX, Cartão ou Boleto). Você será redirecionado para a página de pagamento após confirmar o pedido."}
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
                <p className="text-xs text-dark/65">Qtd. {item.quantity}</p>
              </div>
              <p className="font-semibold text-dark">{formatBRL(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        {/* Coupon Input Box */}
        <div className="mt-5 border-t border-gold/15 pt-5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-dark/65 mb-2">
            Possui um cupom de desconto?
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={appliedCoupon ? appliedCoupon.code : couponCodeInput}
              onChange={(e) => setCouponCodeInput(e.target.value)}
              disabled={couponLoading || !!appliedCoupon}
              placeholder="CÓDIGO"
              className="input-field py-2 text-sm uppercase flex-1"
            />
            {appliedCoupon ? (
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 transition-colors"
              >
                Remover
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponCodeInput}
                className="btn-primary py-2 px-4 text-xs font-bold disabled:opacity-50"
              >
                {couponLoading ? "..." : "Aplicar"}
              </button>
            )}
          </div>
          {couponError && (
            <p className="mt-2 text-xs font-medium text-red-600">{couponError}</p>
          )}
          {couponSuccess && (
            <p className="mt-2 text-xs font-medium text-forest">{couponSuccess}</p>
          )}
        </div>

        <dl className="mt-5 space-y-2 text-sm border-t border-gold/15 pt-5">
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
          {appliedCoupon && (
            <div className="flex justify-between text-forest font-medium">
              <dt>Cupom ({appliedCoupon.code})</dt>
              <dd>- {formatBRL(couponDiscountAmount)}</dd>
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
            <dd className="font-serif text-fox font-bold">
              {formatBRL(
                Math.max(0, totals.subtotal - totals.discount - couponDiscountAmount) +
                  selectedCost
              )}
            </dd>
          </div>
        </dl>

        <Link href="/carrinho" className="mt-6 block text-center text-sm text-dark/60 hover:text-primary">
          Voltar ao carrinho
        </Link>
      </aside>
    </div>
  );
}
