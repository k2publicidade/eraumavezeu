# Architecture Research

**Domain:** E-commerce BR (livros infantis personalizados com IA)
**Researched:** 2026-04-18
**Confidence:** HIGH (Next.js 14 App Router + Prisma + NextAuth são padrões bem estabelecidos; integrações específicas MP/Melhor Envio/Evolution seguem receitas conhecidas do mercado BR)

## Standard Architecture

### System Overview

```
┌────────────────────────────────────────────────────────────────────────┐
│                         EDGE / CLIENT LAYER                             │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────┐     │
│  │ Site (RSC) │  │ Loja       │  │ Cliente    │  │ Admin        │     │
│  │ SEO-first  │  │ Wizard +   │  │ Auth-gated │  │ ADMIN role   │     │
│  │ static     │  │ checkout   │  │ (RSC+RCC)  │  │ (RSC+RCC)    │     │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └──────┬───────┘     │
│        │               │                │                │              │
│  ┌─────┴───────────────┴────────────────┴────────────────┴──────┐     │
│  │            middleware.ts  (role + auth guard)                │     │
│  └─────┬────────────────────────────────────────────────────────┘     │
├────────┼───────────────────────────────────────────────────────────────┤
│        │                   APP / API LAYER                              │
├────────┼───────────────────────────────────────────────────────────────┤
│  ┌─────┴──────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Server     │  │ Route        │  │ Server       │  │ Webhooks     │ │
│  │ Components │  │ Handlers     │  │ Actions      │  │ (no auth)    │ │
│  │ (reads)    │  │ /api/*       │  │ (mutations)  │  │ /api/webhook │ │
│  └─────┬──────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│        │                │                 │                  │         │
│  ┌─────┴────────────────┴─────────────────┴──────────────────┴──────┐ │
│  │  lib/  (auth.ts, db.ts, mercadopago.ts, melhorenvio.ts,          │ │
│  │         resend.ts, whatsapp.ts, watermark.ts, storage.ts)         │ │
│  └─────┬──────────┬───────────┬───────────┬────────────┬─────────────┘ │
├────────┼──────────┼───────────┼───────────┼────────────┼───────────────┤
│        │          │           │           │            │                │
│        ▼          ▼           ▼           ▼            ▼                │
│   ┌────────┐ ┌────────┐ ┌─────────┐ ┌────────┐ ┌──────────────┐        │
│   │Supabase│ │Uploadth│ │Mercado  │ │Melhor  │ │Resend +      │        │
│   │Postgres│ │(blobs) │ │Pago     │ │Envio   │ │Evolution API │        │
│   │+Storage│ │        │ │(pay+whk)│ │(frete) │ │(email+WA)    │        │
│   └────────┘ └────────┘ └─────────┘ └────────┘ └──────────────┘        │
│                                                                          │
│                      ┌──────────────┐                                   │
│                      │  Sentry      │  (cross-cutting observability)   │
│                      └──────────────┘                                   │
└────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **(site)** route group | Páginas institucionais públicas, SEO-first | RSC estático + `generateMetadata`, ISR onde couber |
| **(loja)** route group | Wizard, carrinho, checkout, sucesso/erro | Mix: wizard = RCC + Zustand; resumos = RSC |
| **(cliente)** route group | Lista e detalhe de pedidos do usuário logado | RSC + `auth()` server-side; timeline e rastreio |
| **(admin)** route group | Dashboard, gestão de pedidos, atualização de status | RSC + middleware role gate; mutations via Server Actions |
| **middleware.ts** | Enforce de auth/role antes de renderizar | Redirect anônimo, 404 para não-ADMIN no `/admin` |
| **Route Handlers `/api/*`** | Endpoints REST para operações não-form: upload, webhook, frete | `route.ts` exportando `POST/GET` |
| **Server Actions** | Mutations originadas de forms (criar pedido, atualizar status) | `"use server"` collocados em `app/**/actions.ts` |
| **`lib/db.ts`** | Prisma Client singleton, evita exaustão de conexões em dev | Global `var` pattern documentado pela Prisma |
| **`lib/auth.ts`** | Config NextAuth v5 (email/senha + Google opcional), session callbacks com `role` | Prisma adapter, JWT strategy |
| **`lib/mercadopago.ts`** | Criar preference, verificar assinatura de webhook, idempotência | SDK oficial `mercadopago` |
| **`lib/melhorenvio.ts`** | Cotação de frete, cache de resposta por CEP curto-prazo | Fetch direto à API REST |
| **`lib/resend.ts`** | Envio de e-mails com templates React Email | `resend.emails.send()` |
| **`lib/whatsapp.ts`** | Envio Evolution API, normalização de telefone BR | Fetch + retries + fila (ver Pitfalls) |
| **`lib/watermark.ts`** | Sharp server-side para composite de marca d'água | Executado em Route Handler dedicado (Node runtime) |
| **`lib/storage.ts`** | Abstração Uploadthing / Supabase Storage para fotos | URLs não-listadas, retention policy |
| **Zustand store** | Carrinho + rascunho do wizard em memória + localStorage | Persist middleware com key versionada |
| **Webhook handler** | Recebe MP, valida HMAC, atualiza Order, dispara notificações | Route Handler sem auth, dedup por `paymentId` |

## Recommended Project Structure

```
eraumavezeu/
├── app/
│   ├── layout.tsx                   # Root layout: fonts, providers, Sentry init
│   ├── providers.tsx                # "use client": SessionProvider, Toaster, Theme
│   │
│   ├── (site)/                      # grupo: site institucional (público, SEO)
│   │   ├── layout.tsx               # Header público + Footer
│   │   ├── page.tsx                 # Home (RSC) + FlipBook (RCC)
│   │   ├── como-funciona/page.tsx
│   │   ├── produtos/page.tsx
│   │   ├── galeria/page.tsx
│   │   ├── quem-somos/page.tsx
│   │   ├── faq/page.tsx
│   │   └── contato/page.tsx
│   │
│   ├── (loja)/                      # grupo: fluxo de compra
│   │   ├── layout.tsx               # Header simplificado + stepper
│   │   ├── personalizar/
│   │   │   ├── page.tsx             # RCC shell do wizard
│   │   │   └── actions.ts           # "use server": persistir rascunho opcional
│   │   ├── carrinho/page.tsx        # RCC (usa store Zustand)
│   │   ├── checkout/
│   │   │   ├── page.tsx             # RCC stepper 3 etapas
│   │   │   └── actions.ts           # createOrder, criarPreferenciaMP
│   │   ├── pedido-confirmado/[id]/page.tsx   # RSC
│   │   ├── pedido-pendente/[id]/page.tsx     # RSC
│   │   └── error.tsx
│   │
│   ├── (cliente)/                   # grupo: área logada do cliente
│   │   ├── layout.tsx               # checa auth(); redirect se anônimo
│   │   ├── pedidos/page.tsx         # RSC: lista pedidos do userId
│   │   ├── pedido/[id]/page.tsx     # RSC: detalhe + timeline
│   │   └── perfil/page.tsx
│   │
│   ├── (admin)/                     # grupo: painel administrativo
│   │   ├── layout.tsx               # checa role === ADMIN; sidebar admin
│   │   ├── dashboard/page.tsx       # RSC: métricas agregadas
│   │   ├── pedidos/
│   │   │   ├── page.tsx             # RSC: tabela + filtros (searchParams)
│   │   │   └── actions.ts           # exportCSV, bulkUpdate
│   │   ├── pedido/[id]/
│   │   │   ├── page.tsx             # RSC
│   │   │   └── actions.ts           # updateStatus, setTracking, resendEmail
│   │   └── configuracoes/page.tsx
│   │
│   └── api/
│       ├── auth/[...nextauth]/route.ts
│       ├── upload/route.ts          # Uploadthing bridge
│       ├── frete/route.ts           # POST CEP → cotação
│       ├── watermark/route.ts       # GET url → imagem com marca
│       ├── webhook/
│       │   └── mercadopago/route.ts # POST sem auth, HMAC-verified
│       └── health/route.ts
│
├── components/
│   ├── ui/                          # primitives (Button, Input, Dialog)
│   ├── site/                        # Header, Footer, FlipBook, Gallery
│   ├── loja/                        # WizardStep*, CartLine, CheckoutStepper
│   ├── cliente/                     # OrderCard, StatusTimeline, Tracking
│   └── admin/                       # DashboardCards, OrdersTable, StatusSelect
│
├── lib/
│   ├── db.ts                        # Prisma singleton
│   ├── auth.ts                      # NextAuth config + helpers
│   ├── mercadopago.ts               # preference + webhook verify
│   ├── melhorenvio.ts               # calcular frete
│   ├── resend.ts                    # sender + templates index
│   ├── whatsapp.ts                  # evolution client
│   ├── watermark.ts                 # sharp helper
│   ├── storage.ts                   # uploadthing helpers
│   ├── cart.ts                      # regras de desconto combo (pura)
│   ├── prompt-ia.ts                 # gerarPromptIA(customization)
│   ├── validators/                  # zod schemas por entidade
│   └── utils.ts
│
├── stores/
│   ├── cart-store.ts                # Zustand + persist
│   └── wizard-store.ts              # Zustand + persist (rascunho)
│
├── emails/                          # React Email templates
│   ├── order-confirmation.tsx
│   ├── payment-approved.tsx
│   ├── in-production.tsx
│   ├── shipped.tsx
│   └── delivered.tsx
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
│
├── middleware.ts                    # matcher /admin/* e /pedidos/*
├── sentry.client.config.ts
├── sentry.server.config.ts
└── public/
    ├── fonts/
    ├── images/
    └── exemplo-livro/               # apenas arquivos JÁ com marca d'água
