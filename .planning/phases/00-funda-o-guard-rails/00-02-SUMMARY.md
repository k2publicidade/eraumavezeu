---
phase: 00-funda-o-guard-rails
plan: 02
subsystem: database
tags: [supabase, prisma, migration, seed, postgres, lgpd, idempotencia]
requires:
  - Plan 00-01 concluído (Vitest + .gitignore + scaffold validado)
  - Projeto Supabase provisionado pelo cliente (k2publicidade2@gmail.com)
  - Credenciais DATABASE_URL/DIRECT_URL em .env.local (gitignored)
provides:
  - Banco Supabase real com schema completo aplicado (10 tabelas)
  - Migration inicial versionada (prisma/migrations/20260418195747_init/)
  - 5 produtos seedados com preços exatos do brief (total R$ 589,50)
  - Constraint Order.paymentId UNIQUE (base de idempotência para webhook MP da Fase 4)
  - Index Customization.photosExpireAt (base do cron de retenção LGPD da Fase 7)
  - Testes automatizados (tests/unit/schema.test.ts) validando slug, preço e tipo de cada produto
  - dotenv-cli devDep instalado (padrão para rodar scripts com .env.local)
affects:
  - Plan 00-03 (Guards) — pode usar PrismaClient real para testar requireAuth/requireAdmin
  - Plan 00-04 (Sentry PII scrub) — pode ler dados de teste do banco
  - Plan 00-05 (CI/deploy dry-run) — migration lock pronta para rodar em ambiente CI
  - Phase 02 (Wizard + Upload) — Customization já existe com consentIp, consentAt, photosExpireAt
  - Phase 03 (Carrinho) — 5 Products com Decimal(10,2) prontos para cálculo de combo
  - Phase 04 (Checkout/Pagamento) — Order.paymentId UNIQUE garante idempotência do webhook MP
  - Phase 07 (LGPD retention) — Customization.photosExpireAt indexado para cron
tech-stack:
  added:
    - dotenv-cli@11.0.0 (devDep) — carrega .env.local em `prisma migrate` e `vitest`
  patterns:
    - "Teste de integração contra DB real (não mock): garante que schema + seed ficam coerentes"
    - "it.each com tuplas const para iterar produtos adicionais sem duplicar asserções"
    - "beforeAll fail-fast quando DATABASE_URL ausente — evita relatório confuso de timeout"
    - "Seed idempotente via upsert — rodar múltiplas vezes não duplica nem sobrescreve com ruído"
key-files:
  created:
    - tests/unit/schema.test.ts
    - .env.local (fora do git — artefato manual do cliente)
  modified:
    - package.json (+ devDep dotenv-cli)
    - pnpm-lock.yaml
  already-present:
    - prisma/schema.prisma (Plan 00-01 commit 59eb5e4)
    - prisma/seed.ts (Plan 00-01 commit 59eb5e4)
    - prisma/migrations/20260418195747_init/migration.sql (Plan 00-01 commit 3e8b8d2)
    - prisma/migrations/migration_lock.toml
decisions:
  - "DATABASE_URL usa conexão direta (porta 5432) temporariamente em DEV — cliente forneceu apenas a string de conexão direta do dashboard Supabase. Aceito como desvio documentado para DESTRAVAR Phase 0. Migração para pooler Supavisor (6543 + pgbouncer=true&connection_limit=1) é PRÉ-REQUISITO OBRIGATÓRIO antes de Phase 7 (deploy Vercel) — Pitfall #6 do PITFALLS.md."
  - "Testes rodam contra Supabase real (não mock) — FND-08 exige validar que o banco realmente tem os 5 produtos; mockar esconderia regressão de seed."
  - "dotenv-cli preferido sobre renomear .env.local para .env — mantém separação clara entre template (.env.example commitado) e secrets locais (.env.local gitignored)."
metrics:
  duration_minutes: 12
  tasks_completed: 3
  commits: 1
  files_changed: 3
  tests_passing: 14
  completed: "2026-04-18"
---

# Phase 0 Plan 2: Migration Inicial + Seed + Testes de Schema — Summary

Migration inicial do Prisma aplicada no Supabase do cliente, 5 produtos seedados com preços do brief, e suite de testes de integração validando o invariante de dados (9 testes novos, todos verdes).

## What was done

### Task 1 — [SETUP / human-action] Provisionar Supabase e gravar credenciais

