import { Component } from '@angular/core';
import { DataPollingComponent } from '@shared';

@Component({
  selector: 'sb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent extends DataPollingComponent {
  title = 'sandbox';
}
