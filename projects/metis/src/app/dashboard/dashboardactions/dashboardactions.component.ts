import { Component } from '@angular/core';

import { environment } from '../../../environments/environment';
import { TranslatePipe } from '../../_translate/translate.pipe';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboardactions',
  templateUrl: './dashboardactions.component.html',
  styleUrls: ['./dashboardactions.component.scss'],
  standalone: true,
  imports: [RouterLink, TranslatePipe]
})
export class DashboardactionsComponent {
  linkToZoho: string = environment.links.gotoZoho;
}
