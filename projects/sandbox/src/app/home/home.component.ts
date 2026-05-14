import { NgClass } from '@angular/common';
import { Component, effect, inject, input, output, signal } from '@angular/core';

import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from 'keycloak-angular';

import { DropInModel } from '../_models';
import { UserDataService } from '../_services';
import { RecentComponent } from '../recent';

@Component({
  selector: 'sb-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [NgClass, RecentComponent]
})
export class HomeComponent {
  readonly showing = input(false);
  readonly keycloak = inject(Keycloak);

  readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);

  appEntryLink = output<Event>();
  showAllRecent = output<void>();
  openDataset = output<string>();

  userDataService = inject(UserDataService);

  // Converted to reactive signals for Zoneless support
  hasRecent = signal<boolean>(false);
  userName = signal<string>('');

  constructor() {
    effect(() => {
      const keycloakEvent = this.keycloakSignal();
      // Added session authentication verification to guarantee active tokens before API calls
      if (keycloakEvent.type === KeycloakEventType.Ready && this.keycloak.authenticated) {
        this.initUserData();
      } else {
        this.hasRecent.set(false);
        this.userName.set('');
      }
    });
  }

  initUserData(): void {
    this.userDataService.getUserDatasetsPolledObservable().subscribe((arr: Array<DropInModel>) => {
      this.hasRecent.set(arr.length > 0);
    });

    this.keycloak.loadUserProfile().then((userDetails) => {
      let formattedName = userDetails.username ?? '';
      formattedName = formattedName.replace(/\b(\w)/g, (s) => s.toUpperCase());
      this.userName.set(formattedName);
    });
  }

  clickEvent($event: Event): void {
    this.appEntryLink.emit($event);
  }
}
