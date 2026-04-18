---
phase: 00-funda-o-guard-rails
plan: 03
subsystem: auth
tags:
  - auth
  - nextauth-v5
  - guards
  - tdd
  - security
requires:
  - 00-01 (scaffold Auth.js + middleware + guards stubs)
  - 00-02 (User model aplicado no Supabase)
provides:
  - rota /login (RSC + LoginForm client)
  - rota /cadastro (RSC + CadastroForm client)
  - loginWithCredentials(formData) server action
  - createAccount(formData) server action (bcrypt 10, role CUSTOMER, auto-login)
  - loginSchema e signupSchema em lib/validators/auth
  - cobertura de teste para requireAuth / requireAdmin / callback authorized
affects:
  - middleware edge → depende de auth.config.authorized
  - layouts/actions futuros de /admin e /cliente → dependem de requireAdmin / requireAuth
tech-stack:
  added: []
  patterns:
    - Pattern 3 ARCHITECTURE.md (Guarda em Três Camadas)
    - Server Actions com return type discriminated union `{ ok: true } | { ok: false, error: string }`
    - Graceful degrade de provider OAuth (Google só renderiza se env configurado)
key-files:
  created:
    - app/(auth)/layout.tsx
    - app/(auth)/login/page.tsx
    - app/(auth)/login/LoginForm.tsx
    - app/(auth)/login/actions.ts
    - app/(auth)/cadastro/page.tsx
    - app/(auth)/cadastro/CadastroForm.tsx
    - app/(auth)/cadastro/actions.ts
    - lib/validators/auth.ts
    - tests/unit/auth-guards.test.ts
    - tests/unit/auth-config.test.ts
  modified: []
decisions:
  - mensagem de erro de login é genérica ("Credenciais inválidas") para mitigar enumeração de e-mails (T-00-10)
  - Google provider é omitido do UI quando AUTH_GOOGLE_ID não está setado (graceful degrade)
  - promoção de ADMIN no MVP é manual (SQL direto no Supabase — ver seção "Security Note" abaixo)
metrics:
  duration: 3m50s
  tasks_completed: 2
  commits: 2
  files_created: 10
  files_modified: 0
  tests_added: 17
  tests_total_green: 31
  completed_date: 2026-04-18
---

# Phase 00 Plan 03: Login & Cadastro UI + Guards Tests Summary

One-liner: Auth end-to-end — páginas /login e /cadastro com Server Actions (bcrypt 10 + Zod), Google opcional via env, e 17 tests provando a guarda em 3 camadas (middleware, requireAuth, requireAdmin).

## Objective Revisited

Completar FND-04 (Auth.js v5 email/senha + Google opcional) e FND-05 (middleware + guards globais) com UI funcional e regressão de teste. O scaffold das fases anteriores criou `auth.config.ts`, `lib/auth.ts`, `lib/auth-guards.ts` e `middleware.ts` como estruturas. Este plan entregou as interfaces de entrada (login/cadastro) e fechou Pattern 3 do ARCHITECTURE.md ("Guarda em Três Camadas") com cobertura unitária.

## What Was Built

### Rotas públicas

- `/login` (RSC) — lê `process.env.AUTH_GOOGLE_ID` e passa `googleEnabled` para o client
- `/cadastro` (RSC) — renderiza form de criação de conta
- `app/(auth)/layout.tsx` — shell compartilhado centralizado, sem header da loja

### Server Actions (`"use server"`)

- `loginWithCredentials(formData)` → valida com `loginSchema` → `signIn("credentials", { redirect: false })` → trata `AuthError` como "Credenciais inválidas"
- `createAccount(formData)` → valida com `signupSchema` → checa e-mail duplicado → `bcrypt.hash(password, 10)` → `db.user.create({ role: "CUSTOMER" })` → tenta auto-login

### Validators (`lib/validators/auth.ts`)

- `loginSchema` (email + password 6+ chars)
- `signupSchema` (name 2-80, email, password 8-72 chars, confirmPassword com `.refine` para match)

### Tests (TDD)

