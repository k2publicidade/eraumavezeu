# Roadmap: Era Uma Vez Eu

## Overview

E-commerce BR premium de livros infantis personalizados com IA humano-in-the-loop. A jornada vai de uma fundação segura (Auth.js + Prisma + Supavisor pooler + guards + Sentry PII-scrubbed) passando por site institucional (RSC puro), wizard de personalização de 7 passos com upload LGPD-safe de fotos de crianças, carrinho com desconto combo, checkout BR completo (PIX/Cartão 12x/Boleto via Mercado Pago + frete Melhor Envio), comunicação omnichannel (e-mail Resend + WhatsApp Evolution com fallback), área do cliente e admin, terminando em polimento, conformidade LGPD operacional (retenção 90d, DPO) e go-live com Lighthouse ≥80.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 0: Fundação & Guard-Rails** - Next 14 + Prisma pooler + Auth.js v5 + middleware + guards + Sentry PII-scrub + seed dos 5 produtos
- [ ] **Phase 1: Site Institucional** - Home + Como Funciona + Produtos + Galeria + FAQ + Quem Somos + Contato + identidade visual (paralelo às Fases 2-5)
- [ ] **Phase 2: Wizard + Upload + LGPD Estrutural** - Wizard 7 passos (Zustand+persist fileKey-only), Uploadthing privado, consent explícito, watermark server-side, gerarPromptIA testável
- [ ] **Phase 3: Carrinho + Regras de Preço** - Cart store persistente + `applyComboDiscount` puro testado + página carrinho + cross-sell card
- [ ] **Phase 4: Checkout + Frete + Pagamento** - Checkout 3 etapas, ViaCEP+BrasilAPI, Melhor Envio, Mercado Pago (PIX/Cartão/Boleto), webhook HMAC idempotente, cron reconciliação
- [ ] **Phase 5: Comunicação (E-mail + WhatsApp)** - 5 templates React Email, DKIM/SPF/DMARC, Evolution API com chip dedicado + warmup + rate limit + fallback e-mail, opt-in não-ticado
- [ ] **Phase 6: Área do Cliente + Painel Admin** - `/pedidos` + timeline + rastreio + perfil; `/admin` dashboard + tabela + detalhe + StatusSelect + prompt IA copy + export CSV
- [ ] **Phase 7: Polimento + LGPD Operacional + Go-Live** - FlipBook 3D, SEO avançado, cron retenção 90d, DPO, política privacidade de menores, Supabase Pro, Sentry alerts, Lighthouse ≥80, LCP <2.5s

## Phase Details

### Phase 0: Fundação & Guard-Rails
**Goal**: Infraestrutura de segurança e integração está pronta antes de qualquer código de produto — guards de auth, pooler Supavisor, Sentry com scrub de PII e interface WhatsApp abstraída
**Depends on**: Nothing (first phase)
**Requirements**: FND-01, FND-02, FND-03, FND-04, FND-05, FND-06, FND-07, FND-08, LGPD-05
**Success Criteria** (what must be TRUE):
  1. `pnpm dev` roda Next 14 com TypeScript estrito e Tailwind sem erros
  2. Prisma conecta no Supavisor pooler (6543) para runtime e 5432 só para migrations; schema completo (User, Product, Order, OrderItem, Customization, Address, OrderStatusHistory) migrado
  3. Auth.js v5 autentica com email/senha e Google; `requireAuth()` e `requireAdmin()` bloqueiam acesso não autorizado em Server Actions e rotas
  4. Sentry captura erros em dev mas `beforeSend` remove fotos, telefones e CPF antes do envio
  5. `lib/whatsapp.ts` expõe `sendMessage()` mockado — swap Evolution → WhatsApp Cloud é configuração, não refactor
  6. Seed cria os 5 produtos (livro principal, e-book, colorir, quebra-cabeça, adesivos) com preços do brief
**Plans**: TBD
**Research needed**: No (standard Next 14 + Prisma + Auth.js v5 patterns)
**UI hint**: no

