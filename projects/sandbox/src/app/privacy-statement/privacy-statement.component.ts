import { NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'sb-privacy-statement',
  templateUrl: './privacy-statement.component.html',
  styleUrls: ['./privacy-statement.component.scss'],
  imports: [NgIf]
})
export class PrivacyStatementComponent {
  @Input() showing = false;
}
