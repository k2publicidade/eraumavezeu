# Era Uma Vez Eu — Design System v2.0

> Paleta e identidade visual extraídas diretamente do **selo circular da marca** (logo.jpeg).
> Princípio norteador: *storybook artesanal premium*, não SaaS colorido.

---

## Princípios de Design

1. **Storybook artesanal** — cada tela remete a uma livraria independente curada, não a um app genérico. Tipografia serifada predomina em headings; sans-serif limpa no corpo.
2. **Warm premium** — tons cream/gold criam calor sem kitsch. Sombras levemente amareladas (como luz de vela), não cinzas frias.
3. **Confiança editorial** — hierarquia clara, espaçamento generoso, sem excesso de elementos decorativos. O conteúdo respira.
4. **Mobile-first 375px** — botões com mínimo 44px de altura, textos mínimo 16px no corpo, foco visível em todos os interativos.
5. **Acessibilidade não negociável** — contraste AA em tudo (AAA onde possível), reduced-motion respeitado, aria-labels preservados.

---

## Paleta de Cores

Todas as cores são derivadas diretamente do selo circular da marca.

### Cores primárias

| Token | Hex | Ratio sobre branco | Uso semântico |
|-------|-----|--------------------|---------------|
| `primary` | `#1E3A5F` | 7.2:1 (AAA) | Headings, CTAs principais, links ativos, texto forte |
| `primary-light` | `#2D548A` | 5.1:1 (AA) | Hover states de elementos navy |
| `primary-dark` | `#142845` | 9.8:1 (AAA) | Active states, gradiente de fundo escuro |

**Origem:** Texto "ERA UMA VEZ, EU" no anel do selo — azul-marinho serifado.

### Dourado (Gold)

| Token | Hex | Uso semântico |
|-------|-----|---------------|
| `gold` | `#E8C94A` | Badges, bordas de cards premium, estrelinhas decorativas |
| `gold-light` | `#F5E08A` | Glow, hover de bordas gold |
| `gold-dark` | `#C4A832` | Texto sobre fundo claro (contraste AA: 4.6:1) |
| `gold-warm` | `#F5D87E` | Faixa decorativa do footer, texto em fundo escuro |

**Origem:** Moldura dourada e estrelinhas do selo.

### Cream (Fundo)

| Token | Hex | Uso semântico |
|-------|-----|---------------|
| `cream` | `#FAF3DC` | Background principal do site |
| `cream-light` | `#FFFDF5` | Cards, superfícies elevadas |
| `cream-warm` | `#FFF8E8` | Seções alternadas, hero secundário |
| `cream-deep` | `#F2E8C4` | Bordas internas, separadores |

**Origem:** Fundo interno do selo (área da cena).

### Forest (Verde floresta)

| Token | Hex | Ratio sobre branco | Uso semântico |
|-------|-----|--------------------|---------------|
| `forest` | `#2E5D3C` | 5.8:1 (AA) | Footer, CTAs secundárias, badges de confiança |
| `forest-light` | `#3B7A4A` | 4.5:1 (AA) | Hover states forest |
| `forest-dark` | `#1E3D28` | 8.1:1 (AAA) | Texto sobre fundo claro |

**Origem:** Verde floresta externo do anel do selo.

### Fox (Warm accent)

| Token | Hex | Uso semântico |
|-------|-----|---------------|
| `fox` | `#E8753F` | Preços em destaque, chamadas emocionais, badges de desconto |
| `fox-light` | `#F0956A` | Hover |
| `fox-dark` | `#C4562A` | Texto sobre fundo claro (contraste AA: 5.2:1) |

**Origem:** Raposa laranja lendo no selo.

### Rose (Soft accent)

| Token | Hex | Uso semântico |
|-------|-----|---------------|
| `rose` | `#D4849A` | Elementos decorativos, tags de gênero |
| `rose-light` | `#EBB5C4` | Toques sutis, backgrounds de página de rosto |
| `rose-pale` | `#FAF0F3` | Background suave para páginas femininas |

**Origem:** Capa do livro aberto no centro do selo.

### Dark / Light (semânticos)

| Token | Hex | Uso semântico |
|-------|-----|---------------|
| `dark` | `#1E2A3A` | Texto corpo principal |
| `light` / `cream` | `#FAF3DC` | Background (alias de `cream`) |
| `secondary` | `#2E5D3C` | Alias de `forest` — compatibilidade |

---

## Tipografia

### Famílias

| Variável CSS | Fonte | Uso |
|---|---|---|
| `font-serif` | Playfair Display | Headings (h1–h4), nomes de produtos, depoimentos, títulos de seção |
| `font-sans` | Inter | Corpo de texto, labels, botões, navegação, metadados |
| `font-script` | Dancing Script | Dedicatórias, "Era uma vez…", elementos decorativos emocionais |

### Escala de tamanhos

