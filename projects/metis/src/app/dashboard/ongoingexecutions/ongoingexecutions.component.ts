/** Component to display currently running executions
 */
import { NgClass } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { calcProgress, canCancelWorkflow, copyExecutionAndTaskId } from '../../_helpers';
import { PluginExecutionOverview, WorkflowExecution } from '../../_models';
import { WorkflowService } from '../../_services';
import { RenameWorkflowPipe, TranslatePipe, TranslateService } from '../../_translate';

@Component({
  selector: 'app-ongoingexecutions',
  templateUrl: './ongoingexecutions.component.html',
  styleUrls: ['./ongoingexecutions.component.scss'],
  imports: [NgClass, RouterLink, TranslatePipe, RenameWorkflowPipe]
})
export class OngoingExecutionsComponent implements OnInit {
  constructor(
    private readonly workflows: WorkflowService,
    private readonly translate: TranslateService
  ) {}

  @Input() runningExecutions: WorkflowExecution[];
  @Input() selectedExecutionDsId: string;

  canCancelWorkflow = canCancelWorkflow;
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

  /** cancelWorkflow
  /* cancel the workflow for the id, dataset id and dataset name sepcified
  */
  cancelWorkflow(id: string, datasetId: string, datasetName: string): void {
    if (!id) {
      return;
    }
    this.workflows.promptCancelThisWorkflow(id, datasetId, datasetName);
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
