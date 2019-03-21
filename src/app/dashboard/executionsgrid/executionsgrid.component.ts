import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';

import { WorkflowExecutionSummary } from '../../_models';
import { ErrorService, WorkflowService } from '../../_services';

@Component({
  selector: 'app-executionsgrid',
  templateUrl: './executionsgrid.component.html',
  styleUrls: ['./executionsgrid.component.scss'],
})
export class ExecutionsgridComponent implements OnInit {
  executionSummary: WorkflowExecutionSummary[];
  constructor(private workflows: WorkflowService, private errors: ErrorService) {}
  isLoading = true;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.workflows.getWorkflowExecutionSummary().subscribe(
      (result) => {
        this.executionSummary = result;
        this.isLoading = false;
      },
      (err: HttpErrorResponse) => {
        this.isLoading = false;
        this.errors.handleError(err);
      },
    );
  }
}
