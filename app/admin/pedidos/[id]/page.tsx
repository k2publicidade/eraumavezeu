import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CopyButton from "@/components/admin/CopyButton";
import OrderAdminActions from "@/components/admin/OrderAdminActions";
import { db } from "@/lib/db";
import { formatBRL } from "@/lib/format";
import { orderCodeOf } from "@/lib/orders/build-order";
import { statusLabelOf } from "@/lib/orders/status";
import { getSignedPhotoUrls } from "@/lib/uploadthing-server";
import {
  AGE_RANGES,
  ART_STYLES,
  COLORS,
  GENRES,
  THEMES,
} from "@/lib/wizard/types";

export const dynamic = "force-dynamic";

function catalogLabel(
  list: ReadonlyArray<{ slug: string; label: string }>,
  slug: string,
): string {
  return list.find((x) => x.slug === slug)?.label ?? slug;
}

function formatDateTime(d: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const order = await db.order
    .findUnique({
      where: { id: params.id },
      include: {
        items: { include: { product: true } },
        shippingAddress: true,
        customization: true,
        statusHistory: { orderBy: { changedAt: "desc" } },
        user: { select: { email: true } },
      },
    })
    .catch(() => null);

  if (!order) notFound();

  const custom = order.customization;
  const photos = custom ? await getSignedPhotoUrls(custom.photoKeys) : [];

  return (
    <div>
      <Link href="/admin" className="text-sm text-dark/60 hover:text-primary">
        ← Voltar para pedidos
      </Link>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-3xl text-primary">
          Pedido #{orderCodeOf(order.id)}
        </h1>
        <span className="rounded-full border border-gold/30 bg-cream px-3 py-1 text-sm text-primary">
          {statusLabelOf(order.status)}
        </span>
        <span className="text-sm text-dark/55">{formatDateTime(order.createdAt)}</span>
      </div>

      <div className="mt-6 grid lg:grid-cols-[1.2fr_0.8fr] gap-6 items-start">
        <div className="space-y-6">
          {/* Cliente + entrega */}
          <section className="rounded-2xl border border-gold/25 bg-cream-light p-6">
            <h2 className="font-serif text-xl text-primary">Cliente</h2>
            <dl className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div>
                <dt className="text-dark/55">Nome</dt>
                <dd className="text-dark">{order.guestName}</dd>
              </div>
              <div>
                <dt className="text-dark/55">E-mail</dt>
                <dd className="text-dark">{order.guestEmail}</dd>
              </div>
              <div>
                <dt className="text-dark/55">Telefone</dt>
                <dd className="text-dark">
                  {order.guestPhone}
                  {order.whatsappOptIn && (
                    <span className="ml-2 text-xs text-forest">WhatsApp ✓</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-dark/55">Conta</dt>
                <dd className="text-dark">{order.user?.email ?? "Convidado"}</dd>
              </div>
            </dl>
            {order.shippingAddress && (
              <p className="mt-4 border-t border-gold/20 pt-3 text-sm text-dark/75">
                {order.shippingAddress.street}, {order.shippingAddress.number}
                {order.shippingAddress.complement
                  ? ` — ${order.shippingAddress.complement}`
                  : ""}{" "}
                · {order.shippingAddress.district} · {order.shippingAddress.city}/
                {order.shippingAddress.state} · CEP {order.shippingAddress.zipCode}
              </p>
            )}
          </section>

          {/* Itens */}
          <section className="rounded-2xl border border-gold/25 bg-cream-light p-6">
            <h2 className="font-serif text-xl text-primary">Itens</h2>
            <div className="mt-3 space-y-2 text-sm">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between gap-3 border-b border-gold/15 pb-2 last:border-0">
                  <span className="text-dark">
                    {item.quantity}x {item.product.name}
                  </span>
                  <span className="text-dark">
                    {formatBRL(Number(item.price) * item.quantity)}
                    {Number(item.discount) > 0 && (
                      <span className="ml-2 text-xs text-forest">
                        (- {formatBRL(Number(item.discount))})
                      </span>
                    )}
                  </span>
                </div>
              ))}
              <div className="flex justify-between pt-2 font-medium">
                <span className="text-primary">Total</span>
                <span className="text-fox">{formatBRL(Number(order.total))}</span>
              </div>
            </div>
          </section>

          {/* Personalização — coração da produção */}
          {custom && (
            <section className="rounded-2xl border border-gold/25 bg-cream-light p-6">
              <h2 className="font-serif text-xl text-primary">Personalização</h2>
              <dl className="mt-3 grid sm:grid-cols-3 gap-x-6 gap-y-2 text-sm">
                <div>
                  <dt className="text-dark/55">Criança</dt>
                  <dd className="text-dark font-medium">{custom.childName}</dd>
                </div>
                <div>
                  <dt className="text-dark/55">Faixa etária</dt>
                  <dd className="text-dark">{catalogLabel(AGE_RANGES, custom.ageRange)}</dd>
                </div>
                <div>
                  <dt className="text-dark/55">Tema</dt>
                  <dd className="text-dark">{catalogLabel(THEMES, custom.theme)}</dd>
                </div>
                <div>
                  <dt className="text-dark/55">Gênero</dt>
                  <dd className="text-dark">{catalogLabel(GENRES, custom.genre)}</dd>
                </div>
                <div>
                  <dt className="text-dark/55">Estilo</dt>
                  <dd className="text-dark">{catalogLabel(ART_STYLES, custom.artStyle)}</dd>
                </div>
                <div>
                  <dt className="text-dark/55">Cor favorita</dt>
                  <dd className="text-dark">{catalogLabel(COLORS, custom.favoriteColor)}</dd>
                </div>
              </dl>

              {custom.dedication && (
                <div className="mt-4">
                  <h3 className="text-sm text-dark/55">Dedicatória</h3>
                  <blockquote className="mt-1 rounded-xl bg-cream p-3 text-sm italic text-dark">
                    “{custom.dedication}”
                  </blockquote>
                </div>
              )}

              <div className="mt-4">
                <h3 className="text-sm text-dark/55">
                  Fotos ({custom.photoKeys.length}) — marca d’água aplicada (LGPD)
                </h3>
                <div className="mt-2 flex flex-wrap gap-3">
                  {photos.map((photo) =>
                    photo.url ? (
                      <Image
                        key={photo.key}
                        src={`/api/watermark?url=${encodeURIComponent(photo.url)}`}
                        alt="Foto enviada pelo cliente (com marca d'água)"
                        width={160}
                        height={160}
                        unoptimized
                        className="h-40 w-40 rounded-xl border border-gold/30 object-cover"
                      />
                    ) : (
                      <div
                        key={photo.key}
                        className="flex h-40 w-40 items-center justify-center rounded-xl border border-dashed border-gold/40 bg-cream p-2 text-center text-xs text-dark/50"
                      >
                        Foto indisponível
                        <br />({photo.key.slice(0, 8)}…)
                      </div>
                    ),
                  )}
                </div>
              </div>

              {custom.aiPrompt && (
                <div className="mt-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-primary">Prompt de IA (produção)</h3>
                    <CopyButton text={custom.aiPrompt} label="Copiar prompt" />
                  </div>
                  <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap rounded-xl bg-primary/5 p-4 text-xs text-dark">
                    {custom.aiPrompt}
                  </pre>
                </div>
              )}

              <p className="mt-4 border-t border-gold/20 pt-3 text-xs text-dark/55">
                Consentimento LGPD: aceito em {formatDateTime(custom.consentAt)} (termo{" "}
                {custom.consentTextVersion}, IP {custom.consentIp})
                {custom.photosExpireAt &&
                  ` · fotos expiram em ${formatDateTime(custom.photosExpireAt)}`}
              </p>
            </section>
          )}

          {/* Histórico */}
          <section className="rounded-2xl border border-gold/25 bg-cream-light p-6">
            <h2 className="font-serif text-xl text-primary">Histórico</h2>
            <ol className="mt-3 space-y-2 text-sm">
              {order.statusHistory.map((entry) => (
                <li key={entry.id} className="flex flex-wrap gap-x-2 border-b border-gold/15 pb-2 last:border-0">
                  <span className="text-dark/55">{formatDateTime(entry.changedAt)}</span>
                  <span className="text-dark">
                    {entry.fromStatus ? `${statusLabelOf(entry.fromStatus)} → ` : ""}
                    {statusLabelOf(entry.toStatus)}
                  </span>
                  {entry.note && <span className="text-dark/60">— {entry.note}</span>}
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* Ações */}
        <aside className="rounded-2xl border border-gold/25 bg-cream-light p-6 sticky top-6">
          <h2 className="font-serif text-xl text-primary">Ações</h2>
          <div className="mt-4">
            <OrderAdminActions
              orderId={order.id}
              currentStatus={order.status}
              trackingCode={order.trackingCode}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
