import { Component } from '@angular/core';
import { apiSettings } from '../../environments/apisettings';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  public apiSettings = apiSettings;
}
