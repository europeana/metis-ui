import { Component, Input, OnInit } from '@angular/core';

import { calcProgress, copyExecutionAndTaskId, statusClassFromPlugin } from '../../../_helpers';
import { isPluginCompleted, PluginExecution, WorkflowExecution } from '../../../_models';
import { WorkflowService } from '../../../_services';
import { TranslateService } from '../../../_translate';

@Component({
  selector: '[app-executiontable]',
  templateUrl: './executiontable.component.html',
  styleUrls: ['./executiontable.component.scss'],
})
export class ExecutiontableComponent implements OnInit {
  @Input() execution: WorkflowExecution;
  @Input() plugin: PluginExecution;

  contentCopied = false;
  msgCancelling: string;

  constructor(private workflows: WorkflowService, private translate: TranslateService) {}

  ngOnInit(): void {
    this.msgCancelling = this.translate.instant('cancelling');
  }

  cancelWorkflow(id: string, datasetId: string, datasetName: string): void {
    if (!id) {
      return;
    }
    this.workflows.promptCancelThisWorkflow(id, datasetId, datasetName);
  }

  calcProgress(ongoing: WorkflowExecution): number {
    return calcProgress(ongoing);
  }

  copyInformation(type: string, id1: string, id2: string): void {
    copyExecutionAndTaskId(type, id1, id2);
    this.contentCopied = true;
  }

  getPluginStatusClass(plugin: PluginExecution): string {
    return statusClassFromPlugin(plugin, this.plugin);
  }

  isCompleted(): boolean {
    return isPluginCompleted(this.plugin);
  }
}
