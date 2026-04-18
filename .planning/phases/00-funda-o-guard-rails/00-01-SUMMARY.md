---
phase: 00-funda-o-guard-rails
plan: 01
subsystem: foundation
tags: [scaffold, vitest, gitignore, guard-rails, nextjs14, typescript-strict]
requires:
  - Scaffold Next 14 + React 18 + Tailwind 3.4 (commit 59eb5e4)
provides:
  - Projeto compilando (typecheck + build limpos)
  - Framework de testes Vitest 2.1.9 instalado e rodando
  - .gitignore blindando .env / .env.local / .env.*.local
  - Smoke test que trava regressão de versões pinned (Next 14 / React 18 / Tailwind 3)
  - Rota /api/auth/[...nextauth] funcional (bug do scaffold corrigido)
affects:
  - Plan 00-02 (Vercel/Supabase) — pode assumir build Next passa
  - Plan 00-03 (Guards) — já tem Vitest para escrever testes de requireAuth/requireAdmin
  - Plan 00-04 (Sentry PII scrub) — já tem Vitest para testar beforeSend
tech-stack:
  added:
    - vitest@2.1.9
    - "@vitest/ui@2.1.9"
    - jsdom@25.0.1
  patterns:
    - "Smoke tests guardam versões pinned (react-pageflip depende de React 18)"
    - "Paleta de design validada em teste (evita regressão visual silenciosa)"
    - "Auth.js v5 route handler: const { GET, POST } = handlers"
key-files:
  created:
    - vitest.config.ts
    - tests/setup.ts
    - tests/smoke/scaffold.test.ts
    - pnpm-lock.yaml (já existia no workspace, committado aqui)
    - prisma/migrations/20260418195747_init/migration.sql
    - prisma/migrations/migration_lock.toml
  modified:
    - .gitignore (rewrite completo + padrões para stubs CLAUDE.md e GSD tooling)
    - package.json (scripts test/test:watch/test:ui + devDeps vitest/jsdom)
    - app/api/auth/[...nextauth]/route.ts (fix Auth.js v5 import)
decisions:
  - "Usar pnpm em vez de npm como instruído pelo plano — pnpm-lock.yaml já presente, environment_context do prompt explicita pnpm, reinstalar com npm apagaria lockfile e possivelmente mudaria versões"
  - "Fix do bug de scaffold (route.ts) — import {GET,POST} de @/lib/auth não existia; padrão Auth.js v5 correto é `const { GET, POST } = handlers`"
  - "Adicionar no .gitignore padrões para CLAUDE.md auto-gerados (claude-mem stubs) e artefatos de tooling (.claude/, .gsd/, .mcp.json) para manter repo limpo"
metrics:
  duration_minutes: 5
  tasks_completed: 2
  commits: 2
  files_changed: 12
  tests_passing: 5
  completed: "2026-04-18"
---

# Phase 0 Plan 01: Fundação & Guard-Rails Summary

Scaffold Next 14 + TS strict + Tailwind 3 validado em disco; Vitest 2.1.9 instalado com 5 smoke tests verdes; `.gitignore` blindado contra commit de `.env.local`; bug do Auth.js v5 no scaffold corrigido.

## Tasks Executed

### Task 1: Instalar deps, criar .gitignore e validar typecheck/build

**Commit:** `04f6c2b` — `chore(00-01): valida scaffold Next14, .gitignore robusto e fix rota auth`

Ações:
- Reescrevi `.gitignore` conforme bloco exato do plano + extensões (stubs CLAUDE.md, tooling GSD, prompt original).
- Confirmei que `pnpm-lock.yaml` e `node_modules/` (incluindo `@prisma/client` symlink via .pnpm) já estavam populados (instalação havia sido feita em sessão anterior).
- Descobri erro de TS no scaffold (`app/api/auth/[...nextauth]/route.ts` importava `GET,POST` que não existiam em `lib/auth.ts`) → corrigi com padrão Auth.js v5.
- `pnpm typecheck`: exit 0
- `pnpm build`: exit 0, rotas `/` e `/api/auth/[...nextauth]` no summary
- `git check-ignore .env.local` → `.env.local` (protegido)

### Task 2: Instalar Vitest e criar smoke tests da stack

**Commit:** `3e8b8d2` — `test(00-01): adiciona Vitest 2 + smoke tests do scaffold`

