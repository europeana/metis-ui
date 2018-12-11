import { HttpErrorResponse } from '@angular/common/http';

import { StringifyHttpError } from '../_helpers';

export enum NotificationType {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface Notification {
  type: NotificationType;
  content: string;
  sticky: boolean;
}

export function errorNotification(content: string, sticky: boolean = false): Notification {
  return { type: NotificationType.ERROR, content, sticky };
}

export function successNotification(content: string, sticky: boolean = false): Notification {
  return { type: NotificationType.SUCCESS, content, sticky };
}

export function httpErrorNotification(error: false | HttpErrorResponse): Notification {
  return errorNotification(StringifyHttpError(error));
}
