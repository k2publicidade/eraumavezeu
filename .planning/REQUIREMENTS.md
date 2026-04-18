# Requirements: Era Uma Vez Eu

**Defined:** 2026-04-18
**Core Value:** Wizard de personalização claro e prazeroso que converte o adulto em comprador, gerando ao final um prompt de IA utilizável pela equipe de produção.

## v1 Requirements

### Foundation (FND)

- [ ] **FND-01**: Next.js 14 App Router + TypeScript estrito + Tailwind configurado
- [ ] **FND-02**: Prisma + Supabase Postgres via Supavisor pooler (DATABASE_URL 6543 + DIRECT_URL 5432)
- [ ] **FND-03**: Schema Prisma completo (User, Product, Order, OrderItem, Customization, Address, OrderStatusHistory) + migrations
- [ ] **FND-04**: Auth.js v5 configurado com email/senha + Google OAuth opcional
- [ ] **FND-05**: Middleware de auth + helpers `requireAuth()` / `requireAdmin()` disponíveis globalmente
- [ ] **FND-06**: Interface abstrata `lib/whatsapp.ts` (`sendMessage`) para permitir swap Evolution → WhatsApp Cloud
- [ ] **FND-07**: Sentry configurado com `beforeSend` limpando PII (fotos, telefones, CPF)
- [ ] **FND-08**: Seed dos 5 produtos (livro principal, e-book, colorir, quebra-cabeça, adesivos) com preços do brief

### Site Institucional (SITE)

- [ ] **SITE-01**: Home com hero + CTA + 3 badges + seções (Como Funciona resumida, Produtos, Galeria, Depoimentos, CTA final)
- [ ] **SITE-02**: Página "Como Funciona" com timeline de 8 passos + accordions por sub-opção
- [ ] **SITE-03**: Página "Produtos" com grid 2x2 + preços + botões contextuais
- [ ] **SITE-04**: Página "Galeria" antes/depois com filtro por tema (dinos, floresta, princesas, robôs, trem)
- [ ] **SITE-05**: Página "FAQ" com accordion de ≥12 perguntas
- [ ] **SITE-06**: Páginas "Quem Somos" e "Contato" (WhatsApp floating button global)
- [ ] **SITE-07**: Layout global: Header + Footer (links, contato, redes sociais, copyright)
- [ ] **SITE-08**: Identidade visual aplicada (paleta laranja/roxo, Playfair Display + Inter + Dancing Script)
- [ ] **SITE-09**: SEO: metadata por rota + Open Graph + sitemap.xml + robots.txt (bloqueia /admin + /cliente)

### Wizard de Personalização (WIZ)

- [ ] **WIZ-01**: Wizard de 7 passos (tema, gênero, estilo, cor, faixa etária, fotos, nome+dedicatória+revisão) com barra de progresso
- [ ] **WIZ-02**: Persistência do progresso em Zustand+localStorage com TTL 7 dias (fotos armazenadas apenas por `fileKey`, nunca base64)
- [ ] **WIZ-03**: Validação por etapa antes de avançar + "Continue de onde parou?" ao retornar
- [ ] **WIZ-04**: Passo 6 — Upload de até 4 fotos (drag&drop, preview, dicas visuais boa vs ruim) via Uploadthing em bucket privado
- [ ] **WIZ-05**: Consentimento LGPD explícito no Passo 6 (checkbox não-ticado + IP+timestamp+textVersion gravados)
- [ ] **WIZ-06**: Passo 7 — Nome da criança + dedicatória com preview em Dancing Script + revisão do pedido
- [ ] **WIZ-07**: Preview lateral visual do livro sendo montado conforme seleções (versão simplificada: varia tema+cor)
- [ ] **WIZ-08**: Função pura `gerarPromptIA(customization)` testada — gera prompt PT-BR completo para equipe
- [ ] **WIZ-09**: Analytics de abandono por passo (Vercel Analytics events)
- [ ] **WIZ-10**: Marca d'água server-side via `/api/watermark` (runtime Node, resize antes de compor, SVG tile)

### Carrinho + Preços (CART)

