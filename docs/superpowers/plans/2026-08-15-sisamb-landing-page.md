# Landing Page do SISAMB Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete SISAMB landing page (header, hero, sobre, módulos, recursos da plataforma, rodapé) inside the existing Angular app, following the same per-brand component pattern already used by Catec/tônomei/Gestão UNA.

**Architecture:** Three new SISAMB-specific shared components (`button`, `card`, `header`), each namespaced under `src/app/pages/sisamb/shared/components/` exactly like Gestão UNA's. Four content sections under `src/app/pages/sisamb/section/`: `hero-section` and `about-section` (existing empty files, populated), `more-products-section` (existing empty files, populated with the "Módulos" content), and a new `platform-features-section`. The existing shared `FooterComponent` (already has a `sisamb` theme) is wired in last. No new services, no HTTP calls, no forms — this is a static content build.

**Tech Stack:** Angular 19 standalone components, signals, SCSS with the project's existing CSS custom properties (`--primary-sisamb`, `--secondary-sisamb`, etc., already defined in `src/styles.scss`).

**Spec:** `docs/superpowers/specs/2026-08-15-sisamb-landing-page-design.md`

## Global Constraints

- New components live under `src/app/pages/sisamb/shared/components/{button,card,header}/`, following the exact folder/selector convention already used by `src/app/pages/gestao-una/shared/components/`. Selectors are `app-button`, `app-card`, `app-header` (safe — never imported cross-brand, exactly like every other brand's local components).
- Brand colors (already defined in `src/styles.scss`, do not redefine): `--primary-sisamb: #00c29d`, `--primary-hover-sisamb: #00a082`, `--secondary-sisamb: #2a2f35`.
- WhatsApp CTA uses the shared default number `5585996157126` (same one the global floating `WhatsappButtonComponent` already uses for any non-`/tonomei` route — no SISAMB-specific WhatsApp button needed).
- No quote-request modal/form for SISAMB — CTAs open WhatsApp directly, matching the Catec hero's `abrirWhatsApp()` pattern.
- Reuses the existing image `public/img/sisamb.webp` (already in the repo) for both the hero and about-section visuals — no new image assets.
- `more-products-section`'s existing folder/selector name is kept as-is (renaming it is unnecessary churn); its content becomes the "Módulos" section.
- Scroll-reveal entrance animation (fade + rise via `IntersectionObserver`, toggling an `.in-view` class) is used on every card grid, matching the existing pattern in `about-section.component.ts`/`hero-section.component.ts`. The continuous ambient float/icon-wiggle animation used on Catec's hero/about cards is also replicated for the hero/about/módulos card grids (3–4 cards each) for visual consistency with the rest of the site, but is intentionally **not** used on the 10-item platform-features grid (too many simultaneously-animating elements reads as visual noise at that count) — that grid gets the fade+rise entrance only.
- All new sections need `id` attributes matching the header's nav anchors: `sisamb-inicio` (hero), `sisamb-sobre` (about), `sisamb-modulos` (módulos), `sisamb-recursos` (platform features).
- No automated tests for these presentational components (no business logic to test) — each task's verification is a successful `tsc --noEmit` type-check plus a description of what to visually confirm once a human looks at it in the browser (neither the implementer nor the controller has browser-screenshot tooling in this environment).

---

## Task 1: SISAMB `button` component

**Files:**
- Create: `src/app/pages/sisamb/shared/components/button/button.component.ts`
- Create: `src/app/pages/sisamb/shared/components/button/button.component.html`
- Create: `src/app/pages/sisamb/shared/components/button/button.component.scss`

**Interfaces:**
- Produces (used by Tasks 2, 4): `ButtonComponent` (selector `app-button`) with `variant = input<'primary' | 'secondary' | 'outline'>('primary')` and `type = input<'button' | 'submit'>('button')`, projecting content via `<ng-content>`.

- [ ] **Step 1: Create the component class**

Create `src/app/pages/sisamb/shared/components/button/button.component.ts`:

```ts
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-button',
  standalone: true,
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
// Reusable pill-shaped button with primary/secondary/outline variants, for the SISAMB LP.
export class ButtonComponent {
  variant = input<'primary' | 'secondary' | 'outline'>('primary');
  type = input<'button' | 'submit'>('button');
}
```

- [ ] **Step 2: Create the template**

Create `src/app/pages/sisamb/shared/components/button/button.component.html`:

```html
<button [type]="type()" [class]="'btn ' + variant()">
  <ng-content></ng-content>
</button>
```

- [ ] **Step 3: Create the styles**

Create `src/app/pages/sisamb/shared/components/button/button.component.scss`:

```scss
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 28px;
  font-size: 0.95rem;
  font-weight: 600;
  border-radius: 50px;
  border: 2px solid transparent;
  cursor: pointer;
  transition: all 0.25s ease-in-out;

  &.primary {
    background-color: var(--primary-sisamb);
    color: var(--white);

    &:hover {
      background-color: var(--primary-hover-sisamb);
      transform: translateY(-2px);
    }
  }

  &.secondary {
    background-color: var(--secondary-sisamb);
    color: var(--white);

    &:hover {
      opacity: 0.9;
      transform: translateY(-2px);
    }
  }

  &.outline {
    background-color: transparent;
    border-color: #e2e8f0;
    color: var(--secondary-sisamb);

    &:hover {
      border-color: var(--primary-sisamb);
      color: var(--primary-sisamb);
    }
  }
}
```

- [ ] **Step 4: Verify it compiles**

Run from the repo root (`C:\Users\renat\landing-pages\catec`): `npx tsc --noEmit -p tsconfig.app.json`
Expected: no output (clean).

- [ ] **Step 5: Commit**

```bash
git add src/app/pages/sisamb/shared/components/button
git commit -m "feat: add SISAMB button component"
```

---

## Task 2: SISAMB `card` component

**Files:**
- Create: `src/app/pages/sisamb/shared/components/card/card.component.ts`
- Create: `src/app/pages/sisamb/shared/components/card/card.component.html`
- Create: `src/app/pages/sisamb/shared/components/card/card.component.scss`

**Interfaces:**
- Produces (used by Tasks 4, 5, 6): `CardComponent` (selector `app-card`) with `icon = input<string>('')`, `title = input<string>('')`, `description = input<string>('')`, `bullets = input<string[]>([])`. When `bullets()` is non-empty, renders a checklist below the description. Internal root class is `.sisamb-card` (parallel to Catec's `.catec-card`), so callers can target it via `::ng-deep .sisamb-card` for grid-specific hover/entrance overrides (Tasks 4–6 do this).

- [ ] **Step 1: Create the component class**

Create `src/app/pages/sisamb/shared/components/card/card.component.ts`:

```ts
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  templateUrl: './card.component.html',
  styleUrl: './card.component.scss',
})
// Reusable icon + title + description card for the SISAMB LP, with an optional checklist.
export class CardComponent {
  icon = input<string>('');
  title = input<string>('');
  description = input<string>('');
  bullets = input<string[]>([]);
}
```

- [ ] **Step 2: Create the template**

Create `src/app/pages/sisamb/shared/components/card/card.component.html`:

```html
<div class="sisamb-card">
  <div class="card-content">
    @if (icon()) {
      <div class="icon-wrapper">
        <span class="material-icons card-icon">{{ icon() }}</span>
      </div>
    }
    <h3 class="card-title">{{ title() }}</h3>
    <p class="card-description">{{ description() }}</p>

    @if (bullets().length > 0) {
      <ul class="card-bullets">
        @for (item of bullets(); track item) {
          <li>{{ item }}</li>
        }
      </ul>
    }
  </div>
</div>
```

- [ ] **Step 3: Create the styles**

Create `src/app/pages/sisamb/shared/components/card/card.component.scss`:

```scss
.sisamb-card {
  background: var(--white);
  padding: 36px 28px;
  border-radius: 10px;
  box-shadow: var(--shadow-md);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  text-align: center;
  border: 1px solid #b0b1b45e;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;

  &:hover {
    transform: translateY(-6px);
    box-shadow: var(--shadow-lg);
  }

  .card-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .icon-wrapper {
    width: 64px;
    height: 64px;
    background-color: rgba(0, 194, 157, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px auto;
  }

  .card-icon {
    font-size: 2rem;
    color: var(--primary-sisamb);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }

  .card-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--secondary-sisamb);
    margin-bottom: 12px;
    text-align: center;
  }

  .card-description {
    font-size: 0.95rem;
    color: var(--text-muted);
    line-height: 1.5;
    text-align: center;
    align-self: stretch;
    width: 100%;
  }

  .card-bullets {
    list-style: none;
    margin: 16px 0 0;
    padding: 0;
    text-align: left;
    align-self: stretch;
    width: 100%;

    li {
      position: relative;
      padding-left: 24px;
      font-size: 0.85rem;
      color: var(--text-muted);
      line-height: 1.5;

      &:not(:last-child) {
        margin-bottom: 8px;
      }

      &::before {
        content: "check_circle";
        font-family: "Material Icons";
        font-weight: normal;
        text-transform: none;
        position: absolute;
        left: 0;
        top: 0;
        font-size: 1rem;
        color: var(--primary-sisamb);
      }
    }
  }
}
```

- [ ] **Step 4: Verify it compiles**

Run from the repo root: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/app/pages/sisamb/shared/components/card
git commit -m "feat: add SISAMB card component with optional checklist"
```

---

## Task 3: SISAMB `header` component

**Files:**
- Create: `src/app/pages/sisamb/shared/components/header/header.component.ts`
- Create: `src/app/pages/sisamb/shared/components/header/header.component.html`
- Create: `src/app/pages/sisamb/shared/components/header/header.component.scss`

**Interfaces:**
- Produces (used by Task 8): `HeaderComponent` (selector `app-header`), sticky nav with anchor links to `#sisamb-inicio`, `#sisamb-sobre`, `#sisamb-modulos`, `#sisamb-recursos`, a click-set active-link state, and a mobile hamburger menu. No dropdown (SISAMB has no "Links Úteis"-style menu).

- [ ] **Step 1: Create the component class**

Create `src/app/pages/sisamb/shared/components/header/header.component.ts`:

```ts
import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  isMenuOpen = signal<boolean>(false);
  activeSection = signal<string>('sisamb-inicio');

  setActiveSection(sectionId: string, event: Event): void {
    event.preventDefault();
    this.activeSection.set(sectionId);
    this.closeMenu();
    this.scrollToElement(sectionId);
  }

  private scrollToElement(sectionId: string): void {
    const targetElement = document.getElementById(sectionId);
    if (!targetElement) return;

    const headerOffset = 90;
    const elementPosition = targetElement.getBoundingClientRect().top;
    const offsetPosition =
      elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
  }

  toggleMenu(): void {
    this.isMenuOpen.update((state) => !state);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }
}
```

- [ ] **Step 2: Create the template**

Create `src/app/pages/sisamb/shared/components/header/header.component.html`:

```html
<header class="header" [class.menu-open]="isMenuOpen()">
  <div class="header-container">
    <!-- Logo -->
    <a
      href="#sisamb-inicio"
      class="logo"
      (click)="setActiveSection('sisamb-inicio', $event)"
    >
      <img src="img/logo-sisamb.webp" alt="SISAMB" class="logo-img" />
    </a>

    <!-- Navigation Menu Desktop -->
    <nav class="nav-menu">
      <a
        href="#sisamb-inicio"
        class="nav-link"
        [class.active]="activeSection() === 'sisamb-inicio'"
        (click)="setActiveSection('sisamb-inicio', $event)"
        >INÍCIO</a
      >

      <a
        href="#sisamb-sobre"
        class="nav-link"
        [class.active]="activeSection() === 'sisamb-sobre'"
        (click)="setActiveSection('sisamb-sobre', $event)"
        >SOBRE</a
      >

      <a
        href="#sisamb-modulos"
        class="nav-link"
        [class.active]="activeSection() === 'sisamb-modulos'"
        (click)="setActiveSection('sisamb-modulos', $event)"
        >MÓDULOS</a
      >

      <a
        href="#sisamb-recursos"
        class="nav-link"
        [class.active]="activeSection() === 'sisamb-recursos'"
        (click)="setActiveSection('sisamb-recursos', $event)"
        >RECURSOS</a
      >
    </nav>

    <!-- Mobile Hamburger Button -->
    <button
      class="hamburger-btn"
      (click)="toggleMenu()"
      aria-label="Menu de navegação"
    >
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
      <span class="hamburger-line"></span>
    </button>

    <!-- Expanded Mobile Menu -->
    <div class="mobile-menu">
      <nav class="mobile-nav">
        <a
          href="#sisamb-inicio"
          class="mobile-link"
          (click)="setActiveSection('sisamb-inicio', $event)"
          >INÍCIO</a
        >
        <a
          href="#sisamb-sobre"
          class="mobile-link"
          (click)="setActiveSection('sisamb-sobre', $event)"
          >SOBRE</a
        >
        <a
          href="#sisamb-modulos"
          class="mobile-link"
          (click)="setActiveSection('sisamb-modulos', $event)"
          >MÓDULOS</a
        >
        <a
          href="#sisamb-recursos"
          class="mobile-link"
          (click)="setActiveSection('sisamb-recursos', $event)"
          >RECURSOS</a
        >
      </nav>
    </div>
  </div>
</header>
```

- [ ] **Step 3: Create the styles**

Create `src/app/pages/sisamb/shared/components/header/header.component.scss`:

```scss
.header {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background-color: var(--secondary-sisamb);
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.15);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);

  .header-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    position: relative;
  }
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  z-index: 1010;

  .logo-img {
    height: 40px;
    width: auto;
    object-fit: contain;
  }
}

.nav-menu {
  display: flex;
  align-items: center;
  gap: 32px;
  height: 100%;

  @media (max-width: 1024px) {
    display: none;
  }
}

.nav-link {
  text-decoration: none;
  color: var(--white);
  font-weight: 600;
  font-size: 0.85rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  height: 100%;
  display: flex;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;
  position: relative;
  transition: color 0.2s ease;

  &:hover {
    color: var(--primary-sisamb);
  }

  &.active {
    color: var(--primary-sisamb);

    &::after {
      content: "";
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 3px;
      background-color: var(--primary-sisamb);
      border-radius: 10px 10px 0 0;
    }
  }
}

.hamburger-btn {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 24px;
  height: 18px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 1010;

  @media (max-width: 1024px) {
    display: flex;
  }

  .hamburger-line {
    width: 100%;
    height: 2px;
    background-color: var(--white);
    border-radius: 2px;
    transition:
      transform 0.3s ease,
      opacity 0.3s ease;
  }
}

.header.menu-open {
  .hamburger-line:nth-child(1) {
    transform: translateY(8px) rotate(45deg);
  }
  .hamburger-line:nth-child(2) {
    opacity: 0;
  }
  .hamburger-line:nth-child(3) {
    transform: translateY(-8px) rotate(-45deg);
  }
}

.mobile-menu {
  display: none;
  background-color: var(--secondary-sisamb);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  position: fixed;
  top: 60px;
  left: 0;
  width: 100%;
  height: calc(100vh - 60px);
  box-shadow: var(--shadow-md);
  z-index: 999;
  overflow-y: auto;
}

.header.menu-open .mobile-menu {
  @media (max-width: 1024px) {
    display: block;
  }
}

.mobile-nav {
  display: flex;
  flex-direction: column;
  padding: 32px 24px;
  gap: 20px;

  .mobile-link {
    text-decoration: none;
    color: var(--white);
    font-weight: 600;
    font-size: 1.1rem;
    padding: 8px 0;
    background: none;
    border: none;
    text-align: left;
    width: 100%;
    border-bottom: 1px solid rgba(255, 255, 255, 0.03);
    cursor: pointer;

    &:hover {
      color: var(--primary-sisamb);
    }
  }
}
```

- [ ] **Step 4: Verify it compiles**

Run from the repo root: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/app/pages/sisamb/shared/components/header
git commit -m "feat: add SISAMB header component"
```

---

## Task 4: Hero section

**Files:**
- Modify: `src/app/pages/sisamb/section/hero-section/hero-section.component.ts`
- Modify: `src/app/pages/sisamb/section/hero-section/hero-section.component.html`
- Modify: `src/app/pages/sisamb/section/hero-section/hero-section.component.scss`

**Interfaces:**
- Consumes: `ButtonComponent`, `CardComponent` from Tasks 1–2.
- Produces (used by Task 8): `<app-hero-section>`, self-contained, no inputs/outputs.

- [ ] **Step 1: Implement the component class**

Replace the contents of `src/app/pages/sisamb/section/hero-section/hero-section.component.ts` with:

```ts
import {
  afterNextRender,
  Component,
  ElementRef,
  viewChild,
} from '@angular/core';
import { CardComponent } from '../../shared/components/card/card.component';
import { ButtonComponent } from '../../shared/components/button/button.component';

// SISAMB main WhatsApp line (same number used across the footer/floating button).
const SISAMB_WHATSAPP_PHONE = '5585996157126';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [ButtonComponent, CardComponent],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss',
})
export class HeroSectionComponent {
  private readonly featuresCard =
    viewChild<ElementRef<HTMLElement>>('featuresCard');

