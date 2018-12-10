import { Component, EventEmitter, Input, Output } from '@angular/core';

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
  @Input() ngClass: NgClass = '';
  @Input() disabled = false;
  @Input() isLoading = false;
  @Input() title: string;
  @Input() loadingTitle?: string;

  @Output() click = new EventEmitter<MouseEvent>();
}