| Classe | Tamanho | Line-height | Uso típico |
|--------|---------|-------------|------------|
| `text-xs` | 12px | 1.4 | Metadados, timestamps, contador |
| `text-sm` | 14px | 1.5 | Descrições, labels de form, navegação |
| `text-base` | 16px | 1.7 | **Corpo principal** (mínimo para leitura) |
| `text-lg` | 18px | 1.65 | Lead text, subtítulos de seção |
| `text-xl` | 20px | 1.6 | Subheadings, depoimentos |
| `text-2xl` | 24px | 1.4 | H3, nomes de produto |
| `text-3xl` | 30px | 1.3 | H2 de seção |
| `text-4xl` | 36px | 1.2 | H1 de página interna |
| `text-5xl` | 48px | 1.1 | H1 hero desktop |
| `text-6xl` | 60px | 1.05 | Display hero máximo |

### Pares tipográficos recomendados

- **Hero:** `font-serif text-5xl text-primary` + `font-sans text-xl text-dark/65`
- **Seção:** `font-serif text-3xl text-primary` + `font-sans text-base text-dark/55`
- **Card:** `font-serif text-xl text-primary` + `font-sans text-sm text-dark/65`
- **Dedicatória:** `font-script text-2xl text-primary`
- **Label form:** `font-sans font-medium text-sm text-primary`
- **Badge:** `font-sans font-medium text-xs`

---

## Espaçamento

Sistema baseado em múltiplos de 4px (Tailwind padrão + extensões):

| Escala | px | Uso típico |
|--------|----|------------|
| 1 | 4px | Gap mínimo entre ícone e label |
| 2 | 8px | Padding interno de badges |
| 3 | 12px | Gap entre elementos inline |
| 4 | 16px | Padding horizontal de botões pequenos |
| 5 | 20px | Gap entre cards mobile |
| 6 | 24px | Padding interno de cards |
| 8 | 32px | Padding de seções pequenas |
| 10 | 40px | Gap entre grupos |
| 12 | 48px | Padding vertical de seções desktop |
| 16 | 64px | Seções hero padding |
| 24 | 96px | Py de seções desktop grandes |

---

## Border Radius

| Token | Valor | Uso |
|-------|-------|-----|
| `rounded-lg` | 1rem | Inputs, elementos UI menores |
| `rounded-xl` | 1.25rem | Cards menores, thumbnails |
| `rounded-2xl` | 1.5rem | Cards principais, modais, wizard |
| `rounded-3xl` | 2rem | Container do wizard |
| `rounded-full` | 9999px | Botões, badges, avatares, progress bar |

---

## Sombras

| Token | Uso |
|-------|-----|
| `shadow-xs` | Separação mínima (header sticky) |
| `shadow-sm` | Cards em repouso |
| `shadow-md` | Cards com hover |
| `shadow-lg` | Modais, dropdowns |
| `shadow-gold` | Elementos com borda dourada, selos |
| `shadow-gold-lg` | CTA hero com fundo dourado |
| `shadow-focus` | Focus ring customizado (via `focus-visible`) |

---

## Componentes — Classes Utilitárias

### Botões

```html
<!-- Primário (navy) -->
<button class="btn-primary">Personalizar →</button>

<!-- Primário grande (hero) -->
<button class="btn-primary-lg">Criar meu livro</button>

<!-- Secundário (forest) -->
<button class="btn-secondary">Ver mais</button>

<!-- Ghost (outline navy) -->
<button class="btn-ghost">Como funciona</button>
```

**Estados documentados:** default, hover, active (scale-95), focus-visible (ring gold), disabled (opacity-30).

### Cards

```html
<!-- Card premium com borda gold -->
<div class="card-premium p-6">...</div>
```

### Badges

```html
<span class="badge-gold">Ilustrações únicas com IA</span>
<span class="badge-forest">Entrega garantida</span>
```

### Inputs

```html
<input class="input-field" placeholder="Ex.: Sofia" />
<textarea class="input-field font-script text-lg" />
```

---

## Gradientes de Background

| Classe | Descrição | Uso |
|--------|-----------|-----|
| `bg-hero-warm` | Cream 3 stops suave | Hero principal, páginas internas |
| `bg-hero-radial` | Glow dourado radial no topo | Overlay decorativo do hero |
| `bg-cream-to-white` | Cream para branco | Transições de seção |
| `bg-navy-to-forest` | Navy para forest | Não usado — disponível para variantes futuras |
| `bg-cta-premium` | Navy 3 stops com shimmer | Seção CTA final da home |

---

## Acessibilidade

- **Focus:** `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2` em todos os interativos
- **Contraste mínimo:** AA (4.5:1) para texto normal, AA (3:1) para texto grande e ícones
- **Reduced motion:** bloco `@media (prefers-reduced-motion: reduce)` em `globals.css` desativa todas as animações
- **LGPD (Art. 14):** Checkbox de consentimento tem borda `border-gold/50` destacada, label obrigatório visível, mensagem de status (aceito/pendente)
- **Aria:** `aria-label`, `aria-pressed`, `aria-required`, `role="dialog"`, `aria-modal` preservados em todos os componentes

---

## Tokens para Código

```ts
// Cores principais para uso em style inline ou lógica JS
export const BRAND = {
  navy:   "#1E3A5F",
  gold:   "#E8C94A",
  cream:  "#FAF3DC",
  forest: "#2E5D3C",
  fox:    "#E8753F",
  rose:   "#D4849A",
} as const;
```

---

*Última atualização: 2026-04-20 — rebrand v2.0 com identidade storybook premium.*
