---
phase: 00-funda-o-guard-rails
plan: 04
subsystem: observability-lgpd
tags:
  - sentry
  - lgpd
  - pii-scrub
  - whatsapp
  - interface
  - tdd
  - security
requires:
  - 00-01 (scaffold Sentry + lib/whatsapp stubs)
provides:
  - lib/sentry-scrub.ts (fonte única da verdade para scrubPII + maskPhone)
  - sentry.edge.config.ts com beforeSend (antes não tinha)
  - 11 tests de scrub PII cobrindo LGPD-05 (password, photos, photoKeys, cpf, phone, ip_address, null-safety, preservação de campos não-PII)
  - 5 tests de contrato WhatsAppClient (FND-06) provando que swap é troca de objeto
affects:
  - todo evento Sentry (server/client/edge) agora passa pelo mesmo scrubPII
  - Fase 5 (Evolution API) pode trocar o stub com setWhatsAppClient(new EvolutionClient()) — sem refactor
tech-stack:
  added: []
  patterns:
    - Pure-function + injectable singleton (let client + setter) para swap em runtime
    - Regex-only PII scrub (edge-safe: sem Node built-ins, sem deps externas)
    - Drop vs mask: dados de criança (photos, photoKeys, cpf) → drop completo; telefone → mask preservando 4 últimos
key-files:
  created:
    - lib/sentry-scrub.ts
    - tests/unit/sentry-scrub.test.ts
    - tests/unit/whatsapp.test.ts
  modified:
    - sentry.server.config.ts
    - sentry.client.config.ts
    - sentry.edge.config.ts
decisions:
  - "beforeSend delega (não absorve) o retorno: scrubPII muta in-place e o handler retorna o evento original — evita conflito de tipos com Sentry.ErrorEvent (que tem Index signature diferente de ScrubableEvent)"
  - "Cast unknown → ScrubableEvent no beforeSend: permite desacoplar a tipagem da lib dos tipos internos do @sentry/nextjs (que mudam entre versões)"
  - "Stub WhatsApp permanece no lib/whatsapp.ts original (não exportado publicamente) — o test recria equivalente para evitar vazamento de estado entre arquivos de teste"
  - "maskPhone usa regex pura /\\d(?=\\d{4})/g — edge-safe, funciona do server ao edge runtime"
metrics:
  duration: 3m30s
  tasks: 2
  files: 6
  tests_added: 16
  tests_total_before: 31
  tests_total_after: 47
  completed_date: 2026-04-18
requirements:
  - FND-06
  - FND-07
  - LGPD-05
---

# Phase 00 Plan 04: PII Scrub + WhatsApp Contract Tests Summary

DRY no scrub PII do Sentry via `lib/sentry-scrub.ts` (fonte única entre server/client/edge) com 11 tests + 5 tests de contrato WhatsApp que provam swap Evolution→Cloud = uma chamada a `setWhatsAppClient`.

## What Was Built

### 1. `lib/sentry-scrub.ts` — fonte única do scrub PII

- `scrubPII<E>(event: E): E` — muta in-place, retorna o mesmo evento.
- `maskPhone(phone: string): string` — regex pura, edge-safe.
- Zero dependências de runtime Node. Apenas JS/regex → funciona em Edge Runtime.
- Export type `ScrubableEvent` define um shape mínimo desacoplado de `@sentry/nextjs`.

**Campos removidos em `request.data`:** `password`, `photos`, `photoKeys`, `cpf`
**Campos mascarados em `request.data`:** `phone` (últimos 4 dígitos preservados)
**Campos removidos em `event.user`:** `ip_address`
**Campos preservados:** `email`, `orderId`, `total`, `user.id`, `user.email`, demais.

### 2. Refatoração dos 3 configs Sentry

| Config | Antes | Agora |
| --- | --- | --- |
| `sentry.server.config.ts` | `delete data.password; delete data.photos; ...` inline | `scrubPII(event)` + return |
| `sentry.client.config.ts` | Função `scrubPII` LOCAL duplicada | `import { scrubPII } from "./lib/sentry-scrub"` |
| `sentry.edge.config.ts` | **Sem beforeSend** (gap) | `scrubPII` aplicado |

Grep confirma:
- `sentry.*.config.ts` contém `import.*scrubPII.*from.*sentry-scrub` nos 3 arquivos
- `sentry.*.config.ts` tem **zero** ocorrências de `delete data.(password|photos|photoKeys|cpf)` inline

### 3. Tests

