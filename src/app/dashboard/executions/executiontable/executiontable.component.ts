import { Component, OnInit, Input } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { WorkflowService, TranslateService, ErrorService } from '../../../_services';

import { StringifyHttpError, copyExecutionAndTaskId } from '../../../_helpers';
import { WorkflowExecution, PluginExecution } from '../../../_models/workflow-execution';

@Component({
  selector: '[app-executiontable]',
  templateUrl: './executiontable.component.html',
  styleUrls: ['./executiontable.component.scss']
})
export class ExecutiontableComponent implements OnInit {

  @Input() execution: WorkflowExecution;
  @Input() plugin: PluginExecution;

  contentCopied = false;
  msgCancelling: string;
  errorMessage: string;
  successMessage: string;

  constructor(private workflows: WorkflowService,
    private errors: ErrorService,
    private translate: TranslateService) { }

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
    if (!id) { return; }
    this.workflows.promptCancelThisWorkflow(id);
  }

  /*** copyInformation
  /* after double clicking, copy the execution and task id to the clipboard
  /* @param {string} type - execution or plugin
  /* @param {string} id1 - an id, depending on type
  /* @param {string} id2 - an id, depending on type
  */
  copyInformation (type: string, id1: string, id2: string): void {
    copyExecutionAndTaskId(type, id1, id2);
    this.contentCopied = true;
  }
}
