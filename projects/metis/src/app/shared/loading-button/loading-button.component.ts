import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NgClass as NgClass_1, NgIf } from '@angular/common';

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
  standalone: true,
  imports: [NgClass_1, NgIf]
})
export class LoadingButtonComponent {
  @Input() classes: NgClass = '';
  @Input() type = 'button';
  @Input() disabled = false;
  @Input() isLoading = false;
  @Input() title: string;
  @Input() loadingTitle?: string;
  @Output() onClick = new EventEmitter<null>();

  click(): void {
    this.onClick.emit();
  }
}
