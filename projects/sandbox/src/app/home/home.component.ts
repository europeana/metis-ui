import { NgClass } from '@angular/common';
import { Component, effect, inject, input, output, signal } from '@angular/core';
import { DropInModel } from '../_models';
import { KeycloakAuthService, UserDataService } from '../_services';
import { RecentComponent } from '../recent';

@Component({
  selector: 'sb-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [NgClass, RecentComponent]
})
export class HomeComponent {
  readonly showing = input(false);
  readonly authService = inject(KeycloakAuthService);
  readonly userDataService = inject(UserDataService);

  appEntryLink = output<Event>();
  showAllRecent = output<void>();
  openDataset = output<string>();

  hasRecent = signal<boolean>(false);
  userName = signal<string>('');

  constructor() {
    effect(() => {
      if (this.authService.isAuthenticated()) {
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

    let formattedName = this.authService.userProfile;
    formattedName = formattedName.replace(/\b(\w)/g, (s) => s.toUpperCase());
    this.userName.set(formattedName);
  }

  clickEvent($event: Event): void {
    this.appEntryLink.emit($event);
  }
}