**Executado manualmente pelo orchestrator + cliente em 2026-04-18.**

- Projeto Supabase provisionado (project_ref `qrcqdpijwophhnvwjrnd`)
- Região: auto-detectada no dashboard (provavelmente us-east-1; sul-americana não selecionada)
- Senha do Postgres armazenada em gerenciador do cliente
- `.env.local` criado na raiz contendo:
  - `DATABASE_URL` (ver deviation abaixo)
  - `DIRECT_URL` (direct connection 5432)
  - `AUTH_SECRET="BgAtYaFPCvJGrwfmZNCVh0Lg2YRZyjpJAX9voynN/hQ="` (gerado com `openssl rand -base64 32`)
  - `AUTH_URL="http://localhost:3000"`
  - `NEXT_PUBLIC_URL="http://localhost:3000"`
- `.env` espelho para Prisma default loader
- Ambos arquivos confirmados gitignored: `git check-ignore .env.local` → `.env.local` ✅

### Task 2 — [BLOCKING] Rodar migration + seed contra Supabase

**Executado manualmente pelo orchestrator em 2026-04-18.**

- `pnpm prisma migrate dev --name init` concluído com sucesso
- Arquivo gerado: `prisma/migrations/20260418195747_init/migration.sql` (169 linhas, 7357 bytes)
- 10 tabelas criadas em `public`: Account, Address, Customization, Order, OrderItem, OrderStatusHistory, Product, Session, User, VerificationToken + `_prisma_migrations`
- `pnpm db:seed` rodou após migrate — 5 produtos inseridos via upsert
- Output confirmado:
  ```
  ✓ livro-principal-capa-dura
  ✓ ebook
  ✓ livro-colorir
  ✓ quebra-cabeca
  ✓ cartela-adesivos
  Seed concluído: 5 produtos.
  ```
- Migration já estava commitada no commit `3e8b8d2` do Plan 00-01 (antecipou-se o arquivo antes de aplicar).

### Task 3 — Validar seed dos 5 produtos com teste automatizado

**Executado nesta sessão (commit `77922e8`).**

- Instalado `dotenv-cli@11.0.0` como devDep (padrão para rodar scripts lendo `.env.local`)
- Criado `tests/unit/schema.test.ts` com 6 casos (9 testes totais por causa do `it.each`):
  1. Count === 5 produtos
  2. Livro principal com slug/nome/preço/tipo/active corretos
  3. `it.each` para ebook / livro-colorir / quebra-cabeca / cartela-adesivos (4 tests)
  4. Soma dos 4 adicionais = 339.60
  5. Nenhum produto inativo (active=false count = 0)
  6. Soma total dos 5 = 589.50
- Rodado com `npx dotenv -e .env.local -- pnpm test` → **14 tests passing** (5 smoke + 9 schema)

## Evidence

### Database state (live Supabase)

```sql
SELECT slug, price, type FROM "Product" ORDER BY price DESC;
```

| slug                        | price  | type             |
| --------------------------- | ------ | ---------------- |
| livro-principal-capa-dura   | 249.90 | LIVRO_PRINCIPAL  |
| livro-colorir               |  99.90 | LIVRO_COLORIR    |
| ebook                       |  89.90 | EBOOK            |
| quebra-cabeca               |  79.90 | QUEBRA_CABECA    |
| cartela-adesivos            |  69.90 | CARTELA_ADESIVOS |

Total: **R$ 589,50** | Soma adicionais: **R$ 339,60**

### Migration applied

```
$ npx dotenv -e .env.local -- npx prisma migrate status
Environment variables loaded from .env
Prisma schema loaded from prisma\schema.prisma
Datasource "db": PostgreSQL database "postgres", schema "public" at "db.qrcqdpijwophhnvwjrnd.supabase.co:5432"

1 migration found in prisma/migrations

Database schema is up to date!
```

### Schema validated

```
$ npx prisma validate
The schema at prisma\schema.prisma is valid 🚀
```

### Critical constraints present in migration.sql

- ✅ `CREATE UNIQUE INDEX "Order_paymentId_key" ON "Order"("paymentId");` — base de idempotência MP
- ✅ `CREATE INDEX "Customization_photosExpireAt_idx" ON "Customization"("photosExpireAt");` — base cron LGPD
- ✅ 10 tabelas + `_prisma_migrations` populada (evidência indireta: `migrate status` diz "up to date")

