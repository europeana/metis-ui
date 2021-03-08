import { Component } from '@angular/core';
import { wizardConf } from './wizard';

@Component({
  selector: 'sb-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  conf = wizardConf;
}
