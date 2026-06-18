# Painel Admin Completo Implementation Plan

> **For Hermes:** Implementar em fases pequenas com testes antes da lógica nova e QA visual com Impeccable.

**Goal:** Transformar o admin atual (hoje basicamente lista/detalhe de pedidos) em um painel operacional para gerenciar vendas, produção, catálogo, clientes e indicadores do e-commerce.

**Architecture:** Usar Next.js App Router com Server Components para leitura, Server Actions protegidas por role ADMIN para escrita, Prisma como fonte de dados e componentes reutilizáveis em `components/admin`. A fase inicial usa os modelos existentes (`Order`, `Product`, `User`, `Customization`) para evitar migração emergencial em produção.

**Tech Stack:** Next.js 14, TypeScript estrito, Prisma 6, Tailwind, Auth.js v5, Vitest.

---

## Fase 1 — Painel operacional completo sem migração

### Task 1: Criar shell admin profissional

**Objective:** Substituir header simples por layout com sidebar, navegação por módulos e destaque visual.

**Files:**
- Modify: `app/admin/layout.tsx`
- Create: `components/admin/AdminShell.tsx`

**Verification:** `corepack pnpm typecheck`

### Task 2: Mover lista de pedidos para `/admin/pedidos`

**Objective:** Liberar `/admin` para dashboard e manter pedidos em rota própria.

**Files:**
- Create: `app/admin/pedidos/page.tsx` com a lista atual melhorada
- Modify: `app/admin/page.tsx` para dashboard
- Modify: links de voltar em `app/admin/pedidos/[id]/page.tsx`

**Verification:** `/admin/pedidos` lista pedidos e filtros; detalhe volta para `/admin/pedidos`.

### Task 3: Criar dashboard de vendas

**Objective:** Mostrar receita total, receita do mês, pedidos do mês, ticket médio, pedidos por status, pendências de produção/envio e últimos pedidos.

**Files:**
- Create: `lib/admin/metrics.ts`
- Create test: `tests/unit/admin-metrics.test.ts`
- Modify: `app/admin/page.tsx`

**Verification:** teste unitário dos cálculos e render sem erro.

### Task 4: Criar gestão de produtos

**Objective:** Permitir listar, editar nome, descrição, preço, preço antigo e status ativo/inativo dos produtos vendidos.

**Files:**
- Create: `app/admin/produtos/page.tsx`
- Create: `app/admin/produtos/[id]/page.tsx`
- Create: `components/admin/ProductForm.tsx`
- Create/modify: `app/actions/admin-products.ts`
- Create tests para validação de preço/slug se necessário.

**Verification:** editar produto via Server Action; `corepack pnpm typecheck`.

### Task 5: Criar gestão de clientes

**Objective:** Listar clientes cadastrados, e-mail, telefone, role, número de pedidos e total comprado.

**Files:**
- Create: `app/admin/clientes/page.tsx`

**Verification:** página renderiza dados agregados por usuário/e-mail convidado.

### Task 6: Criar central de produção/LGPD

**Objective:** Dar visão rápida de pedidos em produção, aguardando envio, fotos próximas da expiração e prompts pendentes.

**Files:**
- Create: `app/admin/producao/page.tsx`

**Verification:** lista operacional com links para detalhe do pedido.

### Task 7: QA e publicação

**Objective:** Garantir build, typecheck, testes e atualizar GitHub.

**Commands:**
- `corepack pnpm test -- tests/unit/admin-metrics.test.ts`
- `corepack pnpm typecheck`
- `corepack pnpm build`
- `npx impeccable detect app/admin components/admin`
- `git add ... && git commit -m "feat: build complete admin panel" && git push origin HEAD`

---

## Fase 2 — Conteúdo configurável com migração

Depois da Fase 1 validada, adicionar modelos `SiteSetting`, `HeroContent`, `FaqItem`, `GalleryItem` e substituir constantes estáticas do site por leitura do banco com fallback. Essa fase exige migração no Supabase e deve ser feita com backup antes.
