import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { timer } from 'rxjs';
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
  hidden = false;

  @Input() set notification(value: Notification | undefined) {
    this._notification = value;
    this.reset();
    if (value && value.fadeTime) {
      // the css transition time
      const transitionDuration = 400;
      const timer1 = timer(value.fadeTime).subscribe(() => {
        this.hidden = true;
        timer1.unsubscribe();
      });
      const timer2 = timer(value.fadeTime + transitionDuration).subscribe(() => {
        timer2.unsubscribe();
        this.closed.emit();
      });
    }
  }

  /** notification
  /* getter for notification
  */
  get notification(): Notification | undefined {
    return this._notification;
  }

  /** reset
   *  - set hidden variable to false
   */
  reset(): void {
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
