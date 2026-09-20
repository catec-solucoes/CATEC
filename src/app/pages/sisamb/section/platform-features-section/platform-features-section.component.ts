import {
  afterNextRender,
  Component,
  ElementRef,
  viewChild,
} from '@angular/core';

interface Beneficio {
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-platform-features-section',
  standalone: true,
  imports: [],
  templateUrl: './platform-features-section.component.html',
  styleUrl: './platform-features-section.component.scss',
})
// "Por que o SISAMB": what genuinely changes in the secretaria after rollout.
export class PlatformFeaturesSectionComponent {
  private readonly grid = viewChild<ElementRef<HTMLElement>>('grid');

  readonly beneficios: Beneficio[] = [
    {
      icon: 'event_busy',
      title: 'Fim das filas presenciais',
      description:
        'Cidadão resolve tudo pelo portal, sem precisar ir até a secretaria',
    },
    {
      icon: 'bolt',
      title: 'Processos até 5x mais rápidos',
      description:
        'Curadoria automática elimina o gargalo na triagem dos documentos',
    },
    {
      icon: 'visibility',
      title: 'Transparência para o cidadão',
      description:
        'Acompanhamento em tempo real via notificações e painel próprio',
    },
    {
      icon: 'dashboard',
      title: 'Gestores com visão completa',
      description:
        'Dashboards com indicadores, prazos e histórico de tramitação',
    },
    {
      icon: 'task_alt',
      title: 'Menos retrabalho para fiscais',
      description:
        'A IA faz a análise prévia dos documentos antes do parecer técnico',
    },
    {
      icon: 'tune',
      title: 'Adaptado ao seu município',
      description:
        'Configuração flexível para a legislação e os processos locais',
    },
    {
      icon: 'eco',
      title: 'Economia de papel e custos',
      description:
        'Eliminação do uso de papel e dos custos de armazenamento físico',
    },
    {
      icon: 'workspace_premium',
      title: 'Imagem moderna da gestão',
      description:
        'Sua prefeitura se posiciona como referência em inovação pública',
    },
  ];

  constructor() {
    afterNextRender(() => {
      const el = this.grid()?.nativeElement;
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
