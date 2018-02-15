import { Component, OnInit, Input } from '@angular/core';
import { DatasetsService, TranslateService } from '../../_services';

@Component({
  selector: 'app-generalinfo',
  templateUrl: './generalinfo.component.html',
  styleUrls: ['./generalinfo.component.scss']
})
export class GeneralinfoComponent implements OnInit {

  constructor(private datasets: DatasetsService,
  	private translate: TranslateService) { }

  @Input() datasetData: any;

  ngOnInit() {
    if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
    }
  }

}
