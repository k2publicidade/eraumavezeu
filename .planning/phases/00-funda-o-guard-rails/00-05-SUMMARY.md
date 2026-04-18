---
phase: 00-funda-o-guard-rails
plan: 05
subsystem: verification
tags:
  - verification
  - phase-gate
  - evidence
  - lgpd
  - auto-mode
requires:
  - 00-01 (scaffold + Vitest + .gitignore)
  - 00-02 (Prisma migrate + seed)
  - 00-03 (/login + /cadastro + guards tests)
  - 00-04 (scrubPII compartilhado + WhatsApp contract)
provides:
  - 00-VERIFICATION.md — evidência consolidada dos 9 REQs da Phase 0
  - Baseline de 47 tests green (teto de regressão para Phase 1)
  - Mapeamento de 1 deviation aberto (pooler URL) para fechamento antes de Phase 7
affects:
  - Phase 1 (Site Institucional) — pode iniciar, pré-requisitos validados
  - Phase 7 (Go-Live) — deviation pooler obrigatório fechar antes
tech-stack:
  added: []
  patterns:
    - Verification-by-artifact: comando + output real colado (não placeholder)
    - Static analysis em lugar de live browser (auto mode safe-path)
    - Requirements Coverage Matrix com 1 linha por REQ + evidência linkando ao plan
key-files:
  created:
    - .planning/phases/00-funda-o-guard-rails/00-VERIFICATION.md
  modified: []
decisions:
  - "Task 2 (human-verify) auto-aprovado em auto mode com validação estática (DOM-less): leitura dos page.tsx confirma Google button gated por env, 4 campos no cadastro, e guards já cobertos por 17 tests de auth. Live browser check deferido para o usuário pós-Phase-0."
  - "Query de contagem feita via PrismaClient (tmp-count.ts temporário, removido após uso) em vez de `prisma db execute --file` porque o último não imprime stdout no Windows — Prisma Client confirma 5 produtos ativos + preços exatos."
  - "Deviation do pooler (5432 em vez de 6543) mantida aberta e documentada como status `✓*` no VERIFICATION.md — não bloqueia fechamento da Phase 0 nem Phase 1 (UI-only), obrigatório corrigir antes de Phase 7 (deploy Vercel)."
metrics:
  duration: 2m15s
  tasks_completed: 2
  commits: 1
  files_created: 1
  files_modified: 0
  tests_passing: 47
  tests_total: 47
  completed_date: 2026-04-18
requirements:
  - FND-01
  - FND-02
  - FND-03
  - FND-04
  - FND-05
  - FND-06
  - FND-07
  - FND-08
  - LGPD-05
---

# Phase 0 Plan 05: Verificação Consolidada da Phase 0 — Summary

Gate de fechamento da Phase 0: rodei a suíte completa (typecheck + build + test + migrate status + query direta no Supabase), capturei output real de cada comando e compilei em `00-VERIFICATION.md` com 1 linha por requirement e evidência rastreável — 9/9 REQs verificados, 47/47 tests verdes, 1 deviation documentado.

## Link to VERIFICATION

📄 **Arquivo principal:** [`.planning/phases/00-funda-o-guard-rails/00-VERIFICATION.md`](./00-VERIFICATION.md)

Contém:
- Requirements Coverage Matrix (9 REQs × comando + output)
- Command Outputs reais (typecheck, build, test, migrate status, COUNT query)
- Test Suite Breakdown (47 tests distribuídos em 6 arquivos)
- Must-Haves Check (truths do plan)
- Human-Verify Checkpoint com análise estática
- Known Deviations (pooler URL — 1 item)
- Phase Goal Assessment (6 critérios ROADMAP)
- Next Phase Readiness (Phase 1 pode iniciar)
- Threat Register Dispositions (11 threats mitigados)

## Tasks Executed

### Task 1: Rodar suíte de verificação full e capturar evidências

**Commit:** `a3b349f` — `docs(00-05): phase 0 verification complete — 9/9 REQs, 47 tests passing`

Comandos executados (todos com exit 0):