  constructor() {
    // Reveals the differentiator cards with a staggered animation once they
    // scroll into view, same pattern used across the site's other sections.
    afterNextRender(() => {
      const grid = this.featuresCard()?.nativeElement;
      if (!grid) return;

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      if (prefersReducedMotion) {
        grid.classList.add('in-view');
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            grid.classList.add('in-view');
            observer.disconnect();
          }
        },
        { threshold: 0.2 },
      );
      observer.observe(grid);
    });
  }

  // Opens WhatsApp with a pre-filled message to the SISAMB line.
  abrirWhatsApp(): void {
    const text = encodeURIComponent(
      'Olá! Gostaria de saber mais sobre o SISAMB.',
    );
    window.open(
      `https://api.whatsapp.com/send/?phone=${SISAMB_WHATSAPP_PHONE}&text=${text}`,
      '_blank',
    );
  }
}
```

- [ ] **Step 2: Implement the template**

Replace the contents of `src/app/pages/sisamb/section/hero-section/hero-section.component.html` with:

```html
<section class="hero-section" id="sisamb-inicio">
  <div class="hero-container">
    <!-- Left side: Text and CTA -->
    <div class="hero-content">
      <h1 class="hero-title">
        Gestão ambiental pública, simplificada e
        <span class="highlight">100% digital</span>
      </h1>
      <p class="hero-subtitle">
        O SISAMB leva a gestão ambiental do seu município, estado ou
        consórcio para o digital: menos deslocamentos, mais transparência e
        processos automatizados com inteligência artificial, do protocolo à
        emissão da licença.
      </p>

      <div class="hero-actions">
        <app-button variant="primary" (click)="abrirWhatsApp()">
          Fale Conosco <i class="fa-solid fa-arrow-right"></i>
        </app-button>
      </div>
    </div>

    <!-- Right side: Main image -->
    <div class="hero-image-wrapper">
      <img src="img/sisamb.webp" alt="SISAMB" class="hero-img" />
    </div>
  </div>

  <!-- Floating card of differentiators -->
  <div class="hero-features-container">
    <div class="hero-features-card" #featuresCard>
      <app-card
        icon="cloud_done"
        title="100% Digital"
        description="Elimina a necessidade de deslocamentos presenciais, com serviços digitais completos do início ao fim."
      >
      </app-card>

      <app-card
        icon="smart_toy"
        title="IA em cada etapa"
        description="Chatbot inteligente e análise automática de documentos agilizam cada solicitação."
      >
      </app-card>

      <app-card
        icon="visibility"
        title="Transparência total"
        description="Rastreabilidade completa dos processos, com clareza em cada decisão."
      >
      </app-card>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Implement the styles**

