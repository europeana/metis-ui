import { Component, OnInit, Input } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { DatasetsService, TranslateService, WorkflowService, ErrorService, AuthenticationService } from '../../_services';
import { Subscription, timer as observableTimer } from 'rxjs';
import { environment } from '../../../environments/environment';
import { apiSettings } from '../../../environments/apisettings';
import { Workflow } from '../../_models/workflow';

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
  subscription: Subscription;
  intervalTimer = environment.intervalStatusLong;
  viewPreview: string;
  viewCollections: string;
  buttonClassPreview = 'btn-disabled';
  buttonClassCollections = 'btn-disabled';

  /** ngOnInit
  /* init for this specific component
  /* and set translation languages
  /* if dataset, try to retrieve information about harvest and publication
  */
  ngOnInit(): void {
    if (typeof this.translate.use === 'function') {
      this.translate.use('en');
    }

    this.workflows.changeWorkflow.subscribe(
      () => {
        this.getDatasetInformation();
      }
    );

    if (this.subscription || !this.authentication.validatedUser()) { this.subscription.unsubscribe(); }
    const timer = observableTimer(0, this.intervalTimer);
    this.subscription = timer.subscribe(t => {
      this.getDatasetInformation();
    });
  }

  /** ngOnDestroy
  /* cancel subscriptions to check for current available dataset information
  */
  ngOnDestroy(): void {
    if (this.subscription) { this.subscription.unsubscribe(); }
  }

  /** getDatasetInformation
  /* get information about dataset
  /* including links to preview and collections
  */
  getDatasetInformation (): void {
    if (!this.authentication.validatedUser()) { return; }
    if (this.datasetData) {

      if (!this.viewPreview) {
        this.viewPreview = apiSettings.viewPreview + encodeURIComponent(this.escapeSolr(this.datasetData.datasetId + '_') + '*');
        this.viewCollections = apiSettings.viewCollections + encodeURIComponent(this.escapeSolr(this.datasetData.datasetId + '_') + '*');
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

  /** escapeSolr
  /* format urls to link and preview
  */
  escapeSolr(url: string): string {
    const pattern = /([\!\*\+\-\=\<\>\&\|\(\)\[\]\{\}\^\~\?\:\\/"])/g;
    return url.replace(pattern, '\\$1');
  }
}
