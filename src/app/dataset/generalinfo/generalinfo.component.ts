import { Component, Input, OnInit } from '@angular/core';

import { apiSettings } from '../../../environments/apisettings';
import { Dataset, HarvestData } from '../../_models';
import { TranslateService } from '../../_translate';

@Component({
  selector: 'app-generalinfo',
  templateUrl: './generalinfo.component.html',
})
export class GeneralinfoComponent implements OnInit {
  constructor(private translate: TranslateService) {}

  @Input() datasetData: Dataset;

  lastPublishedRecords?: number;
  lastPublishedDate?: string;
  viewPreview?: string;
  buttonClassPreview = 'btn-disabled';
  viewCollections?: string;
  buttonClassCollections = 'btn-disabled';

  private _harvestPublicationData: HarvestData;

  @Input()
  set harvestPublicationData(value: HarvestData) {
    this._harvestPublicationData = value;

    if (value) {
      this.lastPublishedRecords = value.lastPublishedRecords;
      this.lastPublishedDate = value.lastPublishedDate;

      if (value.lastPreviewRecordsReadyForViewing) {
        this.viewPreview =
          apiSettings.viewPreview +
          encodeURIComponent(this.escapeSolr(this.datasetData.datasetId + '_') + '*');
        this.buttonClassPreview = '';
      } else {
        this.viewPreview = undefined;
        this.buttonClassPreview = 'btn-disabled';
      }
      if (value.lastPublishedRecordsReadyForViewing) {
        this.viewCollections =
          apiSettings.viewCollections +
          encodeURIComponent(this.escapeSolr(this.datasetData.datasetId + '_') + '*');
        this.buttonClassCollections = '';
      } else {
        this.viewCollections = undefined;
        this.buttonClassCollections = 'btn-disabled';
      }
    }
  }

  get harvestPublicationData(): HarvestData {
    return this._harvestPublicationData;
  }

  ngOnInit(): void {
    this.translate.use('en');
  }

  // format urls to link and preview
  escapeSolr(url: string): string {
    const pattern = /([\!\*\+\-\=\<\>\&\|\(\)\[\]\{\}\^\~\?\:\\/"])/g;
    return url.replace(pattern, '\\$1');
  }
}
