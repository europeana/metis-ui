import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'sb-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
  standalone: true,
  imports: [NgIf]
})
export class PrivacyPolicyComponent {
  @Input() showing = false;
}
