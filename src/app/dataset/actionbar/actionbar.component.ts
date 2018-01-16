import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import {Observable} from 'rxjs/Rx';

import { WorkflowService, AuthenticationService } from '../../_services';

@Component({
  selector: 'app-actionbar',
  templateUrl: './actionbar.component.html',
  styleUrls: ['./actionbar.component.scss']
})

export class ActionbarComponent {

  constructor(private route: ActivatedRoute, 
      private workflows: WorkflowService,
      private http: HttpClient,
      private authentication: AuthenticationService,
      private router: Router) { }

  @Input('isShowingLog') isShowingLog: boolean;
  @Input('datasetData') datasetData;
  workflowPercentage = 0;
  subscription;
  intervalTimer = 500;
  now;
  totalInDataset: Number = 10000;
  totalProcessed: Number = 0;
  currentStatus: string;
  currentWorkflow;
  logMessages;

  @Output() notifyShowLogStatus: EventEmitter<boolean> = new EventEmitter<boolean>();

  ngOnInit() {

    this.now = Date.now();
    this.currentStatus = 'Now running';

    this.workflows.changeWorkflow.subscribe(
      workflow => {
        this.currentWorkflow = workflow;
        let timer = Observable.timer(0, this.intervalTimer);
        this.subscription = timer.subscribe(t => {
          this.pollingWorkflow(t);
        });
      }
    );

  }

  pollingWorkflow(t) {
     this.workflowPercentage = t * 10;
     this.totalProcessed = t * 1000;
     this.now = Date.now();
     if (this.workflowPercentage === 100) {
       this.currentStatus = 'Complete';
       this.subscription.unsubscribe();
     }
  };

  showLog() {
    this.notifyShowLogStatus.emit(true);
  }

   returnLog() {
      this.workflows.getLogs().subscribe(result => {
        this.logMessages = result;
      },(err: HttpErrorResponse) => {
        if (err.status === 401 || err.status === 406) {
          this.authentication.logout();
          this.router.navigate(['/login']);
        }
      });
    }

}