```

### Structure Rationale

- **Route Groups `(site) (loja) (cliente) (admin)`:** cada grupo tem layout próprio (header diferente, auth diferente) sem poluir a URL. Permite paralelizar desenvolvimento — site estático primeiro, loja depois, admin por último.
- **`app/**/actions.ts` colocadas ao lado das páginas:** Server Actions ficam junto do consumo (alta coesão). Evita "god file" `lib/actions.ts`.
- **`lib/` é a fronteira de integração externa:** toda chamada a serviço externo passa por `lib/`. Facilita mock em testes e troca de provider (ex: Uploadthing → Supabase Storage).
- **`stores/` separado de `components/`:** Zustand stores são compartilhados entre múltiplos componentes; isolar evita ciclos de import.
- **`emails/` no root (não em `lib/`):** convenção React Email + `react-email preview` consegue auto-descobrir.
- **`prisma/seed.ts`:** dados iniciais dos 5 produtos fixos (livro, e-book, colorir, quebra-cabeça, adesivos). Essencial em ambiente novo.
- **`middleware.ts` no root:** Next 14 exige posição exata. Matcher configurado para `/admin/*` (role ADMIN) e `/pedidos/*` + `/perfil/*` (any auth).

## Architectural Patterns

### Pattern 1: Server Components por Padrão, Client Components só quando Necessário

**What:** Tudo é RSC (Server Component) por padrão. Adiciona-se `"use client"` apenas em componentes que precisam de: `useState`, `useEffect`, event handlers (onClick, onChange), APIs do browser (localStorage, window), ou bibliotecas client-only (ex: `react-pageflip`).

**When to use:** sempre — é o default do App Router. A escolha é onde colocar a fronteira.

**Trade-offs:**
- Pró: payload JS menor, dados buscados no servidor (sem waterfalls), SEO nativo.
- Contra: não é possível usar hooks de estado em RSC. Exige pensar em "ilhas" de interatividade.

**Boundary guide para este projeto:**

| Componente/rota | Tipo | Razão |
|------------------|------|-------|
| Home, como-funciona, FAQ, produtos (catálogo), galeria | RSC | Conteúdo estático, SEO crítico |
| `FlipBook` | RCC | Depende de `react-pageflip` e DOM |
| `GalleryFilter` | RCC | Estado local de filtro |
| Wizard 7 etapas | RCC | State machine + localStorage persist |
| Upload dropzone | RCC | APIs do browser |
| Carrinho | RCC | Store Zustand reativa |
| Checkout stepper | RCC shell; mas sub-seções de revisão podem ser server-rendered em transições | Mistura: estado de etapa é client, lookup de dados pode ser server |
| Lista de pedidos (cliente e admin) | RSC | Busca direto do Prisma; filtros via `searchParams` (URL) |
| Detalhe do pedido | RSC + `StatusSelect` (RCC) | Corpo estático; ação de mudar status é Server Action disparada de componente client |
| Dashboard admin | RSC | Agregações via Prisma |

**Example:**

```tsx
// app/(admin)/pedido/[id]/page.tsx  (RSC)
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { StatusSelect } from "@/components/admin/StatusSelect"; // RCC

export default async function Page({ params }: { params: { id: string } }) {
  await requireAdmin();
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: params.id },
    include: { items: { include: { product: true } }, customization: true, shippingAddress: true },
  });
  return (
    <div>
      <h1>Pedido #{order.id}</h1>
      {/* renderização estática */}
      <StatusSelect orderId={order.id} current={order.status} /> {/* ilha interativa */}
    </div>
  );
}
```

### Pattern 2: Route Groups para Layout + Auth Diferenciados

**What:** `(site) (loja) (cliente) (admin)` não alteram URL mas permitem layouts e guardas isolados.

**When to use:** sempre que houver diferentes "shells" (header, nav, permissions) em uma mesma aplicação.

**Trade-offs:**
- Pró: organização limpa, sem prefixos feios (`/admin/admin/dashboard`).
- Contra: developers novos podem confundir — documentar no README.

**Example:**

```tsx
// app/(admin)/layout.tsx
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/login?callbackUrl=/admin/dashboard");
  if (session.user.role !== "ADMIN") notFound(); // esconde existência do painel
  return <AdminShell>{children}</AdminShell>;
}
```

### Pattern 3: Guarda em Três Camadas (Middleware + Layout + Server Action)

**What:** não confiar em uma só barreira. Aplicar defesa em profundidade.

1. **`middleware.ts`** — bloqueia request não autenticada antes mesmo de renderizar (redireciona para `/login`).
2. **Layout RSC** — re-valida a sessão server-side (middleware pode ser contornado se cookies forjados chegam a HTML cacheado).
3. **Server Action / Route Handler** — cada mutation faz `requireAdmin()` ou `requireOwner(orderId)`. NUNCA confiar que o botão "só aparece pra admin" é suficiente.

**When to use:** obrigatório em qualquer painel admin e em dados do cliente (um cliente não pode ver pedido de outro).

**Trade-offs:**
- Pró: se uma camada falhar, as outras seguram.
- Contra: leve duplicação. Aceitável.

**Example:**

```ts
// lib/auth.ts
export async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("UNAUTHORIZED");
  }
  return session;
}

