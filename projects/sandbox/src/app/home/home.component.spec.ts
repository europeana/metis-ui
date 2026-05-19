import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection, signal, WritableSignal } from '@angular/core';
import { Subject } from 'rxjs';
import { KeycloakAuthService, UserDataService } from '../_services';
import { HomeComponent } from './home.component';
import { RecentComponent } from '../recent';

// Stub nested child component to isolate test paths to HomeComponent properties
@Component({
  selector: 'sb-recent',
  template: '',
  standalone: true
})
class MockRecentComponent {}

describe('HomeComponent (Angular Zoneless + Vitest)', () => {
  let component: HomeComponent;
  let mockDatasetsSubject: Subject<any[]>;

  // 🚀 FIX: Declare the signal types using the standard Angular core interface types
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

    // Act: Simulate successful user login state change
    mockIsAuthenticatedSignal.set(true);
    await TestBed.flushEffects();

    expect(component.isAuthenticated()).toBeTruthy();
  });

  it('should compute hasRecent as true only when the underlying dataset stream contains items', async () => {
    expect(component.hasRecent()).toBeFalsy();

    // Act: Push a dataset item through the mock continuous polling observable
    mockDatasetsSubject.next([{ id: 'dataset-1' }]);
    await TestBed.flushEffects();

    expect(component.hasRecent()).toBeTruthy();

    // Act: Push empty array through stream context
    mockDatasetsSubject.next([]);
    await TestBed.flushEffects();

    expect(component.hasRecent()).toBeFalsy();
  });

  it('should format the userName to TitleCase when the user profile signal provides information', async () => {
    mockIsAuthenticatedSignal.set(true);
    mockUserProfileSignal.set('john doe-smith');
    await TestBed.flushEffects();

    // Confirms title-casing transformation matches regex rules
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
