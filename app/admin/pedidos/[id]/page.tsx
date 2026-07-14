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
import {
  ART_STYLE_OPTIONS,
  GENDER_OPTIONS,
  LINE_STYLE_OPTIONS,
  PRODUCT_FORM_LABELS,
} from "@/lib/product-customization";

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
        items: {
          include: {
            product: true,
            customizations: { orderBy: { unitIndex: "asc" } },
          },
        },
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
  const itemCustomizations = order.items.flatMap((item) =>
    item.customizations.map((customization) => ({ customization, item })),
  );
  const itemPhotos = new Map(
    await Promise.all(
      itemCustomizations.map(async ({ customization }) => [
        customization.id,
        await getSignedPhotoUrls(customization.photoKeys),
      ] as const),
    ),
  );

  return (
    <div>
      <Link href="/admin/pedidos" className="text-sm text-dark/60 hover:text-primary">
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

          {itemCustomizations.length > 0 && (
            <section className="rounded-2xl border border-gold/25 bg-cream-light p-6">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-serif text-xl text-primary">Fichas de produção</h2>
                <span className="text-xs font-medium text-forest">
                  {itemCustomizations.length} {itemCustomizations.length === 1 ? "unidade personalizada" : "unidades personalizadas"}
                </span>
              </div>
              <div className="mt-4 divide-y divide-gold/25">
                {itemCustomizations.map(({ customization, item }, index) => {
                  const customizationPhotos = itemPhotos.get(customization.id) ?? [];
                  const gender = GENDER_OPTIONS.find((option) => option.value === customization.childGender)?.label ?? customization.childGender;
                  const artStyle = ART_STYLE_OPTIONS.find((option) => option.value === customization.artStyle)?.label ?? customization.artStyle;
                  const lineStyle = LINE_STYLE_OPTIONS.find((option) => option.value === customization.lineStyle)?.label ?? customization.lineStyle;
                  return (
                    <article key={customization.id} className="py-6 first:pt-1 last:pb-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-white">{index + 1}</span>
                        <h3 className="font-medium text-primary">{PRODUCT_FORM_LABELS[customization.productType].title}</h3>
                        <span className="text-xs text-dark/50">{item.product.name}, unidade {customization.unitIndex + 1}</span>
                      </div>
                      <dl className="mt-4 grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2 lg:grid-cols-3">
                        <AdminField label="Criança" value={customization.childName} />
                        <AdminField label="Idade" value={`${customization.childAge} anos`} />
                        <AdminField label="Identificação" value={gender} />
                        <AdminField label="Cor favorita" value={customization.favoriteColor} />
                        <AdminField label="Tema" value={customization.theme} />
                        {customization.storyGenre && <AdminField label="Gênero da história" value={customization.storyGenre} />}
                        {customization.artStyle && <AdminField label="Estilo visual" value={artStyle || ""} />}
                        {customization.lineStyle && <AdminField label="Tipo de traço" value={lineStyle || ""} />}
                      </dl>
                      {customization.dedication && (
                        <div className="mt-4 rounded-xl bg-cream p-4">
                          <p className="text-xs font-medium text-dark/55">Dedicatória</p>
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-dark">{customization.dedication}</p>
                        </div>
                      )}
                      {customization.notes && (
                        <div className="mt-4">
                          <p className="text-xs font-medium text-dark/55">Detalhes para criação</p>
                          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-dark">{customization.notes}</p>
                        </div>
                      )}
                      <div className="mt-5">
                        <p className="text-xs font-medium text-dark/55">Fotos de referência ({customization.photoKeys.length})</p>
                        <div className="mt-2 flex flex-wrap gap-3">
                          {customizationPhotos.map((photo, photoIndex) => photo.url ? (
                            <Image key={photo.key} src={`/api/watermark?key=${encodeURIComponent(photo.key)}`} alt={`Foto ${photoIndex + 1} de ${customization.childName}, com marca d'água`} width={144} height={144} unoptimized className="h-36 w-36 rounded-xl border border-gold/30 object-cover" />
                          ) : (
                            <div key={photo.key} className="flex h-36 w-36 items-center justify-center rounded-xl border border-dashed border-gold/40 bg-cream p-3 text-center text-xs text-dark/50">Foto indisponível</div>
                          ))}
                        </div>
                      </div>
                      {customization.aiPrompt && (
                        <details className="mt-5 overflow-hidden rounded-xl bg-primary/5">
                          <summary className="flex cursor-pointer items-center justify-between gap-3 px-4 py-3 text-sm font-medium text-primary">
                            Brief de produção
                            <CopyButton text={customization.aiPrompt} label="Copiar brief" />
                          </summary>
                          <pre className="max-h-72 overflow-auto whitespace-pre-wrap border-t border-primary/10 px-4 py-3 text-xs text-dark">{customization.aiPrompt}</pre>
                        </details>
                      )}
                      <p className="mt-4 text-xs leading-relaxed text-dark/50">
                        Consentimento aceito em {formatDateTime(customization.consentAt)} · confidencialidade confirmada em {formatDateTime(customization.confidentialityAt)} · termo {customization.consentTextVersion}
                        {customization.photosExpireAt ? ` · fotos expiram em ${formatDateTime(customization.photosExpireAt)}` : ""}
                      </p>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

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
                        src={`/api/watermark?key=${encodeURIComponent(photo.key)}`}
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

function AdminField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-dark/55">{label}</dt>
      <dd className="font-medium text-dark">{value}</dd>
    </div>
  );
}
