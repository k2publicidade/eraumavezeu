# Feature Research — Era Uma Vez Eu

**Domain:** E-commerce premium de livros infantis personalizados com IA (gift commerce + child-data sensitive)
**Researched:** 2026-04-18
**Confidence:** HIGH (triangulado com concorrentes BR/internacionais, LGPD oficial, Baymard, mercado de pagamentos BR)

## Executive Summary

O produto opera em três domínios sobrepostos: **e-commerce brasileiro** (com expectativas rígidas de PIX/boleto/parcelamento/Correios), **gift commerce** (comprador != destinatário, ansiedade de entrega, data-sensível) e **produto com dado pessoal sensível de criança** (LGPD Art. 14, fotos, consentimento específico). A janela do MVP é curta (14 dias ref.) e o wizard é o coração da conversão — todas as decisões devem reforçar: (1) confiança no upload de fotos, (2) previsibilidade de prazo, (3) simplicidade do fluxo multietapas, (4) métodos de pagamento completos BR.

Concorrentes relevantes: Dentro da História (BR, líder, avatar customizado com preview ao vivo), Playstories (BR, spin-off DdH, app-first), EuNoBook (BR, foto+nome), Meu Livro Personalizado (BR, nicho), Tibi (BR), e internacionalmente Wonderbly + Hooray Heroes (benchmark de UX premium com 3M+ livros personalizados, "criados em minutos, enviados em 3 dias"). Nosso diferencial estrutural é o **pipeline humano-com-IA** (prompt gerado automaticamente → equipe produz no Midjourney/SD) — não competimos em velocidade automática, então temos que competir em **sensação premium** e **transparência do prazo**.

## Feature Landscape

### Table Stakes (Users Expect These)

Ausência destas = site parece quebrado, amador ou inseguro. Penaliza, não premia.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **PIX com QR Code + copia-e-cola** | 80% das transações de e-com BR são parceladas, mas PIX é o método dominante por volume. Sem PIX = abandono imediato. | MEDIUM | Mercado Pago SDK; exibir QR, copia-e-cola, contador de expiração (30min), polling de status via webhook. |
| **Cartão parcelado até 12x sem juros** | Consumidor BR trata parcela como método, não como crédito. Ticket médio R$ 249-450 exige parcelamento. | MEDIUM | Mercado Pago Payment Brick; exibir valor parcela claramente ("12x R$ 20,82"). |
| **Boleto bancário** | Ainda 15-20% dos e-com BR; público adulto 40+ usa. Gera confiança mesmo quando não é usado. | LOW | Mercado Pago; enviar PDF por email + WhatsApp; aviso de prazo 1-3 dias úteis. |
| **CEP com autopreenchimento (ViaCEP)** | Padrão absoluto BR. Digitar endereço inteiro = abandono. | LOW | ViaCEP é grátis, sem key; validar 8 dígitos antes da chamada; fallback manual se API falhar. |
| **Cálculo de frete real-time (Melhor Envio)** | PAC/SEDEX/Mini com prazo e preço antes de checkout. Frete surpresa = abandono #1 (Baymard). | MEDIUM | API Melhor Envio; cachear resposta por CEP (1h); exibir prazo "chega até DD/MM". |
| **Rastreamento Correios na área do cliente** | Pós-venda é onde cliente de presente mais ansia. Link direto + código copiável. | LOW | Armazenar trackingCode no Order; deep-link para rastreamento.correios.com.br. |
| **Guest checkout** | Primeira compra de presente = não quer criar conta. -35% abandono quando oferecido. | LOW | Campos guestEmail/guestName/guestPhone no Order model (já previsto no schema). |
| **E-mail de confirmação imediato** | Ausência = pânico do comprador, suporte inflado. Expectativa < 2min após confirmar. | LOW | Resend + React Email template; enviar dentro do handler do webhook MP, não no checkout. |
| **Status do pedido com timeline visual** | Cliente checa 3-7x durante a produção. Timeline reduz abertura de tickets em ~40%. | MEDIUM | 6 estados do enum OrderStatus; ícones + data de cada transição; "próximo passo" destacado. |
| **Mobile-first funcional em 375px** | 75%+ do tráfego de e-com BR é mobile. Wizard precisa funcionar de uma mão. | HIGH | Todos os steps, upload drag-and-drop com fallback de click, touch targets ≥44px. |
| **Validação em cada etapa do wizard** | Avançar com erro = raiva e abandono. Mostrar erro inline antes de clicar "próximo". | LOW | Zod schemas por step; botão "próximo" disabled até válido; mensagens em PT-BR. |
| **Página de produto com preço claro + promoção** | "De R$ 299,90 Por R$ 249,90" é expectativa cultural BR. Sem riscado = parece que não tem desconto. | LOW | priceOld no Product model; renderizar com strikethrough + badge de %. |
| **FAQ abrangente** | Produto não-trivial (foto de criança + IA + prazo longo). Sem FAQ = email/WhatsApp perguntando óbvio. | LOW | 12+ perguntas: foto que posso usar, quanto tempo, posso ver antes, se não gostei, devolução, etc. |
| **Selos de segurança visíveis no checkout** | "Site Seguro" / "SSL" / "Compra Protegida" aumentam conversão até 18%. | LOW | Badge SSL no footer; logo Mercado Pago no checkout; selo de LGPD. |
| **Contato via WhatsApp visível** | Botão flutuante WhatsApp é padrão absoluto BR. Ausência = "essa empresa some?". | LOW | Floating button com deep-link wa.me/55DDNNNNNNNNN?text=Olá; mostrar em todas as páginas. |
| **Página "Como Funciona" com passo a passo** | Produto novo exige pedagogia. Decisão de compra trava sem entender o fluxo completo. | LOW | Timeline vertical com 8 passos: escolher → personalizar → enviar foto → pagar → produção (X dias) → envio → entrega. |
| **Política de privacidade + Termos claros** | LGPD Art. 14 exige informação "simples, clara e acessível" sobre dados da criança. | MEDIUM | Página dedicada; consent checkbox no upload; retenção explícita (ex.: 90d após entrega). |
| **Responsive para iPad/tablet** | Avós e tios usam tablet para compras de presente. | LOW | Breakpoints 768px e 1024px; FlipBook adaptado. |