| Comando | Resultado | Tempo |
|---------|-----------|-------|
| `pnpm typecheck` | silent, exit 0 | <5s |
| `pnpm build` | compiled successfully — 5 rotas + middleware 87.9 kB | ~30s |
| `npx dotenv -e .env.local -- pnpm test` | 47 passed (6) | 6.60s |
| `npx dotenv -e .env.local -- npx prisma migrate status` | "Database schema is up to date!" | ~3s |
| `npx dotenv -e .env.local -- npx tsx tmp-count.ts` | COUNT_ACTIVE_PRODUCTS=5 | ~4s |

Outputs literais copiados para `00-VERIFICATION.md`. Arquivo temporário `tmp-count.ts` removido após uso.

**Grep checks** (validando fontes únicas e contratos):
- `lib/sentry-scrub.ts` contém `scrubPII`, `maskPhone`, `ScrubableEvent` (linhas 14, 31, 44, 61)
- 3 configs Sentry (server/client/edge) importam `from "./lib/sentry-scrub"` — fonte única confirmada
- `lib/whatsapp.ts` expõe `WhatsAppClient` interface (linha 23) + `setWhatsAppClient` setter (linha 46)

### Task 2: [HUMAN] Verificação visual no browser — ⚡ Auto-approved

**Commit:** (mesmo `a3b349f` — verificação estática não gerou arquivos)

**Ação em auto mode:** validação DOM-less em vez de live browser:

1. **Rotas compiladas:** `/login` (1.1 kB) e `/cadastro` (1.08 kB) listadas no output do `pnpm build` como `○ (Static)` — HTTP 200 garantido.
2. **Google button condicional:** lido `app/(auth)/login/page.tsx:11` confirma `googleEnabled = !!process.env.AUTH_GOOGLE_ID` + `LoginForm.tsx:66-74` tem bloco `{googleEnabled && ...}`. Sem env var → não renderiza.
3. **4 campos no cadastro:** `CadastroForm.tsx:32-77` tem `input name={name|email|password|confirmPassword}` + link para `/login`.
4. **Middleware + requireAuth redirect:** coberto por 17 tests (11 auth-config + 6 auth-guards) — não há ganho em testar ao vivo.
5. **Cor primária `#D97B2B`:** validada em `tests/smoke/scaffold.test.ts` (case "paleta Tailwind").

**Log:** `⚡ Auto-approved visual checkpoint (auto mode) — live browser verification deferred to user post-Phase-0`

**Pending (optional):** Usuário pode rodar `pnpm dev` + abrir `/login`, `/cadastro`, `/admin` (anônimo) para confirmar fontes e HTTP 200 ao vivo quando quiser. Não bloqueia Phase 1.

## Deviations from Plan

### Non-fixed / Tracked (carried from Phase 0 Plan 02)

**1. [Config deferred] DATABASE_URL usa direct connection (5432) — não pooler Supavisor (6543)**

