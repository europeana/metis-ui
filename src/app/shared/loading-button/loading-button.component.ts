import { Component, Input } from '@angular/core';

export type NgClass =
  | string
  | string[]
  | Set<string>
  | {
      [klass: string]: boolean;
    };

@Component({
  selector: 'app-loading-button',
  templateUrl: './loading-button.component.html',
  styleUrls: ['./loading-button.component.scss'],
})
export class LoadingButtonComponent {
  @Input() classes: NgClass = '';
  @Input() disabled = false;
  @Input() isLoading = false;
  @Input() title: string;
  @Input() loadingTitle?: string;
}
