import { Component, Input } from '@angular/core';

import { apiSettings } from '../../../environments/apisettings';
import { Dataset, HarvestData } from '../../_models';

@Component({
  selector: 'app-generalinfo',
  templateUrl: './generalinfo.component.html',
  styleUrls: ['./generalinfo.component.scss']
})
export class GeneralinfoComponent {
  @Input() datasetData: Dataset;

  disabledBtnClass = 'btn-disabled';
  lastPublishedRecords?: number;
  lastPublishedDate?: string;
  viewPreview?: string;
  buttonClassPreview = this.disabledBtnClass;
  viewCollections?: string;
  buttonClassCollections = this.disabledBtnClass;

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
        this.buttonClassPreview = this.disabledBtnClass;
      }
      if (value.lastPublishedRecordsReadyForViewing) {
        this.viewCollections =
          apiSettings.viewCollections +
          encodeURIComponent(this.escapeSolr(this.datasetData.datasetId + '_') + '*');
        this.buttonClassCollections = '';
      } else {
        this.viewCollections = undefined;
        this.buttonClassCollections = this.disabledBtnClass;
      }
    }
  }

  get harvestPublicationData(): HarvestData {
    return this._harvestPublicationData;
  }

  // format urls to link and preview
  escapeSolr(url: string): string {
    const pattern = /([\!\*\+\-\=\<\>\&\|\(\)\[\]\{\}\^\~\?\:\\/"])/g;
    return url.replace(pattern, '\\$1');
  }
}
