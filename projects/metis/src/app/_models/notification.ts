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
