/** Component to display workflow executions
 */
import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';

import { copyExecutionAndTaskId } from '../../_helpers';
import {
  PluginExecution,
  PluginStatus,
  PluginType,
  PreviewFilters,
  SimpleReportRequest,
  TopologyName
} from '../../_models';

@Component({
  selector: 'app-executions-grid-data',
  templateUrl: './executions-data-grid.component.html',
  styleUrls: ['./executions-data-grid.component.scss']
})
export class ExecutionsDataGridComponent {
  applyHighlight = false;
  _plugin: PluginExecution;
  @Input() applyStripe?: boolean;
  @Input() isIncremental?: boolean;
  @Input()
  set plugin(plugin: PluginExecution) {
    this._plugin = plugin;
    this.applyHighlight = plugin.pluginStatus === PluginStatus.RUNNING;
  }
  get plugin(): PluginExecution {
    return this._plugin;
  }

  @Input() workflowExecutionId?: string;
  @Output() openPreview: EventEmitter<PreviewFilters> = new EventEmitter();
  @Output() setReportMsg = new EventEmitter<SimpleReportRequest | undefined>();
  @ViewChild('gridDataTemplate', { static: true }) gridDataTemplate: TemplateRef<HTMLElement>;

  contentCopied = false;

  /** copyInformation
  /* copy current execution data to the clipboard
  /* @param { string } id - the id to copy
  /* @param { string } extId - the external id to copy
  */
  copyInformation(id: string, extId = ''): void {
    copyExecutionAndTaskId('plugin', extId, id);
    this.contentCopied = true;
  }

  /** pluginIsHarvest
  /* template utility for harvest plugin detection
  /* @param { PluginExecution } pluginExecution - the PluginExecution to evaluate
  /* @return boolean
  */
  pluginIsHarvest(pluginExecution: PluginExecution): boolean {
    return [PluginType.HTTP_HARVEST, PluginType.OAIPMH_HARVEST].includes(
      pluginExecution.pluginType
    );
  }

  /** goToPreview
  /* fire the preview event
  */
  goToPreview(executionId: string, pluginExecution: PluginExecution): void {
    const previewFilters: PreviewFilters = {
      baseFilter: {
        executionId: executionId,
        pluginType: pluginExecution.pluginType
      },
      baseStartedDate: pluginExecution.startedDate
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
