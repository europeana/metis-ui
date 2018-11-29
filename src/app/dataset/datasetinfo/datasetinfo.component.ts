import {Component, Input, OnInit} from '@angular/core';
import {Dataset} from '../../_models/dataset';
import {HarvestData} from '../../_models/harvest-data';

@Component({
  selector: 'app-datasetinfo',
  templateUrl: './datasetinfo.component.html'
})
export class DatasetinfoComponent implements OnInit {

  @Input() datasetData: Dataset;
  @Input() harvestPublicationData: HarvestData;
  @Input() isNew: boolean;

  ngOnInit(): void {
  }
}
