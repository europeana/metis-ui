import { Component, HostListener, Renderer2 } from '@angular/core';
import { apiSettings } from '../environments/apisettings';
import { ClickService } from 'shared';
import { WizardComponent } from './wizard';

@Component({
  selector: 'sb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public documentationUrl = apiSettings.documentationUrl;
  public feedbackUrl = apiSettings.feedbackUrl;
  public userGuideUrl = apiSettings.userGuideUrl;
  public apiSettings = apiSettings;

  isSidebarOpen = false;
  themes = ['theme-default', 'theme-white'];
  themeIndex = 0;
  wizardRef: WizardComponent;

  constructor(private readonly clickService: ClickService, private readonly renderer: Renderer2) {}

  /** documentClick
   * - global document click handler
   * - push the clicked element to the clickService
   * - (picked up by the click-aware directive)
   **/
  @HostListener('document:click', ['$event'])
  documentClick(event: { target: HTMLElement }): boolean | void {
    this.clickService.documentClickedTarget.next(event.target);
  }

  /** switchTheme
  /* - bumps or resets themeIndex
  /* - manages relevant body-level classes
  */
  switchTheme(): void {
    this.themeIndex += 1;
    if (this.themeIndex >= this.themes.length) {
      this.themeIndex = 0;
    }
    this.themes.forEach((theme: string) => {
      this.renderer.removeClass(document.body, theme);
    });
    this.renderer.addClass(document.body, this.themes[this.themeIndex]);
  }

  /** onOutletLoaded
  /* - obtains ref to app component
  /* @param { WizardComponent } component - route component
  */
  onOutletLoaded(component: WizardComponent): void {
    this.wizardRef = component;
  }

  /**
   * onLogoClick
   * invokes setStep on wizardRef
   * @param { Event } event - the click event
   **/
  onLogoClick(event: Event): void {
    event.preventDefault();
    this.wizardRef.setStep(0, false, true);
  }

  /**
   * closeSideBar
   * sets isSidebarOpen to false
   **/
  closeSideBar(): void {
    this.isSidebarOpen = false;
  }

  /**
   * toggleSidebarOpen
   * toggle isSidebarOpen
   **/
  toggleSidebarOpen(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
