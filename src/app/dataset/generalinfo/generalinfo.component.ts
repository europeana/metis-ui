import { Component, OnInit, Input } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DatasetsService, TranslateService, WorkflowService, ErrorService } from '../../_services';

import { Observable, timer as observableTimer } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-generalinfo',
  templateUrl: './generalinfo.component.html'
})

export class GeneralinfoComponent implements OnInit {

  constructor(private datasets: DatasetsService,
    private workflows: WorkflowService,
  	private translate: TranslateService,
    private errors: ErrorService) { }

  @Input() datasetData: any;
  harvestPublicationData: any;
  subscription;
  intervalTimer = environment.intervalStatusLong;

  /** ngOnInit
  /* init for this specific component
  /* and set translation languages
  /* if dataset, try to retrieve information about harvest and publication
  */
  ngOnInit() {
    if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
    }

    this.workflows.changeWorkflow.subscribe(
      workflow => {
         this.getDatasetInformation();
      }
    );

    if (this.subscription) { this.subscription.unsubscribe(); }
    let timer = observableTimer(0, this.intervalTimer);
    this.subscription = timer.subscribe(t => {
      this.getDatasetInformation();
    });

  }

  getDatasetInformation () {
    if (this.datasetData) {
      this.workflows.getPublishedHarvestedData(this.datasetData.datasetId).subscribe(result => {
        this.harvestPublicationData = result;
      }, (err: HttpErrorResponse) => {
        this.errors.handleError(err);   
      });
    }
  }

}
