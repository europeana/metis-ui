import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WorkflowService, AuthenticationService, DatasetsService, ErrorService, TranslateService } from './_services';
import { StringifyHttpError } from './_helpers';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  providers: [AuthenticationService, DatasetsService],
  selector: 'app-root',
  templateUrl: './app.component.html'
})

export class AppComponent implements OnInit {

  title = 'Metis-UI';
  isLessMargin = false;
  bodyClass: string;
  showWrapper = false;
  currentWorkflowId?: string;
  public loggedIn = false;

  constructor(
    public workflows: WorkflowService,
    private authentication: AuthenticationService,
    private errors: ErrorService,
    public router: Router,
    private translate: TranslateService) {
  }

  /** ngOnInit
  /* init for this component
  /* watch router events
  /* check if user is logged in
  /* add a body class
  /* and margins
  */
  public ngOnInit(): void {

    this.router.events.subscribe((event: any) => {
      if (!event.url) { return; }
      if (this.router.isActive(event.url, false)) {
        this.loggedIn = this.authentication.validatedUser( );

        this.bodyClass = event.url.split('/')[1];
        if (event.url === '/') { this.bodyClass = 'home'; }

        this.isLessMargin = event.url.includes('home') || event.url === '/' || event.url.includes('dashboard');
      }
    });

    this.workflows.promptCancelWorkflow.subscribe((workflow: string) => {
      if (workflow) {
        this.currentWorkflowId = workflow;
        this.showWrapper = true;
      }
    });

    if (typeof this.translate.use === 'function') {
      this.translate.use('en');
    }
  }

  /** closePrompt
  /*  as the name suggests, this one closes the prompt or modal window
  */
  closePrompt (): void {
    this.showWrapper = false;
  }

  /** cancelWorkflow
  /*  cancels the workflow using the currentWorkflow id
  */
  cancelWorkflow (): void {
    this.workflows.cancelThisWorkflow(this.currentWorkflowId!).subscribe(result => {
      this.closePrompt();
      this.workflows.setWorkflowCancelled();
    }, (err: HttpErrorResponse) => {
      this.errors.handleError(err);
    });
  }
}
