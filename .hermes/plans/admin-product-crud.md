# Admin Product CRUD Implementation Plan

> **For Hermes:** Execute directly in this session using the project GSD workflow.

**Goal:** Add a complete admin product registration flow with create, edit, delete, and public storefront visibility for active products.

**Architecture:** Reuse the existing Prisma Product model and admin route group. Add server-side validation/action helpers for create/update/delete, a reusable client ProductForm for create/edit, and list actions for edit/delete. Keep active products flowing through existing `getActiveProducts()` so the public store, cart cross-sell, and checkout draft continue using database prices.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Prisma, Zod, Vitest, Tailwind.

---

## Tasks

1. Add test coverage for product action normalization/validation and storefront fallback behavior.
2. Expand `app/actions/admin-products.ts` with create, update, delete, slug generation, image URL parsing, admin guard, revalidation, and safe delete handling.
3. Replace `components/admin/ProductForm.tsx` with a create/edit capable client form including type, slug, prices, images, active flag, and delete button on edit.
4. Add `/admin/produtos/novo` page and update `/admin/produtos/[id]` and `/admin/produtos` list to support full flow.
5. Ensure public catalog continues reading active DB products and add fallback when DB is empty/unavailable.
6. Run unit tests, typecheck, build, and Impeccable detection for changed admin UI.
