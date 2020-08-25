import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Event, Router, RouterEvent } from '@angular/router';
import { environment } from '../environments/environment';
import { SubscriptionManager } from './shared/subscription-manager/subscription.manager';
import { CancellationRequest } from './_models';
import { AuthenticationService, ErrorService, WorkflowService } from './_services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent extends SubscriptionManager implements OnDestroy, OnInit {
  bodyClass: string;
  showWrapper = false;
  cancellationRequest?: CancellationRequest;
  public loggedIn = false;

  constructor(
    private readonly workflows: WorkflowService,
    private readonly authentication: AuthenticationService,
    private readonly errors: ErrorService,
    private readonly router: Router
  ) {
    super();
  }

  /** ngOnDestroy
  /* call cleanup
  */
  public ngOnDestroy(): void {
    this.cleanup();
  }

  /** ngOnInit
  /* init for this component
  /* watch router events
  /* check if user is logged in
  /* add a body class
  /* and margins
  */
  public ngOnInit(): void {
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

    this.subs.push(
      this.workflows.promptCancelWorkflow.subscribe((cancellationRequest: CancellationRequest) => {
        this.cancellationRequest = cancellationRequest;
        if (cancellationRequest.workflowExecutionId) {
          this.showWrapper = true;
        }
      })
    );
  }

  /** closePrompt
  /*  as the name suggests, this one closes the prompt or modal window
  */
  closePrompt(): void {
    this.showWrapper = false;
  }

  /** cancelWorkflow
  /*  cancels the workflow using the currentWorkflow id
  */
  cancelWorkflow(): void {
    this.subs.push(
      this.workflows.cancelThisWorkflow(this.cancellationRequest!.workflowExecutionId).subscribe(
        () => {
          this.closePrompt();
        },
        (err: HttpErrorResponse) => {
          this.errors.handleError(err);
        }
      )
    );
  }
}
