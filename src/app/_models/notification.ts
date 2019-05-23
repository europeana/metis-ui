import { HttpErrorResponse } from '@angular/common/http';

import { StringifyHttpError } from '../_helpers/stringify-http-error';

export enum NotificationType {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface Notification {
  content: string;
  type: NotificationType;
  sticky?: boolean;
  fadeTime?: number;
}

export interface NotificationOptions {
  sticky?: boolean;
  fadeTime?: number;
}

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
