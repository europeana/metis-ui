import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { calcProgress, copyExecutionAndTaskId } from '../../_helpers';
import { getCurrentPlugin, PluginExecution, WorkflowExecution } from '../../_models';
import { WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';

@Component({
  selector: 'app-ongoingexecutions',
  templateUrl: './ongoingexecutions.component.html',
  styleUrls: ['./ongoingexecutions.component.scss'],
})
export class OngoingexecutionsComponent implements OnInit {
  constructor(private workflows: WorkflowService, private translate: TranslateService) {}

  @Input() showPluginLog: PluginExecution;
  @Input() runningExecutions: WorkflowExecution[];
  @Output() setShowPluginLog = new EventEmitter<PluginExecution | undefined>();

  cancelling: string;
  contentCopied = false;

  ngOnInit(): void {
    this.cancelling = this.translate.instant('cancelling');
  }

  cancelWorkflow(id: string, datasetId: string, datasetName: string): void {
    if (!id) {
      return;
    }
    this.workflows.promptCancelThisWorkflow(id, datasetId, datasetName);
  }

  showLog(workflow: WorkflowExecution): void {
    this.setShowPluginLog.emit(getCurrentPlugin(workflow));
  }

  calcProgress(ongoing: WorkflowExecution): number {
    return calcProgress(ongoing);
  }

  copyInformation(type: string, id1: string, id2: string): void {
    copyExecutionAndTaskId(type, id1, id2);
    this.contentCopied = true;
  }

  byId(_: number, item: WorkflowExecution): string {
    return item.id;
  }
}
