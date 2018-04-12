import { Component, OnInit, Input } from '@angular/core';
import { DatasetsService, TranslateService } from '../../_services';

@Component({
  selector: 'app-generalinfo',
  templateUrl: './generalinfo.component.html'
})
export class GeneralinfoComponent implements OnInit {

  constructor(private datasets: DatasetsService,
  	private translate: TranslateService) { }

  @Input() datasetData: any;

  /** ngOnInit
  /* init for this specific component
  /* and set translation langugaes
  */
  ngOnInit() {
    if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
    }
  }

}
