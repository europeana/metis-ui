import { Component } from '@angular/core';
import { apiSettings } from '../environments/apisettings';

@Component({
  selector: 'sb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  public feedbackUrl = apiSettings.feedbackUrl;
}