### Differentiators (Competitive Advantage)

Onde o produto compete e ganha. Alinhados ao Core Value: "wizard de personalização claro e prazeroso que converte o adulto em comprador".

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **FlipBook 3D interativo na Home** | Cliente vê o produto final antes de gastar. Reduz risco percebido, aumenta dwell time, compartilhável. | MEDIUM | react-pageflip; 20 páginas com marca d'água; CTA "criar o meu" ao final; versão mobile swipe. |
| **Preview lateral no wizard ("livro sendo montado")** | Feedback visual imediato a cada escolha gera sensação de autoria. Reduz abandono do multietapas. | HIGH | Cada step atualiza mockup lateral com tema/estilo/cor; em mobile, collapse no topo. Requer assets pre-renderizados por combinação (tema × estilo). |
| **Persistência em localStorage do wizard** | Cliente sai e volta no mobile/desktop. Sem isto, 7 passos = 45-60% abandono no passo 4+. | MEDIUM | Zustand com persist middleware; TTL 7 dias; recuperar com toast "Continue de onde parou?". |
| **Dicas inteligentes no upload de foto** | Foto ruim = IA ruim = cliente frustrado. Guiar: rosto visível, boa luz, sem óculos escuros, 1 pessoa por foto. | LOW | Component com ilustrações de "foto boa" vs "foto ruim"; validação client-side de resolução mínima (ex.: 800x800). |
| **Badge "LGPD: suas fotos são protegidas"** | Upload de criança = maior fricção psicológica. Explicar retenção + marca d'água + uso único = remove trava mental. | LOW | Componente reutilizável exibido no step de upload; link para política; selo verde visual. |
| **Notificação WhatsApp a cada mudança de status** | Cliente de presente checa obsessivamente. WhatsApp proativo > email = reduz ansiedade e tickets. | MEDIUM | Evolution API; trigger em cada transição de OrderStatus; opt-in no checkout (default on). |
| **Combo visual "compre junto, economize R$ 20"** | Upsell pós-wizard, antes do checkout. Desconto fixo simples, visual de pacote. | MEDIUM | Cross-sell card com 3 adicionais após o wizard; "Adicione e economize R$ 20 em cada"; cálculo no carrinho. |
| **Galeria antes/depois filtrável por tema** | Prova social específica por fit. "Minha filha de 5 anos adora dinossauros" → ver exatamente isso. | LOW | Grid masonry; filtro chip por tema; toggle antes/depois; todas imagens com marca d'água. |
| **Estimativa de data de entrega no wizard e carrinho** | Gift commerce = prazo é #1. "Chega até 15 de abril" > "PAC 10 dias úteis". | MEDIUM | Calcular: produção (5-7 dias) + frete Melhor Envio; banner destacado no carrinho e checkout. |
| **Prompt IA gerado automaticamente (admin)** | Core interno do negócio. Equipe copia-cola no Midjourney sem retrabalho. | MEDIUM | Template de prompt PT-BR; função determinística baseada em Customization; botão "copiar" no admin. |
| **Dedicatória personalizada com preview tipográfico** | Momento emocional do comprador. Ver "Para meu amor, Laura — com carinho da Vovó Neide" com fonte Dancing Script vira closer. | LOW | Input com preview em Dancing Script; limite 200 chars; exibir mockup de página de dedicatória. |
| **Checkout em 3 etapas no mesmo URL** | Stepper interno > navegação entre páginas. Reduz fricção e perda de contexto em mobile. | MEDIUM | Estado único no client; animação de transição; progress bar; voltar sem perder dados. |
| **Selo "arte aprovada por você"** (fase 2, opcional v1) | Posicionamento premium: "você aprova antes de imprimir". Diferencia de concorrentes que imprimem direto. | HIGH | Status intermediário "AGUARDANDO_APROVACAO"; admin envia arte watermarked; cliente aprova/pede ajuste. **Não MVP — listar como v1.1.** |
| **Suporte WhatsApp one-click do detalhe do pedido** | Contexto do pedido já vai na mensagem pré-preenchida → suporte 10x mais rápido. | LOW | wa.me/... com body="Olá, sobre o pedido #{id}, ..."; link em cada página relevante. |
| **Marca d'água server-side agressiva em previews** | Proteger arte antes de pagar + antes de aprovar. LGPD-friendly + anti-pirataria. | MEDIUM | Sharp com SVG composite; tile repetido; rotação; aplicar em upload E em imagens de galeria. |

