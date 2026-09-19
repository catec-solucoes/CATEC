import { Routes } from '@angular/router';

export const routes: Routes = [
  // Main / root route (Catec LP)
  {
    path: '',
    loadComponent: () =>
      import('./pages/catec/home/home.page').then((m) => m.HomePage),
  },

  // SISAMB route
  {
    path: 'sisamb',
    loadComponent: () =>
      import('./pages/sisamb/home/home.page').then((m) => m.HomePage),
  },

  // Gestão Una route
  {
    path: 'gestao-una',
    loadComponent: () =>
      import('./pages/gestao-una/home/home.page').then((m) => m.HomePage),
  },

  // tônomei route
  {
    path: 'tonomei',
    loadComponent: () =>
      import('./pages/tonomei/home/home.page').then((m) => m.HomePage),
  },

  // Privacy Policy route (catec)
  {
    path: 'politica-de-privacidade',
    loadComponent: () =>
      import('./pages/legal/privacy-policy/privacy-policy.page').then(
        (m) => m.PrivacyPolicyPage,
      ),
  },

  // Terms of Use route (catec)
  {
    path: 'termos-de-uso',
    loadComponent: () =>
      import('./pages/legal/terms-of-use/terms-of-use.page').then(
        (m) => m.TermsOfUsePage,
      ),
  },

  // Per-brand Privacy Policy / Terms of Use routes — same shared content and
  // page chrome as above, just with each brand's own logo/home link/footer
  // (see legal-marca.ts). Needed so each product has its own crawlable
  // legal-page URL, e.g. for Google OAuth consent screen verification.
  {
    path: 'sisamb/politica-de-privacidade',
    data: { marca: 'sisamb' },
    loadComponent: () =>
      import('./pages/legal/privacy-policy/privacy-policy.page').then(
        (m) => m.PrivacyPolicyPage,
      ),
  },
  {
    path: 'sisamb/termos-de-uso',
    data: { marca: 'sisamb' },
    loadComponent: () =>
      import('./pages/legal/terms-of-use/terms-of-use.page').then(
        (m) => m.TermsOfUsePage,
      ),
  },
  {
    path: 'tonomei/politica-de-privacidade',
    data: { marca: 'tonomei' },
    loadComponent: () =>
      import('./pages/legal/privacy-policy/privacy-policy.page').then(
        (m) => m.PrivacyPolicyPage,
      ),
  },
  {
    path: 'tonomei/termos-de-uso',
    data: { marca: 'tonomei' },
    loadComponent: () =>
      import('./pages/legal/terms-of-use/terms-of-use.page').then(
        (m) => m.TermsOfUsePage,
      ),
  },
  {
    path: 'gestao-una/politica-de-privacidade',
    data: { marca: 'gestao' },
    loadComponent: () =>
      import('./pages/legal/privacy-policy/privacy-policy.page').then(
        (m) => m.PrivacyPolicyPage,
      ),
  },
  {
    path: 'gestao-una/termos-de-uso',
    data: { marca: 'gestao' },
    loadComponent: () =>
      import('./pages/legal/terms-of-use/terms-of-use.page').then(
        (m) => m.TermsOfUsePage,
      ),
  },

  // Redirect unknown routes to the main page
  {
    path: '**',
    redirectTo: '',
  },
];
