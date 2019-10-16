import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';

import { copyExecutionAndTaskId } from '../../_helpers';
import {
  PluginExecution,
  PreviewFilters,
  SimpleReportRequest,
  TopologyName,
  WorkflowExecution,
  WorkflowOrPluginExecution
} from '../../_models';

@Component({
  selector: 'app-executions-grid-data',
  templateUrl: './executions-data-grid.component.html',
  styleUrls: ['./executions-data-grid.component.scss']
})
export class ExecutionsDataGridComponent {
  @Input() hasMore?: boolean;

  @Input() plugin: PluginExecution;
  @Input() wpe?: WorkflowOrPluginExecution;
  @Output() openPreview: EventEmitter<PreviewFilters> = new EventEmitter();
  @Output() setReportMsg = new EventEmitter<SimpleReportRequest | undefined>();
  @ViewChild('gridDataTemplate') gridDataTemplate: TemplateRef<HTMLElement>;

  contentCopied = false;

  constructor() {}

  copyInformation(type: string, id: string, extId: string = ''): void {
    copyExecutionAndTaskId(type, extId, id);
    this.contentCopied = true;
  }

  hasPreview(plugin: PluginExecution): boolean {
    return (
      plugin.executionProgress !== undefined &&
      plugin.executionProgress.processedRecords > plugin.executionProgress.errors
    );
  }

  goToPreview(execution: WorkflowExecution, pluginExecution: PluginExecution): void {
    const previewFilters: PreviewFilters = {
      executionId: execution.id,
      pluginType: pluginExecution.pluginType,
      startedDate: execution.startedDate
    };
    this.openPreview.emit(previewFilters);
  }

  openFailReport(topology?: TopologyName, taskId?: string, errorMsg?: string): void {
    this.setReportMsg.emit({ topology, taskId, message: errorMsg });
  }
}