### Anti-Features (Commonly Requested, Often Problematic)

Features que parecem óbvias mas sabotam o MVP ou o modelo de negócio.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Geração de IA dentro do app** | "É sobre IA, então deveria gerar imagens no ato" | Custo por imagem (US$ 0.02-0.10/img × 20 páginas = caro e imprevisível); decisão do cliente é humano-in-the-loop; abre portas para prompts ofensivos/moderação. | Prompt estruturado gerado automaticamente → equipe produz em Midjourney externamente (já decidido). |
| **E-book com leitor embutido (PDF.js / reader in-app)** | "Se vende e-book, precisa ler no site" | Reader bom exige mês+ de trabalho; DRM; anti-screenshot; suporte offline. Escopo infinito. | v1: entrega por link PDF com marca d'água enviado por email após pagamento. |
| **Assinatura recorrente / clube do livro** | Concorrente Dentro da História tem clube; "receita recorrente é melhor" | Muda o modelo de negócio inteiro; exige gestão de catálogo, gestão de churn, billing recorrente; não é o pedido do cliente. | Compra única no MVP; avaliar assinatura após validar unit economics. |
| **Programa de fidelidade / cashback / cupons dinâmicos** | "Fidelizar cliente", "cupom de primeira compra" | Adiciona models (Coupon, LoyaltyPoints), regras de negócio, painel admin extra, edge cases de combinação com desconto combo. | Desconto combo fixo R$ 20 é simples, claro e suficiente no MVP. |
| **Chat in-app (Intercom/Zendesk Chat)** | "Suporte moderno tem chat" | Custo mensal; exige SLA de resposta; duplica com WhatsApp; hora admin extra. | WhatsApp button flutuante + formulário de contato; concentra atendimento em um canal que o público já usa. |
| **Multi-idioma (EN/ES)** | "Queremos vender fora do BR" | Traduções de UI + emails + WhatsApp + termos legais; checkout internacional (Stripe, não MP); frete internacional. | PT-BR only no v1; reavaliar após validar mercado BR. |
| **In-app drawing/customização visual avatar (tipo Dentro da História)** | "Concorrente faz assim, temos que fazer" | O modelo do cliente é outro: foto real da criança + IA humana. Avatar estilizado conflita com a promessa "a criança que você ama vira o herói". Além disso, avatar requer pipeline 2D sprite-based completo. | Manter diferenciação: upload de foto real + prompt humano + arte manual. |
| **Painel de aprovação de arte por cliente no MVP** | "Cliente quer ver antes de imprimir" | Estado de pedido bifurcado; emails extras; lógica de "quantas revisões", "quanto tempo para aprovar"; pode travar produção. | v1.1: primeiro lançar com status lineares; se NPS indicar demanda, adicionar. |
| **Review/rating de produto com estrelas** | "Todo e-com tem review" | Sem reviews de verdade no launch vira deserto ou inflado com fake; catálogo de 4 produtos SKU-repetido (personalização varia mas produto é um só). | Depoimentos curados na home (3-6); coletar reviews via email pós-entrega e curar antes de publicar (v1.1). |
| **Wishlist / favoritos** | "Padrão de e-com" | Produtos são poucos e customizados — não faz sentido favoritar "o livro principal"; aumenta complexidade de UI. | Não incluir. Compartilhamento via link do wizard completo (deep-link) é melhor para presente. |
| **Integração com marketplaces (Mercado Livre, Shopee)** | "Mais canais = mais vendas" | Marketplace exige SKU fixo, não personalizado; conflita com modelo direto-ao-consumidor premium; comissão mata margem. | D2C puro; usar Google Shopping + Meta Ads como canais. |
| **Login obrigatório para checkout** | "Cliente vira base de CRM" | -35% conversão de primeira compra de presente; público 40+ resistente a criar conta. | Guest checkout + oferta de criar conta *depois* da compra ("1 clique pra acompanhar seu pedido"). |
| **Upload ilimitado de fotos** | "Mais fotos = IA melhor" | Custo de storage; LGPD risco maior; cliente se perde; equipe processa mais tempo. | Limite 4 fotos (já no PROJECT.md); com dicas de quais 4 fotos escolher. |

