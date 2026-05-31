import { NgClass, NgTemplateOutlet } from '@angular/common';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
  viewChild,
  ViewContainerRef
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { KeycloakAuthService } from './_services/keycloak-auth.service';
import { tap } from 'rxjs/operators';

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
  ModalConfirmService
} from 'shared';

import { ThemeService } from './_services';
import { FooterComponent } from './footer/footer.component';
import { SandboxNavigatonComponent } from './sandbox-navigation';

@Component({
  selector: 'sb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  standalone: true,
  imports: [
    KeycloakSignoutCheckDirective,
    ModalConfirmComponent,
    MaintenanceInfoComponent,
    ClickAwareDirective,
    NgClass,
    NgTemplateOutlet,
    RouterOutlet,
    FooterComponent
  ],
  host: {
    '(document:click)': 'documentClick($event)'
  }
})
export class AppComponent {
  private readonly clickService = inject(ClickService);
  private readonly themes = inject(ThemeService);
  private readonly modalConfirms = inject(ModalConfirmService);
  private readonly maintenanceSchedules = inject(MaintenanceScheduleService);
  private readonly authService = inject(KeycloakAuthService);
  private readonly destroyRef = inject(DestroyRef);

  public readonly documentationUrl = apiSettings.documentationUrl;
  public readonly feedbackUrl = apiSettings.feedbackUrl;
  public readonly userGuideUrl = apiSettings.userGuideUrl;
  public readonly apiSettings = apiSettings;

  readonly consentContainer = viewChild('consentContainer', { read: ViewContainerRef });
  readonly modalConfirm = viewChild(ModalConfirmComponent);

  readonly isSidebarOpen = signal(false);
  readonly linkTabIndex = computed(() => (this.isSidebarOpen() ? 0 : -1));

  sandboxNavigationRef?: SandboxNavigatonComponent;

  readonly modalMaintenanceId = 'idMaintenanceModal';
  readonly maintenanceInfo = signal<MaintenanceItem | undefined>(undefined);

  public readonly isAuthenticated = this.authService.isAuthenticated;

  constructor() {
    this.initMaintenanceTracking(maintenanceSettings);

    // 🚀 THE FIX: Wrap view container mutations in a setTimeout to avoid
    // illegal expression modifications during change detection evaluation loops
    effect(() => {
      const container = this.consentContainer();
      if (container) {
        setTimeout(() => {
          this.showCookieConsent();
        }, 0);
      }
    });
  }

  goToLogin(): void {
    this.authService.login();
  }

  logOut(): void {
    this.sandboxNavigationRef?.setPage(0, false, false);
    this.authService.logout();
  }

  /**
   * Set up maintenance settings and react to schedule emissions.
   **/
  private initMaintenanceTracking(settings: MaintenanceSettings): void {
    this.maintenanceSchedules.setApiSettings(settings);

    this.maintenanceSchedules
      .loadMaintenanceItem()
      .pipe(
        tap((msg) => this.maintenanceInfo.set(msg)),
        // 🚀 THE FIX: Provided explicit destroyRef to prevent NG0911 injection context crashes
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((msg) => {
        if (msg?.maintenanceMessage) {
          this.modalConfirms.open(this.modalMaintenanceId).subscribe();
        } else if (this.modalConfirms.isOpen(this.modalMaintenanceId)) {
          this.modalConfirms.remove(this.modalMaintenanceId);
        }
      });
  }

  /**
   * Global document click handler bound via host metadata
   **/
  documentClick(event: MouseEvent): void {
    this.clickService.documentClickedTarget.next(event.target as HTMLElement);
  }

  /**
   * Lazily loads and instantiates the Cookie Consent Component
   **/
  async showCookieConsent(force = false): Promise<void> {
    const container = this.consentContainer();
    if (!container) return;

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

  switchTheme(): void {
    this.themes.switchTheme();
  }

  onOutletLoaded(component: SandboxNavigatonComponent): void {
    this.sandboxNavigationRef = component;
  }

  onLogoClick(event: Event): void {
    event.preventDefault();
    this.sandboxNavigationRef?.setPage(0, false, true);
  }

  onPrivacyPolicyClick(): void {
    this.sandboxNavigationRef?.setPage(6, false, true);
  }

  onCookiePolicyClick(): void {
    this.sandboxNavigationRef?.setPage(7, false, true);
  }

  closeSideBar(): void {
    this.isSidebarOpen.set(false);
  }

  toggleSidebarOpen(): void {
    this.isSidebarOpen.update((val) => !val);
  }

  keycloakAccountUrl(): string {
    return this.authService.getAccountUrl();
  }
}