Replace the contents of `src/app/pages/sisamb/section/hero-section/hero-section.component.scss` with:

```scss
.hero-section {
  width: 100%;
  background: var(--white);
  padding: 30px 24px 20px 24px;
  position: relative;
  box-sizing: border-box;
  scroll-margin-top: 80px;

  @media (max-width: 768px) {
    padding: 24px 16px 12px 16px;
  }
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;

  @media (max-width: 968px) {
    flex-direction: column;
    text-align: center;
    gap: 32px;
  }
}

.hero-content {
  flex: 1;
  width: 100%;
  max-width: 580px;
  z-index: 2;

  .hero-title {
    font-size: clamp(2rem, 4vw, 3rem);
    font-weight: 800;
    color: var(--secondary-sisamb);
    line-height: 1.2;
    letter-spacing: -1px;
    margin-bottom: 16px;

    .highlight {
      color: var(--primary-sisamb);
    }
  }

  .hero-subtitle {
    font-size: clamp(1rem, 1.5vw, 1.125rem);
    color: var(--text-muted);
    line-height: 1.6;
    margin-bottom: 24px;
    text-align: justify;

    @media (max-width: 968px) {
      text-align: center;
    }
  }
}

.hero-actions {
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 968px) {
    justify-content: center;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;

    app-button {
      width: 100%;
      display: block;
    }
  }
}

.hero-image-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  max-width: 540px;

  .hero-img {
    width: 100%;
    max-height: 420px;
    height: auto;
    object-fit: contain;
    border-radius: var(--radius-md);
  }
}

.hero-features-container {
  position: relative;
  width: 100%;
  max-width: 1200px;
  margin: 40px auto 40px auto;
  padding: 0 24px;
  z-index: 5;
  box-sizing: border-box;

  @media (max-width: 968px) {
    margin-top: 32px;
    margin-bottom: 32px;
  }
}

.hero-features-card {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 968px) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
  }

  app-card {
    display: block;
    opacity: 0;
    transform: translateY(32px);
    transition:
      opacity 0.6s ease,
      transform 0.6s ease;
  }

  &.in-view app-card {
    opacity: 1;
    transform: translateY(0);
    animation: card-float 6s cubic-bezier(0.445, 0.05, 0.55, 0.95) infinite;

    @for $i from 1 through 3 {
      &:nth-child(#{$i}) {
        transition-delay: #{($i - 1) * 0.12}s;
        animation-delay: #{0.6 + ($i - 1) * 0.4}s;
      }
    }

    &:hover {
      animation-play-state: paused;
    }
  }

  @keyframes card-float {
    0%,
    100% {
      transform: translateY(0) rotate(0deg);
    }
    50% {
      transform: translateY(-7px) rotate(0.6deg);
    }
  }

  ::ng-deep .sisamb-card {
    transition:
      transform 0.4s cubic-bezier(0.34, 1.2, 0.64, 1),
      box-shadow 0.4s ease,
      border-color 0.4s ease;

    &:hover {
      transform: translateY(-10px) scale(1.02);
      border-color: rgba(0, 194, 157, 0.35);
      box-shadow:
        0 20px 32px -14px rgba(0, 194, 157, 0.3),
        var(--shadow-lg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    app-card {
      opacity: 1;
      transform: none;
      transition: none;
      animation: none;
    }

    ::ng-deep .sisamb-card:hover {
      transform: none;
    }
  }
}
```

