---
gsd_state_version: 1.0
milestone: v1.0
milestone_name: milestone
status: executing
stopped_at: Completed 00-04-PLAN.md (PII scrub extraído para lib/sentry-scrub.ts + tests WhatsApp FND-06 — 47/47 tests green, build OK)
last_updated: "2026-04-18T20:26:53.789Z"
last_activity: 2026-04-18
progress:
  total_phases: 8
  completed_phases: 0
  total_plans: 5
  completed_plans: 4
  percent: 80
---

# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-18)

**Core value:** Wizard de personalização claro e prazeroso que converte o adulto em comprador, gerando ao final um prompt de IA utilizável pela equipe de produção.
**Current focus:** Phase 0 — Fundação & Guard-Rails

## Current Position

Phase: 0 (Fundação & Guard-Rails) — EXECUTING
Plan: 5 of 5
Status: Ready to execute
Last activity: 2026-04-18

Progress: [░░░░░░░░░░] 0% (0/72 requirements delivered)

## Performance Metrics

**Velocity:**

- Total plans completed: 0
- Average duration: —
- Total execution time: —

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| — | — | — | — |

**Recent Trend:**

- Last 5 plans: —
- Trend: — (sem histórico)

*Updated after each plan completion*
| Phase 00-funda-o-guard-rails P01 | 5 | 2 tasks | 12 files |
| Phase 00-funda-o-guard-rails P02 | 12 | 3 tasks | 3 files |
| Phase 00-funda-o-guard-rails P03 | 3m50s | 2 tasks | 10 files |
| Phase 00-funda-o-guard-rails P04 | 3m30s | 2 tasks | 6 files |

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- **Stack**: Next.js 14 App Router + TypeScript estrito + Tailwind 3.4 (pinned React 18.3.1)
- **BD**: Prisma 6 + Supabase via Supavisor pooler (6543 runtime, 5432 migrations)
- **Auth**: Auth.js v5 (`next-auth@beta`) + `@auth/prisma-adapter`
- **Pagamento**: Mercado Pago SDK v2.12+ (PIX/Cartão/Boleto)
- **WhatsApp**: Evolution API v2 com interface abstrata `lib/whatsapp.ts` (swap pronto para Cloud API)
- **IA**: Humano-in-the-loop — sistema gera prompt, equipe usa em ferramenta externa
- [Phase 00-funda-o-guard-rails]: Adotado pnpm como gerenciador de pacotes (lockfile reproducible, environment context)
- [Phase 00-funda-o-guard-rails]: Auth.js v5 route handler pattern: const { GET, POST } = handlers (fix de bug no scaffold)
- [Phase 00-funda-o-guard-rails]: Smoke test trava versoes pinned (Next 14.2.21 + React 18.3.1 + Tailwind ^3) para evitar upgrade acidental que quebraria react-pageflip
- [Phase 00-funda-o-guard-rails]: Plan 02: Migration + seed aplicados no Supabase real (5 produtos, total R$ 589,50). 14 testes verdes (5 smoke + 9 schema).
- [Phase 00-funda-o-guard-rails]: Plan 02: dotenv-cli como devDep padrão para carregar .env.local em scripts (Prisma, Vitest)
- [Phase 00-funda-o-guard-rails]: Plan 03: login com mensagem genérica ('Credenciais inválidas') mitiga T-00-10 (enumeração de e-mails); Google provider omite UI quando AUTH_GOOGLE_ID ausente (graceful degrade); promoção ADMIN é SQL manual no MVP
- [Phase 00-funda-o-guard-rails]: Plan 04: scrubPII é pure function em lib/sentry-scrub.ts (edge-safe, regex-only), usada pelos 3 configs Sentry. beforeSend muta in-place e retorna event original — evita conflito com tipos internos do @sentry/nextjs.
- [Phase 00-funda-o-guard-rails]: Plan 04: contrato WhatsAppClient selado via 5 tests (FND-06). Swap Evolution→Cloud API é uma chamada a setWhatsAppClient — tests provam não ser refactor.

### Pending Todos

[From .planning/todos/pending/ — ideas captured during sessions]

None yet.

### Blockers/Concerns

**Open gaps surfaced durante research (endereçar nas fases indicadas):**

- Dimensões+peso exatos do livro 20 pág capa dura — confirmar com gráfica antes da Fase 4
- Retenção exata de fotos pós-ENTREGUE — 90d é padrão; validar com cliente na Fase 2
- MP sandbox + ngrok setup — validar webhook flow antes da Fase 5
- A11y FlipBook — `react-pageflip` visual-first; planejar galeria linear alternativa na Fase 7
- DATABASE_URL na porta 5432 (direct) em vez do pooler Supavisor 6543 — OBRIGATÓRIO trocar antes de Phase 7 (deploy Vercel). Pitfall #6. Ver 00-02-SUMMARY.md.

## Session Continuity

Last session: 2026-04-18T20:26:53.784Z
Stopped at: Completed 00-04-PLAN.md (PII scrub extraído para lib/sentry-scrub.ts + tests WhatsApp FND-06 — 47/47 tests green, build OK)
Resume file: None

**Next action:** `/gsd-plan-phase 0` para iniciar planning da fundação
