import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';

import { WorkflowExecutionSummary } from '../../_models';
import { ErrorService, WorkflowService } from '../../_services';
import { GridrowComponent } from './gridrow';

@Component({
  selector: 'app-executionsgrid',
  templateUrl: './executionsgrid.component.html',
  styleUrls: ['./executionsgrid.component.scss'],
})

export class ExecutionsgridComponent implements OnInit {

  executionSummary: WorkflowExecutionSummary[];
  isLoading = true;
  filled = true;

  @ViewChildren(GridrowComponent) rows: QueryList<GridrowComponent>;

  constructor(private workflows: WorkflowService, private errors: ErrorService) {}

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

  toggleFilled(): void {
    this.filled = !this.filled;
  }

  //closeAllExpanded
  closeExpanded(): void{
    this.rows.forEach((r) => {
      r.expanded = false;
    });
  }
}
