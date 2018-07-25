import { Component, OnInit, Input } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { WorkflowService, TranslateService, ErrorService } from '../../../_services';

import { StringifyHttpError, copyExecutionAndTaskId } from '../../../_helpers';

@Component({
  selector: '[app-executiontable]',
  templateUrl: './executiontable.component.html',
  styleUrls: ['./executiontable.component.scss']
})
export class ExecutiontableComponent implements OnInit {

	@Input() execution: any;
  @Input() plugin: any;

  contentCopied: boolean = false;
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
  ngOnInit() {
    if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
      this.msgCancelling = this.translate.instant('cancelling');
    } 
  }

  /** cancelWorkflow
  /*  start cancellation of the dataset with id
  /* @param {number} id - id of the dataset to cancel
  */
  cancelWorkflow(id) {
    if (!id) { return false; }
    this.workflows.cancelThisWorkflow(id).subscribe(result => {
      this.successMessage = this.msgCancelling + ': ' + id;
    },(err: HttpErrorResponse) => {
      const error = this.errors.handleError(err);   
      this.errorMessage = `${StringifyHttpError(error)}`;
    });
  }

  /*** copyInformation
  /* after double clicking, copy the execution and task id to the clipboard
  /* @param {string} type - execution or plugin
  /* @param {string} id1 - an id, depending on type
  /* @param {string} id2 - an id, depending on type
  */
  copyInformation (type, id1, id2) {
    copyExecutionAndTaskId(type, id1, id2);
    this.contentCopied = true;
  }  

}
