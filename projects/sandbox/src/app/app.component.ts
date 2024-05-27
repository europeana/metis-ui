import { NgClass, NgIf, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  HostListener,
  inject,
  Renderer2,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import {
  MaintenanceInfoComponent,
  MaintenanceItem,
  MaintenanceScheduleService,
  MaintenanceSettings
} from '@europeana/metis-ui-maintenance-utils';
import { apiSettings } from '../environments/apisettings';
import { maintenanceSettings } from '../environments/maintenance-settings';
import { cookieConsentConfig } from '../environments/eu-cm-settings';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import {
  ClickAwareDirective,
  ClickService,
  ModalConfirmComponent,
  ModalConfirmService,
  SubscriptionManager
} from 'shared';
import { FooterComponent } from './footer/footer.component';
import { SandboxNavigatonComponent } from './sandbox-navigation';

@Component({
  selector: 'sb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    ModalConfirmComponent,
    MaintenanceInfoComponent,
    ClickAwareDirective,
    NgClass,
    NgIf,
    NgTemplateOutlet,
    RouterOutlet,
    FooterComponent
  ]
})
export class AppComponent extends SubscriptionManager {
  private readonly clickService = inject(ClickService);
  private readonly renderer = inject(Renderer2);
  private readonly cookies = inject(CookieService);

  private modalConfirms = inject(ModalConfirmService);
  private maintenanceSchedules = inject(MaintenanceScheduleService);

  public documentationUrl = apiSettings.documentationUrl;
  public feedbackUrl = apiSettings.feedbackUrl;
  public userGuideUrl = apiSettings.userGuideUrl;
  public apiSettings = apiSettings;

  @ViewChild('consentContainer', { read: ViewContainerRef }) consentContainer: ViewContainerRef;

  isSidebarOpen = false;

  themeCookieName = 'eu_sb_theme';
  themeIndex = 0;
  themes = ['theme-white', 'theme-classic'];

  sandboxNavigationRef: SandboxNavigatonComponent;

  modalMaintenanceId = 'idMaintenanceModal';
  maintenanceInfo?: MaintenanceItem = undefined;

  @ViewChild(ModalConfirmComponent, { static: true })
  modalConfirm: ModalConfirmComponent;

  constructor() {
    super();
    this.setSavedTheme();
    this.checkIfMaintenanceDue(maintenanceSettings);
    this.showCookieConsent();
  }

  /**
   * checkIfMaintenanceDue
   **/
  checkIfMaintenanceDue(settings: MaintenanceSettings): void {
    this.maintenanceSchedules.setApiSettings(settings);
    this.subs.push(
      this.maintenanceSchedules
        .loadMaintenanceItem()
        .subscribe((msg: MaintenanceItem | undefined) => {
          this.maintenanceInfo = msg;
          if (this.maintenanceInfo?.maintenanceMessage) {
            this.modalConfirms.open(this.modalMaintenanceId).subscribe();
          } else if (this.modalConfirms.isOpen(this.modalMaintenanceId)) {
            this.modalConfirm.close(false);
          }
        })
    );
  }

  /**
   * documentClick
   * - global document click handler
   * - push the clicked element to the clickService
   * - (picked up by the click-aware directive)
   **/
  @HostListener('document:click', ['$event'])
  documentClick(event: { target: HTMLElement }): boolean | void {
    this.clickService.documentClickedTarget.next(event.target);
  }

  /**
   * showCookieConsent
   * - calls closeSideBar
   * - calls show on cookieConsent
   **/
  async showCookieConsent(force = false): Promise<void> {
    this.closeSideBar();
    const CookieConsentComponent = (await import('@europeana/metis-ui-consent-management'))
      .CookieConsentComponent;
    this.consentContainer.clear();

    const cookieConsent = this.consentContainer.createComponent(CookieConsentComponent);

    cookieConsent.setInput('services', cookieConsentConfig.services);
    cookieConsent.setInput('fnLinkClick', (): void => {
      cookieConsent.instance.shrink();
      this.onCookiePolicyClick();
    });

    if (force) {
      cookieConsent.instance.show();
    }
  }

  /**
   * switchTheme
   * - bumps or resets themeIndex
   * - manages relevant body-level classes
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
    this.cookies.set(this.themeCookieName, `${this.themeIndex}`, { path: '/' });
  }

  /** onOutletLoaded
  /* - obtains ref to app component
  /* @param { SandboxNavigatonComponent } component - route component
  */
  onOutletLoaded(component: SandboxNavigatonComponent): void {
    this.sandboxNavigationRef = component;
  }

  /**
   * onLogoClick
   * invokes setPage on sandboxNavigationRef
   * @param { Event } event - the click event
   **/
  onLogoClick(event: Event): void {
    event.preventDefault();
    this.sandboxNavigationRef.setPage(0, false, true);
  }

  /**
   * onPrivacyPolicyClick
   * invokes setPage on sandboxNavigationRef
   **/
  onPrivacyPolicyClick(): void {
    this.sandboxNavigationRef.setPage(6, false, true);
  }

  /**
   * onCookiePolicyClick
   * invokes setPage on sandboxNavigationRef
   **/
  onCookiePolicyClick(): void {
    this.sandboxNavigationRef.setPage(7, false, true);
  }

  /**
   * closeSideBar
   * sets isSidebarOpen to false
   **/
  closeSideBar(): void {
    this.isSidebarOpen = false;
  }

  /**
   * getLinkTabIndex
   * template utility
   **/
  getLinkTabIndex(): number {
    return this.isSidebarOpen ? 0 : -1;
  }

  /**
   * setSavedTheme
   * loads the saved theme / switches if different to the default
   **/
  setSavedTheme(): void {
    const themeCookie = this.cookies.get(this.themeCookieName);
    const themeParsed = parseInt(themeCookie);

    if (themeCookie && !isNaN(themeParsed) && this.themeIndex !== themeParsed) {
      this.switchTheme();
    }
  }

  /**
   * toggleSidebarOpen
   * toggle isSidebarOpen
   **/
  toggleSidebarOpen(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
