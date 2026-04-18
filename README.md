# Era Uma Vez Eu

E-commerce BR de livros infantis personalizados com IA humano-in-the-loop.

## Stack

- Next.js 14.2 App Router + TypeScript estrito + Tailwind 3.4
- React 18.3 (pinned — `react-pageflip` não suporta React 19)
- Prisma 6 + Supabase Postgres via Supavisor pooler
- Auth.js v5 + Google OAuth + Credentials
- Mercado Pago SDK v2 (PIX + Cartão 12x + Boleto)
- Melhor Envio + ViaCEP + BrasilAPI
- Resend (e-mail) + React Email
- Evolution API (WhatsApp) atrás de `lib/whatsapp.ts`
- Uploadthing (fotos em bucket privado) + Sharp (watermark)
- Sentry com scrub de PII + Vercel Analytics
- Zustand + Zod + React Hook Form

## Setup

```bash
# 1. Dependências
npm install

# 2. Variáveis de ambiente
cp .env.example .env.local
# Preencha DATABASE_URL + DIRECT_URL do Supabase, AUTH_SECRET, etc.

# 3. Gerar Prisma client
npx prisma generate

# 4. Migrar schema
npx prisma migrate dev --name init

# 5. Seed (5 produtos)
npm run db:seed

# 6. Rodar dev
npm run dev
```

## Credenciais necessárias (por fase)

| Fase | Credencial | Onde obter |
|------|-----------|-----------|
| 0 | `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET` | Supabase (Settings → Database → Connection string); `openssl rand -base64 32` |
| 0 (opcional) | `AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET` | console.cloud.google.com → OAuth 2.0 Client |
| 2 | `UPLOADTHING_TOKEN`, `UPLOADTHING_SECRET` | uploadthing.com dashboard |
| 4 | `MP_ACCESS_TOKEN`, `MP_WEBHOOK_SECRET`, `MP_PUBLIC_KEY` | mercadopago.com.br/developers |
| 4 | `MELHOR_ENVIO_TOKEN`, `CEP_ORIGEM` | melhorenvio.com.br/painel/gerenciar/tokens |
| 5 | `RESEND_API_KEY`, `EMAIL_FROM` com DNS validado | resend.com |
| 5 | `EVOLUTION_API_URL`, `EVOLUTION_API_KEY`, `EVOLUTION_INSTANCE` | instância Evolution (self-hosted ou SaaS) |
| 7 | `SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT` | sentry.io |
| 7 | `CRON_SECRET` | `openssl rand -base64 32` |

## Estrutura

```
app/
  (site)/       — rotas públicas [Fase 1]
  (loja)/       — fluxo de compra [Fases 2-4]
  (cliente)/    — área logada [Fase 6]
  (admin)/      — painel admin [Fase 6]
  api/          — route handlers
lib/            — db, auth, guards, whatsapp (abstrato), utils
prisma/         — schema + seed
middleware.ts   — guarda /admin + /cliente via JWT (edge)
auth.config.ts  — config sem Prisma (edge-safe)
```

## Workflow

Gerenciado via [GSD](https://github.com/gsd-claude/gsd). Artefatos em `.planning/`:

- `PROJECT.md` — contexto
- `REQUIREMENTS.md` — 72 REQ-IDs em v1
- `ROADMAP.md` — 8 fases
- `research/` — pesquisa inicial (stack, features, architecture, pitfalls)

Comandos úteis:
- `/gsd-progress` — ver status
- `/gsd-plan-phase N` — planejar fase
- `/gsd-execute-phase N` — executar fase

## LGPD

Fotos de crianças são dado sensível (Art. 14). Regras aplicadas:
- Bucket Uploadthing **privado** (signed URLs TTL 15min)
- Consentimento registrado (`consentIp`, `consentAt`, `consentTextVersion`)
- Marca d'água server-side obrigatória em previews públicos
- Cron Vercel deleta fotos 90 dias após `ENTREGUE`
- Sentry `beforeSend` remove fotos, telefones, CPF

## Licença

Proprietário — K2 Publicidade, Rio de Janeiro.