- [ ] **CART-01**: Carrinho persistente client-side (Zustand) com adicionar/remover/quantidade
- [ ] **CART-02**: Função pura `applyComboDiscount` em `lib/cart.ts` — R$ 20 off em cada adicional quando livro principal está no carrinho
- [ ] **CART-03**: Página `/carrinho` com lista, resumo (subtotal/desconto/total), CEP para frete estimado, botões de ação
- [ ] **CART-04**: Cross-sell card quando livro principal está no carrinho mas adicionais não

### Checkout + Frete + Pagamento (PAY)

- [ ] **PAY-01**: Checkout 3 etapas em stepper interno: identificação, entrega, pagamento
- [ ] **PAY-02**: Identificação — login/cadastro OU continuar como convidado (nome, email, telefone)
- [ ] **PAY-03**: Entrega — CEP com autopreenchimento ViaCEP (fallback BrasilAPI) + endereço completo
- [ ] **PAY-04**: Cálculo de frete via Melhor Envio (PAC, SEDEX, Mini quando aplicável) com prazo + preço
- [ ] **PAY-05**: Pagamento via Mercado Pago SDK v2: PIX (QR + copia-e-cola + polling), Cartão 12x, Boleto
- [ ] **PAY-06**: Server Action `createOrder` em transação — preço recalculado server-side a partir do banco
- [ ] **PAY-07**: Webhook `/api/webhook/mercadopago` com verificação HMAC `x-signature` + re-fetch `payment.get()` + idempotência via `paymentId UNIQUE` + responde em <5s
- [ ] **PAY-08**: Cron diário de reconciliação — detecta pagamentos aprovados sem webhook processado
- [ ] **PAY-09**: Página de sucesso com número do pedido + instruções por método de pagamento

### Comunicação (COMM)

- [ ] **COMM-01**: 5 templates React Email (confirmação, pagto aprovado, em produção, enviado c/ tracking, entregue c/ avaliação)
- [ ] **COMM-02**: `lib/resend.ts` com domínio verificado (DKIM+SPF+DMARC ≥9/10 em mail-tester)
- [ ] **COMM-03**: Implementação Evolution API em `lib/whatsapp.ts` (interface da Fase 0)
- [ ] **COMM-04**: Chip dedicado + warmup + rate limit 1msg/10-30s com jitter + variação de template
- [ ] **COMM-05**: Fallback automático para e-mail quando WhatsApp falha (monitor `connectionState`)
- [ ] **COMM-06**: Opt-in explícito de WhatsApp no checkout (checkbox não-ticado)
- [ ] **COMM-07**: Notificações disparadas nas transições de status (email + WhatsApp paralelos)

### Área do Cliente (CLI)

- [ ] **CLI-01**: `/pedidos` — lista de pedidos com badge de status colorido + paginação
- [ ] **CLI-02**: `/pedido/[id]` — resumo completo + dados de personalização + fotos enviadas
- [ ] **CLI-03**: Timeline visual do status do pedido com datas
- [ ] **CLI-04**: Rastreamento Correios/transportadora quando código disponível
- [ ] **CLI-05**: `/perfil` — dados básicos do usuário (editar nome/telefone)
- [ ] **CLI-06**: `DELETE /api/cliente/fotos/:orderId` — endpoint LGPD para exclusão sob demanda

### Painel Administrativo (ADM)

- [ ] **ADM-01**: `/admin/dashboard` com métricas (pedidos hoje, receita mês, em produção, pendentes envio) + gráfico 30d + últimos 5 pedidos
- [ ] **ADM-02**: `/admin/pedidos` — tabela paginada com filtros (status/data/produto) + busca (nome/número) + export CSV
- [ ] **ADM-03**: `/admin/pedido/[id]` — todos dados cliente + endereço + fotos com download + prompt IA (copy one-click)
- [ ] **ADM-04**: StatusSelect para alterar status + campo código de rastreamento + histórico em `OrderStatusHistory`
- [ ] **ADM-05**: Botões "reenviar email de confirmação" e "enviar WhatsApp"
- [ ] **ADM-06**: Guard em 3 camadas: middleware + layout (`notFound()` para não-ADMIN) + `requireAdmin()` em toda Server Action

