import { Component, Input } from '@angular/core';

@Component({
  selector: 'sb-cookie-policy',
  templateUrl: './cookie-policy.component.html',
  styleUrls: ['./cookie-policy.component.scss']
})
export class CookiePolicyComponent {
  @Input() showing = false;
}
