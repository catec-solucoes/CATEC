import {
  afterNextRender,
  Component,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import { OrcamentoService } from '../../../../catec/shared/components/orcamento-modal/orcamento.service';

interface Passo {
  numero: string;
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-cta-final-section',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './cta-final-section.component.html',
  styleUrl: './cta-final-section.component.scss',
})
// "Como contratar": the real commercial process for hiring Gestão Una, shown
// as an editorial intro (left) + vertical timeline (right) — same layout as
// the SISAMB LP's own "Como contratar" section.
export class CtaFinalSectionComponent {
  private readonly timeline = viewChild<ElementRef<HTMLElement>>('timeline');
  private readonly orcamentoService = inject(OrcamentoService);

  readonly passos: Passo[] = [
    {
      numero: '01',
      icon: 'event_available',
      title: 'Agendamento',
      description:
        'Processo feito aqui mesmo em nosso site, através de nossos canais.',
    },
    {
      numero: '02',
      icon: 'co_present',
      title: 'Demonstração',
      description: 'Apresentação técnica personalizada para sua equipe',
    },
    {
      numero: '03',
      icon: 'request_quote',
      title: 'Envio da proposta comercial',
      description: 'Adequação jurídica incluída na proposta',
    },
    {
      numero: '04',
      icon: 'rocket_launch',
      title: 'Implantação',
      description: 'Configuração do sistema para a sua instituição',
    },
    {
      numero: '05',
      icon: 'school',
      title: 'Treinamento',
      description: 'Capacitação completa de toda a equipe',
    },
  ];

  // Opens the same quote-request form used across the site's other CTAs.
  abrirAgendamento(): void {
    this.orcamentoService.abrir('gestao');
  }

  constructor() {
    afterNextRender(() => {
      const el = this.timeline()?.nativeElement;
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            el.classList.add('in-view');
            observer.disconnect();
          }
        },
        { threshold: 0.15 },
      );
      observer.observe(el);
    });
  }
}
