/** Component to display currently running executions
 */
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { calcProgress, copyExecutionAndTaskId } from '../../_helpers';
import {
  getCurrentPlugin,
  PluginExecution,
  PluginExecutionOverview,
  PluginType,
  WorkflowExecution
} from '../../_models';
import { WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';

@Component({
  selector: 'app-ongoingexecutions',
  templateUrl: './ongoingexecutions.component.html',
  styleUrls: ['./ongoingexecutions.component.scss']
})
export class OngoingexecutionsComponent implements OnInit {
  constructor(
    private readonly workflows: WorkflowService,
    private readonly translate: TranslateService
  ) {}

  @Input() showPluginLog: PluginExecution;
  @Input() runningExecutions: WorkflowExecution[];
  @Input() selectedExecutionDsId: string;
  @Output() setShowPluginLog = new EventEmitter<PluginExecution | undefined>();

  cancelling: string;
  contentCopied = false;

  /** ngOnInit
  /* pre-translate the cancelling message
  */
  ngOnInit(): void {
    this.cancelling = this.translate.instant('cancelling');
  }

  /** getPluginStatusClass
  /* convert the pluginStatus to a css class string
  */
  getPluginStatusClass(plugin: PluginExecutionOverview): string {
    return `status-${plugin.pluginStatus.toString().toLowerCase()}`;
  }

  /** canCancelWorkflow
  /*  calculate if the workflow can be cancelled
  /*  @param {WorkflowExecution} ongoing - the execution
  */
  canCancelWorkflow(ongoing: WorkflowExecution): boolean {
    return (
      [`${PluginType.PUBLISH}`, `${PluginType.DEPUBLISH}`].indexOf(
        ongoing.currentPlugin!.pluginType
      ) == -1 && !ongoing.cancelling
    );
  }

  /** cancelWorkflow
  /* cancel the workflow for the id, dataset id and dataset name sepcified
  */
  cancelWorkflow(id: string, datasetId: string, datasetName: string): void {
    if (!id) {
      return;
    }
    this.workflows.promptCancelThisWorkflow(id, datasetId, datasetName);
  }

  /** showLog
  /* emit the showPluginLog event for the specified workflow
  */
  showLog(workflow: WorkflowExecution): void {
    this.setShowPluginLog.emit(getCurrentPlugin(workflow));
  }

  /** calcProgress
  /* invoke the progress-calculation utility
  */
  calcProgress(ongoing: WorkflowExecution): number {
    return calcProgress(ongoing);
  }

  /** copyInformation
  /* copy the execution information to the clipboard
  */
  copyInformation(type: string, id1: string, id2: string): void {
    copyExecutionAndTaskId(type, id1, id2);
    this.contentCopied = true;
  }

  /** byId
  /* return the item id
  */
  byId(_: number, item: WorkflowExecution): string {
    return item.id;
  }
}
