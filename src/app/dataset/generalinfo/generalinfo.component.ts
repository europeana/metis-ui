import { Component, OnInit, Input } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DatasetsService, TranslateService, WorkflowService, ErrorService, AuthenticationService } from '../../_services';
import { Observable, timer as observableTimer } from 'rxjs';
import { environment } from '../../../environments/environment';
import { apiSettings } from '../../../environments/apisettings';

@Component({
  selector: 'app-generalinfo',
  templateUrl: './generalinfo.component.html'
})

export class GeneralinfoComponent implements OnInit {

  constructor(private datasets: DatasetsService,
    private workflows: WorkflowService,
  	private translate: TranslateService,
    private authentication: AuthenticationService,
    private errors: ErrorService) { }

  @Input() datasetData: any;
  harvestPublicationData: any;
  subscription;
  intervalTimer = environment.intervalStatusLong;
  viewPreview;
  viewCollections;
  buttonClassPreview = 'btn-disabled';
  buttonClassCollections = 'btn-disabled';

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

    if (this.subscription || !this.authentication.validatedUser()) { this.subscription.unsubscribe(); }
    let timer = observableTimer(0, this.intervalTimer);
    this.subscription = timer.subscribe(t => {
      this.getDatasetInformation();
    });
  }

  getDatasetInformation () {
    if (!this.authentication.validatedUser()) { return false; }
    if (this.datasetData) {

      if (!this.viewPreview) {
        this.viewPreview = apiSettings.viewPreview + this.escapeURL(this.datasetData.datasetId + '_') + '*';
        this.viewCollections = apiSettings.viewCollections + this.escapeURL(this.datasetData.datasetId + '_') + '*';  
      }

      this.workflows.getPublishedHarvestedData(this.datasetData.datasetId).subscribe(result => {
        this.harvestPublicationData = result;
        this.buttonClassPreview = this.harvestPublicationData.lastPreviewRecordsReadyForViewing ? '' : 'btn-disabled';
        this.buttonClassCollections = this.harvestPublicationData.lastPublishedRecordsReadyForViewing ? '' : 'btn-disabled';             
      }, (err: HttpErrorResponse) => {
        if (this.subscription) { this.subscription.unsubscribe(); }
        this.errors.handleError(err);   
      });
    }
  }

  escapeURL(url) {
    let pattern = /([\!\*\+\-\=\<\>\&\|\(\)\[\]\{\}\^\~\?\:\\/"])/g;
    return encodeURIComponent(url.replace(pattern, '\\$1'));
  }
}