export async function requireOrderOwner(orderId: string) {
  const session = await auth();
  const order = await prisma.order.findUnique({ where: { id: orderId }, select: { userId: true } });
  if (!session || order?.userId !== session.user.id) throw new Error("FORBIDDEN");
}
```

### Pattern 4: Wizard como State Machine Persistida + Server Action de Commit

**What:** o wizard é 100% client-side (Zustand + `persist` em localStorage). Fotos vão pro Uploadthing na hora (precisa URL), mas o resto é rascunho local. Somente ao "Adicionar ao carrinho" → envia para o carrinho (ainda client). Só ao Finalizar no checkout → Server Action cria Order + Customization + Address no Postgres em uma transação.

**When to use:** wizards longos onde abandono é alto e registro prematuro polui o banco.

**Trade-offs:**
- Pró: zero escrita no DB até o comprometimento. Recuperação transparente se a aba fecha.
- Contra: localStorage tem limite (~5MB); não salvar base64 de fotos, só URLs pós-upload.

**Example:**

```ts
// stores/wizard-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

type WizardState = {
  step: number;
  theme?: string; genre?: string; artStyle?: string;
  favoriteColor?: string; ageRange?: string;
  photos: string[]; // URLs Uploadthing
  childName?: string; dedication?: string;
  set: (patch: Partial<WizardState>) => void;
  reset: () => void;
};

