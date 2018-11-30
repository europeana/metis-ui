import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Dataset } from '../../_models/dataset';
import { HarvestData } from '../../_models/harvest-data';

@Component({
  selector: 'app-datasetinfo',
  templateUrl: './datasetinfo.component.html',
  styleUrls: ['./datasetinfo.component.scss']
})
export class DatasetinfoComponent {

  @Input() datasetData: Dataset;
  @Input() harvestPublicationData?: HarvestData;

  @Output() datasetUpdated = new EventEmitter<void>();
}
