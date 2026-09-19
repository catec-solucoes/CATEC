import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent, FooterTheme } from '../../../components/footer/footer.component';
import { LEGAL_MARCA_INFO } from '../legal-marca';
import { TermsContentComponent } from './terms-content.component';

@Component({
  selector: 'app-terms-of-use',
  standalone: true,
  imports: [RouterLink, FooterComponent, TermsContentComponent],
  templateUrl: './terms-of-use.page.html',
  styleUrl: './terms-of-use.page.scss',
})
// /termos-de-uso page (and its per-brand variants, e.g.
// /sisamb/termos-de-uso): page chrome around the shared terms content, with
// the header logo/link and footer swapped per brand.
export class TermsOfUsePage {
  // Bound from the matching route's `data.marca` (see app.routes.ts).
  @Input() marca: FooterTheme = 'catec';

  get info() {
    return LEGAL_MARCA_INFO[this.marca];
  }
}
