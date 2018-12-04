import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { TranslateService, WorkflowService } from '../../_services';
import { copyExecutionAndTaskId } from '../../_helpers';
import { PluginExecution, PluginStatus, WorkflowExecution } from '../../_models/workflow-execution';
import {Report, ReportRequest} from '../../_models/report';

@Component({
  selector: 'app-lastexecution',
  templateUrl: './lastexecution.component.html',
  styleUrls: ['./lastexecution.component.scss']
})
export class LastExecutionComponent implements OnInit {

  constructor(public workflows: WorkflowService,
    private translate: TranslateService) { }

  @Input() datasetId: string;

  @Output() setReportRequest = new EventEmitter<ReportRequest | undefined>();

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

  openReport (taskId: string, topology: string): void {
    this.setReportRequest.emit({ taskId, topology });
  }

  // after double clicking, copy the execution and task id to the clipboard
  copyInformation (type: string, id1: string, id2: string): void {
    copyExecutionAndTaskId(type, id1, id2);
  }
}
