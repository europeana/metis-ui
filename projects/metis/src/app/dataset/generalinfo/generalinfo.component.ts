import { DatePipe, NgClass, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

import { apiSettings } from '../../../environments/apisettings';
import { Dataset, DatasetDepublicationStatus, HarvestData } from '../../_models';
import { TranslatePipe } from '../../_translate';

@Component({
  selector: 'app-generalinfo',
  templateUrl: './generalinfo.component.html',
  styleUrls: ['./generalinfo.component.scss'],
  imports: [NgIf, NgClass, DatePipe, TranslatePipe]
})
export class GeneralinfoComponent {
  @Input() datasetData: Dataset;

  currentDepublicationStatusMessage?: string;
  currentDepublicationStatusClass?: string;
  disabledBtnClass = 'is-disabled';
  lastDepublishedDate?: string;
  lastDepublishedRecords?: number;
  lastPublishedRecords?: number;
  lastPublishedDate?: string;
  totalPreviewRecords?: number;
  totalPublishedRecords?: number;
  viewPreview?: string;
  buttonClassPreview = this.disabledBtnClass;
  viewCollections?: string;
  buttonClassCollections = this.disabledBtnClass;
  displayNumberOfItemsPublished: number;

  private _harvestPublicationData: HarvestData;

  @Input()
  set harvestPublicationData(value: HarvestData) {
    this._harvestPublicationData = value;
    if (value) {
      if (value.publicationStatus === DatasetDepublicationStatus.DEPUBLISHED) {
        this.currentDepublicationStatusMessage = 'depublished';
      } else if (value.publicationStatus === DatasetDepublicationStatus.PUBLISHED) {
        this.currentDepublicationStatusMessage = 'published';
      } else {
        this.currentDepublicationStatusMessage = undefined;
      }
      this.currentDepublicationStatusClass = this.currentDepublicationStatusMessage;
      this.lastDepublishedDate = value.lastDepublishedDate;
      this.lastDepublishedRecords = value.lastDepublishedRecords;
      this.lastPublishedRecords = value.lastPublishedRecords;
      this.lastPublishedDate = value.lastPublishedDate;
      this.totalPublishedRecords = value.totalPublishedRecords;
      this.totalPreviewRecords = value.totalPreviewRecords;
      this.displayNumberOfItemsPublished = this.totalPublishedRecords;

      if (this.displayNumberOfItemsPublished === -1) {
        this.displayNumberOfItemsPublished = this.lastPublishedRecords;
      }

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

  /** harvestPublicationData
  /* return the harvest publication data
  */
  get harvestPublicationData(): HarvestData {
    return this._harvestPublicationData;
  }

  /** escapeSolr
  /* format urls to link and preview
  */
  escapeSolr(url: string): string {
    const pattern = /([!*+\-=<>&|()[\]{}^~?:\\/"])/g;
    return url.replace(pattern, '\\$1');
  }
}
