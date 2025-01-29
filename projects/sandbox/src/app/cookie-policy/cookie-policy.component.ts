import { NgIf, NgTemplateOutlet } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'sb-cookie-policy',
  templateUrl: './cookie-policy.component.html',
  styleUrls: ['./cookie-policy.component.scss'],
  imports: [NgIf, NgTemplateOutlet]
})
export class CookiePolicyComponent {
  @Input() showing = false;
  siteAddress = document.baseURI.replace(/\/$/, '');
}
