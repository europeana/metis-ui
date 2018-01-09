import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

import {Observable} from 'rxjs/Rx';

import { DatasetsService } from '../../_services';

@Component({
  selector: 'app-actionbar',
  templateUrl: './actionbar.component.html',
  styleUrls: ['./actionbar.component.scss']
})

export class ActionbarComponent {

  constructor(private route: ActivatedRoute, 
      private DatasetsService: DatasetsService, 
      private http: HttpClient) { }

  @Input('isShowingLog') isShowingLog: boolean;
  @Input('datasetData') datasetData;
  workflowPercentage = 0;
  subscription;
  intervalTimer = 500;
  now;
  totalInDataset: Number = 10000;
  totalProcessed: Number = 0;
  currentStatus: string;

  @Output() notifyShowLogStatus: EventEmitter<boolean> = new EventEmitter<boolean>();

  ngOnInit() {

    this.now = Date.now();
    this.currentStatus = 'Now running';

    let timer = Observable.timer(0, this.intervalTimer);
    this.subscription = timer.subscribe(t => {
        this.pollingWorkflow(t);
    });
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

}