### Phase 1: Site Institucional
**Goal**: Visitante navega o site premium mobile-first, entende o produto em até 30s, encontra respostas no FAQ e tem 1 clique pro WhatsApp em qualquer página
**Depends on**: Phase 0
**Requirements**: SITE-01, SITE-02, SITE-03, SITE-04, SITE-05, SITE-06, SITE-07, SITE-08, SITE-09
**Success Criteria** (what must be TRUE):
  1. Visitante acessa `/` e vê hero + CTA "Criar meu livro" + 3 badges + seções (Como Funciona, Produtos, Galeria, Depoimentos, CTA final)
  2. Visitante navega `/como-funciona` (timeline 8 passos), `/produtos` (grid 2x2), `/galeria` (filtro por tema), `/faq` (≥12 perguntas), `/quem-somos`, `/contato`
  3. Header + Footer globais funcionam em todas rotas com WhatsApp floating button persistente
  4. Identidade visual aplicada (paleta laranja+roxo, Playfair Display + Inter + Dancing Script) e design mobile-first funciona em 375px
  5. SEO: cada rota tem metadata + Open Graph; sitemap.xml + robots.txt (bloqueando `/admin` e `/cliente`) servidos
**Plans**: TBD
**Research needed**: No (RSC + metadata + ISR standard patterns)
**UI hint**: yes

### Phase 2: Wizard + Upload + LGPD Estrutural
**Goal**: Adulto completa os 7 passos do wizard sem perder progresso, sobe fotos da criança com consentimento LGPD explícito e fotos ficam em bucket privado com marca d'água server-side — ao final, `gerarPromptIA()` produz o prompt PT-BR que a equipe usará em ferramentas externas
**Depends on**: Phase 0, Phase 1 (parcial — pode rodar em paralelo)
**Requirements**: WIZ-01, WIZ-02, WIZ-03, WIZ-04, WIZ-05, WIZ-06, WIZ-07, WIZ-08, WIZ-09, WIZ-10, LGPD-01, LGPD-02
**Success Criteria** (what must be TRUE):
  1. Usuário percorre os 7 passos (tema, gênero, estilo, cor, faixa etária, fotos, nome+dedicatória+revisão) com barra de progresso e validação por etapa
  2. Usuário fecha o navegador e retorna em até 7 dias com "Continue de onde parou?" restaurando o progresso (Zustand+localStorage, apenas `fileKey` de fotos, nunca base64)
  3. Usuário sobe até 4 fotos via Uploadthing em bucket PRIVADO, vê preview + dicas "foto boa vs ruim" + aceita checkbox LGPD não-ticado com IP+timestamp+textVersion gravados no `Customization`
  4. Qualquer preview público de foto passa por `/api/watermark` (runtime Node, resize antes de compor, SVG tile) com signed URL TTL 15min
  5. Função pura `gerarPromptIA(customization)` é testada e produz prompt PT-BR completo para equipe de produção
  6. Passo 7 renderiza dedicatória em Dancing Script com preview visual do livro (tema+cor)
  7. Analytics registra abandono em cada um dos 7 passos (Vercel Analytics)
**Plans**: TBD
**Research needed**: Yes — `/gsd-research-phase` para política exata de retenção e benchmark Sharp com fotos reais iPhone em Vercel Hobby (não-negociável por risco OOM + LGPD Art. 14)
**UI hint**: yes

### Phase 3: Carrinho + Regras de Preço
**Goal**: Usuário monta carrinho, vê desconto combo aplicado automaticamente (R$ 20 off por adicional quando livro principal presente) e tem cross-sell claro para aumentar ticket médio
**Depends on**: Phase 2
**Requirements**: CART-01, CART-02, CART-03, CART-04
**Success Criteria** (what must be TRUE):
  1. Usuário adiciona livro + adicional ao carrinho e vê R$ 20 de desconto destacado no resumo
  2. Usuário modifica quantidades, remove itens e carrinho persiste client-side (Zustand) entre sessões
  3. Usuário com só o livro principal no carrinho vê cross-sell card "economize R$ 20 adicionando colorir/quebra-cabeça/adesivos"
  4. Função pura `applyComboDiscount` em `lib/cart.ts` é testada e importada tanto pelo store (display) quanto por `createOrder` (autoridade server-side) — nunca diverge
  5. Página `/carrinho` mostra lista + subtotal + desconto + total + input CEP para frete estimado + botões Checkout/Continuar Comprando
**Plans**: TBD
**Research needed**: No (Zustand + função pura testável, standard)
**UI hint**: yes

