import { Component, input, OnDestroy, output, signal } from '@angular/core';
import { Notification } from '../../_models';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnDestroy {
  variant = input<string>('medium');

  notification = input<Notification | undefined, Notification | undefined>(undefined, {
    transform: (value) => {
      this.handleNotificationChange(value);
      return value;
    }
  });

  closed = output<void>();

  hidden = signal<boolean>(false);

  private timer1?: ReturnType<typeof setTimeout>;
  private timer2?: ReturnType<typeof setTimeout>;

  private handleNotificationChange(value: Notification | undefined): void {
    this.clearActiveTimers();
    this.reset();

    if (value?.fadeTime) {
      const transitionDuration = 400;

      this.timer1 = setTimeout(() => {
        this.hidden.set(true);
      }, value.fadeTime);

      this.timer2 = setTimeout(() => {
        this.closed.emit();
      }, value.fadeTime + transitionDuration);
    }
  }

  reset(): void {
    this.hidden.set(false);
  }

  private clearActiveTimers(): void {
    if (this.timer1) clearTimeout(this.timer1);
    if (this.timer2) clearTimeout(this.timer2);
  }

  ngOnDestroy(): void {
    this.clearActiveTimers();
  }

  close(): void {
    const currentNotification = this.notification();
    if (currentNotification && !currentNotification.sticky) {
      this.closed.emit();
      this.reset();
    }
  }
}
