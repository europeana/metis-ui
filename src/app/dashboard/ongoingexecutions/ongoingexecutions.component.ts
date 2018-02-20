import { Component, Input } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { StringifyHttpError } from '../../_helpers';
import { Observable } from 'rxjs/Rx';

import { WorkflowService, ErrorService } from '../../_services';

@Component({
  selector: 'app-ongoingexecutions',
  templateUrl: './ongoingexecutions.component.html',
  styleUrls: ['./ongoingexecutions.component.scss']
})
export class OngoingexecutionsComponent {

  constructor(private workflows: WorkflowService, 
    private errors: ErrorService) { }

  ongoingFirst;
  ongoing;
  errorMessage;
  subscription;
  intervalTimer = 2000;
  currentPlugin: number = 0;

  ngOnInit() {
    this.startPolling();
  }

  startPolling() {
    if (this.subscription) { this.subscription.unsubscribe(); }
    let timer = Observable.timer(0, this.intervalTimer);
    this.subscription = timer.subscribe(t => {
      this.getOngoing();
    });
  }

  getOngoing() {
    this.workflows.getOngoingExecutionsPerOrganisation().subscribe(executions => {
      if (executions.length === 0) { this.subscription.unsubscribe(); }
      this.ongoingFirst = executions.slice(0, 1)[0];
      this.ongoing = executions.slice(1);
    });
  }

  cancelWorkflow(id, e) {
    if (!id) { return false; }
    this.getOngoing();
    this.workflows.cancelThisWorkflow(id).subscribe(result => {
    },(err: HttpErrorResponse) => {
      let error = this.errors.handleError(err);   
      this.errorMessage = `${StringifyHttpError(error)}`;
    });
  }

}