## Feature Dependencies

```
Auth/NextAuth
    └── Guest Checkout (opcional; bypass do auth)
    └── Área do Cliente (pedidos, perfil)
    └── Admin Panel (role ADMIN)

Prisma Schema + Supabase
    └── Order / Customization / Product models
            └── Wizard (cria Customization)
                    └── Carrinho (adiciona Product + Customization ref)
                            └── Checkout (consolida em Order)
                                    └── Mercado Pago (paymentId)
                                            └── Webhook → atualiza PaymentStatus
                                                    └── Email (Resend)
                                                    └── WhatsApp (Evolution API)

Uploadthing
    └── Upload de fotos no wizard
            └── Storage URLs em Customization.photos
                    └── Watermark (Sharp) → preview galeria/home

ViaCEP
    └── Autofill no checkout (dependência: CEP válido)
            └── Melhor Envio (precisa CEP destino)
                    └── Cálculo de frete
                            └── Estimativa de data de entrega

Mercado Pago
    ├── PIX (QR + copia-e-cola + polling)
    ├── Cartão (parcelado 12x)
    └── Boleto
    └── Webhook → PaymentStatus → OrderStatus transition

OrderStatus transitions
    └── Timeline visual (cliente)
    └── WhatsApp notifications (each transition)
    └── Email transacional (5 templates)
    └── Admin panel (altera status manualmente)

FlipBook ──enhances──> Home conversion
Preview lateral ──enhances──> Wizard completion rate
localStorage persistence ──requires──> Wizard state management (Zustand)
LGPD badge ──requires──> Política de privacidade publicada
```

### Dependency Notes

