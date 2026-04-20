---
phase: 01-site-institucional
plan: 01
status: complete
completed: 2026-04-20
requirements_delivered: [SITE-07, SITE-08]
---

# Plan 01-01 Summary — Site Layout Shell

## Arquivos criados

- `lib/site-config.ts` — fonte única de NAV_ITEMS, SITE_NAME, WHATSAPP_NUMBER, SOCIAL_LINKS, CONTACT_EMAIL, PRIMARY_CTA
- `components/site/Header.tsx` (RSC) — sticky header com logo + nav desktop + CTA + MobileNav
- `components/site/MobileNav.tsx` (Client) — drawer fullscreen com trap de scroll
- `components/site/Footer.tsx` (RSC) — 4 colunas grid com nav/atendimento/redes + link privacidade
- `components/site/WhatsAppFloatingButton.tsx` (RSC) — fixed bottom-right com URL wa.me encodada
- `app/(site)/layout.tsx` (RSC) — shell envolvendo Header/main/Footer/WhatsApp button
- `tests/unit/site-layout.test.ts` — 5 testes

## Decisões

- **Header é RSC puro, MobileNav é o único Client Component** — isola `useState` ao drawer, mantém todo o resto server-side (menor bundle JS)
- **lib/site-config.ts como fonte única** — trocar WHATSAPP_NUMBER ou adicionar rota se propaga em 1 lugar
- **WhatsAppFloatingButton é RSC** — o href é computado server-side (constante + encodeURIComponent); não precisa de client-side
- **MobileNav bloqueia body scroll via useEffect** — evita scroll fantasma quando drawer está aberto (mobile-first)
- **Logo em texto puro (font-serif)** — SVG de logo fica para Phase 7 (polimento)

## Threats mitigados

- T-01-01 (Information Disclosure): todos os links externos (WhatsApp, redes sociais) usam `target="_blank" rel="noopener noreferrer"`
- T-01-02 (Tampering): constantes server-side via `lib/site-config.ts`, não vêm de user input
- T-01-03 (DoS): zero deps runtime, RSC renderizado estático

## Baseline

- typecheck: verde
- 5/5 testes verdes em `tests/unit/site-layout.test.ts`
- build: verde (route group `(site)` compila sem page filha, Next 14 permite)

## Próximo

Plans 02/03/04 (home + páginas + SEO) podem rodar em paralelo — todos consomem `app/(site)/layout.tsx`.
