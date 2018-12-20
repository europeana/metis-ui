import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';

import { Notification } from '../../_models';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent implements OnDestroy {
  @Input() variant = 'medium';

  @Output() closed = new EventEmitter<void>();

  private _notification?: Notification;
  private timeout: number;

  hidden = false;

  @Input() set notification(value: Notification | undefined) {
    this._notification = value;

    this.reset();
    if (value && value.fadeTime) {
      this.timeout = window.setTimeout(() => {
        this.hidden = true;
        this.timeout = window.setTimeout(() => {
          this.closed.emit();
          this.reset();
        }, 400);
      }, value.fadeTime);
    }
  }

  get notification(): Notification | undefined {
    return this._notification;
  }

  reset(): void {
    clearTimeout(this.timeout);
    this.hidden = false;
  }

  ngOnDestroy(): void {
    this.reset();
  }

  close(): void {
    if (this.notification && !this.notification.sticky) {
      this.closed.emit();
      this.reset();
    }
  }
}
