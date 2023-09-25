import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, HostListener, OnInit, ViewChild } from '@angular/core';
import { Event, Router, RouterEvent } from '@angular/router';
import { of } from 'rxjs';
import { filter, switchMap, tap } from 'rxjs/operators';
import { MaintenanceItem, MaintenanceScheduleService } from '@europeana/metis-ui-maintenance-utils';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import {
  ClickService,
  ModalConfirmComponent,
  ModalConfirmService,
  SubscriptionManager
} from 'shared';
import { maintenanceSettings } from '../environments/maintenance-settings';
import { environment } from '../environments/environment';
import { CancellationRequest, httpErrorNotification, Notification } from './_models';
import { AuthenticationService, WorkflowService } from './_services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent extends SubscriptionManager implements OnInit {
  bodyClass: string;
  cancellationRequest?: CancellationRequest;
  public loggedIn = false;
  modalConfirmId = 'confirm-cancellation-request';
  modalMaintenanceId = 'idMaintenanceModal';
  maintenanceInfo?: MaintenanceItem = undefined;
  errorNotification?: Notification;

  @ViewChild(ModalConfirmComponent, { static: true })
  modalConfirm: ModalConfirmComponent;

  private readonly maintenanceScheduleService: MaintenanceScheduleService;

  constructor(
    private readonly workflows: WorkflowService,
    private readonly authentication: AuthenticationService,
    private readonly modalConfirms: ModalConfirmService,
    private readonly router: Router,
    private readonly clickService: ClickService,
  ) {
    super();
    this.maintenanceScheduleService = inject(MaintenanceScheduleService);
    this.maintenanceScheduleService.setApiSettings(maintenanceSettings);
    this.subs.push(
      this.maintenanceScheduleService
        .loadMaintenanceItem()
        .subscribe((item: MaintenanceItem | undefined) => {
          this.maintenanceInfo = item;
          if (this.maintenanceInfo && this.maintenanceInfo.maintenanceMessage) {
            this.modalConfirms.open(this.modalMaintenanceId).subscribe();
          } else if (this.modalConfirms.isOpen(this.modalMaintenanceId)) {
            this.modalConfirm.close(false);
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
            return modal ? modal : of(false);
          })
        )
        .subscribe((response: boolean) => {
          if (response) {
            this.cancelWorkflow();
          }
        })
    );
    this.subs.push(this.router.events.subscribe(this.handleRouterEvent.bind(this)));
  }

  /**
   * handleRouterEvent
   * conditionally sets this.bodyClass or calls router
   *
   * @param { Event } event - the router event
   **/
  handleRouterEvent(event: Event): void {
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
      this.loggedIn = this.authentication.validatedUser();
      this.bodyClass = url.split('/')[1];
      if (url === '/') {
        this.bodyClass = 'home';
      }
      if ((url === '/' || url === '/home') && this.loggedIn) {
        this.router.navigate([environment.afterLoginGoto]);
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
        this.workflows.cancelThisWorkflow(this.cancellationRequest.workflowExecutionId).subscribe(
          () => {
            // successful cancellation request made
          },
          (err: HttpErrorResponse) => {
            this.errorNotification = httpErrorNotification(err);
          }
        )
      );
    }
  }
}
