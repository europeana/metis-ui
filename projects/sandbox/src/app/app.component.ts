import { Component, HostListener } from '@angular/core';
import { apiSettings } from '../environments/apisettings';

import { ClickService } from 'shared';

@Component({
  selector: 'sb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public feedbackUrl = apiSettings.feedbackUrl;

  constructor(private readonly clickService: ClickService) {}

  /** documentClick
   * - global document click handler
   * - push the clicked element to the clickService
   * - (picked up by the click-aware directive)
   **/
  @HostListener('document:click', ['$event'])
  documentClick(event: { target: HTMLElement }): void {
    this.clickService.documentClickedTarget.next(event.target);
  }
}
