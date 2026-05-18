import { NgClass } from '@angular/common';
import { Component, computed, inject, input, output } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { KeycloakAuthService, UserDataService } from '../_services';
import { RecentComponent } from '../recent';

@Component({
  selector: 'sb-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [NgClass, RecentComponent]
})
export class HomeComponent {
  readonly showing = input(false);
  private readonly authService = inject(KeycloakAuthService);
  private readonly userDataService = inject(UserDataService);

  public appEntryLink = output<Event>();
  public showAllRecent = output<void>();
  public openDataset = output<string>();

  // 🚀 Converts the Observable source straight into a reactive signal.
  // This automatically cleans up subscriptions and maps changes safely into the template.
  private readonly userDatasets = toSignal(this.userDataService.getUserDatasetsPolledObservable(), {
    initialValue: []
  });

  // Declarative computed values replace manual .set() logic inside lifecycles
  public readonly isAuthenticated = computed(() => this.authService.isAuthenticated());
  public readonly hasRecent = computed(() => this.userDatasets().length > 0);

  public readonly userName = computed(() => {
    if (!this.isAuthenticated()) return '';
    const rawProfile = this.authService.userProfile() || '';
    return rawProfile.replace(/\b(\w)/g, (s: string) => s.toUpperCase());
  });

  public clickEvent($event: Event): void {
    this.appEntryLink.emit($event);
  }
}
