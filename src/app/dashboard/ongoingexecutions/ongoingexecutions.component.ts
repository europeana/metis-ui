import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

import { copyExecutionAndTaskId } from '../../_helpers';
import { WorkflowService, TranslateService } from '../../_services';
import { PluginExecution, WorkflowExecution } from '../../_models/workflow-execution';

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

  errorMessage: string;
  cancelling: string;
  viewMore = false;
  contentCopied = false;

  ngOnInit(): void {
    this.translate.use('en');
    this.cancelling = this.translate.instant('cancelling');
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

  /** showLog
  /*  show the log for the current/last execution
  /* @param {number} externalTaskId - id of the external task that belongs to topology/plugin
  /* @param {string} topology - name of the topology
  */
  showLog(workflow: WorkflowExecution): void {
    const plugin = workflow.metisPlugins[this.workflows.getCurrentPlugin(workflow)];
    this.setShowPluginLog.emit(plugin);
  }

  /** viewAll
  /*  scrolls to top of all executions table/top of page
  */
  viewAll(): void {
    window.scrollTo(0, 0);
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