- **Webhook Mercado Pago é o hub de orquestração:** dispara Email + WhatsApp + transição de OrderStatus. Se falhar, tudo depois falha. Precisa retry + idempotência (usar `paymentId` como dedup key).
- **Watermark bloqueia publicação de galeria:** nenhuma imagem de exemplo pode ir a público sem passar por Sharp. Fazer no deploy/build ou em upload time, nunca on-the-fly por request (custo).
- **Estimativa de data de entrega cruza 3 sistemas:** produção (config manual admin) + Melhor Envio (API) + feriados BR (hardcoded ou lib). Se qualquer um falhar, mostrar faixa conservadora "entre X e Y dias úteis".
- **Preview lateral no wizard depende de assets pré-renderizados:** combinações tema (5) × estilo (3) × faixa etária (3) = 45 mockups. Pode ser limitado a 5 temas × 3 estilos = 15 mockups no MVP, ignorando faixa etária no preview.
- **WhatsApp opt-in** precisa estar no checkout (campo guest ou perfil) — sem telefone válido, nenhum envio acontece.
- **LGPD consent checkbox** deve estar no wizard (passo de upload) E no checkout (confirmação final), com timestamp gravado em Order.

## MVP Definition

### Launch With (v1)

Mínimo para validar o conceito: adulto consegue personalizar, pagar, receber atualizações e receber o livro.

- [ ] **Home com FlipBook 3D + seções estáticas** — hook visual imediato, reduz risco percebido
- [ ] **Wizard de 7 passos com persistência localStorage** — core do produto, sem isso não há venda
- [ ] **Upload de até 4 fotos com dicas + validação client-side** — input crítico para a equipe
- [ ] **Badge LGPD visível + consent checkbox** — legalmente obrigatório, psicologicamente necessário
- [ ] **Prompt IA gerado automaticamente (admin)** — eficiência operacional interna
- [ ] **Carrinho com lógica de desconto combo R$ 20** — regra de negócio central
- [ ] **Checkout 3 etapas no mesmo URL** — identificação, entrega, pagamento
- [ ] **Guest checkout + login opcional** — reduz fricção da primeira compra
- [ ] **ViaCEP autofill** — expectativa BR não-negociável
- [ ] **Melhor Envio (PAC, SEDEX, Mini)** — expectativa BR não-negociável
- [ ] **Estimativa de data de entrega** — central para gift commerce
- [ ] **Mercado Pago: PIX + Cartão 12x + Boleto** — trinca obrigatória
- [ ] **Webhook MP com retry/idempotência** — robustez do pagamento
- [ ] **5 emails transacionais (Resend)** — pós-venda básico
- [ ] **WhatsApp em cada mudança de status (Evolution API)** — diferenciador BR
- [ ] **Área do cliente: lista + detalhe + timeline + rastreamento Correios** — confiança pós-venda
- [ ] **Admin: dashboard + lista pedidos + detalhe (com fotos, prompt, alterar status, trackingCode)** — operação viável
- [ ] **Watermark Sharp server-side** — proteção de IP antes de pagamento
- [ ] **Galeria antes/depois com filtro por tema** — prova social
- [ ] **FAQ com 12+ perguntas** — reduz suporte
- [ ] **Botão WhatsApp flutuante** — canal primário de suporte
- [ ] **SEO completo (metadata, OG, sitemap, robots)** — aquisição orgânica
- [ ] **Sentry + Vercel Analytics** — observabilidade mínima

### Add After Validation (v1.x)

Features a adicionar assim que o core estiver rodando e métricas derem sinal.

- [ ] **Aprovação de arte pelo cliente antes da impressão** — gatilho: NPS indica "quero ver antes"; ou primeiras reclamações de "não era o que esperava"
- [ ] **Depoimentos/reviews reais curados** — gatilho: 50+ entregas realizadas
- [ ] **A/B test do wizard (ordem dos passos, copy dos CTAs)** — gatilho: dados de conversão suficientes (≥1000 sessions)
- [ ] **Cupom de primeira compra** — gatilho: CAC alto de Ads, precisa impulso de conversão
- [ ] **Histórico de customizações salvas (repetir pedido)** — gatilho: pedidos repetidos identificados (ex.: mesmo cliente comprando para aniversário)
- [ ] **Integração com Google Shopping Feed** — gatilho: tráfego orgânico saturado
- [ ] **PIX Parcelado (regulamentação 2025/2026)** — gatilho: Mercado Pago liberar, regulatório amadurecer
- [ ] **Painel admin: filtros avançados + busca full-text + export CSV/Excel** — gatilho: admin manual virar gargalo (>30 pedidos/dia)

