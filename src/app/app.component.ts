import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Event, Router, RouterEvent } from '@angular/router';
import { filter, switchMap, tap } from 'rxjs/operators';
import { environment } from '../environments/environment';
import { SubscriptionManager } from './shared/subscription-manager/subscription.manager';
import { CancellationRequest } from './_models';
import { ModalConfirmComponent } from './shared/modal-confirm';
import {
  AuthenticationService,
  ErrorService,
  ModalConfirmService,
  WorkflowService
} from './_services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent extends SubscriptionManager implements OnInit {
  bodyClass: string;
  cancellationRequest?: CancellationRequest;
  public loggedIn = false;
  modalConfirmId = 'confirm-cancellation-request';

  @ViewChild(ModalConfirmComponent, { static: true })
  modalConfirm: ModalConfirmComponent;

  constructor(
    private readonly workflows: WorkflowService,
    private readonly authentication: AuthenticationService,
    private readonly modalConfirms: ModalConfirmService,
    private readonly errors: ErrorService,
    private readonly router: Router
  ) {
    super();
  }

  /** ngOnInit
  /* init for this component
  /* watch router events
  /* check if user is logged in
  /* add a body class
  /* and margins
  */
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
            return this.modalConfirms.open(this.modalConfirmId);
          })
        )
        .subscribe((response: boolean) => {
          if (response) {
            this.cancelWorkflow();
          }
        })
    );

    this.subs.push(
      this.router.events.subscribe((event: Event) => {
        const url: string | undefined = (event as RouterEvent).url;
        if (!url) {
          return;
        }
        if (this.router.isActive(url, false)) {
          this.loggedIn = this.authentication.validatedUser();

          this.bodyClass = url.split('/')[1];
          if (url === '/') {
            this.bodyClass = 'home';
          }

          if ((url === '/' || url === '/home') && this.loggedIn) {
            this.router.navigate([environment.afterLoginGoto]);
          }
        }
      })
    );
  }

  /** cancelWorkflow
  /*  cancels the workflow using the currentWorkflow id
  */
  cancelWorkflow(): void {
    this.subs.push(
      this.workflows.cancelThisWorkflow(this.cancellationRequest!.workflowExecutionId).subscribe(
        () => {
          console.log('cancelling');
        },
        (err: HttpErrorResponse) => {
          this.errors.handleError(err);
        }
      )
    );
  }
}
