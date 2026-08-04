"use client";

import { useEffect, useMemo, useState, type ComponentProps } from "react";
import { useRouter } from "next/navigation";
import { Payment, initMercadoPago } from "@mercadopago/sdk-react";
import { CheckCircle2, CreditCard, LoaderCircle, LockKeyhole, QrCode, ShieldCheck } from "lucide-react";
import { PixCopyButton } from "./PixCopyButton";

type PaymentSubmission = Parameters<NonNullable<ComponentProps<typeof Payment>["onSubmit"]>>[0];

type PaymentResponse = {
  paymentId?: string;
  status?: string;
  statusDetail?: string;
  paymentMethod?: string;
  pixQrCode?: string;
  pixQrCodeBase64?: string;
  error?: string;
  code?: string;
};

interface MercadoPagoTransparentCheckoutProps {
  publicKey: string;
  orderId: string;
  amount: number;
  payer: {
    email?: string;
    firstName?: string;
    lastName?: string;
    cpf?: string;
  };
  existingPix?: {
    qrCode: string;
    qrCodeBase64: string;
  } | null;
}

export function MercadoPagoTransparentCheckout({
  publicKey,
  orderId,
  amount,
  payer,
  existingPix,
}: MercadoPagoTransparentCheckoutProps) {
  const router = useRouter();
  const [sdkReady, setSdkReady] = useState(false);
  const [brickReady, setBrickReady] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PaymentResponse | null>(existingPix ? {
    status: "pending",
    paymentMethod: "pix",
    pixQrCode: existingPix.qrCode,
    pixQrCodeBase64: existingPix.qrCodeBase64,
  } : null);

  useEffect(() => {
    initMercadoPago(publicKey, {
      locale: "pt-BR",
      advancedFraudPrevention: true,
      frontEndStack: "react",
      siteId: "MLB",
    });
    setSdkReady(true);
  }, [publicKey]);

  useEffect(() => {
    if (result?.status !== "pending") return;
    const interval = window.setInterval(() => router.refresh(), 10_000);
    return () => window.clearInterval(interval);
  }, [result?.status, router]);

  const initialization = useMemo(() => ({
    amount,
    payer: {
      entityType: "individual" as const,
      email: payer.email,
      firstName: payer.firstName,
      lastName: payer.lastName,
      identification: payer.cpf ? { type: "CPF", number: payer.cpf } : undefined,
    },
  }), [amount, payer]);

  const customization = useMemo(() => ({
    paymentMethods: {
      bankTransfer: "all" as const,
      creditCard: "all" as const,
      debitCard: "all" as const,
      prepaidCard: "all" as const,
      maxInstallments: 12,
    },
    visual: {
      style: {
        theme: "flat" as const,
        customVariables: {
          baseColor: "#172b52",
          textPrimaryColor: "#172b52",
          textSecondaryColor: "#6f675f",
          inputBackgroundColor: "#fffdf9",
          formBackgroundColor: "#fffdf9",
          outlinePrimaryColor: "#dbc27b",
          outlineSecondaryColor: "#eadfbd",
          errorColor: "#b42318",
          successColor: "#2f6b4f",
          buttonTextColor: "#ffffff",
          borderRadiusMedium: "16px",
          borderRadiusLarge: "22px",
          formPadding: "0px",
        },
      },
      hidePaymentButton: false,
      defaultPaymentOption: { bankTransferForm: true },
    },
  }), []);

  async function handleSubmit(submission: PaymentSubmission) {
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/payments/mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, ...submission }),
      });
      const data = await response.json() as PaymentResponse;
      if (response.status === 409 && data.status === "approved") {
        router.refresh();
        return;
      }
      if (!response.ok) throw new Error(data.error || "Não foi possível processar o pagamento.");

      setResult(data);
      if (data.status === "approved") {
        router.refresh();
        return;
      }
      if (data.status === "rejected") {
        setError("Pagamento recusado. Confira os dados ou escolha outra forma de pagamento.");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Não foi possível processar o pagamento.");
      throw caught;
    } finally {
      setSubmitting(false);
    }
  }

  const pixPending = result?.status === "pending" && result.paymentMethod === "pix" && result.pixQrCode;
  const cardPending = result?.status === "pending" && result.paymentMethod !== "pix";

  return (
    <div className="text-left">
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-2xl border border-gold/20 bg-white/60 px-4 py-3">
          <QrCode className="h-5 w-5 text-forest" aria-hidden="true" />
          <span className="text-xs font-semibold text-primary">PIX instantâneo</span>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-gold/20 bg-white/60 px-4 py-3">
          <CreditCard className="h-5 w-5 text-primary" aria-hidden="true" />
          <span className="text-xs font-semibold text-primary">Cartão em até 12x</span>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-gold/20 bg-white/60 px-4 py-3">
          <ShieldCheck className="h-5 w-5 text-fox" aria-hidden="true" />
          <span className="text-xs font-semibold text-primary">Dados protegidos</span>
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-relaxed text-red-700">
          {error}
        </div>
      )}

      {result?.status === "approved" && (
        <div className="rounded-3xl border border-forest/25 bg-forest/10 p-6 text-center text-forest">
          <CheckCircle2 className="mx-auto h-10 w-10" aria-hidden="true" />
          <h3 className="mt-3 font-serif text-2xl">Pagamento confirmado</h3>
          <p className="mt-2 text-sm">Tudo certo. Seu pedido já pode seguir para produção.</p>
        </div>
      )}

      {pixPending && (
        <div className="rounded-3xl border border-gold/30 bg-cream-warm/50 p-5 text-center sm:p-7">
          <span className="badge-gold">PIX gerado</span>
          <h3 className="mt-3 font-serif text-2xl text-primary">Escaneie ou copie o código</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-dark/65">
            Abra o aplicativo do seu banco, escolha pagar com PIX e confirme. A página será atualizada automaticamente.
          </p>
          {result.pixQrCodeBase64 && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`data:image/png;base64,${result.pixQrCodeBase64}`}
              alt="QR Code para pagamento via PIX"
              className="mx-auto mt-5 h-52 w-52 rounded-2xl border border-gold/20 bg-white p-3"
            />
          )}
          <PixCopyButton code={result.pixQrCode!} />
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-dark/55">
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            Aguardando a confirmação do banco
          </div>
        </div>
      )}

      {cardPending && (
        <div className="rounded-3xl border border-gold/25 bg-cream-warm/50 p-6 text-center">
          <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-primary" aria-hidden="true" />
          <h3 className="mt-3 font-semibold text-primary">Pagamento em análise</h3>
          <p className="mt-2 text-sm text-dark/65">Estamos aguardando a confirmação do Mercado Pago.</p>
        </div>
      )}

      {!pixPending && !cardPending && result?.status !== "approved" && sdkReady && (
        <div className="relative rounded-3xl border border-gold/25 bg-[#fffdf9] p-4 sm:p-6">
          {!brickReady && (
            <div className="absolute inset-0 z-10 flex min-h-64 items-center justify-center gap-3 rounded-3xl bg-[#fffdf9] text-sm text-dark/60">
              <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
              Carregando formas de pagamento…
            </div>
          )}
          <div className={brickReady ? "opacity-100" : "min-h-64 pointer-events-none opacity-0"}>
            <Payment
              initialization={initialization}
              customization={customization}
              locale="pt-BR"
              onReady={() => setBrickReady(true)}
              onSubmit={handleSubmit}
              onError={(brickError) => {
                if (brickError.type === "critical") {
                  setError("Não foi possível carregar uma das opções de pagamento. Tente novamente.");
                }
              }}
            />
          </div>
          {submitting && (
            <div className="absolute inset-0 flex items-center justify-center rounded-3xl bg-white/85 backdrop-blur-sm">
              <div className="flex items-center gap-3 text-sm font-semibold text-primary">
                <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
                Processando com segurança…
              </div>
            </div>
          )}
        </div>
      )}

      <p className="mt-5 flex items-center justify-center gap-2 text-center text-xs leading-relaxed text-dark/50">
        <LockKeyhole className="h-4 w-4" aria-hidden="true" />
        Os dados do cartão são criptografados pelo Mercado Pago e não passam pelos nossos servidores.
      </p>
    </div>
  );
}
