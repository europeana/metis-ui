import { NgClass } from '@angular/common';
import { Component, effect, EventEmitter, inject, input, OnInit, Output } from '@angular/core';

import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType } from 'keycloak-angular';

import { DropInModel } from '../_models';
import { DropInService } from '../_services';
import { RecentComponent } from '../recent';

@Component({
  selector: 'sb-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [NgClass, RecentComponent]
})
export class HomeComponent implements OnInit {
  readonly showing = input(false);
  readonly keycloak = inject(Keycloak);

  readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);

  @Output() appEntryLink = new EventEmitter<Event>();
  @Output() showAllRecent = new EventEmitter<void>();

  dropInService = inject(DropInService);
  recentModel: Array<DropInModel>;
  userName: string;

  constructor() {
    effect(() => {
      const keycloakEvent = this.keycloakSignal();
      if (keycloakEvent.type === KeycloakEventType.Ready) {
        this.initUserData();
      } else {
        this.recentModel = [];
        this.userName = '';
      }
    });
  }

  initUserData(): void {
    this.dropInService.getUserDatasetsPolledObservable().subscribe((arr: Array<DropInModel>) => {
      this.recentModel = arr;
    });

    this.keycloak.loadUserProfile().then((userDetails) => {
      this.userName = userDetails.username ?? '';
      this.userName = this.userName.replace(/\b(\w)/g, (s) => s.toUpperCase());
    });
  }

  ngOnInit(): void {
    console.log('ngOnInit: ' + this.keycloak.authenticated);
    if (this.keycloak.authenticated) {
      this.initUserData();
    }
  }

  clickEvent($event: Event): void {
    this.appEntryLink.emit($event);
  }
}
