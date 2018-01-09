import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatasetsService } from '../../_services';
import { convertDate } from '../../_helpers';

@Component({
  selector: 'app-generalinfo',
  templateUrl: './generalinfo.component.html',
  styleUrls: ['./generalinfo.component.scss']
})
export class GeneralinfoComponent implements OnInit {

  constructor(private datasets: DatasetsService,
  	private route: ActivatedRoute) { }

  @Input() datasetData: any;
  lastPublishedDate;

  ngOnInit() {
    this.lastPublishedDate = convertDate(this.datasetData.lastPublishedDate);
  }

}