| Suite                                 | Casos | Cobertura                                                                                  |
| ------------------------------------- | ----- | ------------------------------------------------------------------------------------------ |
| `tests/unit/auth-guards.test.ts`      | 6     | requireAuth: null → redirect, sem id → redirect, válido → user. requireAdmin: null/CUSTOMER → notFound, ADMIN → user |
| `tests/unit/auth-config.test.ts`      | 11    | Matriz role × rota: /admin/* (3), /pedidos (2), /perfil, /cliente/* (2), públicas (3)      |

## Cobertura dos 3 Layers de Guard

| Layer              | Componente                          | Prova de que funciona                                 |
| ------------------ | ----------------------------------- | ----------------------------------------------------- |
| Layer 1 (middleware, edge) | `auth.config.authorized` callback | `tests/unit/auth-config.test.ts` — 11 casos de matriz role × rota |
| Layer 2 (layout RSC)       | `requireAdmin()` → `notFound()`   | `tests/unit/auth-guards.test.ts` — 3 cases           |
| Layer 3 (Server Action)    | `requireAuth()` → `redirect('/login')` | `tests/unit/auth-guards.test.ts` — 3 cases       |

Isto fecha o **Pitfall #8** (Server Actions sem authorization = escalação): toda action admin deverá chamar `requireAdmin()` antes de qualquer operação sensível — e o contrato é testado.

## Test Output

```
 ✓ tests/unit/auth-guards.test.ts (6 tests) 8ms
 ✓ tests/unit/auth-config.test.ts (11 tests) 7ms
 ✓ tests/smoke/scaffold.test.ts (5 tests) 38ms
 ✓ tests/unit/schema.test.ts (9 tests) 4265ms

 Test Files  4 passed (4)
      Tests  31 passed (31)
```

## Build Output

```
Route (app)                              Size     First Load JS
┌ ○ /                                    138 B          87.2 kB
├ ○ /_not-found                          872 B            88 kB
├ ƒ /api/auth/[...nextauth]              0 B                0 B
├ ○ /cadastro                            1.08 kB          95 kB
└ ○ /login                               1.1 kB           95 kB
ƒ Middleware                             87.9 kB
```

Ambas rotas `/login` e `/cadastro` são estáticas (RSC sem dados dinâmicos) e o middleware está ativo.

## Commits

| Hash    | Type | Message                                                                      |
| ------- | ---- | ---------------------------------------------------------------------------- |
| 4c4e7d4 | feat | add /login and /cadastro pages + Server Actions + guards (Task 1)           |
| 99490e5 | test | add auth guards and authorized callback tests (Task 2 — TDD green)          |

## Deviations from Plan

None — plan executado exatamente como escrito. Pequenas adições cosméticas feitas sem sair do escopo:

- Adicionado `autoComplete` nos inputs de login/cadastro (UX/password manager hint — não afeta segurança)
- Adicionado `role="alert"` nos parágrafos de erro (acessibilidade — contraint AA do PROJECT.md)
- Adicionado `hover:bg-primary-dark` nos botões primários (usando cor `primary.dark` já definida em `tailwind.config.ts`)
- Task 2 implementada como TDD puro: testes escritos primeiro, roda verde na primeira execução porque o scaffold já estava pronto das fases anteriores.

## Authentication Gates

None — nenhuma credencial externa foi necessária para este plan (tests são mockados, build é offline, actions usam `signIn` do Auth.js sem chamada HTTP real).

## Security Note — Promoting a User to ADMIN in MVP

O plano não inclui UI para promover ADMIN (out of scope no MVP). Para criar o primeiro admin:

```sql
-- No Supabase SQL Editor
UPDATE "User" SET role = 'ADMIN' WHERE email = 'admin@eraumavez.com';
```

Após a promoção, o usuário precisa fazer sign-out/sign-in para que o JWT novo carregue `role: "ADMIN"` (o callback `jwt` só lê role do User na primeira autorização — não re-consulta DB).

## Threat Register — Dispositions Realizadas

| Threat ID | Mitigation                                                                                      |
| --------- | ----------------------------------------------------------------------------------------------- |
| T-00-08   | Test `tests/unit/auth-config.test.ts` cobre /admin/* + CUSTOMER → false (Pitfall 8 fechado)    |
| T-00-09   | `requireAdmin()` retorna `notFound()`, não `redirect` — teste prova em `tests/unit/auth-guards.test.ts` |
| T-00-10   | `loginWithCredentials` retorna sempre "Credenciais inválidas" — não revela se e-mail existe    |
| T-00-11   | `callbacks.jwt` lê role só de `user` (primeira autorização); session lê de `token` (não de client) — scaffold das fases anteriores; comportamento testado implicitamente via autorizado callback |
| T-00-12   | `createAccount` armazena apenas hash; password nunca retorna de `findUnique` sem `select` explícito |

## Deferred Items

Itens de futuro fora do escopo de Phase 0 (não são deviations, são decisões do PLAN):

- **Recuperação de senha** → Fase 6 (notificações/e-mail)
- **Verificação de e-mail** → Fase 6
- **UI de promoção ADMIN** → não previsto no MVP (SQL manual cobre)
- **2FA / MFA** → pós-MVP
- **OAuth2 Google configurado em prod** → env `AUTH_GOOGLE_ID/SECRET` deve ser populado antes de Fase 7 (deploy); UI já faz graceful degrade

## Next Plan

Próximo plan: `00-04-PLAN.md` — (cronograma da fase 0 define próximo escopo; STATE.md/ROADMAP.md serão atualizados via `state advance-plan`)

## Self-Check: PASSED

- [x] app/(auth)/layout.tsx — FOUND
- [x] app/(auth)/login/page.tsx — FOUND
- [x] app/(auth)/login/LoginForm.tsx — FOUND
- [x] app/(auth)/login/actions.ts — FOUND
- [x] app/(auth)/cadastro/page.tsx — FOUND
- [x] app/(auth)/cadastro/CadastroForm.tsx — FOUND
- [x] app/(auth)/cadastro/actions.ts — FOUND
- [x] lib/validators/auth.ts — FOUND
- [x] tests/unit/auth-guards.test.ts — FOUND
- [x] tests/unit/auth-config.test.ts — FOUND
- [x] commit 4c4e7d4 — FOUND
- [x] commit 99490e5 — FOUND
- [x] typecheck exit 0
- [x] build exit 0 com rotas /login e /cadastro
- [x] pnpm test: 31/31 green