- [ ] **Step 4: Verify it compiles**

Run from the repo root: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/app/pages/sisamb/section/hero-section
git commit -m "feat: build SISAMB hero section"
```

---

## Task 5: About section

**Files:**
- Modify: `src/app/pages/sisamb/section/about-section/about-section.component.ts`
- Modify: `src/app/pages/sisamb/section/about-section/about-section.component.html`
- Modify: `src/app/pages/sisamb/section/about-section/about-section.component.scss`

**Interfaces:**
- Consumes: `CardComponent` from Task 2.
- Produces (used by Task 8): `<app-about-section>`, self-contained.

- [ ] **Step 1: Implement the component class**

Replace the contents of `src/app/pages/sisamb/section/about-section/about-section.component.ts` with:

```ts
import {
  afterNextRender,
  Component,
  ElementRef,
  viewChild,
} from '@angular/core';
import { CardComponent } from '../../shared/components/card/card.component';

@Component({
  selector: 'app-about-section',
  standalone: true,
  imports: [CardComponent],
  templateUrl: './about-section.component.html',
  styleUrl: './about-section.component.scss',
})
// "Sobre" section: mission statement, benefit cards and image.
export class AboutSectionComponent {
  private readonly featuresGrid =
    viewChild<ElementRef<HTMLElement>>('featuresGrid');

