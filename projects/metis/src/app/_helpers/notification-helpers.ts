import { HttpErrorResponse } from '@angular/common/http';
import { StringifyHttpError } from 'shared';
import { Notification, NotificationOptions, NotificationType } from '../_models';

export function errorNotification(
  content: string,
  options: NotificationOptions = {}
): Notification {
  return { type: NotificationType.ERROR, content, ...options };
}

export function successNotification(
  content: string,
  options: NotificationOptions = {}
): Notification {
  return { type: NotificationType.SUCCESS, content, ...options };
}

export function httpErrorNotification(
  error: false | HttpErrorResponse,
  options: NotificationOptions = {}
): Notification {
  return errorNotification(StringifyHttpError(error), options);
}
