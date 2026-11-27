import { NgIf } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'sb-privacy-statement',
  templateUrl: './privacy-statement.component.html',
  styleUrls: ['./privacy-statement.component.scss'],
  imports: [NgIf, RouterLink]
})
export class PrivacyStatementComponent {
  readonly showing = input(false);
  readonly pageUrl = '/privacy-statement';
}
