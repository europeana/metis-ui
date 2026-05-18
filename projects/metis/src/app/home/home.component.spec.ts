import { provideZonelessChangeDetection, TestBed } from '@angular/core/testing';
import { Component, signal, WritableSignal } from '@angular/core'; // 🚀 Added WritableSignal import
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Subject } from 'rxjs';
import { KeycloakAuthService, UserDataService } from '../_services';
import { HomeComponent } from './home.component';
import { RecentComponent } from '../recent';

@Component({
  selector: 'sb-recent',
  template: '',
  standalone: true
})
class MockRecentComponent {}

describe('HomeComponent (Angular Zoneless + Vitest)', () => {
  let component: HomeComponent;
  let mockDatasetsSubject: Subject<any[]>;

  // 🚀 FIX: Correctly declare the explicit signal types using standard Angular core models
  let mockIsAuthenticatedSignal: WritableSignal<boolean>;
  let mockUserProfileSignal: WritableSignal<string>;

  let mockAuthService: any;
  let mockUserDataService: any;

  beforeEach(async () => {
    mockDatasetsSubject = new Subject<any[]>();
    mockIsAuthenticatedSignal = signal<boolean>(false);
    mockUserProfileSignal = signal<string>('');

    mockAuthService = {
      isAuthenticated: mockIsAuthenticatedSignal,
      userProfile: mockUserProfileSignal
    };

    mockUserDataService = {
      getUserDatasetsPolledObservable: vi.fn().mockReturnValue(mockDatasetsSubject.asObservable())
    };

    await TestBed.configureTestingModule({
      imports: [HomeComponent, MockRecentComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: KeycloakAuthService, useValue: mockAuthService },
        { provide: UserDataService, useValue: mockUserDataService }
      ]
    }).compileComponents();

    TestBed.overrideComponent(HomeComponent, {
      remove: { imports: [RecentComponent] },
      add: { imports: [MockRecentComponent] }
    });

    const fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
  });

  it('should create the component instance', () => {
    expect(component).toBeTruthy();
  });

  it('should compute isAuthenticated state dynamically from the authentication service signal', async () => {
    expect(component.isAuthenticated()).toBeFalsy();

    mockIsAuthenticatedSignal.set(true);
    await TestBed.flushEffects();

    expect(component.isAuthenticated()).toBeTruthy();
  });

  it('should compute hasRecent as true only when the underlying dataset stream contains items', async () => {
    expect(component.hasRecent()).toBeFalsy();

    mockDatasetsSubject.next([{ id: 'dataset-1' }]);
    await TestBed.flushEffects();

    expect(component.hasRecent()).toBeTruthy();

    mockDatasetsSubject.next([]);
    await TestBed.flushEffects();

    expect(component.hasRecent()).toBeFalsy();
  });

  it('should format the userName to TitleCase when the user profile signal provides information', async () => {
    mockIsAuthenticatedSignal.set(true);
    mockUserProfileSignal.set('john doe-smith');
    await TestBed.flushEffects();

    expect(component.userName()).toBe('John Doe-Smith');
  });

  it('should return an empty userName string if the user context is unauthenticated', async () => {
    mockIsAuthenticatedSignal.set(false);
    mockUserProfileSignal.set('anonymous user');
    await TestBed.flushEffects();

    expect(component.userName()).toBe('');
  });

  it('should emit the appEntryLink output wrapper event when clickEvent handles interaction triggers', () => {
    let emittedEvent: Event | null = null;
    component.appEntryLink.subscribe((ev) => (emittedEvent = ev));

    const mockEvent = new MouseEvent('click');
    component.clickEvent(mockEvent);

    expect(emittedEvent).toBe(mockEvent);
  });
});
