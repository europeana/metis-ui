import { Component, Input, OnInit } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { ErrorService, TranslateService, WorkflowService } from '../../_services';
import { copyExecutionAndTaskId, StringifyHttpError } from '../../_helpers';
import { PluginExecution, PluginStatus, WorkflowExecution } from '../../_models/workflow-execution';
import { Report } from '../../_models/report';

@Component({
  selector: 'app-lastexecution',
  templateUrl: './lastexecution.component.html',
  styleUrls: ['./lastexecution.component.scss']
})
export class LastExecutionComponent implements OnInit {

  constructor(public workflows: WorkflowService,
    private errors: ErrorService,
    private translate: TranslateService) { }

  @Input() datasetId: string;

  errorMessage?: string;
  report?: Report;
  completedPlugins: PluginExecution[] = [];

  @Input()
  set lastExecutionData(value: WorkflowExecution | undefined) {
    if (value) {
      this.workflows.getReportsForExecution(value);

      this.completedPlugins = value.metisPlugins.filter(({ pluginStatus }) =>
        pluginStatus === PluginStatus.FINISHED || pluginStatus === PluginStatus.FAILED || pluginStatus === PluginStatus.CANCELLED
      );
      this.completedPlugins.reverse();
    }
  }

  ngOnInit(): void {
    this.translate.use('en');
  }

  //  scroll to specific point in page after click
  scroll(el: Element): void {
    el.scrollIntoView({ behavior: 'smooth' });
  }

  //  click on link to open report, if available
  openReport (taskid: string, topology: string): void {
    this.workflows.getReport(taskid, topology).subscribe(result => {
      this.report = result;
    }, (err: HttpErrorResponse) => {
      const error = this.errors.handleError(err);
      this.errorMessage = `${StringifyHttpError(error)}`;
    });
  }

  closeReport(): void {
    this.report = undefined;
  }

  // after double clicking, copy the execution and task id to the clipboard
  copyInformation (type: string, id1: string, id2: string): void {
    copyExecutionAndTaskId(type, id1, id2);
  }
}
