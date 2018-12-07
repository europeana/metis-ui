import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Notification } from '../../_models/notification';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss'],
})
export class NotificationComponent {
  @Input() notification?: Notification;

  @Output() closed = new EventEmitter<void>();
}
