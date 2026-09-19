import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent, FooterTheme } from '../../../components/footer/footer.component';
import { LEGAL_MARCA_INFO } from '../legal-marca';
import { PrivacyContentComponent } from './privacy-content.component';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [RouterLink, FooterComponent, PrivacyContentComponent],
  templateUrl: './privacy-policy.page.html',
  styleUrl: './privacy-policy.page.scss',
})
// /politica-de-privacidade page (and its per-brand variants, e.g.
// /sisamb/politica-de-privacidade): page chrome around the shared privacy
// content, with the header logo/link and footer swapped per brand.
export class PrivacyPolicyPage {
  // Bound from the matching route's `data.marca` (see app.routes.ts).
  @Input() marca: FooterTheme = 'catec';

  get info() {
    return LEGAL_MARCA_INFO[this.marca];
  }
}
