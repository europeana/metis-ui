import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { TranslateService } from '../../_services';

@Component({
  selector: 'app-dashboardactions',
  templateUrl: './dashboardactions.component.html',
  styleUrls: ['./dashboardactions.component.scss']
})
export class DashboardactionsComponent implements OnInit {

  constructor(private translate: TranslateService) { }

  /** ngOnInit
  /* init this component:
  /* set translation language 
  */
  ngOnInit() {    
    if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
    }
  }

  /** gotoZoho
  /*  redirect to zoho url
  */
  gotoZoho() {
  	window.location.href = environment.links.gotoZoho;
  }

}
