import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { CardComponent } from '../../../../../components/card/card.component';
import { ButtonComponent } from '../../components/button/button.component';
import { OrcamentoService } from '../../components/orcamento-modal/orcamento.service';

// CATEC Soluções main WhatsApp line (same number used in the footer/floating button).
const CATEC_WHATSAPP_PHONE = '5585996157126';

@Component({
  selector: 'app-more-products-section',
  standalone: true,
  imports: [CardComponent, ButtonComponent],
  templateUrl: './more-products-section.component.html',
  styleUrl: './more-products-section.component.scss',
})
export class MoreProductsSectionComponent {
  private readonly orcamentoService = inject(OrcamentoService);
  private readonly productsGrid =
    viewChild<ElementRef<HTMLElement>>('productsGrid');

  constructor() {
    // Reveals the service cards with a staggered animation once the grid
    // scrolls into view, instead of animating them on every page load.
    afterNextRender(() => {
      const grid = this.productsGrid()?.nativeElement;
      if (!grid) return;

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

  // Opens the quote request modal.
  abrirOrcamento(): void {
    this.orcamentoService.abrir();
  }

  // Opens WhatsApp with a pre-filled message to the CATEC Soluções line.
  abrirWhatsApp(): void {
    const text = encodeURIComponent(
      'Olá! Gostaria de tirar algumas dúvidas sobre os serviços da CATEC Soluções.',
    );
    window.open(
      `https://api.whatsapp.com/send/?phone=${CATEC_WHATSAPP_PHONE}&text=${text}`,
      '_blank',
    );
  }
}
