import { Component, OnInit, Input } from '@angular/core';
import { DatasetsService } from '../../_services';
import { convertDate } from '../../_helpers';

@Component({
  selector: 'app-generalinfo',
  templateUrl: './generalinfo.component.html',
  styleUrls: ['./generalinfo.component.scss']
})
export class GeneralinfoComponent implements OnInit {

  constructor(private datasets: DatasetsService) { }

  @Input() datasetData: any;
  lastPublishedDate;

  ngOnInit() {
    if (this.datasetData) {
      this.lastPublishedDate = convertDate(this.datasetData.lastPublishedDate);
    }
  }

}
