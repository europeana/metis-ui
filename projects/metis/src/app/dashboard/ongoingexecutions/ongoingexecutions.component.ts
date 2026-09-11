/** Component to display currently running executions
 */
import { NgClass } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
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
export class OngoingExecutionsComponent {
  private readonly workflows = inject(WorkflowService);
  private readonly translate = inject(TranslateService);

  readonly runningExecutions = input<WorkflowExecution[]>([]);
  readonly selectedExecutionDsId = input<string | undefined>();

  readonly contentCopied = signal(false);
  readonly cancelling = computed(() => this.translate.instant('cancelling'));

  readonly canCancelWorkflow = canCancelWorkflow;

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
  copyInformation(type: string, id1?: string, id2?: string): void {
    copyExecutionAndTaskId(type, id1 ?? '', id2 ?? '');
    this.contentCopied.set(true);
  }
}
