import {
  Component,
  HostListener,
  inject,
  Renderer2,
  ViewChild,
  ViewContainerRef
} from '@angular/core';
import { MaintenanceItem, MaintenanceScheduleService } from '@europeana/metis-ui-maintenance-utils';
import { apiSettings } from '../environments/apisettings';
import { maintenanceSettings } from '../environments/maintenance-settings';
import { cookieConsentConfig } from '../environments/eu-cm-settings';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import {
  ClickService,
  ModalConfirmComponent,
  ModalConfirmService,
  SubscriptionManager
} from 'shared';
import { SandboxNavigatonComponent } from './sandbox-navigation';

@Component({
  selector: 'sb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends SubscriptionManager {
  private readonly clickService = inject(ClickService);
  private readonly renderer = inject(Renderer2);
  private modalConfirms = inject(ModalConfirmService);
  private maintenanceSchedules = inject(MaintenanceScheduleService);

  public documentationUrl = apiSettings.documentationUrl;
  public feedbackUrl = apiSettings.feedbackUrl;
  public userGuideUrl = apiSettings.userGuideUrl;
  public apiSettings = apiSettings;

  @ViewChild('consentContainer', { read: ViewContainerRef }) consentContainer: ViewContainerRef;

  isSidebarOpen = false;
  themes = ['theme-white', 'theme-classic'];
  themeIndex = 0;
  sandboxNavigationRef: SandboxNavigatonComponent;

  modalMaintenanceId = 'idMaintenanceModal';
  maintenanceInfo?: MaintenanceItem = undefined;

  @ViewChild(ModalConfirmComponent, { static: true })
  modalConfirm: ModalConfirmComponent;

  constructor() {
    super();
    this.maintenanceSchedules.setApiSettings(maintenanceSettings);
    this.subs.push(
      this.maintenanceSchedules
        .loadMaintenanceItem()
        .subscribe((msg: MaintenanceItem | undefined) => {
          this.maintenanceInfo = msg;
          if (this.maintenanceInfo && this.maintenanceInfo.maintenanceMessage) {
            this.modalConfirms.open(this.modalMaintenanceId).subscribe();
          } else if (this.modalConfirms.isOpen(this.modalMaintenanceId)) {
            this.modalConfirm.close(false);
          }
        })
    );
    this.showCookieConsent();
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
    const CookieConsentComponent = (
      await import(
        '../../../../node_modules/@europeana/metis-ui-consent-management/dist/metis-ui-consent-management'
      )
    ).CookieConsentComponent;
    this.consentContainer.clear();

    const cookieConsent = this.consentContainer.createComponent(CookieConsentComponent);
    cookieConsent.setInput('privacyPolicyClass', 'external-link');
    cookieConsent.setInput('services', cookieConsentConfig.services);
    cookieConsent.setInput('fnPrivacyPolicyClick', (): void => {
      cookieConsent.instance.shrink();
      this.sandboxNavigationRef.setPage(1, false, true);
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
   * onLogoClick
   * invokes setPage on sandboxNavigationRef
   **/
  onPrivacyPolicyClick(): void {
    this.sandboxNavigationRef.setPage(1, false, true);
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
   * toggleSidebarOpen
   * toggle isSidebarOpen
   **/
  toggleSidebarOpen(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }
}
