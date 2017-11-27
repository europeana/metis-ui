import { Injectable } from '@angular/core';
import { Notification } from '../_models';

@Injectable()
export class NotificationsService {

  notifications: Notification[] = [
    {
      action: 'User request: Simon Tzanakis',
      date: new Date('05/07/2017 08:34')
    },
    {
      action: 'Dataset 2048418_Ag_DE_DDB_SLUB-Sub10 was harvested',
      date: new Date('05/07/2017 11:55')
    },
    {
      action: 'Dataset 15512_Ag_AT_Kulturpool_voralberg was published',
      date: new Date('05/07/2017 08:56')
    },
    {
      action: 'User request: Alena Fedasenka',
      date: new Date('05/06/2017 22:34')
    }
  ];

  getNotifications() {
    return this.notifications;
  }
}

