import { NgClass } from '@angular/common';
import { Component, effect, EventEmitter, inject, input, Output } from '@angular/core';

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

  @Output() appEntryLink = new EventEmitter<Event>();
  @Output() showAllRecent = new EventEmitter<void>();
  @Output() openDataset = new EventEmitter<string>();

  dropInService = inject(UserDataService);
  hasRecent = false;
  userName: string;

  constructor() {
    effect(() => {
      const keycloakEvent = this.keycloakSignal();
      if (keycloakEvent.type === KeycloakEventType.Ready) {
        this.initUserData();
      } else {
        this.hasRecent = false;
        this.userName = '';
      }
    });
  }

  initUserData(): void {
    this.dropInService.getUserDatasetsPolledObservable().subscribe((arr: Array<DropInModel>) => {
      this.hasRecent = arr.length > 0;
    });

    this.keycloak.loadUserProfile().then((userDetails) => {
      this.userName = userDetails.username ?? '';
      this.userName = this.userName.replace(/\b(\w)/g, (s) => s.toUpperCase());
    });
  }

  clickEvent($event: Event): void {
    this.appEntryLink.emit($event);
  }
}
