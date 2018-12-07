import { HttpErrorResponse } from '@angular/common/http';

import { StringifyHttpError } from '../_helpers';

export enum NotificationType {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface Notification {
  type: NotificationType;
  content: string;
}

export function errorNotification(content: string): Notification {
  return { type: NotificationType.ERROR, content };
}

export function successNotification(content: string): Notification {
  return { type: NotificationType.SUCCESS, content };
}

export function httpErrorNotification(error: false | HttpErrorResponse): Notification {
  return errorNotification(StringifyHttpError(error));
}
