import { Component, Input } from '@angular/core';
import { EnvItem } from '../_models/remote-env';

@Component({
  selector: 'lib-maintenance-info',
  templateUrl: './maintenance-info.component.html'
})
export class MaintenanceInfoComponent {
  @Input() maintenanceInfo: EnvItem;
}