  constructor() {
    afterNextRender(() => {
      const grid = this.featuresGrid()?.nativeElement;
      if (!grid) return;

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      if (prefersReducedMotion) {
        grid.classList.add('in-view');
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            grid.classList.add('in-view');
            observer.disconnect();
          }
        },
        { threshold: 0.2 },
      );
      observer.observe(grid);
    });
  }
}
```

- [ ] **Step 2: Implement the template**

Replace the contents of `src/app/pages/sisamb/section/about-section/about-section.component.html` with:

```html
<section class="about-section" id="sisamb-sobre">
  <div class="about-container">
    <div class="about-top">
      <div class="about-content">
        <span class="section-badge">Sobre o SISAMB</span>
        <h2 class="section-title">
          Tecnologia a serviço da
          <span class="highlight">gestão ambiental pública</span>
        </h2>

        <p class="about-description">
          O SISAMB nasceu para simplificar os processos e fluxos de trabalho
          da gestão ambiental pública, tornando-os mais intuitivos e
          acessíveis tanto para o cidadão quanto para o servidor. Ao eliminar
          a necessidade de deslocamentos presenciais e automatizar tarefas
          repetitivas, a plataforma reduz tempo e custos, aumenta a
          transparência das decisões e libera as equipes técnicas para o que
          realmente importa: fiscalização e gestão de qualidade.
        </p>
      </div>

      <div class="about-image-wrapper">
        <div class="about-bg-shape"></div>

        <img
          src="immages-sisamb/sisamb.webp"
          alt="Plataforma SISAMB de gestão ambiental"
          class="about-img"
          loading="lazy"
          decoding="async"
        />

        <div class="metric-badge">
          <span class="material-icons badge-icon">cloud_done</span>
          <div class="metric-text">
            <span class="number">100% Online</span>
            <span class="label">Sem deslocamento presencial</span>
          </div>
        </div>
      </div>
    </div>

    <div class="about-features-grid" #featuresGrid>
      <app-card
        icon="route"
        title="Processos Simplificados"
        description="Fluxos mais intuitivos, do protocolo à homologação."
      >
      </app-card>

      <app-card
        icon="savings"
        title="Menos Tempo, Menos Custo"
        description="Redução real no tempo e custo de tramitação de processos."
      >
      </app-card>

      <app-card
        icon="fact_check"
        title="Transparência e Rastreabilidade"
        description="Acompanhamento claro de cada decisão, do início ao fim."
      >
      </app-card>

      <app-card
        icon="hub"
        title="Integração Governamental"
        description="Interoperabilidade segura com outras bases e sistemas públicos."
      >
      </app-card>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Implement the styles**

Replace the contents of `src/app/pages/sisamb/section/about-section/about-section.component.scss` with:

```scss
.about-section {
  width: 100%;
  background: var(--white);
  padding: 30px 0;
  position: relative;
  overflow: hidden;
  scroll-margin-top: 80px;

  @media (max-width: 968px) {
    padding: 10px 0;
  }
}

.about-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  flex-direction: column;
  gap: 44px;
}

.about-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 64px;

  @media (max-width: 1024px) {
    gap: 40px;
  }

  @media (max-width: 968px) {
    flex-direction: column;
    gap: 48px;
  }
}

.about-content {
  flex: 1;
  max-width: 580px;
  width: 100%;

  @media (max-width: 968px) {
    max-width: 100%;
  }

  .section-title {
    .highlight {
      position: relative;
      z-index: 0;

      &::after {
        content: "";
        position: absolute;
        left: -2px;
        right: -2px;
        bottom: 3px;
        height: 9px;
        background: rgba(0, 194, 157, 0.16);
        border-radius: 4px;
        z-index: -1;
      }
    }
  }

  .about-description {
    font-size: 1.125rem;
    color: var(--text-muted);
    line-height: 1.6;
    margin-bottom: 32px;
    text-align: justify;

    @media (max-width: 576px) {
      font-size: 1rem;
      margin-bottom: 24px;
    }
  }
}

.about-features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }

  app-card {
    display: block;
    opacity: 0;
    transform: translateY(24px);
    transition:
      opacity 0.6s ease,
      transform 0.6s ease;
  }

  &.in-view app-card {
    opacity: 1;
    transform: translateY(0);
    animation: feature-card-float 6s cubic-bezier(0.445, 0.05, 0.55, 0.95)
      infinite;

    @for $i from 1 through 4 {
      &:nth-child(#{$i}) {
        transition-delay: #{($i - 1) * 0.1}s;
        animation-delay: #{0.6 + ($i - 1) * 0.3}s;
      }
    }

    &:hover {
      animation-play-state: paused;
    }
  }

  @keyframes feature-card-float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-6px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    app-card {
      opacity: 1;
      transform: none;
      transition: none;
    }

    &.in-view app-card {
      animation: none;
    }
  }
}

.about-image-wrapper {
  flex: 1;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding-bottom: 20px;

  .about-bg-shape {
    position: absolute;
    width: 82%;
    height: 82%;
    top: 14px;
    right: 4%;
    background: var(--primary-sisamb);
    opacity: 0.1;
    border-radius: var(--radius-lg, 24px);
    transform: rotate(-4deg);
    z-index: 0;
  }

  .about-img {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 540px;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    object-position: center;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-md);
  }
}

.metric-badge {
  position: absolute;
  bottom: 0;
  left: 20px;
  background-color: var(--secondary-sisamb);
  color: var(--white);
  padding: 16px 24px;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 3;
  animation: badge-float 4s ease-in-out infinite;

  &:hover {
    animation-play-state: paused;
  }

  @media (max-width: 576px) {
    left: 50%;
    animation: none;
    width: calc(100% - 32px);
    max-width: 360px;
    padding: 12px 18px;
    gap: 12px;
    transform: translateX(-50%);
  }

  .badge-icon {
    font-size: 2.5rem;
    color: var(--primary-sisamb);
    flex-shrink: 0;

    @media (max-width: 576px) {
      font-size: 2rem;
    }
  }

  .metric-text {
    display: flex;
    flex-direction: column;

    .number {
      font-size: 1.25rem;
      font-weight: 800;
      letter-spacing: -0.5px;
      line-height: 1.2;

      @media (max-width: 576px) {
        font-size: 1.1rem;
      }
    }

    .label {
      font-size: 0.85rem;
      color: #94a3b8;
      font-weight: 500;

      @media (max-width: 576px) {
        font-size: 0.8rem;
      }
    }
  }
}

@keyframes badge-float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-6px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .metric-badge {
    animation: none;
  }
}
```

- [ ] **Step 4: Verify it compiles**

Run from the repo root: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/app/pages/sisamb/section/about-section
git commit -m "feat: build SISAMB about section"
```

---

## Task 6: Módulos section (`more-products-section`)

**Files:**
- Modify: `src/app/pages/sisamb/section/more-products-section/more-products-section.component.ts`
- Modify: `src/app/pages/sisamb/section/more-products-section/more-products-section.component.html`
- Modify: `src/app/pages/sisamb/section/more-products-section/more-products-section.component.scss`

**Interfaces:**
- Consumes: `CardComponent` from Task 2.
- Produces (used by Task 8): `<app-more-products-section>`, self-contained.

- [ ] **Step 1: Implement the component class**

Replace the contents of `src/app/pages/sisamb/section/more-products-section/more-products-section.component.ts` with:

```ts
import {
  afterNextRender,
  Component,
  ElementRef,
  viewChild,
} from '@angular/core';
import { CardComponent } from '../../shared/components/card/card.component';

@Component({
  selector: 'app-more-products-section',
  standalone: true,
  imports: [CardComponent],
  templateUrl: './more-products-section.component.html',
  styleUrl: './more-products-section.component.scss',
})
// "Módulos" section: the three functional modules of the SISAMB platform.
export class MoreProductsSectionComponent {
  private readonly modulesGrid =
    viewChild<ElementRef<HTMLElement>>('modulesGrid');

  constructor() {
    afterNextRender(() => {
      const grid = this.modulesGrid()?.nativeElement;
      if (!grid) return;

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      if (prefersReducedMotion) {
        grid.classList.add('in-view');
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            grid.classList.add('in-view');
            observer.disconnect();
          }
        },
        { threshold: 0.2 },
      );
      observer.observe(grid);
    });
  }
}
```

- [ ] **Step 2: Implement the template**

Replace the contents of `src/app/pages/sisamb/section/more-products-section/more-products-section.component.html` with:

```html
<section class="modules-section" id="sisamb-modulos">
  <div class="section-container text-center">
    <span class="section-badge">Módulos</span>
    <h2 class="section-title">
      Tudo o que sua gestão ambiental precisa, em
      <span class="highlight">um só lugar</span>
    </h2>
    <p class="section-subtitle">
      Cada módulo do SISAMB foi pensado para uma parte específica do processo
      — do primeiro contato do cidadão até a homologação final pelo gestor.
    </p>

    <div class="modules-grid" #modulesGrid>
      <app-card
        icon="support_agent"
        title="Atendimento ao Cidadão"
        description="Chatbot com inteligência artificial que orienta o cidadão em cada etapa, reduz dúvidas e facilita o preenchimento correto das solicitações — com linguagem simples e feedback imediato."
        [bullets]="[
          'Formulários online',
          'IA para análise e verificação de documentos',
          'Acompanhamento de processos na própria plataforma',
          'Central de notificações'
        ]"
      >
      </app-card>

      <app-card
        icon="fact_check"
        title="Gestão de Processos"
        description="Ferramentas para o gestor distribuir tarefas, acompanhar prazos e homologar processos com clareza em cada etapa."
        [bullets]="[
          'Distribuição de tarefas pelo gestor',
          'Acompanhamento e gestão de prazos',
          'Visualização dos documentos após triagem',
          'Homologação (aprovação e rejeição)'
        ]"
      >
      </app-card>

      <app-card
        icon="school"
        title="Cursos & Treinamentos"
        description="Módulo dedicado à capacitação contínua dos agentes envolvidos, direto na plataforma."
      >
      </app-card>
    </div>
  </div>