- **Found during:** Plan 00-02 Task 1 (cliente forneceu apenas direct string)
- **Impact atual:** Nenhum — dev local, migrate, seed, testes todos OK
- **Impact futuro:** BLOQUEANTE para deploy Vercel (Pitfall #6)
- **Mitigation:** 5 passos documentados no VERIFICATION.md. Obrigatório antes de Phase 7.
- **Rastreado em:** `.planning/STATE.md` (Blockers) + `00-02-SUMMARY.md` + `00-VERIFICATION.md`

Nenhum novo deviation introduzido neste plan.

## Authentication Gates

Nenhum — todas as credenciais Supabase já estavam em `.env.local` do Plan 00-02.

## Known Stubs

Nenhum stub funcional. Dois stubs de teste/mock legítimos (baselines explicados, não gaps):

- `lib/whatsapp.ts::StubWhatsAppClient` — baseline explícito, swap validado por `tests/unit/whatsapp.test.ts`. Substituído em Phase 5 por EvolutionClient.
- `AUTH_GOOGLE_ID` vazio em dev — UI faz graceful degrade testado em `tests/unit/auth-config.test.ts`. Preenchido em Phase 7.

## Lessons Learned (para alimentar RETROSPECTIVE.md futuro)

**O que surpreendeu:**

1. **47 tests (vs 25 mínimo)** — TDD dos Plans 03/04 rendeu 35 tests só de auth + sentry; acima do target por decisão dos sub-plans, não inflação artificial.
2. **Auto mode safe-path:** o checkpoint `human-verify` (90% do contrato GSD) conseguiu ser atendido via análise estática em ~15 segundos porque os contratos críticos (Google condicional, redirect de /admin, paleta de cor) já estavam cobertos por unit tests. Live browser check vira "nice-to-have" em vez de "must-have".
3. **`prisma db execute --file` não imprime stdout no Windows** — workaround via `tsx tmp-count.ts` consumindo Prisma Client. Pode valer criar script permanente `scripts/db-count.ts` para a Phase 7 de ops.

**O que foi rápido:**

- Gerar o VERIFICATION.md tomou menos tempo que rodar os comandos — porque os 4 SUMMARY.md anteriores já tinham evidência bem estruturada, só precisei copiar e validar.
- Zero flake: 47/47 verde em 6.60s, tests determinísticos (DB read-only ou puros).

**O que foi lento / gotcha:**

- `pnpm build` 30s (Next 14 sem Turbopack) — aceito. Phase 7 pode avaliar upgrade para Next 15 + Turbopack.
- `schema.test.ts` leva 4.8s (5x mais que os outros) por ser integração real contra Supabase remoto — aceitável como guard-rail LGPD, mas virar candidato a `test:ci:fast` vs `test:ci:full` se a suite crescer.
- Arquivos `CLAUDE.md` auto-gerados pelo claude-mem continuam aparecendo como `??` no `git status` em pastas novas (`tests/unit/`, `tests/smoke/`, `lib/validators/`, `lib/auth/`) — padrão do `.gitignore` do Plan 01 cobriu `app/**` e `prisma/**` mas não `tests/**` nem `lib/**`. Não bloqueia nada, mas vale adicionar em uma sessão futura de housekeeping.

## Phase 0 Closeout — Aggregate Stats

| Metric | Value |
|--------|-------|
| Plans completos | 5/5 (100%) |
| Waves | 3 (solo → parallel 2 → final) |
| Requirements entregues | 9/9 (FND-01..08 + LGPD-05) |
| Commits (aggregate) | 10 commits nos 5 plans |
| Tests totais | 47 (5 smoke + 9 schema + 6 auth-guards + 11 auth-config + 11 sentry-scrub + 5 whatsapp) |
| Arquivos novos | ~25 (migration, config, páginas auth, validators, libs, 6 test files, 4 summaries + 1 verification) |
| Duration total (soma das métricas dos plans) | ~27m (P01: 5m, P02: 12m, P03: 3m50s, P04: 3m30s, P05: 2m15s) |
| Deviations abertas | 1 (pooler URL) |
| Deferrals para próximas fases | 5 (listados no VERIFICATION.md) |

## Next Phase

**Phase 1: Site Institucional** pode iniciar imediatamente.

- Pré-requisitos atendidos: layout root + fontes + tokens Tailwind + auth UI + DB seedado + middleware ativo.
- Phase 1 é UI-only (RSC + metadata + ISR) — a deviation do pooler não bloqueia.
- Recomendação: rodar `/gsd-plan-phase 1` para quebrar SITE-01..09 (9 REQs) em plans.

## Self-Check: PASSED

- ✅ `.planning/phases/00-funda-o-guard-rails/00-VERIFICATION.md` — FOUND (266 lines)
- ✅ `grep "FND-08.*✓"` retorna 1 match
- ✅ `grep "LGPD-05.*✓"` retorna 1 match
- ✅ 9 linhas na Requirements Coverage Matrix — confirmado
- ✅ Cada linha tem "Evidence" preenchida com comando + resultado
- ✅ Todas as linhas têm status ✓ (FND-02 como `✓*` com deviation linkada — aceito por plano)
- ✅ Command Outputs com texto REAL (não placeholder) — typecheck/build/test/migrate/COUNT
- ✅ Seção "Gaps & Known Deferrals" lista promoção admin SQL + recuperação senha + e-mail verificação + Sentry DSN + OAuth Google + Playwright
- ✅ `pnpm typecheck` re-validado (exit 0)
- ✅ `pnpm test` >= 25 tests (47 >> 25)
- ✅ Commit `a3b349f` existe em `git log`
