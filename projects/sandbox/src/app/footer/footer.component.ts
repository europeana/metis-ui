import { Component } from '@angular/core';
import { apiSettings } from '../../environments/apisettings';

@Component({
  selector: 'sb-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true
})
export class FooterComponent {
  public dataspaceUrl = apiSettings.dataspaceUrl;
}
