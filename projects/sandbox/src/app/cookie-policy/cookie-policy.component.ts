import { NgIf, NgTemplateOutlet } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'sb-cookie-policy',
  templateUrl: './cookie-policy.component.html',
  styleUrls: ['./cookie-policy.component.scss'],
  imports: [NgIf, NgTemplateOutlet]
})
export class CookiePolicyComponent {
  readonly showing = input(false);
  siteAddress = document.baseURI.replace(/\/$/, '');
}
