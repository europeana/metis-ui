import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Event, Router, RouterEvent } from '@angular/router';

import { environment } from '../environments/environment';

import { CancellationRequest } from './_models';
import { AuthenticationService, ErrorService, WorkflowService } from './_services';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  bodyClass: string;
  showWrapper = false;
  cancellationRequest?: CancellationRequest;
  public loggedIn = false;

  constructor(
    private workflows: WorkflowService,
    private authentication: AuthenticationService,
    private errors: ErrorService,
    private router: Router
  ) {}

  /** ngOnInit
  /* init for this component
  /* watch router events
  /* check if user is logged in
  /* add a body class
  /* and margins
  */
  public ngOnInit(): void {
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
    });

    this.workflows.promptCancelWorkflow.subscribe((cancellationRequest: CancellationRequest) => {
      this.cancellationRequest = cancellationRequest;
      if (cancellationRequest.workflowExecutionId) {
        this.showWrapper = true;
      }
    });
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
    this.workflows.cancelThisWorkflow(this.cancellationRequest!.workflowExecutionId).subscribe(
      () => {
        this.closePrompt();
      },
      (err: HttpErrorResponse) => {
        this.errors.handleError(err);
      }
    );
  }
}