### Phase 4: Checkout + Frete + Pagamento
**Goal**: Usuário completa compra em 3 etapas (identificação → entrega → pagamento) com preço sempre recalculado server-side, pagamento BR completo (PIX + Cartão 12x + Boleto) e webhook MP como fonte-da-verdade idempotente
**Depends on**: Phase 3
**Requirements**: PAY-01, PAY-02, PAY-03, PAY-04, PAY-05, PAY-06, PAY-07, PAY-08, PAY-09
**Success Criteria** (what must be TRUE):
  1. Usuário percorre checkout em 3 etapas (identificação com guest checkout, entrega com CEP autopreenchido via ViaCEP/BrasilAPI, pagamento) em stepper interno
  2. Cálculo de frete retorna PAC/SEDEX/Mini com prazo + preço reais via Melhor Envio
  3. Usuário paga via PIX (QR + copia-e-cola + polling), Cartão 12x sem juros ou Boleto e vê página de sucesso com número do pedido
  4. Preço final é recalculado server-side em `createOrder` (transação) a partir do banco — nunca confia no client
  5. Webhook `/api/webhook/mercadopago` verifica HMAC `x-signature`, re-busca via `payment.get(id)`, deduplica por `paymentId UNIQUE`, responde em <5s
  6. Cron diário de reconciliação detecta pagamentos aprovados no MP sem webhook processado e processa retroativamente
**Plans**: TBD
**Research needed**: Yes — `/gsd-research-phase` para confirmar Personal Access Token MelhorEnvio vs OAuth2, dimensões+peso exatos do livro 20 páginas capa dura (cliente/gráfica), fluxo completo MP sandbox+ngrok
**UI hint**: yes

### Phase 5: Comunicação (E-mail + WhatsApp)
**Goal**: Cliente recebe notificação certa no canal certo em cada transição de status — e-mail com marca verificada (DKIM/SPF/DMARC) + WhatsApp com chip dedicado e rate limit, com fallback automático para e-mail se Evolution cair
**Depends on**: Phase 4 (precisa de pedidos reais para disparar notificações)
**Requirements**: COMM-01, COMM-02, COMM-03, COMM-04, COMM-05, COMM-06, COMM-07
**Success Criteria** (what must be TRUE):
  1. Cliente recebe os 5 e-mails transacionais (confirmação, pagto aprovado, em produção, enviado c/ tracking, entregue c/ avaliação) com domínio verificado (mail-tester ≥9/10)
  2. Cliente que optou-in via checkbox não-ticado recebe notificações WhatsApp nas transições de status via Evolution API com chip dedicado + warmup + rate limit 1msg/10-30s com jitter
  3. Quando Evolution API falha (monitor `connectionState`), sistema cai para e-mail automaticamente sem perder notificação
  4. Transições de status disparam e-mail + WhatsApp em paralelo (não sequencial)
  5. `lib/whatsapp.ts` tem implementação Evolution plugada na interface da Fase 0 — swap para WhatsApp Cloud API continua sendo configuração
**Plans**: TBD
**Research needed**: Yes — `/gsd-research-phase` para conteúdo/timing das 5 msgs WhatsApp + 5 e-mails com cliente; decisão inline vs QStash/Inngest se webhook passar de 5s em prod
**UI hint**: no (templates React Email contam como UI mas não frontend app)

### Phase 6: Área do Cliente + Painel Admin
**Goal**: Cliente acompanha seus pedidos com timeline visual e rastreio; admin gerencia pedidos com dashboard + filtros + export + ações (mudar status, código rastreio, reenviar notificação) com guards em 3 camadas
**Depends on**: Phase 5 (notificações integradas aos disparos admin)
**Requirements**: CLI-01, CLI-02, CLI-03, CLI-04, CLI-05, CLI-06, ADM-01, ADM-02, ADM-03, ADM-04, ADM-05, ADM-06
**Success Criteria** (what must be TRUE):
  1. Cliente logado acessa `/pedidos` e vê lista paginada com badge de status colorido; clica em um pedido e vê detalhe completo com timeline visual + dados de personalização + fotos enviadas
  2. Cliente vê link de rastreamento Correios/transportadora quando código disponível e edita dados básicos em `/perfil`
  3. Cliente aciona `DELETE /api/cliente/fotos/:orderId` e suas fotos são removidas (direito LGPD de exclusão sob demanda)
  4. Admin acessa `/admin/dashboard` e vê métricas (pedidos hoje, receita mês, em produção, pendentes envio) + gráfico 30d + últimos 5 pedidos
  5. Admin lista pedidos em tabela paginada com filtros (status/data/produto) + busca (nome/número) + export CSV
  6. Admin abre detalhe do pedido e vê fotos com download + prompt IA com botão copy one-click + altera status (registrado em `OrderStatusHistory`) + adiciona código de rastreio + reenvia e-mail/WhatsApp
  7. Usuário não-ADMIN acessando `/admin` recebe `notFound()` (middleware + layout + `requireAdmin()` em toda Server Action)
