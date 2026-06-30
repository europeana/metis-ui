import { TestBed } from '@angular/core/testing';
import { Component, provideZonelessChangeDetection, signal, WritableSignal } from '@angular/core';
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

  let mockIsAuthenticatedSignal: WritableSignal<boolean>;
  let mockUserProfileSignal: WritableSignal<string | null | undefined>;

  let mockAuthService: any;
  let mockUserDataService: any;

  beforeEach(async () => {
    mockDatasetsSubject = new Subject<any[]>();
    mockIsAuthenticatedSignal = signal<boolean>(false);
    // Modified type to allow testing for null/undefined fallbacks safely
    mockUserProfileSignal = signal<string | null | undefined>('');

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

  // --- Input Fallbacks ---
  it('should resolve showing input to false by default', () => {
    expect(component.showing()).toBe(false);
  });

  // --- Authentication & Datasets ---
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

  // --- String Formatting Branches & Fallbacks ---
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

  it('should safely fall back to an empty string if userProfile evaluates to null or undefined', async () => {
    mockIsAuthenticatedSignal.set(true);

    mockUserProfileSignal.set(null);
    await TestBed.flushEffects();
    expect(component.userName()).toBe('');

    mockUserProfileSignal.set(undefined);
    await TestBed.flushEffects();
    expect(component.userName()).toBe('');
  });

  // --- Output Emitters ---
  it('should emit the appEntryLink output wrapper event when clickEvent handles interaction triggers', () => {
    let emittedEvent: Event | null = null;
    component.appEntryLink.subscribe((ev) => (emittedEvent = ev));

    const mockEvent = new MouseEvent('click');
    component.clickEvent(mockEvent);

    expect(emittedEvent).toBe(mockEvent);
  });

  it('should support subscribing and emitting to showAllRecent output', () => {
    let emitted = false;
    component.showAllRecent.subscribe(() => (emitted = true));

    component.showAllRecent.emit();

    expect(emitted).toBe(true);
  });

  it('should support subscribing and emitting payload data to openDataset output', () => {
    let emittedId: string | null = null;
    component.openDataset.subscribe((id) => (emittedId = id));

    component.openDataset.emit('mock-dataset-id');

    expect(emittedId).toBe('mock-dataset-id');
  });
});