export const useWizard = create<WizardState>()(
  persist(
    (set) => ({ step: 1, photos: [], set: (p) => set(p), reset: () => set({ step: 1, photos: [] }) }),
    { name: "eraumavezeu-wizard-v1" } // bump 'v1' quando shape mudar
  )
);
```

### Pattern 5: Webhook como Fonte da Verdade (Idempotente + Dedup)

**What:** o retorno "success" do Mercado Pago no browser não é confiável (usuário pode fechar a aba). O webhook server-to-server é que **oficialmente** confirma o pagamento.

1. Webhook recebe, valida HMAC (`x-signature`).
2. Busca Order por `external_reference`.
3. Verifica `paymentId` para dedup (MP reenvia várias vezes).
4. Atualiza `paymentStatus` e `status` em transação.
5. Enfileira (ou dispara inline) envio de e-mail + WhatsApp.
6. Retorna 200 rapidamente (MP exige <22s).

**When to use:** qualquer integração com pagamento assíncrono (MP, Stripe, PagSeguro).

**Trade-offs:**
- Pró: robusto contra network flakiness e abandono de checkout.
- Contra: duplicar dedup logic é fácil de errar — usar tabela `ProcessedWebhook` ou coluna `lastWebhookEventId`.

**Example:**

```ts
// app/api/webhook/mercadopago/route.ts
export async function POST(req: Request) {
  const rawBody = await req.text();
  if (!verifyMPSignature(req.headers, rawBody)) {
    return new Response("invalid signature", { status: 401 });
  }
  const payload = JSON.parse(rawBody);
  if (payload.type !== "payment") return Response.json({ ok: true });

  const payment = await mp.getPayment(payload.data.id);
  const order = await prisma.order.findUnique({ where: { id: payment.external_reference } });
  if (!order) return new Response("order not found", { status: 404 });
  if (order.paymentId === String(payment.id) && order.paymentStatus === mapStatus(payment.status)) {
    return Response.json({ ok: true, dedup: true });
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentId: String(payment.id),
        paymentStatus: mapStatus(payment.status),
        status: payment.status === "approved" ? "PAGAMENTO_CONFIRMADO" : order.status,
      },
    });
  });

  if (payment.status === "approved") {
    await notifyPaymentApproved(order.id); // email + WhatsApp (fire-and-log-error)
  }
  return Response.json({ ok: true });
}
```

### Pattern 6: Marca d'água Sob Demanda via Route Handler (LGPD)

**What:** fotos da criança uploadadas NÃO ficam acessíveis publicamente. Storage usa URL não-listada (privada). Quando é necessário exibir preview (wizard, admin, galeria de marketing), um Route Handler `/api/watermark?src=...` com auth apropriada lê a imagem, aplica marca d'água com Sharp e serve.

**When to use:** qualquer dado sensível (fotos de crianças = LGPD) cuja visualização deve ser intermediada.

**Trade-offs:**
- Pró: protege contra hotlinking, aplica watermark sempre, centraliza caching.
- Contra: consumo de CPU na serverless (Sharp precisa Node runtime, não Edge). Usar `Cache-Control: public, max-age=3600` quando aplicável; pré-gerar versões com marca d'água para imagens de marketing (galeria).

**Example:**

```ts
// app/api/watermark/route.ts
export const runtime = "nodejs"; // Sharp não roda em Edge
export async function GET(req: Request) {
  const url = new URL(req.url).searchParams.get("src");
  if (!url || !isAllowedSource(url)) return new Response("bad src", { status: 400 });
  // autorização: se src pertence a um pedido, conferir owner ou ADMIN
  const buf = await aplicarMarcaDagua(url);
  return new Response(buf, {
    headers: { "Content-Type": "image/jpeg", "Cache-Control": "private, max-age=300" },
  });
}
```

### Pattern 7: Carrinho Client-Side com Regras Puras Compartilhadas

**What:** carrinho vive no client (Zustand). Mas a função `applyComboDiscount(items)` fica em `lib/cart.ts` como código puro (sem React), importada tanto pelo store quanto pelo `createOrder` server-side. Assim o total exibido no checkout bate com o total salvo no pedido.

**When to use:** qualquer regra de preço/desconto — evita duplicação client/server que gera divergência.

**Trade-offs:**
- Pró: fonte única de verdade pras regras.
- Contra: disciplina necessária — proibido espalhar lógica de preço em componentes.

## Data Flow

### Request Flow — Fluxo do Checkout Feliz

```
[Usuário preenche wizard]
    │ (Zustand persist → localStorage)
    ▼
