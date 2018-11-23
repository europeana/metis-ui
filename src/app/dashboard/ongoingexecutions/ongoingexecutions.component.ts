import { Component, Input, Output, EventEmitter } from '@angular/core';

import { copyExecutionAndTaskId } from '../../_helpers';

import { WorkflowService, TranslateService } from '../../_services';
import { LogStatus } from '../../_models/log-status';
import { WorkflowExecution } from '../../_models/workflow-execution';

@Component({
  selector: 'app-ongoingexecutions',
  templateUrl: './ongoingexecutions.component.html',
  styleUrls: ['./ongoingexecutions.component.scss']
})
export class OngoingexecutionsComponent {

  constructor(private workflows: WorkflowService,
    private translate: TranslateService) { }

  @Output() notifyShowLogStatus: EventEmitter<LogStatus> = new EventEmitter<LogStatus>();
  @Input('isShowingLog') isShowingLog: LogStatus;
  @Input() runningExecutions: WorkflowExecution[];

  ongoingExecutions: WorkflowExecution[];
  ongoingExecutionsTotal: number;
  errorMessage: string;
  cancelling: string;
  viewMore = false;
  logIsOpen?: string;
  contentCopied = false;

  /** ngOnInit
  /* init of this component:
  /* start polling/checking for updates
  /* set translation languages
  /* translate some values to use in this component
  */
  ngOnInit(): void {
    this.workflows.updateLog.subscribe(
      (log: LogStatus) => {
        if (this.isShowingLog) {
          this.showLog(log['externalTaskId'], log['topology'], log['plugin'], this.logIsOpen, log['processed'], log['status']);
        } else {
          this.logIsOpen = undefined;
        }
    });

    this.translate.use('en');
    this.cancelling = this.translate.instant('cancelling');
  }

  /** cancelWorkflow
  /*  start cancellation of the dataset with id
  /* @param {number} id - id of the dataset to cancel
  */
  cancelWorkflow(id: string): void {
    if (!id) { return; }
    this.workflows.promptCancelThisWorkflow(id);
  }

  /** showLog
  /*  show the log for the current/last execution
  /* @param {number} externalTaskId - id of the external task that belongs to topology/plugin
  /* @param {string} topology - name of the topology
  */
  showLog(externalTaskId: string | undefined, topology: string, plugin: string, datasetId?: string, processed?: number, status?: string): void {
    const message = {'externalTaskId' : externalTaskId, 'topology' : topology, 'plugin': plugin, 'processed': processed, 'status': status};
    this.logIsOpen = datasetId;
    this.notifyShowLogStatus.emit(message);
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
  copyInformation (type: string, id1: string, id2: string): void {
    copyExecutionAndTaskId(type, id1, id2);
    this.contentCopied = true;
  }

}
