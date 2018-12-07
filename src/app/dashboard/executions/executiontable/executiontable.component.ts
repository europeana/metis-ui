import { Component, Input, OnInit } from '@angular/core';

import { copyExecutionAndTaskId } from '../../../_helpers';
import { PluginExecution, WorkflowExecution } from '../../../_models/workflow-execution';
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

  /** ngOnInit
  /* init this component:
  /* set translation language,
  */
  ngOnInit(): void {
    this.translate.use('en');
    this.msgCancelling = this.translate.instant('cancelling');
  }

  /** cancelWorkflow
  /*  start cancellation of the dataset with id
  /* @param {number} id - id of the dataset to cancel
  */
  cancelWorkflow(id: string): void {
    if (!id) {
      return;
    }
    this.workflows.promptCancelThisWorkflow(id);
  }

  /*** copyInformation
  /* after double clicking, copy the execution and task id to the clipboard
  /* @param {string} type - execution or plugin
  /* @param {string} id1 - an id, depending on type
  /* @param {string} id2 - an id, depending on type
  */
  copyInformation(type: string, id1: string, id2: string): void {
    copyExecutionAndTaskId(type, id1, id2);
    this.contentCopied = true;
  }
}