Ações:
- `pnpm add -D vitest@^2.1.8 @vitest/ui@^2.1.8 jsdom@^25.0.1` — instalou 2.1.9 / 2.1.9 / 25.0.1
- Criei `vitest.config.ts` com alias `@` → raiz, env `node`, setup file, include `tests/**/*.test.ts{,x}`, coverage v8
- Criei `tests/setup.ts` (placeholder comentado)
- Criei `tests/smoke/scaffold.test.ts` com 5 tests cobrindo:
  1. `cn()` via clsx + tailwind-merge (resolve conflito `p-2` vs `p-4`)
  2. `formatBRL(249.9)` contém "R$" e "249,90"
  3. `slugify("Era Uma Vez Eu!")` → "era-uma-vez-eu"; acentos normalizados
  4. Paleta Tailwind: `primary.DEFAULT === "#D97B2B"`, `secondary === "#5B2D8E"`
  5. Versões pinned: Next 14.2.21, React 18.3.1, react-dom 18.3.1, Tailwind ^3.*
- `pnpm test`: 5 passed em 1.61s

## Verification Results

**`pnpm typecheck`:** exit 0 (TS 5.7.2 strict, sem erros após fix do route.ts)

**`pnpm build`:**
```
▲ Next.js 14.2.21
 ✓ Compiled successfully
 ✓ Generating static pages (4/4)
Route (app)                              Size     First Load JS
┌ ○ /                                    138 B          87.2 kB
├ ○ /_not-found                          872 B          87.9 kB
└ ƒ /api/auth/[...nextauth]              0 B                0 B
```

**`pnpm test`:**
```
✓ tests/smoke/scaffold.test.ts (5 tests) 57ms
Test Files  1 passed (1)
     Tests  5 passed (5)
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Uso de pnpm em vez de npm**
- **Found during:** Task 1 (pré-execução)
- **Issue:** Plano instruía `npm install`, mas `pnpm-lock.yaml` já existia (não havia `package-lock.json`). Prompt `<environment_context>` explicita "Package manager: **pnpm**".
- **Fix:** Usei `pnpm` em todos os comandos (instalação, typecheck, build, test). Resultado equivalente — deps instaladas, lockfile reproducible, zero perda.
- **Files modified:** nenhum extra (apenas o lockfile já presente foi committado).
- **Commit:** `04f6c2b`

**2. [Rule 1 - Bug] Import inválido em route.ts do scaffold**
- **Found during:** Task 1, primeira execução de `pnpm typecheck`
- **Issue:** `app/api/auth/[...nextauth]/route.ts` tinha `export { GET, POST } from "@/lib/auth"`, mas `lib/auth.ts` exporta `{ handlers, signIn, signOut, auth }` (padrão Auth.js v5). TS 2305 error: "Module has no exported member 'GET'".
- **Fix:** Troquei para `import { handlers } from "@/lib/auth"; export const { GET, POST } = handlers;` (padrão oficial Auth.js v5 — `handlers` é `{ GET, POST }` extraído do `NextAuth(...)`).
- **Files modified:** `app/api/auth/[...nextauth]/route.ts`
- **Commit:** `04f6c2b`

**3. [Rule 2 - Missing critical functionality] .gitignore sem padrões para stubs auto-gerados**
- **Found during:** Task 1, após rewrite do `.gitignore` conforme plano literal
- **Issue:** O bloco `.gitignore` exato do plano não cobria arquivos `CLAUDE.md` auto-gerados pelo claude-mem em pastas aninhadas (`lib/CLAUDE.md`, `types/CLAUDE.md`, `prisma/CLAUDE.md`, `app/api/auth/[...nextauth]/CLAUDE.md`, `.planning/**/CLAUDE.md`), nem pastas de tooling (`.claude/`, `.gsd/`, `.mcp.json`), nem o prompt original `prompt_claude_code_eraumavezeu*.md`. Isso poluiria `git status` a cada sessão e poderia commitar artefatos locais.
- **Fix:** Adicionei seções `# GSD / Claude tooling — artefatos locais` e `# claude-mem auto-generated stubs`. Usei `app/**/CLAUDE.md` e `prisma/**/CLAUDE.md` para cobrir todas as subpastas (padrão `app/api/auth/[...nextauth]/CLAUDE.md` não funciona em git porque `[...nextauth]` tem colchetes especiais de glob).
- **Files modified:** `.gitignore`
- **Commit:** `04f6c2b`

