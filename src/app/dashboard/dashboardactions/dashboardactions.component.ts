import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboardactions',
  templateUrl: './dashboardactions.component.html',
  styleUrls: ['./dashboardactions.component.scss']
})
export class DashboardactionsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  gotoZoho() {
  	window.location.href = environment.links.gotoZoho;
  }

}