| Arquivo | Tests | Foco |
| --- | --- | --- |
| `tests/unit/sentry-scrub.test.ts` | 11 | LGPD-05 regression net (drop, mask, null-safe, preservação) |
| `tests/unit/whatsapp.test.ts` | 5 | FND-06 contract (stub default, swap, pass-through, isolamento, swap Evolution→Cloud) |

**Total projeto:** 47 tests (era 31 após Plan 00-03; +16 deste plan).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Conflito de tipos no retorno de `beforeSend`**

- **Found during:** Task 1 (typecheck após refatorar os 3 configs)
- **Issue:** `scrubPII<E>(event): E` retorna um `ScrubableEvent`, mas Sentry espera `ErrorEvent | null`. O cast direto `event as Parameters<typeof scrubPII>[0]` forçava o tipo de retorno da função a divergir — TS reclamou de "Index signature for type 'string' missing in ErrorEvent".
- **Fix:** Em vez de confiar no tipo de retorno genérico do `scrubPII`, os handlers agora fazem: `scrubPII(event as unknown as ...)` (muta in-place) e depois `return event;` — preservando o tipo `ErrorEvent` do Sentry. Mais limpo e mais honesto (a função é in-place).
- **Files modified:** `sentry.server.config.ts`, `sentry.client.config.ts`, `sentry.edge.config.ts`
- **Commit:** `204b28c` (já consolidado)

**2. [Rule 2 - Correctness] Test extra para `data` null/undefined**

- **Found during:** Task 1 (pensando no threat model)
- **Issue:** O plan especificava 10 tests; adicionei um 11º cobrindo explicitamente `request.data === null` e `request.data === undefined` — caso real em eventos Sentry de middleware (ex: edge runtime pode ter request sem body parsed).
- **Fix:** Test "não crasha com request.data null ou undefined" adicionado à suite.
- **Files modified:** `tests/unit/sentry-scrub.test.ts`
- **Commit:** `204b28c`

### Scope Boundaries

- CRLF warnings do git no Windows foram ignorados (são de renormalização de line endings, não do diff funcional).
- `.planning/config.json` apareceu modificado no `git status` — não relacionado a este plan (provavelmente estado do GSD tools de sessão anterior); não stageado.

## Verification

### Automated

| Check | Result |
| --- | --- |
| `pnpm test` | 47/47 passing (era 31) |
| `pnpm typecheck` | exit 0 |
| `pnpm build` | compiled successfully (Next 14.2.21) |
| Grep `import.*scrubPII` em sentry.*.config.ts | 3 matches (server/client/edge) |
| Grep `delete data.(password\|photos\|photoKeys\|cpf)` em sentry.*.config.ts | 0 matches |

### Threat Model Mitigations Delivered

| Threat ID | Mitigation | Evidence |
| --- | --- | --- |
| T-00-13 (I) | scrubPII executa em server/client/edge | 3 importações confirmadas |
| T-00-14 (R) | photos/photoKeys DROP (não mask) | Tests 2 e 3 |
| T-00-15 (I) | phone mask preserva só 4 últimos | Test 5 + `maskPhone` |

## Known Stubs

Nenhum. A Task 2 valida EXPLICITAMENTE o contrato do stub — é esperado e serve de baseline para a Fase 5 substituir por implementação real de Evolution/Cloud API.

## Handoff Notes para Fase 5 (Comunicação)

Quando COMM-03 (Evolution API) for implementado:

1. Criar `lib/whatsapp/evolution.ts` com `class EvolutionClient implements WhatsAppClient`
2. Criar `lib/whatsapp/init.ts` chamando `setWhatsAppClient(new EvolutionClient())` — importado na raiz (ex: `instrumentation.ts`)
3. Adicionar tests espelhando `tests/unit/whatsapp.test.ts` que instanciem `EvolutionClient` com mock do SDK Evolution
4. **NÃO alterar `lib/whatsapp.ts`** — o contrato já está selado.

## Self-Check: PASSED

- `lib/sentry-scrub.ts` → FOUND
- `tests/unit/sentry-scrub.test.ts` → FOUND (11 tests)
- `tests/unit/whatsapp.test.ts` → FOUND (5 tests)
- `sentry.server.config.ts` import scrubPII → FOUND
- `sentry.client.config.ts` import scrubPII → FOUND
- `sentry.edge.config.ts` import scrubPII → FOUND (beforeSend adicionado)
- Commit `204b28c` (refactor sentry scrub + 11 tests) → FOUND
- Commit `7c0e54f` (whatsapp interface contract tests) → FOUND
