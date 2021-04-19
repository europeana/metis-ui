/** Component to display workflow executions
 */
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
  @ViewChild('gridDataTemplate', { static: true }) gridDataTemplate: TemplateRef<HTMLElement>;

  contentCopied = false;

  /** copyInformation
  /* copy current execution data to the clipboard
  */
  copyInformation(type: string, id: string, extId = ''): void {
    copyExecutionAndTaskId(type, extId, id);
    this.contentCopied = true;
  }

  /** goToPreview
  /* fire the preview event
  */
  goToPreview(execution: WorkflowExecution, pluginExecution: PluginExecution): void {
    const previewFilters: PreviewFilters = {
      baseFilter: {
        executionId: execution.id,
        pluginType: pluginExecution.pluginType
      },
      baseStartedDate: execution.startedDate
    };
    this.openPreview.emit(previewFilters);
  }

  /** openFailReport
  /* open the fail report
  */
  openFailReport(topology?: TopologyName, taskId?: string, errorMsg?: string): void {
    this.setReportMsg.emit({ topology, taskId, message: errorMsg });
  }
}