### Future Consideration (v2+)

Features a adiar até product-market fit estabelecido.

- [ ] **Geração de IA integrada no sistema (Midjourney/Stable Diffusion API)** — esperar modelo validar, custo cair, pipeline humano sair de gargalo
- [ ] **Assinatura / Clube do Livro** — requer modelo de negócio diferente; explorar só se LTV justificar
- [ ] **E-book leitor embutido com anti-pirataria** — escopo grande; avaliar se e-book vira fatia significativa da receita
- [ ] **Multi-idioma (EN, ES)** — expansão LatAm exige infra de pagamento, frete, legal diferentes
- [ ] **Mobile app nativo (iOS/Android)** — PWA resolve 95% do caso; app só se retenção virar chave
- [ ] **Programa de afiliados/embaixadores** — requer tracking, comissão, painel; só se CAC orgânico trava
- [ ] **Chat in-app com IA de suporte** — quando volume de WhatsApp virar intratável
- [ ] **Gift card / vale-presente** — quando comprador quiser "dar sem personalizar agora" (demanda real a validar)

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Wizard 7 passos + localStorage | HIGH | HIGH | **P1** |
| PIX + Cartão 12x + Boleto (Mercado Pago) | HIGH | MEDIUM | **P1** |
| ViaCEP autofill + Melhor Envio | HIGH | MEDIUM | **P1** |
| Upload fotos + Watermark + LGPD badge | HIGH | MEDIUM | **P1** |
| Webhook MP + Email + WhatsApp orquestrado | HIGH | MEDIUM | **P1** |
| Área do cliente com timeline + rastreio | HIGH | MEDIUM | **P1** |
| Admin: dashboard + detalhe pedido + prompt IA | HIGH | MEDIUM | **P1** |
| Carrinho com desconto combo R$ 20 | HIGH | LOW | **P1** |
| Guest checkout | HIGH | LOW | **P1** |
| FlipBook 3D home | HIGH | MEDIUM | **P1** |
| Estimativa de data de entrega | HIGH | MEDIUM | **P1** |
| Galeria antes/depois filtrável | MEDIUM | LOW | **P1** |
| FAQ + Como Funciona | MEDIUM | LOW | **P1** |
| Botão WhatsApp flutuante | HIGH | LOW | **P1** |
| Preview lateral no wizard | HIGH | HIGH | **P2** (pode ser versão simples no MVP, rica depois) |
| Dedicatória com preview Dancing Script | MEDIUM | LOW | **P1** |
| Dicas inteligentes de foto | MEDIUM | LOW | **P1** |
| Selos SSL/Segurança no footer/checkout | MEDIUM | LOW | **P1** |
| Aprovação de arte pelo cliente | HIGH | HIGH | **P3** (v1.1) |
| Depoimentos reais curados | MEDIUM | MEDIUM | **P3** (v1.1) |
| A/B test wizard | MEDIUM | MEDIUM | **P3** (v1.x) |
| Assinatura/Clube | LOW | HIGH | **P3** (v2+) |
| Geração IA integrada | LOW | HIGH | **P3** (v2+, anti-feature atual) |

**Priority key:**
- P1: Must have para o launch v1
- P2: Should have, incluir se tempo permitir no MVP
- P3: Nice to have, pós-validação

## Competitor Feature Analysis

