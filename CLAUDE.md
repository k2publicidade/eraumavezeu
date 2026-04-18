<!-- GSD:project-start source:PROJECT.md -->
## Project

**Era Uma Vez Eu**

E-commerce de livros infantis personalizados com ilustrações geradas por IA. O cliente
envia fotos da criança, escolhe tema/gênero/estilo/faixa-etária, escreve uma dedicatória
e a equipe produz um livro físico (capa dura) usando IA + revisão humana. Produtos
adicionais (colorir, quebra-cabeça, adesivos) ganham desconto de R$ 20 quando
comprados junto do livro principal. Público-alvo: adultos (pais, tios, avós, padrinhos)
comprando presente premium para crianças de 0-10 anos.

**Core Value:** Um wizard de personalização claro e prazeroso que converte o adulto em comprador,
gerando ao final um prompt de IA utilizável pela equipe de produção do livro.

### Constraints

- **Tech stack**: Next.js 14 App Router + TypeScript estrito + Tailwind — decidido pelo cliente
- **Banco**: PostgreSQL via Supabase (DX + free tier)
- **Pagamentos**: Mercado Pago obrigatório (PIX/cartão/boleto) — mercado BR
- **Frete**: Melhor Envio obrigatório (PAC/SEDEX/Mini Envios)
- **E-mail**: Resend com templates React Email
- **WhatsApp**: Evolution API ou Baileys
- **Upload**: Uploadthing
- **Deploy**: Vercel (frontend+API) + Supabase (banco+storage)
- **Monitoramento**: Sentry obrigatório em produção
- **LGPD**: fotos de crianças são dado sensível — marca d'água sempre, URLs não-listadas, retenção definida
- **Performance**: mobile-first 375px, imagens via next/image, skeleton loaders
- **Acessibilidade**: contraste AA mínimo, aria-labels, foco visível
- **Commits**: semânticos (feat/fix/chore/style), código em EN, comentários em PT-BR
<!-- GSD:project-end -->

<!-- GSD:stack-start source:research/STACK.md -->
## Technology Stack

