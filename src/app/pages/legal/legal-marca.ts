import { FooterTheme } from '../../components/footer/footer.component';

export interface LegalMarcaInfo {
  logoSrc: string;
  logoAlt: string;
  // Route the "Voltar ao site" link and the logo itself point back to.
  homeRoute: string;
  // Brand accent shown as a thin bar under the header.
  accentColor: string;
}

// Per-brand header logo + home link for the /termos-de-uso and
// /politica-de-privacidade pages, so the same page can be mounted under
// each brand's own route (e.g. /sisamb/termos-de-uso) and look like it
// belongs there.
export const LEGAL_MARCA_INFO: Record<FooterTheme, LegalMarcaInfo> = {
  catec: {
    logoSrc: 'images/logo-catec-solucoes.webp',
    logoAlt: 'CATEC Soluções',
    homeRoute: '/',
    accentColor: '#f26522',
  },
  tonomei: {
    logoSrc: 'images-tonomei/logo.webp',
    logoAlt: 'tônomei',
    homeRoute: '/tonomei',
    accentColor: '#00b5a3',
  },
  sisamb: {
    logoSrc: 'images-sisamb/sisamb.webp',
    logoAlt: 'Sisamb.eco',
    homeRoute: '/sisamb',
    accentColor: '#00c29d',
  },
  gestao: {
    logoSrc: 'images/logo-gestao-una.webp',
    logoAlt: 'Gestão Una',
    homeRoute: '/gestao-una',
    accentColor: '#00bab5',
  },
};
