import { Component, Input } from '@angular/core';
import { NgIf, NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'sb-cookie-policy',
  templateUrl: './cookie-policy.component.html',
  styleUrls: ['./cookie-policy.component.scss'],
  standalone: true,
  imports: [NgIf, NgTemplateOutlet]
})
export class CookiePolicyComponent {
  @Input() showing = false;
  siteAddress = document.baseURI.replace(/\/$/, '');
}
