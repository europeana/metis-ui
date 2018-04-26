import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs/Rx';

import { WorkflowService} from '../../_services';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-generalactionbar',
  templateUrl: './generalactionbar.component.html',
  styleUrls: ['./generalactionbar.component.scss']
})
export class GeneralactionbarComponent implements OnInit {

  constructor(private workflows: WorkflowService) { }

  @Input('datasetData') datasetData;
  activeSet: string;
  addWorkflow: boolean = false;
  workflowInfoAvailable: boolean = false;
  firstRun: boolean = true;
  currentWorkflowStatus: string;
  currentPlugin: number;
  totalPlugins: number;
  pluginPercentage: number;
  subscription;
  intervalTimer: number = environment.intervalStatus;

  /** ngOnInit
  /*  init for this component
  /* set active dataset
  /* poll to check the status of this dataset + workflow history
  */
  ngOnInit() {    
    if (!this.datasetData) { return false }
    this.activeSet = this.datasetData.datasetId;
    this.checkStatus();

    if (!this.workflows.changeWorkflow) { return false; }
    this.workflows.changeWorkflow.subscribe(workflow => {
      console.log('changeWorkflow');
      this.checkStatus();
    });

  }

  /** checkStatus
  /*  check status of current dataset: is there already workflow info
  /* is there already an execution (running or not)
  */
  checkStatus() {
    if (this.subscription) { this.subscription.unsubscribe(); }
    let timer = Observable.timer(0, this.intervalTimer);
    this.subscription = timer.subscribe(t => {
      this.returnWorkflowInfo();
    });
  }

  /** returnWorkflowInfo
  /*  check if workflow info is already available
  */
  returnWorkflowInfo () {
    if (!this.datasetData) { return false }
    this.workflows.getWorkflowForDataset(this.datasetData.datasetId).subscribe(workflowinfo => {
      if (workflowinfo) {
        console.log('returnWorkflowInfo', workflowinfo);
        this.workflowInfoAvailable = true;
        this.returnLastExecution();
      } else {
        this.addWorkflow = true;
      }
    });
  }

  /** returnLastExecution
  /*  get the last action for this dataset and display its status in the progress/actionbar
  */
  returnLastExecution () {
    if (!this.datasetData) { return false }
    this.workflows.getLastExecution(this.datasetData.datasetId).subscribe(workflow => {
      console.log('returnLastExecution', workflow);
      if (workflow) {
        this.firstRun = false;
        this.currentWorkflowStatus = workflow['workflowStatus'];
        this.currentPlugin = this.workflows.getCurrentPlugin(workflow);
        this.totalPlugins = workflow.metisPlugins.length;
        this.pluginPercentage = (this.currentPlugin / this.totalPlugins) * 100;
      } else {
        this.firstRun = true;
      }
    });
  }

  /** selectWorkflow
  /*  select the workflow, so it would be triggered
  */
  selectWorkflow() {
    console.log('selectWorkflow');
    this.workflows.selectWorkflow();
    if (this.subscription) { this.subscription.unsubscribe(); }
    this.checkStatus();
  }

}
