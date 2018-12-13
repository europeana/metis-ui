import { Component, Input, OnInit } from '@angular/core';

import { copyExecutionAndTaskId } from '../../../_helpers';
import { PluginExecution, WorkflowExecution } from '../../../_models';
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

  cancelWorkflow(id: string): void {
    if (!id) {
      return;
    }
    this.workflows.promptCancelThisWorkflow(id);
  }

  copyInformation(type: string, id1: string, id2: string): void {
    copyExecutionAndTaskId(type, id1, id2);
    this.contentCopied = true;
  }
}
