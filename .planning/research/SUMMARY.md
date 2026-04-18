# Project Research Summary

**Project:** Era Uma Vez Eu
**Domain:** E-commerce BR premium de livros infantis personalizados com IA humano-in-the-loop (gift commerce + dado pessoal sensível de criança)
**Researched:** 2026-04-18
**Confidence:** HIGH

## Executive Summary

"Era Uma Vez Eu" é um e-commerce BR de presente premium onde um adulto passa por um wizard de 7 passos, envia até 4 fotos da criança e recebe um livro físico capa dura produzido por equipe humana que usa o prompt gerado pelo sistema em ferramentas externas de IA. O produto opera em três domínios com restrições pesadas: **e-commerce BR** (PIX/boleto/parcelamento/Correios não-negociáveis), **gift commerce** (comprador ≠ destinatário, ansiedade por prazo) e **dado pessoal sensível de menor** (LGPD Art. 14 exige consentimento destacado, retenção limitada e marca d'água obrigatória).

Recomendação técnica: **Next.js 14 App Router + Prisma 6 + Supabase Postgres via Supavisor pooler (6543) + Auth.js v5 + Mercado Pago SDK v2 + Melhor Envio REST + Resend/React Email + Evolution API com interface abstrata**. Mutations passam por Server Actions com `requireAdmin()`/`requireAuth()` + Zod. Webhook MP é fonte-da-verdade com HMAC-SHA256 e idempotência por `paymentId UNIQUE`. Wizard é client-side (Zustand+persist) armazenando apenas `fileKey` das fotos. Preço **sempre** recalculado server-side.

Riscos estruturais não são técnicos padrão — são de **conformidade** e **canal**: (1) bucket público ou retenção indefinida = violação LGPD crítica; (2) webhook MP sem HMAC/idempotência = pedidos fantasma e duplicação financeira; (3) Evolution API pode ser banida em 2-8 semanas; (4) Sharp em Vercel Hobby estoura OOM com fotos de iPhone sem resize prévio.

## Key Findings

### Recommended Stack (ver STACK.md)

- **Next.js 14.2.x + React 18.3.1 pinned** — React 18 fixado (react-pageflip@2.0.3 quebra em React 19)
- **TypeScript 5.6 estrito + Tailwind 3.4.x** (NÃO subir para Tailwind 4)
- **Prisma 6 + Supabase via Supavisor** — `DATABASE_URL` 6543 (`pgbouncer=true&connection_limit=1`) + `DIRECT_URL` 5432 só para migrations
- **Auth.js v5 (`next-auth@beta`) + `@auth/prisma-adapter`**
- **Mercado Pago SDK v2.12+** (não v1.5 legado)
- **Melhor Envio REST v2** — Personal Access Token; PAC=1, SEDEX=2, Mini=17; cm+kg
- **Uploadthing 7.x (bucket privado) + Sharp 0.33 runtime Node.js**
- **Resend 4 + React Email 3** — DKIM+SPF+DMARC obrigatórios antes do 1º envio
- **Evolution API v2 com interface abstrata `lib/whatsapp.ts`** — fallback e-mail obrigatório
- **Zustand 4.5 + persist** — nunca base64 de foto no localStorage
- **Sentry 8 + Vercel Analytics** — `beforeSend` deve limpar PII

### Expected Features (ver FEATURES.md)

**Must have (table stakes):**
- PIX (QR + copia-e-cola + polling) + Cartão 12x sem juros + Boleto
- ViaCEP + fallback BrasilAPI + Melhor Envio real-time + estimativa "chega até DD/MM"
- Guest checkout (sem ele: -35% conversão em primeira compra)
- WhatsApp floating button + notificações de status
- Badge LGPD + consent checkbox explícito no Passo 6
- Timeline visual no cliente + rastreamento Correios
- Mobile-first 375px funcional

**Should have (differentiators):**
- FlipBook 3D na home com marca d'água
- Wizard com persistência localStorage + TTL 7d ("Continue de onde parou?")
- Preview lateral no wizard
- Dedicatória com preview Dancing Script
- Dicas visuais foto boa vs ruim + validação client-side
- Prompt IA gerado automaticamente no admin
- Combo "compre junto economize R$ 20"
- Galeria antes/depois filtrável

**Defer (v2+):** Geração IA integrada, aprovação de arte pelo cliente, e-book reader in-app, assinatura, multi-idioma, chat in-app

### Architecture Approach (ver ARCHITECTURE.md)

Arquitetura monolítica Next.js com **Route Groups** `(site)(loja)(cliente)(admin)` isolando layouts e guards sem poluir URL. RSC por padrão, `"use client"` só em ilhas interativas.

**Major components:**
1. Route Groups com layouts+guards isolados — `notFound()` no admin para não-ADMIN
2. Defesa em 3 camadas: middleware + layout + Server Action (middleware NÃO lê Prisma)
3. Wizard state machine persistida (Zustand + localStorage) — zero escrita DB até commit; fotos em Uploadthing, só `fileKey` persiste
4. Carrinho client-side + regras puras em `lib/cart.ts` — `applyComboDiscount` importada pelo store E pelo `createOrder`
5. Webhook MP idempotente + HMAC — `x-signature`, re-busca via `payment.get(id)`, dedup por `paymentId UNIQUE`, responde 200 em <22s
6. `/api/watermark` runtime Node — originais em bucket privado, públicos pré-watermarked, signed URLs TTL 15min
7. `lib/` como fronteira de integração — troca de Evolution → WhatsApp Cloud é config

### Critical Pitfalls (ver PITFALLS.md)

1. **Webhook MP sem HMAC/idempotência** — duplicação + pagamentos fantasma. Bloqueante antes de deploy.
2. **LGPD Art. 14 — bucket público ou retenção indefinida** — risco ANPD + reputacional crítico. Bucket privado + RLS + signed URLs TTL 15min + consent com IP+timestamp + cron 90d pós-ENTREGUE.
3. **Evolution API ban 2-8 semanas** — interface abstrata desde Fase 0/1 + chip dedicado + warmup + fallback e-mail obrigatório + opt-in não-ticado.
4. **Sharp OOM na Vercel + wizard perdendo dados Safari privado** — resize antes do watermark, maxDuration elevado, try/catch localStorage + feature detection, fotos NUNCA em localStorage.
5. **Preço manipulado client-side + Server Actions sem auth** — cliente envia só `productId+quantity`; helper `requireAdmin()` criado na Fase 0.

## Implications for Roadmap

### Phase 0: Fundação & Guard-Rails
Helpers `requireAdmin()`/`requireAuth()`, interface abstrata `lib/whatsapp.ts`, scrub PII no Sentry `beforeSend`, Supavisor pooler e middleware criados **antes** de qualquer Server Action.
**Delivers:** Next 14 + TS estrito + Prisma 6 pooler 6543 + Auth.js v5 + middleware + guards + Sentry + seed dos 5 produtos

### Phase 1: Site Institucional (paralelo à Fase 2)
RSC puro, baixo risco, entrega valor visível rápido. FlipBook fica para Fase 7.
**Delivers:** `(site)` com Home/Como Funciona/Produtos/Galeria/FAQ/Contato + SEO + WhatsApp button + Footer

### Phase 2: Wizard + Upload + LGPD (CRÍTICA — compliance estrutural)
Upload de fotos de crianças é o risco #1. LGPD é estrutural, não polish.
**Delivers:** Wizard 7 passos (Zustand+persist, fileKey-only), Uploadthing bucket privado, consent explícito com IP+timestamp, `/api/watermark` (Node, resize antes), badge LGPD, dicas visuais, `gerarPromptIA()` testável, analytics por passo

### Phase 3: Carrinho + Regras de Preço
`lib/cart.ts` pura importada pelo store E pelo `createOrder`.
**Delivers:** cartStore, `applyComboDiscount` testada, página carrinho, cross-sell card

### Phase 4: Checkout + Frete + Pagamento (CRÍTICA — financeira)
Webhook MP source-of-truth com HMAC + idempotência. Token Melhor Envio 30 dias exige refresh.
**Delivers:** ViaCEP+BrasilAPI, `/api/frete` cache 1h + recalc no commit, `lib/mercadopago.ts` + verifyMPSignature, Server Action `createOrder` em transação, `/api/webhook/mercadopago` com HMAC + `payment.get()` + UNIQUE + ON CONFLICT, monitor token ME (alerta 7d antes), cron reconciliação diário

### Phase 5: Comunicação — E-mail + WhatsApp
Evolution pode cair — fallback e-mail obrigatório. DKIM/SPF/DMARC ≥9/10 mail-tester antes do 1º envio.
**Delivers:** 5 templates React Email, `lib/resend.ts`, implementação Evolution em `lib/whatsapp.ts` (interface da Fase 0), chip dedicado + warmup, rate limit 1msg/10-30s + jitter, opt-in não-ticado, DNS verificado

### Phase 6: Área Cliente + Admin
Paginação obrigatória. Audit log de mudanças de status.
**Delivers:** `(cliente)` lista+timeline+rastreio+perfil; `(admin)` dashboard+tabela paginada+detalhe+StatusSelect+prompt IA copy-one-click+export CSV, `robots.txt` bloqueia /admin+/cliente, rate limits em actions guest

### Phase 7: Polimento + LGPD Operacional + Go-Live
FlipBook por último. Cron retenção 90d é bloqueante LGPD para prod. Upgrade Supabase Pro.
**Delivers:** FlipBook 3D (dynamic import SSR:false), galeria masonry com filtros URL, cron Vercel retenção (CRON_SECRET + idempotente), `DELETE /api/cliente/fotos/:orderId`, política privacidade fotos de crianças + DPO, Lighthouse mobile ≥80, LCP <2.5s, upgrade Supabase Pro, domínio+SSL+DNS Resend, Sentry alerts

### Phase Ordering Rationale

- **Fase 0 antes de tudo** — helpers auth e interface WhatsApp economizam refactor massivo
- **LGPD na Fase 2, não na 7** — bucket privado + consent + watermark são estruturais do upload
- **Pagamento (4) antes de Comunicação (5)** — notificações só com evento real
- **Carrinho (3) antes de Checkout (4)** — regras puras antes do `createOrder`
- **Site (1) paralelo às Fases 2–5** — não bloqueia thread crítica
- **Cliente+Admin (6) depois de pedidos reais**
- **FlipBook na Fase 7** — se quebrar em React 18 pinned, pivoteia para custom Framer sem atrasar launch

### Research Flags

**Needs `/gsd-research-phase`:**
- **Phase 2:** política exata de retenção; benchmark Sharp com fotos reais iPhone em Vercel Hobby
- **Phase 4:** confirmar Personal Access Token MelhorEnvio vs OAuth2; dimensões+peso exatos do livro; fluxo completo MP sandbox+ngrok
- **Phase 5:** conteúdo/timing das 5 msgs WhatsApp + 5 e-mails com cliente; decidir inline vs QStash/Inngest
- **Phase 7:** decidir react-pageflip vs custom Framer; cron schedule idempotente

**Standard patterns (skip research):**
- **Phase 0:** Next 14 + Prisma + Auth.js v5 padrão
- **Phase 1:** RSC + metadata + ISR padrão
- **Phase 3:** Zustand + função pura testável
- **Phase 6:** CRUD + Server Actions + paginação cursor padrão

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | Versões verificadas em docs oficiais/npm; gotchas BR vêm de docs oficiais |
| Features | HIGH | Triangulado: 2 líderes BR (DdH, Playstories), 2 benchmarks (Wonderbly, Hooray), Baymard, NN/g |
| Architecture | HIGH | Padrões Next 14 + Prisma + NextAuth estabelecidos |
| Pitfalls | HIGH | 9 pitfalls verificados em docs oficiais MP/Supabase/Vercel/ANPD |

**Overall confidence:** HIGH

### Gaps to Address

- `OrderStatusHistory` schema — validar se timeline rica é must-have MVP
- Fila notificações (QStash vs Inngest vs inline) — MVP inline OK; revisar se webhook passar de 5s em prod
- Retenção exata de fotos — 90d é padrão; validar com cliente
- Vínculo pedido guest → conta criada depois — UX pendente Fase 6
- Backup de banco — Supabase free tem PITR limitado; upgrade Pro na Fase 7
- A11y FlipBook — `react-pageflip` é visual-first; galeria linear alternativa
- Dimensões exatas do livro capa dura 20 pág — confirmar com gráfica antes da Fase 4
- Validação Dev vs Prod sandbox MP — ngrok + sandbox antes da Fase 5

---
*Research completed: 2026-04-18*
*Ready for roadmap: yes*
