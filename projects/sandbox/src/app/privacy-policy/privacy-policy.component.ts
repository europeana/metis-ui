import { Component, Input } from '@angular/core';

@Component({
  selector: 'sb-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss']
})
export class PrivacyPolicyComponent {
  @Input() showing = false;
}