## Executive Summary
- **Prisma 6** como ORM (maduro, migrations confiáveis com Supabase) com **Supavisor transaction pooler (porta 6543)** obrigatório na Vercel.
- **Auth.js v5 (ex-NextAuth)** — não v4, que está em manutenção.
- **Uploadthing** (cliente já decidiu) — tira do radar Cloudinary.
- **Mercado Pago SDK Node.js v2.x** com verificação de webhook via `x-signature` HMAC-SHA256 — obrigatória, documentação oficial ensina o processo exato.
- **Melhor Envio API v2 com OAuth2** — não Bearer token simples; sandbox em `sandbox.melhorenvio.com.br`.
- **Evolution API v2** — aceita mas sinalizada como risco: a Baileys (base da Evolution não oficial) vem perdendo corrida com mudanças do WhatsApp; recomendar migração para **WhatsApp Cloud API (Meta oficial)** via Evolution após validação do MVP.
- **react-pageflip** — última release 5 anos atrás. Funciona, mas frágil em React 19. Recomendamos **fixar `react@18` no package.json** ou substituir por componente custom com Framer Motion para o flipbook.
## Recommended Stack
### Core Technologies
| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | `14.2.x` (constraint do cliente) | Framework full-stack SSR + API | App Router + Server Components; SEO crítico em e-commerce. **Sinalizado:** 15.2.4 é o estável 2026 — usar 14 é decisão aceita mas legada. Confidence: HIGH |
| React | `18.3.x` | UI runtime | Casa com Next 14. **Não subir para React 19** sem testar react-pageflip e outras libs frágeis. Confidence: HIGH |
| TypeScript | `5.6.x` | Type safety | Cliente exigiu TS estrito (`strict: true`, sem `any`). Confidence: HIGH |
| Tailwind CSS | `3.4.x` | Utility-first styling | **NÃO usar Tailwind v4** — requer PostCSS engine nova e quebra muitos templates shadcn/ui. v3.4 é o maduro. Confidence: HIGH |
| Node.js | `20.x LTS` (runtime Vercel) | Server runtime | Mercado Pago SDK exige Node ≥ 16; Sharp e Prisma preferem 20 LTS. Confidence: HIGH |
| Prisma ORM | `6.x` | Type-safe DB client | Migrations + Prisma Studio; integração testada com Supabase. **Gotcha:** usar Supavisor transaction mode na Vercel. Confidence: HIGH |
| PostgreSQL (Supabase) | Postgres 15+ (gerenciado) | Banco relacional + Storage | Free tier viável pro MVP; Storage para fotos como fallback do Uploadthing. Confidence: HIGH |
| Auth.js (NextAuth v5) | `5.0.0` (beta estável) | Autenticação | v4 está em manutenção; v5 é o caminho forward, integra com App Router. Confidence: MEDIUM (v5 ainda tinha label "beta" em algumas refs mas é produção-ready com PrismaAdapter) |
### Supporting Libraries
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `@auth/prisma-adapter` | `^2.7` | Adapter Auth.js ↔ Prisma | Obrigatório para persistir sessions/accounts no Postgres |
| `mercadopago` (SDK oficial) | `^2.12.0` | PIX, cartão, boleto | Único SDK BR maduro que cobre PIX + boleto + checkout; SDK v2 é a rewrite oficial (não confundir com v1.5 legado) |
| `uploadthing` + `@uploadthing/react` | `^7.x` | Upload de fotos | Decisão do cliente; DX nativa Next.js, lida com presigned URLs automaticamente |
| `sharp` | `^0.33.x` | Marca d'água server-side | Watermark obrigatória em toda imagem pública (LGPD — fotos de crianças) |
| `resend` + `@react-email/components` | Resend `^4.x`, React Email `^3.x` | Transacional (5 templates) | DX superior a SendGrid/Mailgun; React components como templates |
| `zustand` | `^4.5.x` | State carrinho + wizard | Mais leve que Context API; persistência em localStorage trivial via middleware |
| `react-hook-form` + `@hookform/resolvers` | RHF `^7.53`, resolvers `^3.9` | Formulários (wizard, checkout) | Performance + integração Zod para validação |
| `zod` | `^3.23.x` | Schema validation (server + client) | Cliente pediu validação Zod no servidor; mesmo schema client-side |
| `lucide-react` | `^0.460.x` | Ícones | Padrão em stacks shadcn; tree-shakable |
| `clsx` + `tailwind-merge` | `clsx ^2.1`, tw-merge `^2.5` | Classe condicional | Helper `cn()` padrão |
| `react-pageflip` | `2.0.3` | Flipbook 3D na home | **Alerta:** última release 2020. Se mantido, fixar React 18. Alternativa: custom com Framer Motion. |
| `@sentry/nextjs` | `^8.x` | Observabilidade produção | Cliente exigiu; instrumenta client + server + edge |
| `@vercel/analytics` | `^1.3.x` | Web analytics (exigido pelo cliente) | Plug-and-play com Next |
| `next-safe-action` (opcional) | `^7.9.x` | Server actions type-safe | Útil pros handlers do wizard/checkout com Zod integrado |
| `@melhorenvio/sdk-php` | N/A — não existe SDK oficial JS | N/A | Consumir REST API diretamente via `fetch` ou `axios`; SDK não-oficial `talissonf/melhor-envio-sdk` existe mas é desatualizado |
### Development Tools
| Tool | Purpose | Notes |
|------|---------|-------|
| ESLint | Lint | Cliente exigiu. Preset `next/core-web-vitals` + `@typescript-eslint` |
| Prettier | Formatação | Cliente exigiu. Plugin `prettier-plugin-tailwindcss` para ordenar classes |
| Husky + lint-staged | Pre-commit hooks | Cliente exigiu. Rodar eslint + prettier em staged files |
| Prisma Studio | GUI do banco | `npx prisma studio` — essencial para admin debug antes do painel estar pronto |
| React Email CLI | Preview templates | `npx email dev` — desenvolvimento de emails isolado |
| `dotenv-cli` | Rodar scripts com `.env` | Útil para seeds e migrations apontando pra sandbox |
| Vercel CLI | Deploy + env vars | Sincronizar `.env.local` com ambiente de preview/prod |
## Installation
# 1. Bootstrap (comando do cliente — mantido)
# 2. Core: DB + Auth + Validation
# 3. UI + State + Utils
# 4. Integrações BR
# 5. Media + Flipbook
# 6. Observability
# 7. Pin React 18 para evitar conflito com react-pageflip
# (se receber propostas de subir para React 19, BLOQUEAR)
# 8. Prisma bootstrap
# editar prisma/schema.prisma e rodar:
# Editar .husky/pre-commit para rodar: npx lint-staged
## Alternatives Considered
| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Next.js 14 | **Next.js 15.2.4** | Se cliente aceitar flexibilizar constraint — ganha Turbopack estável + async Request APIs + React 19. Migração futura pós-MVP é viável com codemods. |
| Supabase Postgres | **Neon** | Neon tem melhor branching DB para preview envs Vercel; Supabase vence por trazer Storage + Auth bundled. |
| Uploadthing | **Cloudinary** | Cloudinary ganha se precisar transformações complexas (crop, CDN global, AI tagging). MVP não precisa. |
| Uploadthing | **Supabase Storage direto** | Se orçamento zero — Supabase free tier inclui 1GB storage. Trade-off: mais boilerplate vs DX do Uploadthing. |
| Auth.js v5 | **Clerk** | Clerk tem DX superior e MFA/SSO out-of-the-box, mas $25/mo a partir de 10k MAUs. Overkill pro MVP BR. |
| Auth.js v5 | **Supabase Auth** | Consolida em um provider só. Perdemos o tipo de integração profunda com Prisma que o cliente pediu. |
| Prisma | **Drizzle** | Drizzle é mais rápido, edge-friendly e SQL-first. Prisma vence por maturidade + Prisma Studio + migrations robustas para domínio CRUD simples. |
| Mercado Pago | **Stripe + PIX via Pix.me** | Stripe é DX superior, mas PIX nativo BR é obrigatório e Stripe ainda não cobre direito boleto/parcelamento 12x BR. MP é obrigatório no mercado BR. |
| Resend | **SendGrid / AWS SES** | SES é 10x mais barato em volume alto. MVP com <10k emails/mês: Resend vence por DX (React Email). |
| Evolution API | **WhatsApp Cloud API (oficial Meta)** | **Recomendamos migrar pós-MVP.** Oficial é mais estável, conforme com ToS, e Evolution v2 já suporta Cloud API por baixo dos panos. Cloud API é paga ($0.005-0.05 por conversa BR). |
| Evolution API | **Baileys direto** | Baileys é a lib que a Evolution encapsula. Usar direto só se quiser controle total + menos dependências — perdemos o painel/webhooks da Evolution. |
| react-pageflip | **Custom Framer Motion + CSS 3D transforms** | Se react-pageflip quebrar em React 19 ou der problema de SSR — fazer FlipBook custom com `transform: rotateY()` + Framer. Mais trabalho inicial, zero dívida. |
| Zustand | **Jotai** | Jotai é atomic e ganha em apps com muitos estados granulares. Carrinho + wizard cabem bem em Zustand single store. |
## What NOT to Use
| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Tailwind CSS v4** | Engine nova (Lightning CSS) quebra muitos plugins e shadcn/ui ainda não tem suporte full. Gotchas de PostCSS. | Tailwind 3.4.x |
| **Next.js Pages Router** | Entering maintenance mode em 2026. Cliente exigiu App Router, correto. | App Router (Next 14+) |
| **`mercadopago` v1.5** (SDK legado) | SDK v1 descontinuado; APIs antigas sem suporte a order/preference modernos. Não está mais no README oficial. | `mercadopago@^2.12` (SDK v2 rewrite) |
| **NextAuth v4** | Em modo manutenção; v5 é o caminho forward. Rebrand oficial para Auth.js. | `next-auth@beta` (v5) + `@auth/prisma-adapter` |
| **`@next-auth/prisma-adapter`** (adapter v4) | Package antigo — nome mudou. | `@auth/prisma-adapter` (v5) |
| **Cloudinary free tier para fotos de crianças** | Não permite restringir acesso só a usuários autenticados no free — URLs públicas são indexáveis. **Violação potencial de LGPD.** | Uploadthing (signed URLs) ou Supabase Storage com RLS |
| **Correios API direto** | Autenticação via token exclusivo para clientes com contrato comercial Correios; API oficial descontinuou WebService SOAP antigo. Burocrática. | Melhor Envio agrega Correios + transportadoras privadas sob uma API OAuth2 única |
| **React 19** (durante a vigência do react-pageflip) | `react-pageflip@2.0.3` é de 2020; peer deps quebram. Framer Motion v11 também tem edge cases. | React 18.3.1 pinned até trocar flipbook |
| **Prisma direct connection (porta 5432) na Vercel** | Esgota connection pool do Supabase em segundos sob carga (cada cold start abre conexão nova). | Supavisor transaction pooler na porta **6543** com `connection_limit=1` |
| **Armazenar fotos de crianças em bucket público** | Violação de LGPD Art. 14 — fotos são dado sensível de menor. ANPD pode autuar. | Storage com signed URLs expiring + watermark obrigatória em qualquer preview público |
| **WhatsApp via Web scraping (wppconnect, venom-bot legado)** | Bloqueios frequentes pelo WhatsApp; violam ToS. Mesma zona cinzenta da Baileys mas com pior uptime. | Evolution API (Baileys) para MVP, migrar para WhatsApp Cloud API oficial em produção |
| **`crypto-js` para verificar webhook MP** | Biblioteca desnecessária — Node tem `crypto` nativo e docs MP mostram com nativo. Adiciona peso. | `node:crypto` (built-in) para HMAC-SHA256 |
| **ViaCEP sem fallback** | API gratuita sem SLA — cai algumas vezes por mês. | ViaCEP primário + BrasilAPI (`brasilapi.com.br/api/cep/v2/{cep}`) como fallback |
## Stack Patterns by Variant
### If o cliente aceitar flexibilizar para Next.js 15:
- Use **Next.js 15.2.4** + React 19
- Async Request APIs (`await cookies()`, `await params`) — os codemods oficiais cuidam
- GET Route Handlers ficam **uncached por padrão** — revisar webhooks
- Turbopack estável reduz `npm run dev` em 5-10x
- **Trade-off:** react-pageflip não funciona em React 19 — trocar por implementação Framer Motion custom
### If escala passar de 500 pedidos/mês (pós-MVP):
- Adicionar **Redis (Upstash)** para rate-limit de webhooks MP + cache de frete Melhor Envio (calcular frete tem custo de request)
- Mover WhatsApp para **Cloud API oficial Meta** via Evolution (Evolution v2 suporta) — Baileys começa a falhar em volume
- Mover Storage para **S3 + CloudFront** (Supabase Storage tem limites de bandwidth)
- Considerar **queue (BullMQ + Redis)** para processar marca d'água assincronamente — Sharp em serverless tem cold start caro
### If foto de criança ficar realmente sensível legalmente:
- Adicionar **criptografia em repouso** (Supabase Storage já criptografa, mas adicionar camada extra com `node:crypto` AES-256 antes do upload)
- Implementar **política de retenção** — deletar fotos após 30 dias da entrega confirmada
- Adicionar **termo de consentimento LGPD Art. 14 específico** no wizard passo 6 (upload de fotos), com checkbox obrigatório confirmando que o adulto é pai/mãe/responsável legal
### If orçamento de infra apertar:
- **Railway** como alternativa à Vercel — $5/mo vs pay-per-use; Prisma + Postgres na mesma plataforma reduz latência
- Supabase free tier cobre MVP (500MB DB, 1GB storage, 50k MAU)
## Version Compatibility
| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| `next@14.2.x` | `react@18.3.x` | Next 14 exige React 18; React 19 só a partir de Next 15 |
| `next@14.2.x` | `tailwindcss@3.4.x` | Tailwind 4 possível mas sem garantia com templates shadcn |
| `next-auth@5.0.0-beta` | `@auth/prisma-adapter@^2` | **Não** usar `@next-auth/prisma-adapter` (v4) — nome mudou |
| `react-pageflip@2.0.3` | `react@18.x` (max) | Peer deps quebram em React 19; **pinnar React 18** |
| `prisma@6.x` + `@prisma/client@6.x` | Node.js ≥ 18.18 | Ambos devem ter mesma versão major — sempre subir juntos |
| `mercadopago@^2.12` | Node.js ≥ 16 | SDK v2 rewrite; **não confundir com v1.5 legado** |
| `sharp@^0.33` | Node 18.17+ / 20+ | Vercel já traz binário pré-compilado linux-x64; local no Windows exige rebuild após `npm install` |
| `@sentry/nextjs@^8` | Next 13.2+ | Usa wrapper de instrumentação; config via `sentry.{client,server,edge}.config.ts` |
| Supabase Postgres | Prisma via `pgbouncer=true&connection_limit=1` | **Obrigatório** na Vercel; senão esgota pool em 30s de tráfego |
## BR-Specific Gotchas (críticos)
### 1. Mercado Pago Webhook — verificação `x-signature`
### 2. Melhor Envio — OAuth2, não Bearer estático
### 3. Sharp na Vercel Serverless
### 4. LGPD Art. 14 — fotos de crianças
- **Consentimento específico e destacado** de pai/mãe/responsável legal — não pode ser enterrado em ToS genérico.
- Marca d'água obrigatória em qualquer preview público.
- URLs de storage devem ser **não-listadas** (signed URLs com expiração).
- Controlador deve manter **transparência pública** sobre tipos de dados coletados, uso e procedimentos de exercício de direitos (página `/privacidade` obrigatória).
- ANPD pode fiscalizar — autuações já ocorreram em 2024-2025 para tratamento inadequado de dados de menores.
- **Retenção:** definir política (ex: deletar fotos após 90 dias da entrega) e documentar no termo.
### 5. Evolution API — risco de médio prazo
- **Plano B:** Evolution v2 suporta **WhatsApp Cloud API (Meta oficial)** — migração é uma config, não re-implementação.
- Isolar o código de WhatsApp em `lib/whatsapp.ts` com interface `enviarMensagem(telefone, mensagem)` — troca de provider fica trivial.
- Considerar custo Cloud API pós-MVP: ~R$ 0,03 por conversa iniciada pelo negócio (BR). Para 500 pedidos/mês × 4 mensagens = ~R$ 60/mês. Viável.
### 6. Prisma + Supabase na Vercel — connection pool
# .env.production
## Sources
- [Next.js 15 release](https://nextjs.org/blog/next-15) — versão estável atual, breaking changes (HIGH)
- [Next.js upgrade guide v15](https://nextjs.org/docs/app/guides/upgrading/version-15) — codemods e async APIs (HIGH)
- [Mercado Pago SDK Node.js GitHub](https://github.com/mercadopago/sdk-nodejs) — v2.12, Node ≥ 16 (HIGH)
- [Mercado Pago PIX Docs](https://www.mercadopago.com.br/developers/en/docs/checkout-api/integration-configuration/integrate-with-pix) — payment_method_id: 'pix' (HIGH)
- [Mercado Pago Webhooks Notificações](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/additional-content/notifications/webhooks) — processo x-signature HMAC-SHA256 (HIGH)
- [Mercado Pago Webhook Signature Discussion](https://github.com/mercadopago/sdk-nodejs/discussions/318) — gotchas validação prod vs teste (HIGH)
- [Melhor Envio API Docs](https://docs.melhorenvio.com.br/reference/introducao-api-melhor-envio) — endpoints v2 (HIGH)
- [Melhor Envio Sandbox](https://docs.melhorenvio.com.br/docs/sandbox) — ambiente teste OAuth2 (HIGH)
- [Evolution API GitHub](https://github.com/EvolutionAPI/evolution-api) — v2, Cloud API integrado (HIGH)
- [Evolution API Cloud API Docs](https://doc.evolution-api.com/v2/en/integrations/cloudapi) — migração para oficial (HIGH)
- [Auth.js Prisma Adapter](https://authjs.dev/getting-started/adapters/prisma) — v5 (HIGH)
- [Supabase Prisma Troubleshooting](https://supabase.com/docs/guides/database/prisma/prisma-troubleshooting) — Supavisor pooler port 6543 (HIGH)
- [Supabase Prisma Integration](https://supabase.com/docs/guides/database/prisma) — DATABASE_URL + DIRECT_URL (HIGH)
- [Resend Next.js Docs](https://resend.com/docs/send-with-nextjs) — App Router integration (HIGH)
- [Install sharp for Next.js](https://nextjs.org/docs/messages/install-sharp) — oficial (HIGH)
- [react-pageflip npm](https://www.npmjs.com/package/react-pageflip) — última release 2.0.3 de 5 anos (HIGH)
- [ANPD enunciado dados crianças](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-divulga-enunciado-sobre-o-tratamento-de-dados-pessoais-de-criancas-e-adolescentes) — consentimento específico (HIGH)
- [LGPD Art. 14 — dados crianças](https://lgpd-brasil.info/capitulo_02/artigo_14) — texto da lei (HIGH)
- [Evolution API vs Baileys vs Venom](https://horadecodar.com.br/evolution-api-vs-baileys-vs-venom/) — análise BR (MEDIUM)
- [API oficial WhatsApp vs não oficial 2026](https://www.agenciarollin.com/blog/api-oficial-whatsapp-vs-nao-oficial-guia-completo-2026) (MEDIUM)
- [Next.js 15 is stable](https://www.abhs.in/blog/nextjs-current-version-march-2026-stable-release-whats-new) — 15.2.4 estável março 2026 (MEDIUM)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, or `.github/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
