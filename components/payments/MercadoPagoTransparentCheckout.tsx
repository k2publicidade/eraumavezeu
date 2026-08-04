"use client";

import { useEffect, useMemo, useState, type ComponentProps } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Payment, StatusScreen, initMercadoPago } from "@mercadopago/sdk-react";
import { CheckCircle2, CreditCard, LoaderCircle, LockKeyhole, QrCode, ShieldCheck } from "lucide-react";
import { PixCopyButton } from "./PixCopyButton";

type PaymentSubmission = Parameters<NonNullable<ComponentProps<typeof Payment>["onSubmit"]>>[0];
const securityScriptProps = {
  src: "https://www.mercadopago.com/v2/security.js",
  strategy: "afterInteractive" as const,
  view: "checkout",
  output: "deviceId",
} as ComponentProps<typeof Script> & { view: string; output: string };

type PaymentResponse = {
  paymentId?: string;
  status?: string;
  statusDetail?: string;
  paymentMethod?: string;
  pixQrCode?: string;
  pixQrCodeBase64?: string;
  threeDsInfo?: {
    externalResourceUrl: string;
    creq: string;
  };
  error?: string;
  code?: string;
};

function mercadoPagoDeviceId() {
  const inputValue = document.getElementById("deviceId") as HTMLInputElement | null;
  const globalValue = (window as typeof window & { MP_DEVICE_SESSION_ID?: unknown }).MP_DEVICE_SESSION_ID;
  const value = inputValue?.value || (typeof globalValue === "string" ? globalValue : "");
  return /^[A-Za-z0-9._:-]{8,256}$/.test(value) ? value : undefined;
}

function cardRejectionMessage(statusDetail?: string) {
  const messages: Record<string, string> = {
    cc_rejected_bad_filled_card_number: "Confira o número do cartão e tente novamente.",
    cc_rejected_bad_filled_date: "Confira a validade do cartão e tente novamente.",
    cc_rejected_bad_filled_security_code: "Confira o código de segurança e tente novamente.",
    cc_rejected_bad_filled_other: "Confira os dados do titular e tente novamente.",
    cc_rejected_insufficient_amount: "O cartão não possui limite disponível para esta compra.",
    cc_rejected_call_for_authorize: "Autorize a compra com o banco emissor do cartão e tente novamente.",
    cc_rejected_card_disabled: "O cartão está desabilitado. Entre em contato com o banco emissor.",
    cc_rejected_duplicated_payment: "Uma tentativa igual já foi processada. Aguarde alguns instantes antes de tentar novamente.",
    cc_rejected_high_risk: "O Mercado Pago não autorizou esta tentativa por segurança. Tente outro cartão ou use PIX.",
    cc_rejected_max_attempts: "O limite de tentativas com este cartão foi atingido. Use outro cartão ou PIX.",
  };
  return statusDetail && messages[statusDetail]
    ? messages[statusDetail]
    : "Pagamento recusado pelo banco ou pelo Mercado Pago. Confira os dados, tente outro cartão ou use PIX.";
}

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
      const deviceId = mercadoPagoDeviceId();
      const response = await fetch("/api/payments/mercadopago", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, ...submission, deviceId }),
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
        setError(cardRejectionMessage(data.statusDetail));
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
  const cardChallenge = cardPending && result?.statusDetail === "pending_challenge" &&
    result.paymentId && result.threeDsInfo;

  return (
    <div className="text-left">
      <Script {...securityScriptProps} />
      <input id="deviceId" type="hidden" aria-hidden="true" />
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

      {cardChallenge && (
        <div className="rounded-3xl border border-gold/25 bg-[#fffdf9] p-3 sm:p-5">
          <StatusScreen
            initialization={{
              paymentId: result.paymentId!,
              additionalInfo: {
                externalResourceURL: result.threeDsInfo!.externalResourceUrl,
                creq: result.threeDsInfo!.creq,
              },
            }}
            customization={{
              visual: {
                hideStatusDetails: false,
                hideTransactionDate: true,
              },
            }}
            locale="pt-BR"
            onError={() => setError("Não foi possível abrir a confirmação de segurança do banco. Tente novamente.")}
          />
        </div>
      )}

      {cardPending && !cardChallenge && (
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
                setError(brickError.type === "critical"
                  ? "Não foi possível carregar uma das opções de pagamento. Atualize a página e tente novamente."
                  : "Confira os dados do cartão destacados no formulário e tente novamente.");
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
