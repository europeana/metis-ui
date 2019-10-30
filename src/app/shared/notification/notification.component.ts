import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';

import { Notification } from '../../_models';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
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
        }, 400); // this is the transition time from the component scss
      }, value.fadeTime);
    }
  }

  /** notification
  /* getter for notification
  */
  get notification(): Notification | undefined {
    return this._notification;
  }

  /** reset
  /* - clear the timeout
  *  - set hidden variable to false
  */
  reset(): void {
    clearTimeout(this.timeout);
    this.hidden = false;
  }

  /** ngOnDestroy
  /* call the rest function
  */
  ngOnDestroy(): void {
    this.reset();
  }

  /** close
  /* - emit the closed event if there's a non-sticky notification
  *  - call the reset function if there's a non-sticky notification
  */
  close(): void {
    if (this.notification && !this.notification.sticky) {
      this.closed.emit();
      this.reset();
    }
  }
}