| Feature | Dentro da História (BR) | Wonderbly (UK/intl) | Hooray Heroes (EU/intl) | Our Approach |
|---------|-------------------------|---------------------|-------------------------|--------------|
| **Personalização** | Avatar 2D customizável (pele, cabelo, olhos, roupa) | Nome + foto opcional em alguns títulos | Avatar customizável + família | Foto real + prompt humano para IA (único no BR) |
| **Preview pré-compra** | Avatar + primeiras páginas folheáveis | Preview das primeiras páginas | Preview completo do livro | FlipBook com livro exemplo + preview lateral no wizard |
| **Geração** | Catálogo fixo de histórias com avatar injetado | Catálogo fixo | Catálogo fixo | Customização combinatória (tema × gênero × estilo) + IA humana |
| **Pagamento BR** | PIX, cartão 12x, boleto | Cartão internacional | Cartão internacional | PIX, cartão 12x, boleto (Mercado Pago) |
| **Frete BR** | Correios + transportadora | Internacional (caro para BR) | Internacional | Melhor Envio (PAC/SEDEX/Mini) |
| **Prazo de produção** | ~5-10 dias úteis | "Created in minutes, shipped in 3 days" | "Created in minutes, shipped in 3 days" | 7-14 dias (humano-in-the-loop) — **gap competitivo: expectation management** |
| **WhatsApp** | Sim | Não | Não | Sim (opt-in, notificações de status) |
| **Preço** | R$ 149-179 por livro | £24.99 (~R$ 160) | €29-40 (~R$ 170-230) | R$ 249,90 livro principal + adicionais — **posicionamento premium exige justificar preço** |
| **Combo/bundle** | Não (livros únicos) | Sim (box sets) | Sim (pacotes família) | Sim (livro + 3 adicionais com R$ 20 off cada) |
| **Aprovação de arte** | Não (avatar WYSIWYG) | Não | Não | **Oportunidade v1.1** (seria diferencial único) |
| **Modelo recorrente** | Clube de assinatura | Não | Não | Não (fora do escopo) |

**Insights estratégicos:**
1. Nosso prazo (7-14d) é 2-3x mais longo que concorrentes internacionais. Compensar com: transparência brutal ("está em produção desde DD/MM"), WhatsApp proativo, arte premium.
2. Nosso preço (R$ 249) é 40-60% mais alto que Dentro da História. Justificar com: foto real da criança (não avatar), pipeline premium, capa dura, combo.
3. Ninguém no BR tem FlipBook 3D + preview lateral no wizard + WhatsApp proativo juntos. Essa combinação é defensável por 6-12 meses.
4. Assinatura de Dentro da História é força deles; não tentar copiar no MVP (modelo diferente).

## BR Market Expectations (Called Out)

Requisitos culturais/regulatórios específicos do mercado brasileiro que não podem ser inferidos de padrões US/EU:

1. **PIX é obrigatório** — 80% das transações instantâneas do BR; ausência = -25% conversão estimada. QR + copia-e-cola são padrão de UX.
2. **Parcelamento sem juros até 12x é padrão** — consumidor trata parcela como método, não financiamento. Exibir valor de parcela grande e claro ("12x R$ 20,82 sem juros").
3. **Boleto ainda matters** — 15-20% dos e-com, principalmente público 40+ e desbancarizado. Geração de PDF + envio por WhatsApp/email.
4. **ViaCEP é expectativa absoluta** — digitar endereço à mão é atrito anti-profissional no BR.
5. **Correios/Melhor Envio dominante** — 80%+ dos e-coms usam. Código de rastreio + link para rastreamento.correios.com.br é esperado.
6. **WhatsApp > Email para atendimento** — botão flutuante é padrão; 90%+ do público adulto BR tem WhatsApp e prefere por responsividade.
7. **LGPD Art. 14 — dados de crianças** — consentimento "específico e destacado" de pelo menos um pai/responsável. Retenção mínima, marca d'água obrigatória em previews públicas, termo separado de dados sensíveis.
8. **Selos "Site Seguro" esperados** — SSL badge, logo Mercado Pago, "compra protegida". Aumentam conversão até 18%.
9. **Prazo expresso em "dias úteis"** — não corridos. Considerar feriados nacionais (lib como `date-holidays` para BR) + regionais.
10. **CPF opcional em guest checkout** — cresce em adoção (obrigatório para nota fiscal), mas não bloquear compra por causa dele.

## Sources