[Carrinho]  ◄──── regras R$ 20 combo em lib/cart.ts (pura)
    │
    ▼
[Checkout etapa 1: identificação]  ──► Server Action `attachUser` (se login)
[Checkout etapa 2: entrega]        ──► Route Handler POST /api/frete → Melhor Envio
[Checkout etapa 3: pagamento]      ──► Server Action `createOrder`:
    │                                      ├─ prisma.$transaction:
    │                                      │   ├─ Order (AGUARDANDO_PAGAMENTO)
    │                                      │   ├─ OrderItems
    │                                      │   ├─ Customization (+ aiPrompt gerado)
    │                                      │   └─ Address
    │                                      ├─ criarPreferencia(MP)
    │                                      └─ returns preferenceInitPoint
    ▼
[Redirect para MP Checkout]
    │
    ▼ (usuário paga)
[MP → webhook /api/webhook/mercadopago]  (pode chegar antes ou depois do back_url)
    │  valida HMAC, dedup
    ▼
[prisma.$transaction: update Order.status = PAGAMENTO_CONFIRMADO]
    │
    ├──► Resend.send(emailPagamentoAprovado)
    └──► Evolution.send(whatsappConfirmacao)
    │
    ▼
[Cliente vê em /pedidos → status atualizado (RSC lê direto do DB)]
[Admin vê em /admin/pedidos → muda status para EM_PRODUCAO via Server Action]
    │
    ▼ (admin atualiza status)
[updateStatus Server Action]
    ├─ prisma.order.update
    └─ dispara email + WhatsApp correspondente ao novo status
```

### State Management

```
┌─────────────────────────────────────────────────────────────────┐
│  CLIENT STATE                                                    │
│                                                                   │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐         │
│  │ wizardStore  │   │ cartStore    │   │ sessionProv. │         │
│  │ (Zustand +   │   │ (Zustand +   │   │ (NextAuth    │         │
│  │  persist)    │   │  persist)    │   │  client)     │         │
│  └──────┬───────┘   └──────┬───────┘   └──────┬───────┘         │
│         │                  │                  │                  │
│         └──────────────────┼──────────────────┘                  │
│                            │                                      │
│  URL state (searchParams) ─┤   usado pra filtros admin,          │
│                            │   paginação, status do wizard       │
└────────────────────────────┼──────────────────────────────────────┘
                             │
                             ▼ (Server Action / fetch)
