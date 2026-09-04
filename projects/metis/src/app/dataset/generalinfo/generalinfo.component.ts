import { DatePipe, NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { apiSettings } from '../../../environments/apisettings';
import { Dataset, DatasetDepublicationStatus, HarvestData } from '../../_models';
import { TranslatePipe } from '../../_translate';

@Component({
  selector: 'app-generalinfo',
  templateUrl: './generalinfo.component.html',
  styleUrls: ['./generalinfo.component.scss'],
  imports: [NgClass, DatePipe, TranslatePipe]
})
export class GeneralinfoComponent {
  datasetData = input<Dataset | undefined>(undefined);
  harvestPublicationData = input<HarvestData | undefined>(undefined);

  private readonly disabledBtnClass = 'is-disabled';

  currentDepublicationStatusMessage = computed<string | undefined>(() => {
    const status = this.harvestPublicationData()?.publicationStatus;
    if (status === DatasetDepublicationStatus.DEPUBLISHED) return 'depublished';
    if (status === DatasetDepublicationStatus.PUBLISHED) return 'published';
    return undefined;
  });

  currentDepublicationStatusClass = computed<string | undefined>(() => {
    return this.currentDepublicationStatusMessage();
  });

  lastDepublishedDate = computed<string | undefined>(
    () => this.harvestPublicationData()?.lastDepublishedDate
  );
  lastDepublishedRecords = computed<number | undefined>(
    () => this.harvestPublicationData()?.lastDepublishedRecords
  );
  lastPublishedRecords = computed<number | undefined>(
    () => this.harvestPublicationData()?.lastPublishedRecords
  );
  lastPublishedDate = computed<string | undefined>(
    () => this.harvestPublicationData()?.lastPublishedDate
  );
  totalPublishedRecords = computed<number | undefined>(
    () => this.harvestPublicationData()?.totalPublishedRecords
  );
  totalPreviewRecords = computed<number | undefined>(
    () => this.harvestPublicationData()?.totalPreviewRecords
  );

  displayNumberOfItemsPublished = computed<number | undefined>(() => {
    const total = this.totalPublishedRecords();
    if (total === -1) {
      return this.lastPublishedRecords();
    }
    return total;
  });

  viewPreview = computed<string | undefined>(() => {
    const harvest = this.harvestPublicationData();
    const dataset = this.datasetData();
    if (harvest?.lastPreviewRecordsReadyForViewing && dataset) {
      return (
        apiSettings.viewPreview + encodeURIComponent(this.escapeSolr(dataset.datasetId + '_') + '*')
      );
    }
    return undefined;
  });

  buttonClassPreview = computed<string>(() => {
    return this.harvestPublicationData()?.lastPreviewRecordsReadyForViewing
      ? ''
      : this.disabledBtnClass;
  });

  viewCollections = computed<string | undefined>(() => {
    const harvest = this.harvestPublicationData();
    const dataset = this.datasetData();
    if (harvest?.lastPublishedRecordsReadyForViewing && dataset) {
      return (
        apiSettings.viewCollections +
        encodeURIComponent(this.escapeSolr(dataset.datasetId + '_') + '*')
      );
    }
    return undefined;
  });

  buttonClassCollections = computed<string>(() => {
    return this.harvestPublicationData()?.lastPublishedRecordsReadyForViewing
      ? ''
      : this.disabledBtnClass;
  });

  /** escapeSolr
   * format urls to link and preview
   */
  escapeSolr(url: string): string {
    const pattern = /([!*+\-=<>&|()[\]{}^~?:\\/"])/g;
    return url.replace(pattern, '\\$1');
  }
}