- [Dentro da História — Livros Personalizados (BR, concorrente líder)](https://www.dentrodahistoria.com.br/) — HIGH confidence
- [Dentro da História — Como funciona (Zendesk)](https://dentrodahistoria.zendesk.com/hc/pt-br/articles/115003844114) — HIGH
- [Playstories (spin-off Dentro da História)](https://www.playstories.com.br/) — HIGH
- [EuNoBook (BR)](https://www.eunobook.com.br/) — MEDIUM
- [Wonderbly (benchmark internacional)](https://www.wonderbly.com/) — HIGH
- [Hooray Heroes (benchmark internacional, 3M+ livros)](https://hoorayheroes.com/) — HIGH
- [Wonderbly vs Hooray Heroes comparison — Kidi Reading 2026](https://www.kidireading.com/wonderbly-vs-hooray-heroes-personalised-books-for-kids/) — MEDIUM
- [Baymard Institute — Gifting Flow UX (4 best practices)](https://baymard.com/blog/gifting-flow) — HIGH
- [Baymard Institute — 111 Gifting Design Examples](https://baymard.com/checkout-usability/benchmark/step-type/gifting) — HIGH
- [Baymard — Cart Abandonment Rate Stats 2026](https://baymard.com/lists/cart-abandonment-rate) — HIGH
- [NN/g — Wishlists, Gift Cards, and Gift Giving](https://www.nngroup.com/articles/wishlists-gift-certificates/) — HIGH
- [E-commerce Brasil — Tendências pagamentos 2026](https://www.ecommercebrasil.com.br/artigos/e-commerce-sem-friccao-as-tendencias-que-vao-dominar-os-pagamentos-em-2026) — HIGH
- [E-commerce Brasil — PIX Parcelado 2025](https://www.ecommercebrasil.com.br/noticias/pix-parcelado-sera-lancado-em-2025) — HIGH
- [E-commerce Brasil — Parcelamento boleto/PIX](https://www.ecommercebrasil.com.br/noticias/parcelamento-boleto-pix-tendencia) — HIGH
- [Mercado Pago — PIX Integration Docs](https://www.mercadopago.com.br/developers/en/docs/checkout-api-orders/payment-integration/pix) — HIGH
- [LGPD Brasil — Artigo 14 (dados de crianças)](https://lgpd-brasil.info/capitulo_02/artigo_14) — HIGH
- [ANPD — Enunciado sobre dados de crianças e adolescentes](https://www.gov.br/anpd/pt-br/assuntos/noticias/anpd-divulga-enunciado-sobre-o-tratamento-de-dados-pessoais-de-criancas-e-adolescentes) — HIGH
- [Serpro — LGPD crianças e adolescentes](https://www.serpro.gov.br/lgpd/noticias/criancas-adolescentes-lgpd-lei-geral-protecao-de-dados-pessoais) — HIGH
- [ViaCEP — Documentação oficial](https://documenter.getpostman.com/view/8961871/SVn3svAh) — HIGH
- [Filament Smart CEP (benchmark implementation)](https://github.com/otavio-araujo/filament-smart-cep) — MEDIUM
- [Tech in Brazil — Security Seals](https://techinbrazil.com/security-seals-for-brazilian-e-commerces) — MEDIUM
- [E-Vendas — Rastreio WhatsApp no e-commerce BR](https://www.e-vendas.net.br/blog/atualizacao-de-rastreio-dos-correios-no-whatsapp/) — MEDIUM
- [Multi-Step Form Abandonment Stats 2025](https://www.amraandelma.com/multi-step-form-abandonment-stats/) — MEDIUM
- [Lollypop — Wizard UI Design Best Practices 2026](https://lollypop.design/blog/2026/january/wizard-ui-design/) — MEDIUM
- [React PageFlip — Flipbook library](https://www.npmjs.com/package/react-pageflip) — HIGH
- [Contentsquare — E-commerce UX Framework 2026](https://contentsquare.com/guides/ecommerce-ux/) — MEDIUM
- [Trust Signals — 77 signals to build website trust](https://www.trustsignals.com/blog/77-trust-signals-to-increase-your-online-conversion-rate) — MEDIUM

---
*Feature research for: E-commerce premium de livros infantis personalizados com IA (BR, gift commerce, child-data sensitive)*
*Researched: 2026-04-18*