┌──────────────────────────────────────────────────────────────────┐
│  SERVER STATE                                                     │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────┐    │
│  │  Prisma Client (singleton) ──► Supabase Postgres         │    │
│  │  NextAuth session (JWT)                                   │    │
│  │  revalidatePath / revalidateTag após mutations           │    │
│  └──────────────────────────────────────────────────────────┘    │
└──────────────────────────────────────────────────────────────────┘
```

**Regra prática:** **URL > client store > server fetch**. Filtros de lista e etapa do wizard podem ir na URL (`?step=3&theme=...`) — melhora shareability e permite RSC ler sem precisar de client. Carrinho e rascunho do wizard ficam em store. Nunca use store para dados de pedido já salvo — leia do servidor.

### Key Data Flows

1. **Wizard → Carrinho:** wizardStore.commit() → cartStore.addItem({ kind: "livro-principal", customizationDraft }). Rascunho de customização viaja com o item até virar Order.
2. **Upload de foto → URL:** dropzone chama Uploadthing → recebe URL → push no wizardStore.photos[]. Se aba fecha antes de finalizar pedido, URL fica órfã (cron de limpeza opcional).
3. **Cotação de frete:** carrinho + CEP → POST /api/frete → lib/melhorenvio → resposta cacheada no cartStore por 10min (invalida ao mudar CEP ou itens).
4. **Criação de pedido:** checkout → Server Action transação → retorna `initPoint` do MP → `window.location.href = initPoint`.
5. **Webhook MP:** externo → /api/webhook/mercadopago → transação update + notificações → 200 OK. Idempotente.
6. **Mudança de status (admin):** StatusSelect (RCC) → Server Action `updateStatus` → update + `revalidatePath('/admin/pedido/[id]')` + trigger de notificação baseado em transição.
7. **Timeline do cliente:** RSC lê Order + histórico (tabela `OrderStatusHistory` recomendada, ver "Gaps") e renderiza direto.

## Scaling Considerations

Este produto começa com demanda pequena (K2 Publicidade é estúdio, cliente é e-commerce nicho). Escala não é o inimigo — **qualidade do fluxo de checkout e confiabilidade de webhook são**.

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0–500 pedidos/mês | Monolito Next.js na Vercel + Supabase free/pro. Nada especial. Observability via Sentry e Vercel Analytics. |
| 500–5k pedidos/mês | Adicionar fila para notificações (Upstash QStash ou Inngest) para não bloquear webhook. Cache de produtos (ISR 1h) e frete (KV Redis, TTL 10min). Pré-gerar thumbs com marca d'água (galeria). |
| 5k+ pedidos/mês | Separar admin em subdomínio (`admin.eraumavezeu.com.br`) com runtime próprio. Considerar Supabase réplica read. Sentry tracing para identificar N+1 do Prisma. |

### Scaling Priorities

1. **Primeiro gargalo:** webhook bloqueando por envio síncrono de e-mail/WhatsApp (Evolution API pode ser lenta). **Fix:** enfileirar com QStash/Inngest — webhook confirma pagamento e publica evento; worker processa notificações.
2. **Segundo gargalo:** Sharp em serverless pra cada request de watermark. **Fix:** pré-gerar versões marcadas em upload e armazenar como blob separado; servir estático.
3. **Terceiro gargalo:** N+1 no admin (lista de pedidos com items + products). **Fix:** sempre usar `include` Prisma explícito + Sentry perf para pegar queries lentas.
4. **Quarto gargalo:** cold start da função de webhook. **Fix:** `export const runtime = "nodejs"` e considerar região próxima (gru1). Evitar imports pesados no handler.

## Anti-Patterns

### Anti-Pattern 1: "Vou confiar no retorno do front do Mercado Pago"

**What people do:** marcar Order como paga no `back_url?status=approved` do MP, sem webhook.
**Why it's wrong:** usuário pode fechar a aba, back_url pode ser manipulado (query string), e MP recomenda webhook como fonte oficial.
**Do this instead:** webhook é autoridade. `back_url` é só UX — mostra "processando pagamento, aguarde confirmação por e-mail". Só marca como paga quando webhook confirma.

### Anti-Pattern 2: Guardar fotos de crianças em bucket público

**What people do:** Uploadthing/Supabase Storage com URL pública indexável por buscador.
**Why it's wrong:** viola LGPD (dado sensível de menor) e princípio de minimização. Indexadores podem pegar, clientes podem compartilhar link público.
**Do this instead:** bucket privado + URL assinada curta (15min) ou stream através de `/api/watermark` com ACL. Retention policy: deletar fotos X dias após entrega.

### Anti-Pattern 3: Lógica de desconto duplicada no front e back

**What people do:** `if (hasLivroPrincipal) price -= 20` escrito em React e também na Server Action.
**Why it's wrong:** mudanças em regra quebram um lado, dão divergência entre total exibido e total salvo (suspeita de fraude / suporte fica maluco).
**Do this instead:** função pura em `lib/cart.ts`, importada pelos dois. Testar ela isoladamente.

### Anti-Pattern 4: Wizard salvando no banco a cada passo

**What people do:** POST `/api/wizard/step` a cada "próximo", criando uma Customization órfã por sessão.
**Why it's wrong:** 80% dos wizards são abandonados. Banco enche de lixo. Privacidade: fotos de crianças persistem sem pedido real.
**Do this instead:** rascunho em localStorage (Pattern 4). Só persiste ao criar Order. Se precisar de resume cross-device no futuro, criar endpoint opt-in.

### Anti-Pattern 5: "use client" no topo da página do admin

**What people do:** marcar a página inteira como RCC "porque tem um select de status".
**Why it's wrong:** perde SSR, força hidratação pesada, queries têm que passar por API.
**Do this instead:** página é RSC; só o `<StatusSelect>` é RCC. Server Action é importada pelo RCC e chamada com `useTransition`.

### Anti-Pattern 6: Middleware fazendo query ao banco

**What people do:** no `middleware.ts`, verificar role lendo Prisma.
**Why it's wrong:** middleware roda em Edge runtime; Prisma client não é compatível fora do adapter apropriado. Além disso, adiciona latência a toda request.
**Do this instead:** middleware só lê JWT (já tem `role` no payload via `session.callback`). Validações de existência ficam em layout/server action.

### Anti-Pattern 7: Webhook que faz tudo inline (e demora)

**What people do:** webhook envia email + WhatsApp + gera PDF + atualiza Sheets tudo antes de retornar 200.
**Why it's wrong:** Mercado Pago reenvia se >22s; operações falhas bloqueiam o ACK; efeitos colaterais travam o handler.
**Do this instead:** webhook só persiste estado + enfileira evento. Worker processa notificações. Se escala baixa inicial, aceitável tentar inline com timeout curto e fallback para fila; documentar essa dívida.

### Anti-Pattern 8: Esquecer `revalidatePath` após mutation

**What people do:** Server Action atualiza pedido mas lista em `/admin/pedidos` continua mostrando dados antigos até reload manual.
**Why it's wrong:** RSC são cacheados por rota; sem revalidate eles servem o snapshot.
**Do this instead:** sempre `revalidatePath('/admin/pedidos')` e `revalidatePath('/admin/pedido/'+id)` ao fim de mutations relevantes. Em listas com muitos filtros, considerar `revalidateTag`.

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **Supabase Postgres** | Prisma Client singleton, `DATABASE_URL` com pooler (`pgbouncer=true`) | Usar connection pooling URL em produção; URL direta só pra migrations (`DIRECT_URL`). |
| **Supabase Storage** | Via `lib/storage.ts`, buckets privados, URLs assinadas | Política RLS no bucket conforme role. |
| **Uploadthing** | SDK + Route Handler `/api/uploadthing`; callback preenche store client | Config `maxFileSize`, `maxFileCount=4` pra fotos. |
| **Mercado Pago** | SDK `mercadopago`, Preference → redirect, webhook para oficializar | Usar `external_reference = orderId`; validar `x-signature`; habilitar modo sandbox em dev. |
| **Melhor Envio** | REST via fetch, token Bearer, cache de resposta por CEP | Precisa `from.postal_code` configurado; dimensões do livro fixas em lib. |
| **Resend** | `resend.emails.send()` com React Email | Configurar domínio + DKIM/SPF antes de sair do sandbox. |
| **Evolution API** | REST POST, precisa instância provisionada | Normalizar telefone para E.164; tratar 4xx sem retry infinito. |
| **Sharp** | local em Node runtime | NÃO funciona em Edge runtime; marcar handler com `export const runtime = "nodejs"`. |
| **NextAuth v5** | `auth()` helper server-side, `useSession` client | Prisma adapter; `session.user.role` via JWT callback. |
| **Sentry** | `@sentry/nextjs` wizard | Configurar `sentry.client.config.ts` + `sentry.server.config.ts` + `sentry.edge.config.ts`. |
| **ViaCEP** | fetch direto no client; autopreenchimento de endereço | Sem auth, rate limit generoso; bom fallback para erros. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| (site) ↔ (loja) | Link puro; sem estado compartilhado | Usuário pode entrar no wizard direto do CTA da home. |
| (loja) ↔ (cliente) | Após checkout, redireciona para `/pedido-confirmado/[id]` que é público (identificado por id secret-ish); `/pedidos` exige auth | Proteger detalhes sensíveis com auth; página de confirmação mostra mínimo. |
| Wizard ↔ Carrinho | Via Zustand stores; carrinho recebe customization draft | Deep clone do draft ao mover — wizard pode ser usado de novo. |
| Carrinho ↔ Checkout | Zustand + Server Action consome snapshot | No `createOrder`, recalcular preços server-side (não confiar no client). |
| Checkout ↔ Webhook | via `external_reference` do MP | Dedup por `paymentId`. |
| Admin ↔ Notificações | Server Action dispara via `lib/resend` / `lib/whatsapp` | Wrap em try/catch + Sentry; UI deve mostrar sucesso mesmo se notificação falhar (não é operação crítica). |

## Security Boundaries

- **Middleware:** matcher `['/admin/:path*', '/pedidos/:path*', '/perfil/:path*', '/pedido/:path*']`. Redireciona não-autenticados para `/login?callbackUrl=...`.
- **Layout `(admin)`:** `notFound()` para não-ADMIN (esconde existência do painel — melhor que 403).
- **Layout `(cliente)`:** `redirect('/login')` se não autenticado.
- **Server Actions:** toda mutation valida `auth()` no começo; mutations admin chamam `requireAdmin()`.
- **Webhook:** SEM auth de usuário, mas COM verificação de HMAC do MP. Rate limit recomendado (Upstash).
- **LGPD fotos:** bucket privado + URL assinada + watermark obrigatório em qualquer exposição. Retenção: ex. 90 dias após `ENTREGUE`.
- **Zod em toda entrada server:** `lib/validators/` com schemas por endpoint/action. Nunca aceitar `any` do client.
- **Prisma `select` explícito em dados sensíveis:** nunca `include: { user: true }` sem projeção — evita vazar `password` hash.
- **Headers de segurança:** `next.config.js` com CSP, `Strict-Transport-Security`, `X-Frame-Options: DENY`.

## Build Order (Dependencies)

Ordem sugerida baseada em grafo de dependências. Cada item tem que estar pronto antes do próximo depender dele.

```
1. Fundação
   ├─ Next.js 14 init + Tailwind + TS estrito + ESLint/Prettier
   ├─ Prisma + schema.prisma + primeira migration + seed (5 produtos)
   ├─ NextAuth v5 (email/senha) + middleware.ts skeleton
   └─ Layout root + providers + Sentry

