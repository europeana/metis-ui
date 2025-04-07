import { Location, NgIf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  HostListener,
  inject,
  OnInit,
  ViewChild
} from '@angular/core';
import { Event, Router, RouterEvent, RouterOutlet } from '@angular/router';

import { of } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import Keycloak from 'keycloak-js';
import {
  MaintenanceInfoComponent,
  MaintenanceItem,
  MaintenanceScheduleService
} from '@europeana/metis-ui-maintenance-utils';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
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
import { CancellationRequest, httpErrorNotification, Notification } from './_models';
import { WorkflowService } from './_services';
import { TranslatePipe } from './_translate';
import { HeaderComponent, NotificationComponent } from './shared';

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
  bodyClass: string;
  cancellationRequest?: CancellationRequest;
  modalConfirmId = 'confirm-cancellation-request';
  modalMaintenanceId = 'idMaintenanceModal';
  modalUnauthorisedId = 'idUnauthorisedModal';
  maintenanceInfo?: MaintenanceItem = undefined;
  errorNotification?: Notification;

  @ViewChild(ModalConfirmComponent, { static: true })
  modalConfirm: ModalConfirmComponent;

  private readonly maintenanceScheduleService: MaintenanceScheduleService;
  private readonly keycloak = inject(Keycloak);
  private readonly location = inject(Location);

  constructor(
    private readonly workflows: WorkflowService,
    private readonly modalConfirms: ModalConfirmService,
    private readonly router: Router,
    private readonly clickService: ClickService
  ) {
    super();
    this.maintenanceScheduleService = inject(MaintenanceScheduleService);
    this.maintenanceScheduleService.setApiSettings(maintenanceSettings);
    this.subs.push(
      this.maintenanceScheduleService.loadMaintenanceItem().subscribe({
        next: (item: MaintenanceItem | undefined) => {
          this.maintenanceInfo = item;
          if (this.maintenanceInfo?.maintenanceMessage) {
            this.modalConfirms.open(this.modalMaintenanceId).subscribe();
          } else if (this.modalConfirms.isOpen(this.modalMaintenanceId)) {
            this.modalConfirm.close(false);
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
            this.cancellationRequest = cancellationRequest;
          }),
          switchMap(() => {
            const modal = this.modalConfirms.open(this.modalConfirmId);
            return modal || of(false);
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
    this.keycloak.logout({
      redirectUri: window.location.origin + environment.afterLoginGoto
    });
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
      this.bodyClass = url.split('/')[1];
      if (url === '/') {
        this.bodyClass = 'home';
      }
      if ((url === '/' || url === '/home') && this.keycloak.authenticated) {
        this.router.navigate([environment.afterLoginGoto]);
      }
      if (url.indexOf(keycloakConstants.paramLoginUnauthorised) > -1) {
        this.modalConfirms.open(this.modalUnauthorisedId).subscribe(() => {
          // use location to properly clear the query parameter
          this.location.replaceState('/home', '');
        });
      }
    }
  }

  /** cancelWorkflow
  /*  cancels the workflow using the currentWorkflow id
  */
  cancelWorkflow(): void {
    if (this.cancellationRequest) {
      this.errorNotification = undefined;
      this.subs.push(
        this.workflows.cancelThisWorkflow(this.cancellationRequest.workflowExecutionId).subscribe({
          next: () => {
            // successful cancellation request made
          },
          error: (err: HttpErrorResponse) => {
            this.errorNotification = httpErrorNotification(err);
          }
        })
      );
    }
  }
}