**Plans**: TBD
**Research needed**: No (CRUD + Server Actions + paginação cursor padrão)
**UI hint**: yes

### Phase 7: Polimento + LGPD Operacional + Go-Live
**Goal**: Produto vai para produção com FlipBook 3D na home, conformidade LGPD operacional completa (retenção 90d, DPO, política para menores), performance Lighthouse ≥80 e monitoramento/alertas em prod
**Depends on**: Phase 6
**Requirements**: LGPD-03, LGPD-04, OPS-01, OPS-02, OPS-03, OPS-04, OPS-05, OPS-06, OPS-07, OPS-08
**Success Criteria** (what must be TRUE):
  1. Home carrega FlipBook 3D interativo (dynamic import SSR:false, react-pageflip com React 18 pinned) com fallback gracioso se quebrar
  2. Cron Vercel diário (CRON_SECRET + idempotente) deleta fotos de pedidos com status ENTREGUE há >90 dias; ação logada
  3. Política de privacidade pública e específica sobre fotos de crianças identifica o DPO e canal de contato
  4. Site em produção no domínio + SSL; Supabase Pro ativo (PITR + limites); DNS Resend verificado (DKIM+SPF+DMARC); Sentry alerts configurados (Slack/e-mail)
  5. Vercel Analytics + Core Web Vitals coletando; Lighthouse mobile ≥80 com LCP <2.5s
  6. QA cross-browser (Chrome, Safari, Firefox, Safari iOS) e mobile 375px passa sem quebras críticas
**Plans**: TBD
**Research needed**: Yes — `/gsd-research-phase` para decidir react-pageflip vs custom Framer (pivot se quebrar em React 18 pinned) e cron schedule idempotente
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in numeric order: 0 → 1 → 2 → 3 → 4 → 5 → 6 → 7
(Phase 1 pode rodar em paralelo com Fases 2-5 — thread não-crítica de Site Institucional)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 0. Fundação & Guard-Rails | 0/TBD | Not started | - |
| 1. Site Institucional | 0/TBD | Not started | - |
| 2. Wizard + Upload + LGPD | 0/TBD | Not started | - |
| 3. Carrinho + Preços | 0/TBD | Not started | - |
| 4. Checkout + Frete + Pagamento | 0/TBD | Not started | - |
| 5. Comunicação (E-mail + WhatsApp) | 0/TBD | Not started | - |
| 6. Cliente + Admin | 0/TBD | Not started | - |
| 7. Polimento + LGPD + Go-Live | 0/TBD | Not started | - |

## Coverage

- **v1 requirements:** 72 total (FND 8 + SITE 9 + WIZ 10 + CART 4 + PAY 9 + COMM 7 + CLI 6 + ADM 6 + LGPD 5 + OPS 8)
- **Mapped to phases:** 72 (100%)
- **Unmapped:** 0
- **Phases:** 8 (Phase 0–7)
- **Granularity:** standard (8 phases within 5-8 target — on upper edge, justified by e-commerce BR compliance+financial complexity)

### Research Flags Summary

| Phase | Research needed? | Reason |
|-------|------------------|--------|
| 0 | No | Standard Next 14 + Prisma + Auth.js v5 |
| 1 | No | RSC + metadata + ISR standard |
| 2 | **Yes** | LGPD retenção policy + Sharp/iPhone benchmark Vercel |
| 3 | No | Zustand + pure function |
| 4 | **Yes** | Melhor Envio auth model + book dims + MP sandbox flow |
| 5 | **Yes** | Messaging copy/timing + queue decision (inline vs QStash) |
| 6 | No | CRUD + Server Actions + pagination |
| 7 | **Yes** | react-pageflip vs Framer + cron idempotency |

### UI Phase Flags

Phases marked `UI hint: yes` should consider `/gsd-ui-phase` for component design spec:
- Phase 1 (Site Institucional)
- Phase 2 (Wizard + Upload)
- Phase 3 (Carrinho)
- Phase 4 (Checkout)
- Phase 6 (Cliente + Admin)
- Phase 7 (FlipBook + Galeria filtrável)
