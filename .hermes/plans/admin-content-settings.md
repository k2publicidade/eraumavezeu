# Admin Content Settings Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Allow admins to manage site contact/configuration content and FAQ entries from `/admin/conteudo`, with public pages reading database values and falling back to safe static defaults.

**Architecture:** Add simple Prisma models for key/value settings and ordered FAQ items. Keep defaults in code so the public site remains stable if the database is empty. Use Server Components for reads and Server Actions protected by `requireAdmin()` for writes.

**Tech Stack:** Next.js 14 App Router, TypeScript, Prisma 6, Zod, Vitest, Tailwind.

---

### Task 1: Add tests for content resolution

**Objective:** Verify static defaults, DB overrides, WhatsApp URL generation, and FAQ ordering before production code changes.

**Files:**
- Create: `tests/unit/site-content.test.ts`
- Create/Modify: `lib/site-content.ts`

**Steps:**
1. Write tests importing `resolveSiteSettings`, `buildWhatsappHref`, and `resolveFaqItems` from `@/lib/site-content`.
2. Run `corepack pnpm test -- tests/unit/site-content.test.ts` and confirm it fails because the module does not exist.
3. Implement the minimal pure helpers and defaults.
4. Re-run the focused test and confirm pass.

### Task 2: Add Prisma content models

**Objective:** Persist editable site settings and FAQ items.

**Files:**
- Modify: `prisma/schema.prisma`

**Models:**
- `SiteSetting`: `key` unique, `value` text, `label`, `type`, timestamps.
- `FaqItem`: question, answer, sortOrder, active, timestamps.

**Verification:**
Run `corepack pnpm prisma:generate`.

### Task 3: Add server access helpers

**Objective:** Load settings/FAQs from Prisma with fallback and no hard failure if DB is temporarily unavailable.

**Files:**
- Modify: `lib/site-content.ts`

**Steps:**
1. Add `getSiteSettings()` and `getFaqItems()` using `db.siteSetting` and `db.faqItem`.
2. Return defaults on DB errors.
3. Keep pure resolver functions testable without Prisma.

### Task 4: Add admin actions

**Objective:** Let admins update settings, create/update FAQ items, toggle FAQ visibility, and delete FAQ items.

**Files:**
- Create: `app/actions/admin-content.ts`

**Steps:**
1. Validate input with Zod.
2. Call `requireAdmin()` before any mutation.
3. Use Prisma upsert/update/delete.
4. Revalidate `/`, `/contato`, `/faq`, `/admin/conteudo`.

### Task 5: Add admin UI

**Objective:** Create `/admin/conteudo` for site settings and FAQs.

**Files:**
- Modify: `components/admin/AdminShell.tsx`
- Create: `components/admin/SiteSettingsForm.tsx`
- Create: `components/admin/FaqItemForm.tsx`
- Create: `app/admin/conteudo/page.tsx`

**Verification:**
Use accessible labels, visible focus, mobile-friendly form layout.

### Task 6: Connect public pages

**Objective:** Make footer, contact page and FAQ page read editable DB content.

**Files:**
- Modify: `components/site/Footer.tsx`
- Modify: `app/(site)/contato/page.tsx`
- Modify: `app/(site)/faq/page.tsx`

**Verification:**
Run typecheck/build; public pages should still render with fallback defaults when DB is empty.

### Task 7: Full validation and publish

**Commands:**
- `corepack pnpm test -- tests/unit/site-content.test.ts`
- `corepack pnpm test`
- `corepack pnpm typecheck`
- `corepack pnpm build`
- `npx impeccable detect app/admin/conteudo components/admin components/site app/(site)/contato app/(site)/faq`
- `git status && git diff --stat`
- `git add ... && git commit -m "feat: add admin content settings" && git push origin main`