### Test suite

```
$ npx dotenv -e .env.local -- pnpm test
✓ tests/smoke/scaffold.test.ts (5 tests)
✓ tests/unit/schema.test.ts   (9 tests)

Test Files  2 passed (2)
Tests       14 passed (14)
Duration    5.12s
```

## Deviations from Plan

### Known deviation (flagged — NÃO resolver agora)

**[Rule 2 - Config] DATABASE_URL usa direct connection (5432) em vez de Supavisor pooler (6543)**

- **Found during:** Task 1 (execução humana)
- **Issue:** O cliente forneceu apenas a string de conexão direta do dashboard (host `db.qrcqdpijwophhnvwjrnd.supabase.co:5432`), não a string do pooler (`aws-0-<region>.pooler.supabase.com:6543`). O plano exige explicitamente:
  - `DATABASE_URL` com `:6543?pgbouncer=true&connection_limit=1`
  - `DIRECT_URL` com `:5432`
- **Decision:** Aceito como desvio **temporário apenas para Phase 0 (dev local)**. Conexão direta funciona para migrate, seed e testes locais. **NÃO funciona em produção na Vercel** — vai esgotar o pool em segundos sob tráfego (Pitfall #6 do PITFALLS.md + gotcha #1 do STACK.md).
- **Mitigation (pendente, obrigatória):** Antes de deploy em Phase 7, cliente PRECISA:
  1. Ir em Supabase Dashboard → Project Settings → Database → Connection string
  2. Selecionar **Transaction** mode (porta 6543) — copiar para `DATABASE_URL`
  3. Adicionar `?pgbouncer=true&connection_limit=1` no final
  4. Manter direct connection (5432) só em `DIRECT_URL`
  5. Atualizar `.env.local` local + env vars da Vercel
- **Commit com deviation:** N/A — arquivo `.env.local` é gitignored
- **Tracked in:** esta SUMMARY + a ser replicado em STATE.md blockers

### Acceptance criteria parcialmente atendidos (Task 1)

| Criterion                                                | Status                  |
| -------------------------------------------------------- | ----------------------- |
| `grep ':6543' .env.local`                                | ❌ Pendente Phase 7      |
| `grep 'pgbouncer=true' .env.local`                       | ❌ Pendente Phase 7      |
| `grep 'connection_limit=1' .env.local`                   | ❌ Pendente Phase 7      |
| `grep ':5432' .env.local`                                | ✅ (em ambas as URLs)    |
| `git check-ignore .env.local`                            | ✅                       |
| `AUTH_SECRET=` definido                                  | ✅                       |

Demais acceptance criteria das Tasks 2 e 3 foram 100% atendidos.

## Authentication Gates

Nenhum gate novo nesta sessão — credenciais Supabase já haviam sido fornecidas pelo orchestrator antes do meu turn.

## Known Stubs

Nenhum stub neste plano. Banco real, dados reais, testes reais.

## Threat Flags

Nenhuma nova superfície de ameaça introduzida além do já mapeado no `<threat_model>` do plano. O deviation da porta 5432 em `DATABASE_URL` é um **threat deferred**, não uma flag nova (T-00-04 DoS já previsto).

## Next Steps

1. **Plan 00-03** — implementar guards `requireAuth()` e `requireAdmin()` usando `PrismaClient` + sessão NextAuth
2. **Plan 00-04** — Sentry PII scrub via `beforeSend`
3. **Plan 00-05** — CI/build dry-run + docs finais
4. **Antes de Phase 7** — OBRIGATÓRIO trocar `DATABASE_URL` para pooler Supavisor (ver deviation acima)

## Self-Check: PASSED

- ✅ `tests/unit/schema.test.ts` existe (verificado com `ls tests/unit/`)
- ✅ Commit `77922e8` existe (verificado com `git log --oneline -5 | grep 77922e8`)
- ✅ `npx dotenv -e .env.local -- pnpm test` exita 0 com 14 testes verdes
- ✅ `npx prisma migrate status` imprime "Database schema is up to date!"
- ✅ Migration `20260418195747_init/migration.sql` contém `Order_paymentId_key` UNIQUE e `Customization_photosExpireAt_idx`
- ✅ `.env.local` gitignored (`git check-ignore .env.local` → `.env.local`)
- ✅ 5 produtos seedados com preços exatos do brief (query direta no banco confirmou)
