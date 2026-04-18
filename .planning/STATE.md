# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-04-18)

**Core value:** Wizard de personalização claro e prazeroso que converte o adulto em comprador, gerando ao final um prompt de IA utilizável pela equipe de produção.
**Current focus:** Phase 0 — Fundação & Guard-Rails

## Current Position

Phase: 0 of 7 (Fundação & Guard-Rails)
Plan: Não iniciado
Status: Ready to plan
Last activity: 2026-04-18 — Roadmap created and approved

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

### Pending Todos

[From .planning/todos/pending/ — ideas captured during sessions]

None yet.

### Blockers/Concerns

**Open gaps surfaced durante research (endereçar nas fases indicadas):**
- Dimensões+peso exatos do livro 20 pág capa dura — confirmar com gráfica antes da Fase 4
- Retenção exata de fotos pós-ENTREGUE — 90d é padrão; validar com cliente na Fase 2
- MP sandbox + ngrok setup — validar webhook flow antes da Fase 5
- A11y FlipBook — `react-pageflip` visual-first; planejar galeria linear alternativa na Fase 7

## Session Continuity

Last session: 2026-04-18
Stopped at: ROADMAP.md + STATE.md criados; 72/72 requisitos mapeados em 8 fases
Resume file: None

**Next action:** `/gsd-plan-phase 0` para iniciar planning da fundação
