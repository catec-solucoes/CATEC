import { CommonModule } from '@angular/common';
import {
  afterNextRender,
  Component,
  DestroyRef,
  ElementRef,
  QueryList,
  ViewChildren,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../components/button/button.component';

interface Slide {
  id: string;
  button: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  icon: string;
  image: string;
  logo: string;
  // Internal route (e.g. '/tonomei') or an external URL (opened in a new tab).
  route: string;
  // Whether the CTA navigates to the product's route. Gestão Una isn't live
  // yet, so its CTA is inert for now.
  clickable: boolean;
}

// Swipeable carousel promoting tônomei, SISAMB and Gestão Una.
@Component({
  selector: 'app-tonomei-section',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './tonomei-section.component.html',
  styleUrl: './tonomei-section.component.scss',
})
export class TonomeiSectionComponent {
  private router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChildren('tabBtn') private tabButtons!: QueryList<ElementRef<HTMLButtonElement>>;

  // How often the carousel auto-advances when the user isn't interacting with it.
  private static readonly AUTOPLAY_INTERVAL_MS = 15000;
  private autoplayId: ReturnType<typeof setInterval> | null = null;

  constructor() {
    afterNextRender(() => {
      this.restartAutoplay();
      this.destroyRef.onDestroy(() => this.stopAutoplay());
    });

    // Keeps the active tab scrolled into view on mobile, where the tab strip
    // scrolls horizontally and autoplay/arrow navigation could otherwise
    // advance the slide without the tab bar visibly following along.
    effect(() => {
      const index = this.activeSlideIndex();
      this.tabButtons?.get(index)?.nativeElement.scrollIntoView({
        behavior: 'smooth',
        inline: 'nearest',
        block: 'nearest',
      });
    });
  }

  slides: Slide[] = [
    {
      id: 'tonomei',
      button: 'tônomei',
      title: 'Solução completa para o microempreendedor',
      subtitle: 'Gestão & Obrigações Fiscais',
      description:
        'Um sistema desenvolvido especialmente para o empreendedor brasileiro. Seja você formalizado (com CNPJ) ou informal (CPF), tudo num só lugar. Garantindo a você, de forma fácil e intuitiva, uma gestão de alto nível, novas oportunidades e tudo mais que precisa. Tudo isso na palma da sua mão.',
      badge: 'Microempreendedores Individuais (MEI)',
      icon: 'point_of_sale',
      image: 'images/tonomei.webp',
      logo: 'images/logo-tonomei.webp',
      route: '/tonomei',
      clickable: true,
    },
    {
      id: 'sisambe',
      button: 'Sisamb.eco',
      title: 'Transformação digital na gestão ambiental',
      subtitle: 'Cidades, Estados & Consórcios',
      description:
        'O Sisamb.eco leva a gestão ambiental do seu município, estado ou consórcio para o ambiente digital de forma leve, fácil e intuitiva. Simplifique processos, monitore indicadores ecológicos e modernize a administração pública ambiental.',
      badge: 'Órgãos de Gestão Ambiental e Consórcios',
      icon: 'eco',
      image: 'images/sisamb.webp',
      logo: 'images/logo-sisamb.webp',
      route: '/sisamb',
      clickable: true,
    },
    {
      id: 'gestao',
      button: 'Gestão Una',
      title: 'Gestão eficiente para o setor público',
      subtitle: 'Serviços Públicos Integrados',
      description:
        'Gestão Uma é uma plataforma de integração e centralização de informações, concebida para atuar como um ponto único de acesso a dados que hoje estão espalhados em diversos sistemas independentes, tanto no setor público quanto no privado.',
      badge: 'Prefeituras e Secretarias Públicas',
      icon: 'account_balance',
      image: 'images/gestao.webp',
      logo: 'images/logo-gestao-una.webp',
      route: '/gestao-una',
      clickable: true,
    },
  ];

  activeSlideIndex = signal<number>(0);

  private touchStartX = 0;
  private touchEndX = 0;

  // Sets the active slide by index and restarts the autoplay timer from there.
  setActiveSlide(index: number): void {
    this.activeSlideIndex.set(index);
    this.restartAutoplay();
  }

  // Advances to the next slide, wrapping around, and restarts the autoplay timer.
  nextSlide(): void {
    this.activeSlideIndex.update((idx) => (idx + 1) % this.slides.length);
    this.restartAutoplay();
  }

  // Goes back to the previous slide, wrapping around, and restarts the autoplay timer.
  prevSlide(): void {
    this.activeSlideIndex.update(
      (idx) => (idx - 1 + this.slides.length) % this.slides.length,
    );
    this.restartAutoplay();
  }

  // (Re)starts the periodic auto-advance, always counting the interval from
  // whichever slide is currently active — manual or automatic.
  private restartAutoplay(): void {
    this.stopAutoplay();
    this.autoplayId = setInterval(() => {
      this.activeSlideIndex.update((idx) => (idx + 1) % this.slides.length);
    }, TonomeiSectionComponent.AUTOPLAY_INTERVAL_MS);
  }

  private stopAutoplay(): void {
    if (this.autoplayId !== null) {
      clearInterval(this.autoplayId);
      this.autoplayId = null;
    }
  }

  // Records the touch start position.
  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.changedTouches[0].screenX;
  }

  // Records the touch end position and resolves the swipe.
  onTouchEnd(event: TouchEvent): void {
    this.touchEndX = event.changedTouches[0].screenX;
    this.handleSwipe();
  }

  // Advances/goes back a slide if the swipe distance passes the threshold.
  private handleSwipe(): void {
    const swipeThreshold = 50;
    const diff = this.touchStartX - this.touchEndX;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        this.nextSlide();
      } else {
        this.prevSlide();
      }
    }
  }

  // Navigates to the selected product's route, if its CTA is clickable.
  // External URLs (http/https) open in a new tab; internal routes navigate in-app.
  openSystemPage(slide: Slide): void {
    if (!slide.clickable) return;

    if (slide.route.startsWith('http')) {
      window.open(slide.route, '_blank', 'noopener,noreferrer');
      return;
    }

    this.router.navigate([slide.route]);
  }
}
