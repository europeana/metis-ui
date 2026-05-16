import { Location, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  inject,
  OnInit,
  signal,
  ViewChild
} from '@angular/core';
import { Event, Router, RouterEvent, RouterOutlet } from '@angular/router';

import { of } from 'rxjs';
import { filter, switchMap, take, tap } from 'rxjs/operators';
import {
  MaintenanceInfoComponent,
  MaintenanceItem,
  MaintenanceScheduleService,
  MaintenanceSettings
} from '@europeana/metis-ui-maintenance-utils';

import {
  ClickService,
  keycloakConstants,
  KeycloakSignoutCheckDirective,
  ModalConfirmComponent,
  ModalConfirmService,
  SubscriptionManager
} from 'shared';
import { maintenanceSettings } from '../environments/maintenance-settings';
import { environment } from '../environments/environment';
import { httpErrorNotification } from './_helpers';
import { CancellationRequest, Notification } from './_models';
import { KeycloakAuthService, WorkflowService } from './_services';
import { TranslatePipe } from './_translate';
import { HeaderComponent } from './header';
import { NotificationComponent } from './shared';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [
    KeycloakSignoutCheckDirective,
    ModalConfirmComponent,
    MaintenanceInfoComponent,
    HeaderComponent,
    NotificationComponent,
    RouterOutlet,
    NgIf,
    TranslatePipe
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class AppComponent extends SubscriptionManager implements OnInit {
  // 1. Core visual layout signals
  public readonly bodyClass = signal<string>('');
  public readonly maintenanceInfo = signal<MaintenanceItem | undefined>(undefined);
  public readonly cancellationRequest = signal<CancellationRequest | undefined>(undefined);
  public readonly errorNotification = signal<Notification | undefined>(undefined);

  public readonly modalConfirmId = 'confirm-cancellation-request';
  public readonly modalMaintenanceId = 'idMaintenanceModal';
  public readonly modalUnauthorisedId = 'idUnauthorisedModal';

  @ViewChild(ModalConfirmComponent, { static: true })
  public modalConfirm!: ModalConfirmComponent;

  // 2. Pure Injection tokens
  private readonly maintenanceScheduleService = inject(MaintenanceScheduleService);
  private readonly auth = inject(KeycloakAuthService);
  private readonly location = inject(Location);
  private readonly workflows = inject(WorkflowService);
  private readonly modalConfirms = inject(ModalConfirmService);
  private readonly router = inject(Router);
  private readonly clickService = inject(ClickService);

  constructor() {
    super();
    this.checkIfMaintenanceDue(maintenanceSettings);
  }

  /**
   * checkIfMaintenanceDue
   **/
  checkIfMaintenanceDue(settings: MaintenanceSettings): void {
    this.maintenanceScheduleService.setApiSettings(settings);
    this.subs.push(
      this.maintenanceScheduleService.loadMaintenanceItem().subscribe({
        next: (item: MaintenanceItem | undefined) => {
          // Update via signal to run clean zoneless UI updates
          this.maintenanceInfo.set(item);

          if (item?.maintenanceMessage) {
            this.modalConfirms
              .open(this.modalMaintenanceId)
              .pipe(take(1))
              .subscribe();
          } else if (this.modalConfirms.isOpen(this.modalMaintenanceId)) {
            this.modalConfirms.remove(this.modalMaintenanceId);
          }
        }
      })
    );
  }

  /** documentClick
   * - global document click handler
   * - push the clicked element to the clickService
   **/
  @HostListener('document:click', ['$event'])
  documentClick(event: { target: HTMLElement }): void {
    this.clickService.documentClickedTarget.next(event.target);
  }

  /**
   * ngOnInit
   * - register modalConfirm
   * - subscribe to workflow cancellations
   * - subscribe to router events
   **/
  public ngOnInit(): void {
    this.modalConfirms.add(this.modalConfirm);
    this.subs.push(
      this.workflows.promptCancelWorkflow
        .pipe(
          filter((cancellationRequest: CancellationRequest) => {
            return !!cancellationRequest.workflowExecutionId;
          }),
          tap((cancellationRequest: CancellationRequest) => {
            this.cancellationRequest.set(cancellationRequest);
          }),
          switchMap(() => {
            const modal = this.modalConfirms.open(this.modalConfirmId);
            return modal ? modal.pipe(take(1)) : of(false);
          })
        )
        .subscribe({
          next: (response: boolean) => {
            if (response) {
              this.cancelWorkflow();
            }
          }
        })
    );
    this.subs.push(this.router.events.subscribe({ next: this.handleRouterEvent.bind(this) }));
  }

  /**
   * logOut
   * wrapper function for keycloak logout.
   **/
  logOut(): void {
    this.auth.logout();
  }

  /**
   * handleRouterEvent
   * conditionally sets this.bodyClass or calls router
   *
   * @param { Event } event - the router event
   **/
  handleRouterEvent(event: Event | RouterEvent): void {
    const url: string | undefined = (event as RouterEvent).url;
    if (!url) {
      return;
    }
    if (
      this.router.isActive(url, {
        paths: 'subset',
        queryParams: 'subset',
        fragment: 'ignored',
        matrixParams: 'ignored'
      })
    ) {
      let newClass = url.split('/')[1];
      if (url === '/') {
        newClass = 'home';
      }
      this.bodyClass.set(newClass);

      // Secure verification leveraging your native KeycloakAuthService signal
      if ((url === '/' || url === '/home') && this.auth.isAuthenticated()) {
        this.router.navigate([environment.afterLoginGoto]);
      }

      if (url.indexOf(keycloakConstants.paramLoginUnauthorised) > -1) {
        this.modalConfirms
          .open(this.modalUnauthorisedId)
          .pipe(take(1))
          .subscribe(() => {
            this.location.replaceState('/home', '');
          });
      }
    }
  }

  /** cancelWorkflow
  /*  cancels the workflow using the currentWorkflow id
  */
  cancelWorkflow(): void {
    const request = this.cancellationRequest();
    if (request) {
      this.errorNotification.set(undefined);
      this.subs.push(
        this.workflows.cancelThisWorkflow(request.workflowExecutionId).subscribe({
          next: () => {
            // successful cancellation request made
          },
          error: (err: HttpErrorResponse) => {
            this.errorNotification.set(httpErrorNotification(err));
          }
        })
      );
    }
  }
}
