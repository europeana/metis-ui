import { NgClass, NgIf, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  HostListener,
  inject,
  signal,
  viewChild,
  ViewContainerRef
} from '@angular/core';
import { RouterOutlet } from '@angular/router';

import Keycloak from 'keycloak-js';
import { take } from 'rxjs/operators';

import {
  MaintenanceInfoComponent,
  MaintenanceItem,
  MaintenanceScheduleService,
  MaintenanceSettings
} from '@europeana/metis-ui-maintenance-utils';
import { apiSettings } from '../environments/apisettings';
import { maintenanceSettings } from '../environments/maintenance-settings';
import { cookieConsentConfig } from '../environments/eu-cm-settings';

import {
  ClickAwareDirective,
  ClickService,
  KeycloakSignoutCheckDirective,
  ModalConfirmComponent,
  ModalConfirmService,
  SubscriptionManager
} from 'shared';

import { ThemeService } from './_services';

import { FooterComponent } from './footer/footer.component';
import { SandboxNavigatonComponent } from './sandbox-navigation';

@Component({
  selector: 'sb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [
    KeycloakSignoutCheckDirective,
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
  private readonly themes = inject(ThemeService);

  private modalConfirms = inject(ModalConfirmService);
  private maintenanceSchedules = inject(MaintenanceScheduleService);

  public documentationUrl = apiSettings.documentationUrl;
  public feedbackUrl = apiSettings.feedbackUrl;
  public userGuideUrl = apiSettings.userGuideUrl;
  public apiSettings = apiSettings;

  public readonly keycloak = inject(Keycloak);

  consentContainer = viewChild('consentContainer', { read: ViewContainerRef });
  modalConfirm = viewChild(ModalConfirmComponent);

  isSidebarOpen = signal(false);
  linkTabIndex = computed(() => (this.isSidebarOpen() ? 0 : -1));

  sandboxNavigationRef: SandboxNavigatonComponent;

  modalMaintenanceId = 'idMaintenanceModal';
  maintenanceInfo?: MaintenanceItem = undefined;

  constructor() {
    super();
    this.checkIfMaintenanceDue(maintenanceSettings);
    this.showCookieConsent();
  }

  goToLogin(): void {
    this.keycloak.login({ redirectUri: window.location.href });
  }

  logOut(): void {
    this.sandboxNavigationRef.setPage(0, false, false);
    this.keycloak.logout({ redirectUri: window.location.origin + '/' });
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
            this.modalConfirms
              .open(this.modalMaintenanceId)
              .pipe(take(1))
              .subscribe();
          } else if (this.modalConfirms.isOpen(this.modalMaintenanceId)) {
            this.modalConfirm()?.close(false);
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
    const container = this.consentContainer(); // 1. Get the signal value
    if (!container) return; // 2. Safety guard

    this.closeSideBar();

    const { CookieConsentComponent } = await import('@europeana/metis-ui-consent-management');

    container.clear();
    const cookieConsent = container.createComponent(CookieConsentComponent);

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
   * - invokes eponymous service
   */
  switchTheme(): void {
    this.themes.switchTheme();
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
    this.isSidebarOpen.set(false);
  }

  /**
   * toggleSidebarOpen
   * toggle isSidebarOpen
   **/
  toggleSidebarOpen(): void {
    this.isSidebarOpen.update((val) => !val);
  }
}