2. Site institucional (pode ser paralelo por outra pessoa)
   ├─ (site)/layout + Header + Footer
   ├─ Home com seções estáticas (FlipBook pode ficar por último — componente pesado)
   ├─ Páginas estáticas (como-funciona, produtos, galeria estática, faq, contato)
   └─ SEO base (metadata, sitemap, robots)

3. Auth funcional (bloqueia 4 e 7)
   ├─ Login/cadastro pages
   ├─ Google OAuth opcional
   ├─ Role no JWT callback
   └─ requireAdmin/requireOwner helpers em lib/auth.ts

4. Produto + Wizard (bloqueia carrinho)
   ├─ Upload (Uploadthing) + storage abstraction
   ├─ Wizard 7 etapas com Zustand + persist
   ├─ Geração de prompt IA (função pura, testável)
   └─ Route handler /api/watermark (Sharp)

5. Carrinho + Regras (bloqueia checkout)
   ├─ cartStore (Zustand persist)
   ├─ lib/cart.ts — applyComboDiscount (puro, testado)
   └─ Página de carrinho

6. Frete + Checkout UI (bloqueia criação de pedido)
   ├─ /api/frete → Melhor Envio
   ├─ Stepper 3 etapas
   ├─ ViaCEP autopreenchimento
   └─ Form de endereço + validação Zod