### LGPD & Operacional (LGPD)

- [ ] **LGPD-01**: Bucket Uploadthing privado com signed URLs TTL 15min para previews
- [ ] **LGPD-02**: Registro de consentimento no `Customization` (IP + timestamp + textVersion do termo)
- [ ] **LGPD-03**: Cron Vercel diário deletando fotos de pedidos >90 dias pós-ENTREGUE (CRON_SECRET + idempotente)
- [ ] **LGPD-04**: Política de privacidade específica sobre fotos de crianças + identificação do DPO
- [ ] **LGPD-05**: Sentry scrub de PII (fotos, telefones, CPF) em `beforeSend`

### Deploy & Go-Live (OPS)

- [ ] **OPS-01**: Deploy Vercel (frontend+API) com domínio + SSL
- [ ] **OPS-02**: Supabase Pro upgrade (PITR + limites adequados)
- [ ] **OPS-03**: DNS Resend configurado (DKIM+SPF+DMARC) + domínio verificado
- [ ] **OPS-04**: Sentry alerts (Slack/email) para erros em produção
- [ ] **OPS-05**: Vercel Analytics + Core Web Vitals
- [ ] **OPS-06**: QA cross-browser (Chrome, Safari, Firefox, Safari iOS) + mobile 375px
- [ ] **OPS-07**: Lighthouse mobile ≥80, LCP <2.5s
- [ ] **OPS-08**: FlipBook 3D na home (dynamic import SSR:false) — react-pageflip com React 18 pinned, fallback se quebrar

## v2 Requirements

Acknowledged scope, deferred to future releases. Not in current roadmap.

### Assinatura e Fidelidade

- **V2-01**: Programa de fidelidade / cupons dinâmicos
- **V2-02**: Assinatura recorrente (livro novo a cada N meses)

### Automação IA

- **V2-03**: Integração direta com API de IA de imagem (Midjourney/SD) — atualmente humano-in-the-loop
- **V2-04**: Aprovação de arte pelo cliente antes da impressão

### Experiência estendida

- **V2-05**: E-book leitor in-app funcional (hoje é PDF por link)
- **V2-06**: Multi-idioma (EN/ES)
- **V2-07**: Chat in-app (hoje WhatsApp externo)
- **V2-08**: PIX Parcelado quando MP liberar API em 2026
- **V2-09**: Fila assíncrona de notificações (QStash/Inngest) se webhook passar de 5s em produção

## Out of Scope

Explicit exclusions with reasoning.

| Feature | Reason |
|---------|--------|
| Geração automática da ilustração pela IA | Cliente optou por humano-in-the-loop; equipe usa prompt em ferramenta externa |
| Gestão de produção dentro do app | Fluxo de arte/diagramação/gráfica fica externo; sistema só rastreia status macro |
| E-book com leitor in-app | V1 entrega por link/PDF manual; leitor é v2 |
| Multi-idioma | PT-BR only na v1 |
| Programa de fidelidade / cupons dinâmicos | Só desconto combo fixo no MVP |
| Chat in-app | Atendimento via WhatsApp externo basta no MVP |
| Assinatura recorrente | Modelo é compra única por ora |
| OAuth além de Google | Email/senha + Google cobre 95%+ do público BR |
| Aplicativo mobile nativo | Web mobile-first é suficiente na v1 |

## Traceability

