import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { Event, Router, RouterEvent } from '@angular/router';

import { AuthenticationService, ErrorService, WorkflowService } from './_services';
import { TranslateService } from './_translate';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  title = 'Metis-UI';
  isLessMargin = false;
  bodyClass: string;
  showWrapper = false;
  currentWorkflowId?: string;
  public loggedIn = false;

  constructor(
    private workflows: WorkflowService,
    private authentication: AuthenticationService,
    private errors: ErrorService,
    private router: Router,
    private translate: TranslateService,
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

        this.isLessMargin = url.includes('home') || url === '/' || url.includes('dashboard');
      }
    });

    this.workflows.promptCancelWorkflow.subscribe((workflow: string) => {
      if (workflow) {
        this.currentWorkflowId = workflow;
        this.showWrapper = true;
      }
    });

    this.translate.use('en');
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
    this.workflows.cancelThisWorkflow(this.currentWorkflowId!).subscribe(
      () => {
        this.closePrompt();
      },
      (err: HttpErrorResponse) => {
        this.errors.handleError(err);
      },
    );
  }
}
