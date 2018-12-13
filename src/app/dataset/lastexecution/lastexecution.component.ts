import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { copyExecutionAndTaskId } from '../../_helpers';
import {
  PluginExecution,
  PluginStatus,
  Report,
  ReportRequest,
  WorkflowExecution,
  WorkflowStatus,
} from '../../_models';
import { WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';

@Component({
  selector: 'app-lastexecution',
  templateUrl: './lastexecution.component.html',
  styleUrls: ['./lastexecution.component.scss'],
})
export class LastExecutionComponent implements OnInit {
  constructor(private workflows: WorkflowService, private translate: TranslateService) {}

  @Input() datasetId: string;

  @Output() setReportRequest = new EventEmitter<ReportRequest | undefined>();

  report?: Report;
  pluginExecutions: PluginExecution[] = [];
  currentPlugin?: PluginExecution;

  @Input()
  set lastExecutionData(value: WorkflowExecution | undefined) {
    if (value) {
      this.workflows.getReportsForExecution(value);

      const { workflowStatus } = value;
      if (
        workflowStatus === WorkflowStatus.FINISHED ||
        workflowStatus === WorkflowStatus.FAILED ||
        workflowStatus === WorkflowStatus.CANCELLED
      ) {
        this.currentPlugin = undefined;
      } else {
        this.currentPlugin = value.metisPlugins[this.workflows.getCurrentPlugin(value)];
      }

      this.pluginExecutions = value.metisPlugins.slice();
      this.pluginExecutions.reverse();
    }
  }

  ngOnInit(): void {
    this.translate.use('en');
  }

  //  scroll to specific point in page after click
  scroll(el: Element): void {
    el.scrollIntoView({ behavior: 'smooth' });
  }

  openReport(taskId: string, topology: string): void {
    this.setReportRequest.emit({ taskId, topology });
  }

  // after double clicking, copy the execution and task id to the clipboard
  copyInformation(type: string, id1: string, id2: string): void {
    copyExecutionAndTaskId(type, id1, id2);
  }

  getPluginStatusClass(plugin: PluginExecution): string {
    const { executionProgress, pluginStatus } = plugin;
    if (
      executionProgress.errors > 0 &&
      (pluginStatus === PluginStatus.FINISHED || pluginStatus === PluginStatus.CANCELLED)
    ) {
      return 'status-warning';
    } else if (plugin !== this.currentPlugin && pluginStatus === PluginStatus.INQUEUE) {
      return 'status-scheduled';
    } else {
      return `status-${pluginStatus.toString().toLowerCase()}`;
    }
  }
}
