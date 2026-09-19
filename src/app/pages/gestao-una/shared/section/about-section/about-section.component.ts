import { Component } from '@angular/core';

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: 'check_circle',
    title: 'Centralização de Dados',
    description:
      'Um único ponto de acesso para as informações da sua instituição.',
  },
  {
    icon: 'check_circle',
    title: 'Integração de Sistemas',
    description: 'Conecte plataformas diferentes sem retrabalho manual.',
  },
  {
    icon: 'check_circle',
    title: 'Segurança da Informação',
    description:
      'Dados protegidos com controle de acesso por perfil de usuário.',
  },
  {
    icon: 'check_circle',
    title: 'Relatórios e Indicadores',
    description:
      'Visão clara da instituição para apoiar decisões mais rápidas.',
  },
];

@Component({
  selector: 'app-about-section',
  templateUrl: './about-section.component.html',
  styleUrl: './about-section.component.scss',
})
// "Sobre" section: text + image on top; the 4 differentiator cards below
// run as an infinite auto-scrolling ticker (same technique as the tônomei
// hero's entrepreneurs ticker — duplicated track, looping translateX).
export class AboutSectionComponent {
  // Duplicated so the CSS marquee can loop seamlessly at -50%.
  readonly features = [...FEATURES, ...FEATURES];
}