</section>
```

- [ ] **Step 3: Implement the styles**

Replace the contents of `src/app/pages/sisamb/section/more-products-section/more-products-section.component.scss` with:

```scss
.modules-section {
  width: 100%;
  background-color: var(--bg-light, #f8fafc);
  padding: 30px 24px;
  box-sizing: border-box;
  scroll-margin-top: 80px;

  .highlight {
    color: var(--primary-sisamb);
  }

  .section-subtitle {
    max-width: 720px;
    margin-left: auto;
    margin-right: auto;
  }

  @media (max-width: 768px) {
    padding: 30px 16px;
  }
}

.modules-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  width: 100%;
  max-width: 1100px;
  margin: 40px auto 0 auto;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  app-card {
    display: block;
    opacity: 0;
    transform: translateY(32px);
    transition:
      opacity 0.6s ease,
      transform 0.6s ease;
  }

  &.in-view app-card {
    opacity: 1;
    transform: translateY(0);
    animation: module-card-float 6s cubic-bezier(0.445, 0.05, 0.55, 0.95)
      infinite;

    @for $i from 1 through 3 {
      &:nth-child(#{$i}) {
        transition-delay: #{($i - 1) * 0.12}s;
        animation-delay: #{0.6 + ($i - 1) * 0.4}s;
      }
    }

    &:hover {
      animation-play-state: paused;
    }
  }

  @keyframes module-card-float {
    0%,
    100% {
      transform: translateY(0) rotate(0deg);
    }
    50% {
      transform: translateY(-7px) rotate(0.6deg);
    }
  }

  ::ng-deep .sisamb-card {
    transition:
      transform 0.4s cubic-bezier(0.34, 1.2, 0.64, 1),
      box-shadow 0.4s ease,
      border-color 0.4s ease;

    &:hover {
      transform: translateY(-10px) scale(1.02);
      border-color: rgba(0, 194, 157, 0.35);
      box-shadow:
        0 20px 32px -14px rgba(0, 194, 157, 0.3),
        var(--shadow-lg);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    app-card {
      opacity: 1;
      transform: none;
      transition: none;
      animation: none;
    }

    ::ng-deep .sisamb-card:hover {
      transform: none;
    }
  }
}
```

- [ ] **Step 4: Verify it compiles**

Run from the repo root: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/app/pages/sisamb/section/more-products-section
git commit -m "feat: build SISAMB módulos section"
```

---

## Task 7: Platform features section (new)

**Files:**
- Create: `src/app/pages/sisamb/section/platform-features-section/platform-features-section.component.ts`
- Create: `src/app/pages/sisamb/section/platform-features-section/platform-features-section.component.html`
- Create: `src/app/pages/sisamb/section/platform-features-section/platform-features-section.component.scss`

**Interfaces:**
- Consumes: nothing from earlier tasks (no `CardComponent` — this grid uses its own lighter markup, not the full card, per the Global Constraints' note on avoiding a 10-item ambient-animation grid).
- Produces (used by Task 8): `<app-platform-features-section>`, self-contained.

- [ ] **Step 1: Create the component class**

Create `src/app/pages/sisamb/section/platform-features-section/platform-features-section.component.ts`:

```ts
import {
  afterNextRender,
  Component,
  ElementRef,
  viewChild,
} from '@angular/core';

interface PlatformFeature {
  icon: string;
  label: string;
}

@Component({
  selector: 'app-platform-features-section',
  standalone: true,
  imports: [],
  templateUrl: './platform-features-section.component.html',
  styleUrl: './platform-features-section.component.scss',
})
// "Recursos da plataforma" section: a compact grid of platform-wide capabilities.
export class PlatformFeaturesSectionComponent {
  private readonly featuresGrid =
    viewChild<ElementRef<HTMLElement>>('featuresGrid');

  readonly features: PlatformFeature[] = [
    { icon: 'smart_toy', label: 'Inteligência Artificial em cada etapa' },
    { icon: 'cloud_done', label: 'Histórico de processos em nuvem' },
    { icon: 'summarize', label: 'Relatórios on-line e em PDF' },
    { icon: 'notifications_active', label: 'Notificações automáticas por prazo' },
    { icon: 'draw', label: 'Assinatura eletrônica para todos os usuários' },
    { icon: 'dashboard', label: 'Dashboard com painéis analíticos e sintéticos' },
    { icon: 'wifi_off', label: 'Acesso e procedimentos disponíveis offline' },
    { icon: 'verified', label: 'Emissão de licenças direto na plataforma' },
    { icon: 'badge', label: 'Cadastro unificado dos agentes envolvidos' },
    { icon: 'gavel', label: 'Leis atualizadas e resumidas para fácil compreensão' },
  ];

  constructor() {
    afterNextRender(() => {
      const grid = this.featuresGrid()?.nativeElement;
      if (!grid) return;

      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;
      if (prefersReducedMotion) {
        grid.classList.add('in-view');
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            grid.classList.add('in-view');
            observer.disconnect();
          }
        },
        { threshold: 0.2 },
      );
      observer.observe(grid);
    });
  }
}
```

- [ ] **Step 2: Create the template**

Create `src/app/pages/sisamb/section/platform-features-section/platform-features-section.component.html`:

```html
<section class="platform-features-section" id="sisamb-recursos">
  <div class="section-container text-center">
    <span class="section-badge">Recursos da plataforma</span>
    <h2 class="section-title">
      Uma plataforma completa, pensada para a
      <span class="highlight">gestão pública</span>
    </h2>

    <div class="features-grid" #featuresGrid>
      @for (feature of features; track feature.label) {
        <div class="feature-chip">
          <span class="material-icons feature-chip-icon">{{
            feature.icon
          }}</span>
          <span class="feature-chip-label">{{ feature.label }}</span>
        </div>
      }
    </div>
  </div>
</section>
```

- [ ] **Step 3: Create the styles**

Create `src/app/pages/sisamb/section/platform-features-section/platform-features-section.component.scss`:

```scss
.platform-features-section {
  width: 100%;
  background: var(--white);
  padding: 30px 24px;
  box-sizing: border-box;
  scroll-margin-top: 80px;

  .highlight {
    color: var(--primary-sisamb);
  }

  @media (max-width: 768px) {
    padding: 30px 16px;
  }
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  width: 100%;
  max-width: 900px;
  margin: 40px auto 0 auto;
  text-align: left;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
}

.feature-chip {
  display: flex;
  align-items: center;
  gap: 14px;
  background: var(--bg-light, #f8fafc);
  border: 1px solid rgba(0, 0, 0, 0.06);
  border-radius: var(--radius-md, 12px);
  padding: 16px 18px;

  opacity: 0;
  transform: translateY(16px);
  transition:
    opacity 0.5s ease,
    transform 0.5s ease;
}

.features-grid.in-view .feature-chip {
  opacity: 1;
  transform: translateY(0);

  @for $i from 1 through 10 {
    &:nth-child(#{$i}) {
      transition-delay: #{($i - 1) * 0.06}s;
    }
  }
}

.feature-chip-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 194, 157, 0.1);
  color: var(--primary-sisamb);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.3rem;
}

.feature-chip-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--secondary-sisamb);
  line-height: 1.4;
}

@media (prefers-reduced-motion: reduce) {
  .feature-chip {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

- [ ] **Step 4: Verify it compiles**

Run from the repo root: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no output.

- [ ] **Step 5: Commit**

```bash
git add src/app/pages/sisamb/section/platform-features-section
git commit -m "feat: add SISAMB platform features section"
```

---

## Task 8: Wire the home page and verify

**Files:**
- Modify: `src/app/pages/sisamb/home/home.page.ts`
- Modify: `src/app/pages/sisamb/home/home.page.html`

**Interfaces:**
- Consumes: `HeaderComponent` (Task 3), `HeroSectionComponent` (Task 4), `AboutSectionComponent` (Task 5), `MoreProductsSectionComponent` (Task 6), `PlatformFeaturesSectionComponent` (Task 7), and the existing shared `FooterComponent` (`src/app/components/footer/footer.component.ts`, already supports `theme="sisamb"`, no changes needed).
- Produces: nothing consumed by later tasks (last task).

- [ ] **Step 1: Wire the imports and template**

Replace the contents of `src/app/pages/sisamb/home/home.page.ts` with:

```ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { HeaderComponent } from '../shared/components/header/header.component';
import { HeroSectionComponent } from '../section/hero-section/hero-section.component';
import { AboutSectionComponent } from '../section/about-section/about-section.component';
import { MoreProductsSectionComponent } from '../section/more-products-section/more-products-section.component';
import { PlatformFeaturesSectionComponent } from '../section/platform-features-section/platform-features-section.component';
import { FooterComponent } from '../../../components/footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeaderComponent,
    HeroSectionComponent,
    AboutSectionComponent,
    MoreProductsSectionComponent,
    PlatformFeaturesSectionComponent,
    FooterComponent,
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
// SISAMB home page: assembles the shared sections into the SISAMB LP.
export class HomePage implements OnInit, OnDestroy {
  // Applies the SISAMB scrollbar theme while this page is active.
  ngOnInit(): void {
    document.body.classList.add('scroll-theme-sisamb');
  }

  // Removes the SISAMB scrollbar theme when leaving the page.
  ngOnDestroy(): void {
    document.body.classList.remove('scroll-theme-sisamb');
  }
}
```

- [ ] **Step 2: Write the template**

Replace the contents of `src/app/pages/sisamb/home/home.page.html` with:

```html
<!-- Header -->
<app-header></app-header>

<!-- Hero -->
<app-hero-section></app-hero-section>

<!-- Sobre -->
<app-about-section></app-about-section>

<!-- Módulos -->
<app-more-products-section></app-more-products-section>

<!-- Recursos da plataforma -->
<app-platform-features-section></app-platform-features-section>

<!-- Footer -->
<app-footer theme="sisamb"></app-footer>
```

- [ ] **Step 3: Verify the full app compiles**

Run from the repo root: `npx tsc --noEmit -p tsconfig.app.json`
Expected: no output.

Then run: `npx ng build --configuration production`
Expected: `Application bundle generation complete`, no errors (per-component CSS budget warnings for other, pre-existing files are fine and unrelated to this change — but there should be no new budget warning for any of the new `sisamb` files exceeding 4kB; if one appears, note it but don't treat it as a blocker unless it's egregiously large).

- [ ] **Step 4: Manual verification**

Start the dev server (`npm start` from the repo root) and confirm `http://localhost:4200/sisamb` renders end-to-end: header with working anchor nav (desktop + mobile hamburger), hero with the 3 floating differentiator cards, about section with image + 4 feature cards, módulos section with 3 cards (2 with checklists, 1 without), platform-features grid with all 10 chips, and the SISAMB-themed footer at the bottom. If a screenshot/browser tool isn't available in this environment, describe what you inspected (e.g. via `curl` against the dev server, or by reading the rendered DOM) and flag that a human should do a final visual pass — don't claim a visual check that wasn't actually performed.

- [ ] **Step 5: Commit**

```bash
git add src/app/pages/sisamb/home
git commit -m "feat: wire up the complete SISAMB landing page"
```