Populated by roadmapper agent on 2026-04-18. Every v1 requirement is mapped to exactly one phase.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FND-01 | Phase 0 | Pending |
| FND-02 | Phase 0 | Pending |
| FND-03 | Phase 0 | Pending |
| FND-04 | Phase 0 | Pending |
| FND-05 | Phase 0 | Pending |
| FND-06 | Phase 0 | Pending |
| FND-07 | Phase 0 | Pending |
| FND-08 | Phase 0 | Pending |
| SITE-01 | Phase 1 | Pending |
| SITE-02 | Phase 1 | Pending |
| SITE-03 | Phase 1 | Pending |
| SITE-04 | Phase 1 | Pending |
| SITE-05 | Phase 1 | Pending |
| SITE-06 | Phase 1 | Pending |
| SITE-07 | Phase 1 | Pending |
| SITE-08 | Phase 1 | Pending |
| SITE-09 | Phase 1 | Pending |
| WIZ-01 | Phase 2 | Pending |
| WIZ-02 | Phase 2 | Pending |
| WIZ-03 | Phase 2 | Pending |
| WIZ-04 | Phase 2 | Pending |
| WIZ-05 | Phase 2 | Pending |
| WIZ-06 | Phase 2 | Pending |
| WIZ-07 | Phase 2 | Pending |
| WIZ-08 | Phase 2 | Pending |
| WIZ-09 | Phase 2 | Pending |
| WIZ-10 | Phase 2 | Pending |
| LGPD-01 | Phase 2 | Pending |
| LGPD-02 | Phase 2 | Pending |
| CART-01 | Phase 3 | Pending |
| CART-02 | Phase 3 | Pending |
| CART-03 | Phase 3 | Pending |
| CART-04 | Phase 3 | Pending |
| PAY-01 | Phase 4 | Pending |
| PAY-02 | Phase 4 | Pending |
| PAY-03 | Phase 4 | Pending |
| PAY-04 | Phase 4 | Pending |
| PAY-05 | Phase 4 | Pending |
| PAY-06 | Phase 4 | Pending |
| PAY-07 | Phase 4 | Pending |
| PAY-08 | Phase 4 | Pending |
| PAY-09 | Phase 4 | Pending |
| COMM-01 | Phase 5 | Pending |
| COMM-02 | Phase 5 | Pending |
| COMM-03 | Phase 5 | Pending |
| COMM-04 | Phase 5 | Pending |
| COMM-05 | Phase 5 | Pending |
| COMM-06 | Phase 5 | Pending |
| COMM-07 | Phase 5 | Pending |
| CLI-01 | Phase 6 | Pending |
| CLI-02 | Phase 6 | Pending |
| CLI-03 | Phase 6 | Pending |
| CLI-04 | Phase 6 | Pending |
| CLI-05 | Phase 6 | Pending |
| CLI-06 | Phase 6 | Pending |
| ADM-01 | Phase 6 | Pending |
| ADM-02 | Phase 6 | Pending |
| ADM-03 | Phase 6 | Pending |
| ADM-04 | Phase 6 | Pending |
| ADM-05 | Phase 6 | Pending |
| ADM-06 | Phase 6 | Pending |
| LGPD-03 | Phase 7 | Pending |
| LGPD-04 | Phase 7 | Pending |
| LGPD-05 | Phase 0 | Pending |
| OPS-01 | Phase 7 | Pending |
| OPS-02 | Phase 7 | Pending |
| OPS-03 | Phase 7 | Pending |
| OPS-04 | Phase 7 | Pending |
| OPS-05 | Phase 7 | Pending |
| OPS-06 | Phase 7 | Pending |
| OPS-07 | Phase 7 | Pending |
| OPS-08 | Phase 7 | Pending |

**Coverage:**
- v1 requirements: 72 total (FND 8 + SITE 9 + WIZ 10 + CART 4 + PAY 9 + COMM 7 + CLI 6 + ADM 6 + LGPD 5 + OPS 8)
- Mapped to phases: 72 (100%)
- Unmapped: 0

**Distribution by phase:**

| Phase | Name | Count |
|-------|------|-------|
| 0 | Fundação & Guard-Rails | 9 (FND 8 + LGPD-05) |
| 1 | Site Institucional | 9 (SITE 9) |
| 2 | Wizard + Upload + LGPD | 12 (WIZ 10 + LGPD-01 + LGPD-02) |
| 3 | Carrinho + Preços | 4 (CART 4) |
| 4 | Checkout + Frete + Pagamento | 9 (PAY 9) |
| 5 | Comunicação | 7 (COMM 7) |
| 6 | Cliente + Admin | 12 (CLI 6 + ADM 6) |
| 7 | Polimento + LGPD Op + Go-Live | 10 (LGPD-03 + LGPD-04 + OPS 8) |
| **Total** | | **72** |

---
*Requirements defined: 2026-04-18*
*Traceability populated: 2026-04-18 by roadmapper (8 phases, 100% coverage)*
