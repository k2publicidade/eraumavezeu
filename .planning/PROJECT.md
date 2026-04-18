# Era Uma Vez Eu

## What This Is

E-commerce de livros infantis personalizados com ilustrações geradas por IA. O cliente
envia fotos da criança, escolhe tema/gênero/estilo/faixa-etária, escreve uma dedicatória
e a equipe produz um livro físico (capa dura) usando IA + revisão humana. Produtos
adicionais (colorir, quebra-cabeça, adesivos) ganham desconto de R$ 20 quando
comprados junto do livro principal. Público-alvo: adultos (pais, tios, avós, padrinhos)
comprando presente premium para crianças de 0-10 anos.

## Core Value

Um wizard de personalização claro e prazeroso que converte o adulto em comprador,
gerando ao final um prompt de IA utilizável pela equipe de produção do livro.

## Requirements

### Validated

(None yet — ship to validate)

### Active

<!-- Hipóteses até ship + validação. Organizadas por área funcional. -->

**Site institucional:**
- [ ] Home com flipbook 3D interativo (antes/depois, marca d'água)
- [ ] Páginas: Como Funciona, Produtos, Galeria, FAQ, Quem Somos, Contato
- [ ] Galeria antes/depois com filtro por tema
- [ ] SEO completo (metadata, OG, sitemap, robots)

**Fluxo de compra:**
- [ ] Wizard de personalização multietapas (7 passos) com persistência em localStorage
- [ ] Upload de até 4 fotos (drag&drop + preview + dicas)
- [ ] Geração automática de prompt IA em PT-BR para equipe
- [ ] Carrinho com lógica de desconto (R$ 20 por adicional + livro principal)
- [ ] Checkout 3 etapas (identificação, entrega, pagamento)
- [ ] Cálculo de frete via Melhor Envio (PAC/SEDEX/Mini)
- [ ] Pagamentos via Mercado Pago (PIX + cartão 12x + boleto)
- [ ] Login + guest checkout (NextAuth: email/senha, Google opcional)

**Área do cliente:**
- [ ] Lista de pedidos + detalhe com timeline de status
- [ ] Rastreamento (código Correios/transportadora)
- [ ] Perfil (dados básicos)

**Painel administrativo (role ADMIN):**
- [ ] Dashboard com métricas (pedidos hoje, receita mês, em produção, pendentes envio)
- [ ] Lista de pedidos com filtros + busca + export CSV
- [ ] Detalhe do pedido (fotos, prompt IA, histórico, ações)
- [ ] Alterar status + código de rastreio + reenviar email/WhatsApp

**Comunicação:**
- [ ] E-mails transacionais via Resend (5 templates: confirmação, pagto aprovado, em produção, enviado, entregue)
- [ ] Notificações WhatsApp via Evolution API (confirmação + updates de status)

**Infraestrutura:**
- [ ] Upload de fotos (Uploadthing)
- [ ] Marca d'água server-side (Sharp) em todas imagens públicas
- [ ] Banco Postgres (Supabase)
- [ ] Deploy Vercel + Sentry + Vercel Analytics
- [ ] TypeScript estrito, validação Zod no servidor, mobile-first 375px+

### Out of Scope

- **Geração automática da ilustração pela IA** — equipe humana usa o prompt; não integramos API de Midjourney/SD no sistema (decisão do cliente)
- **Gestão de produção via sistema** — fluxo de arte/diagramação/gráfica fica externo; app só rastreia status macro
- **E-book funcional (leitura in-app)** — produto aparece no catálogo mas entrega é por link/PDF manual na v1
- **Multi-idioma** — só PT-BR na v1
- **Programa de fidelidade / cupons dinâmicos** — só desconto combo fixo na v1
- **Chat in-app** — atendimento via WhatsApp externo
- **Assinatura recorrente** — modelo é compra única por ora

## Context

- **Público real**: adultos (25-55) comprando presente. Site deve ser premium, não infantilizado. Paleta quente (laranja + roxo), tipografia Playfair Display + Inter + Dancing Script.
- **Operação**: equipe humana usa o prompt gerado pelo wizard em ferramentas externas de IA (Midjourney/SD/etc.), produz 20 páginas e envia pra gráfica.
- **Mercado**: e-commerce BR com exigências específicas — PIX + boleto obrigatórios, Correios/Melhor Envio como padrão de frete, LGPD para dados da criança (fotos).
- **Sensível**: upload de fotos de crianças — precisa cuidado com storage, retenção, marca d'água obrigatória em qualquer preview público.
- **Estúdio**: K2 Publicidade (Rio de Janeiro, RJ).
- **Estimativa original do cliente**: 14 dias de dev (referência, não compromisso).

## Constraints

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

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js 14 App Router + Server Components por padrão | SSR melhor para SEO do e-commerce + DX moderno | — Pending |
| Supabase como BD + Storage | Free tier + integração Next + Postgres gerenciado | — Pending |
| Uploadthing para fotos (não Cloudinary) | Integração nativa Next, DX melhor pro MVP | — Pending |
| Mercado Pago (não Stripe) | Mercado BR exige PIX + boleto; MP domina | — Pending |
| Evolution API para WhatsApp | Mais barato que API oficial, comum em e-commerce BR | — Pending |
| IA fica externa (humano-in-the-loop) | Cliente não quer custo/complexidade de API de imagem no MVP | — Pending |
| Guest checkout permitido | Reduz fricção no presente de primeira compra | — Pending |
| Desconto combo fixo (R$ 20) em adicionais | Mais simples que cupons dinâmicos no MVP | — Pending |
| Marca d'água via Sharp server-side | Proteger arte antes do pagamento confirmado | — Pending |
| YOLO mode + research habilitado no GSD | Autonomia + redução de retrabalho em domínio com pegadinhas (PIX, LGPD) | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-18 after initialization*
