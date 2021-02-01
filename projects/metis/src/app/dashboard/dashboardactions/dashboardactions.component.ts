import { Component } from '@angular/core';

import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboardactions',
  templateUrl: './dashboardactions.component.html',
  styleUrls: ['./dashboardactions.component.scss']
})
export class DashboardactionsComponent {
  linkToZoho: string = environment.links.gotoZoho;
}