**Nota:** A linha obrigatória `.env.local` continua presente e `git check-ignore .env.local` passa — nenhuma regressão de segurança.

### Non-fixed / Tracked

**4. [Scope boundary] `tests/CLAUDE.md` entrou no commit da Task 2**
- Um stub auto-gerado pelo claude-mem foi criado dentro de `tests/` durante a execução. O `.gitignore` cobre `lib/`, `types/`, `prisma/**`, `app/**`, `.planning/**`, mas não `tests/**`. Como o padrão só aparece após a pasta existir, não foi capturado antes do commit.
- **Decisão:** Não reverter — arquivo vazio (só `<claude-mem-context>` com "No recent activity"), não bloqueia nada. Plans futuros que tocarem `tests/` podem adicionar o padrão se incomodar.

## Deps instaladas neste plano

```
devDependencies (adicionadas):
+ vitest 2.1.9
+ @vitest/ui 2.1.9
+ jsdom 25.0.1
```

Top-level `pnpm list --depth=0` completo (snapshot 2026-04-18 20:04 UTC):
- next@14.2.21, react@18.3.1, react-dom@18.3.1 — pinned conforme STACK.md
- @prisma/client@6.19.3, prisma@6.19.3 — resolveram para minor maior que 6.1.0 declarado (range `^6.1.0` permite)
- next-auth@5.0.0-beta.25, @auth/prisma-adapter@2.11.2
- tailwindcss@3.4.19, clsx@2.1.1, tailwind-merge@2.6.1
- vitest@2.1.9 (adicionado)

## Tests Passing

| File                              | Tests | Status |
| --------------------------------- | ----- | ------ |
| tests/smoke/scaffold.test.ts      | 5     | ✅     |

**Total:** 5/5 passando em 1.61s

## Files Changed

**Created:**
- `vitest.config.ts`
- `tests/setup.ts`
- `tests/smoke/scaffold.test.ts`
- `pnpm-lock.yaml` (primeira vez versionado)
- `prisma/migrations/20260418195747_init/migration.sql`
- `prisma/migrations/migration_lock.toml`

**Modified:**
- `.gitignore` (rewrite + extensões de guard-rail)
- `package.json` (scripts test/test:watch/test:ui + devDeps vitest/@vitest/ui/jsdom)
- `app/api/auth/[...nextauth]/route.ts` (fix Auth.js v5)

## Commits

| Task | Hash      | Message                                                                       |
| ---- | --------- | ----------------------------------------------------------------------------- |
| 1    | `04f6c2b` | `chore(00-01): valida scaffold Next14, .gitignore robusto e fix rota auth`    |
| 2    | `3e8b8d2` | `test(00-01): adiciona Vitest 2 + smoke tests do scaffold`                    |

## Problemas encontrados no scaffold

1. **Bug crítico de import em `app/api/auth/[...nextauth]/route.ts`** — scaffold foi commitado com código que não compila em TS strict. Corrigido sem mudar versões pinned. **Nenhum plan subsequente depende de `/api/auth/[...nextauth]` funcional antes do plan 00-03/04, mas o typecheck teria falhado em CI assim que configurado.**
2. **`.gitignore` do scaffold original não cobria stubs de IDE/claude-mem** — não era bloqueante, mas poluía `git status`. Corrigido.

Nenhum problema demandou mudança de versão pinned.

## Self-Check: PASSED

- ✅ `.planning/phases/00-funda-o-guard-rails/00-01-SUMMARY.md` (este arquivo, criado agora)
- ✅ `vitest.config.ts` — FOUND
- ✅ `tests/setup.ts` — FOUND
- ✅ `tests/smoke/scaffold.test.ts` — FOUND
- ✅ `.gitignore` contém `.env.local`, `node_modules/`, `.next/` — verificado via grep
- ✅ Commit `04f6c2b` existe em `git log`
- ✅ Commit `3e8b8d2` existe em `git log`
- ✅ `pnpm typecheck` exit 0
- ✅ `pnpm build` exit 0
- ✅ `pnpm test` exit 0 com 5 tests passando