7. Pagamento E2E (CRÍTICO — testar em sandbox)
   ├─ lib/mercadopago.ts (createPreference)
   ├─ Server Action createOrder (transação)
   ├─ Redirect para MP
   ├─ /api/webhook/mercadopago com HMAC + dedup  ← pronto antes de notificações
   └─ Páginas pedido-confirmado / pedido-pendente / erro

8. Notificações (depende de webhook)
   ├─ lib/resend + 5 templates React Email
   ├─ lib/whatsapp + Evolution API
   └─ Disparos no webhook e nas transições de status

9. Área do cliente (depende de pedidos existirem)
   ├─ (cliente)/layout com guard
   ├─ Lista de pedidos
   ├─ Detalhe com timeline
   └─ Perfil

10. Admin (depende de tudo)
    ├─ (admin)/layout com guard ADMIN
    ├─ Dashboard (métricas)
    ├─ Lista + filtros + export CSV
    ├─ Detalhe + Server Actions (status, tracking, reenvios)
    └─ OrderStatusHistory (se decidido persistir)

11. Polimento e LGPD
    ├─ FlipBook (react-pageflip) com marca d'água
    ├─ Galeria masonry com filtro
    ├─ Retenção de fotos (cron Supabase ou Vercel Cron)
    ├─ CSP headers, páginas de privacidade/termos
    └─ Deploy Vercel + domínio + SSL + Sentry prod
```

**Pontos de atenção no ordering:**
- **7 antes de 8:** notificações só têm sentido quando há evento real de pagamento. Mockar MP em dev com ngrok + sandbox.
- **3 antes de 9/10:** auth é prerequisito absoluto das áreas protegidas.
- **4 antes de 5:** o item do carrinho carrega customização — sem wizard, carrinho não tem conteúdo significativo para livro principal.
- **Site (2) pode ser paralelo a 3–8** se houver dev extra — não bloqueia nada crítico. Boa tarefa para começar entregando valor visível rápido.

## Gaps to Address in Later Research

- **`OrderStatusHistory` table:** schema atual guarda só `status` atual. Para timeline no cliente e auditoria no admin, criar `OrderStatusHistory { id, orderId, from, to, changedBy, changedAt, note }`. Decisão pendente — validar com cliente no Phase 1.
- **Fila para notificações:** QStash vs Inngest vs processamento inline. Em MVP, inline com try/catch e log no Sentry pode bastar. Revisitar se webhook começar a demorar.
- **Retenção de fotos (LGPD):** cron que deleta fotos X dias pós-ENTREGUE. Precisa definir X com cliente; considerar opt-out para permitir uso em galeria (com consentimento).
- **E-mail para guest:** se `guestEmail` está setado mas `userId` é null, como vincular pedido a conta se usuário cadastrar depois? Precisa discutir UX.
- **Backup de banco:** Supabase free tier tem PITR limitado. Em produção, upgrade para Pro ou snapshot cron.
- **A11y FlipBook:** `react-pageflip` é visual-first, precisa linguagem alternativa (galeria linear) para leitor de tela.

## Sources

- Next.js 14 App Router — Route Groups, Layouts, Server/Client Components, Middleware (docs oficiais, training HIGH confidence, padrões bem estabelecidos).
- NextAuth v5 (Auth.js) patterns — JWT strategy, role in session, `auth()` helper (training + well-known patterns, HIGH).
- Mercado Pago — Preference flow + webhook com `x-signature` HMAC (documentação oficial MP Developers, HIGH).
- Melhor Envio — API v2 shipment/calculate (docs públicos, HIGH).
- Prisma — Client singleton pattern for Next.js (doc oficial "Best practices: instantiating Prisma Client", HIGH).
- Sharp runtime — exige Node.js runtime em Next.js (incompatível com Edge) (docs Next.js, HIGH).
- Zustand persist — padrão consagrado para state em wizards/carts (docs Zustand, HIGH).
- LGPD — dado pessoal sensível inclui dado de crianças; princípios de minimização e finalidade (Lei 13.709/2018, HIGH).
- Evolution API — baseado em Baileys, uso comum em e-commerce BR (repositório público, MEDIUM — documentação comunitária).
- React Email + Resend — integração nativa documentada (Resend docs, HIGH).

---
*Architecture research for: E-commerce BR de livros infantis personalizados (Era Uma Vez Eu)*
*Researched: 2026-04-18*
