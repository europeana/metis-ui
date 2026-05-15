import { Location } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { SpyLocation } from '@angular/common/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Params } from '@angular/router';
import { MockComponent } from 'ng-mocks';
import { BehaviorSubject, of } from 'rxjs';
import { signal, Component, Input, Output, EventEmitter } from '@angular/core';
import { SandboxPage, SandboxPageType, FixedLengthArray, DatasetStatus } from '../_models';
import {
  SandboxService,
  SandboxConfService,
  MatomoService,
  KeycloakAuthService
} from '../_services';
import { DatasetInfoComponent } from '../dataset-info/dataset-info.component';
import { HomeComponent } from '../home';
import { NavigationOrbsComponent } from '../navigation-orbs';
import { ProgressTrackerComponent } from '../progress-tracker';
import { SandboxNavigatonComponent } from './sandbox-navigation.component';

@Component({
  selector: 'sb-navigation-orbs',
  template: '',
  standalone: true
})
class MockNavigationOrbsComponent {
  @Input() count = 0;
  @Input() index = 0;
  @Input() tooltips: string[] = [];
  @Input() classMapInner: any = {};
  @Input() classMapOuter: any = {};
  @Output() clickEvent = new EventEmitter<number>();
}

describe('SandboxNavigatonComponent', () => {
  let component: SandboxNavigatonComponent;
  let fixture: ComponentFixture<SandboxNavigatonComponent>;

  let mockNavConfSignal: any;

  let mockSandboxConfService: any;
  let mockSandboxService: any;
  let mockMatomoService: any;
  let mockLocation: any;
  let mockKeycloakAuthService: any;
  let mockAuthSignal: WritableSignal<boolean>;

  let mockParams$: BehaviorSubject<Params>;
  let mockQueryParams$: BehaviorSubject<Params>;

  const mockInitialConf: FixedLengthArray<SandboxPage, 8> = ([
    { stepTitle: 'Home', stepType: SandboxPageType.HOME, isHidden: false },
    { stepTitle: 'Upload Dataset', stepType: SandboxPageType.UPLOAD, isHidden: true },
    { stepTitle: 'Dataset Processing', stepType: SandboxPageType.PROGRESS_TRACK, isHidden: true },
    {
      stepTitle: 'Problem Patterns (Dataset)',
      stepType: SandboxPageType.PROBLEMS_DATASET,
      isHidden: true
    },
    { stepTitle: 'Record Report', stepType: SandboxPageType.REPORT, isHidden: true },
    {
      stepTitle: 'Problem Patterns (Record)',
      stepType: SandboxPageType.PROBLEMS_RECORD,
      isHidden: true
    },
    { stepTitle: 'Privacy Statement', stepType: SandboxPageType.PRIVACY_STATEMENT, isHidden: true },
    { stepTitle: 'Cookie Policy', stepType: SandboxPageType.COOKIE_POLICY, isHidden: true }
  ] as unknown) as FixedLengthArray<SandboxPage, 8>;

  beforeEach(async () => {
    mockParams$ = new BehaviorSubject<Params>({});
    mockQueryParams$ = new BehaviorSubject<Params>({});

    mockNavConfSignal = signal(JSON.parse(JSON.stringify(mockInitialConf)));
    mockAuthSignal = signal<boolean>(true);

    mockKeycloakAuthService = {
      isAuthenticated: vi.fn().mockImplementation(() => mockAuthSignal()),
      isLoggedIn: vi.fn().mockImplementation(() => Promise.resolve(mockAuthSignal())),
      username: signal('sandbox-user'),
      userProfile: vi.fn().mockImplementation(() => ({
        firstName: 'Sandbox',
        lastName: 'User',
        username: 'sandbox-user'
      }))
    };

    mockSandboxConfService = {
      navConf: mockNavConfSignal.asReadonly(),
      isAncestorMode: vi.fn().mockReturnValue(false),
      setAncestorAlignment: vi.fn(),
      updateStepStatus: vi.fn().mockImplementation((pageType: SandboxPageType, status: any) => {
        mockNavConfSignal.update((currentConf: any) => {
          const nextConf = [...currentConf];
          const idx = nextConf.findIndex((step: any) => step.stepType === pageType);
          if (idx !== -1) {
            nextConf[idx] = { ...nextConf[idx], ...status };
          }
          return nextConf;
        });
      })
    };

    mockSandboxService = {
      getDatasetInfo: vi.fn().mockReturnValue(of({ id: '90', title: 'Mock Dataset' })),
      requestProgress: vi.fn().mockReturnValue(of({ status: DatasetStatus.COMPLETED })),
      getProblemPatternsDataset: vi.fn().mockReturnValue(of({})),
      getRecordReport: vi.fn().mockReturnValue(of({}))
    };

    mockMatomoService = {
      trackNavigation: vi.fn(),
      urlChanged: vi.fn()
    };

    // Inside beforeEach:
    const spyLocation = new SpyLocation();
    // Pre-seed the default return value so standard layout tests don't break
    spyLocation.setInitialPath('');
    mockLocation = spyLocation;

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, SandboxNavigatonComponent, MockNavigationOrbsComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SandboxConfService, useValue: mockSandboxConfService },
        { provide: SandboxService, useValue: mockSandboxService },
        { provide: MatomoService, useValue: mockMatomoService },
        { provide: KeycloakAuthService, useValue: mockKeycloakAuthService },
        { provide: Location, useValue: mockLocation },
        {
          provide: ActivatedRoute,
          useValue: {
            params: mockParams$.asObservable(),
            queryParams: mockQueryParams$.asObservable()
          }
        }
      ]
    })
      .overrideComponent(SandboxNavigatonComponent, {
        remove: {
          imports: [
            DatasetInfoComponent,
            HomeComponent,
            NavigationOrbsComponent,
            ProgressTrackerComponent
          ]
        },
        add: {
          imports: [
            MockComponent(DatasetInfoComponent),
            MockComponent(HomeComponent),
            MockComponent(NavigationOrbsComponent),
            MockComponent(ProgressTrackerComponent)
          ]
        }
      })
      .compileComponents();

    TestBed.runInInjectionContext(() => {
      fixture = TestBed.createComponent(SandboxNavigatonComponent);
      component = fixture.componentInstance;
    });

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('should initialize cleanly with default HOME parameters', () => {
    // 1. Explicitly clear all parameters for the standard home path check
    (mockLocation as SpyLocation).setInitialPath('/');
    mockParams$.next({});
    mockQueryParams$.next({});

    // 2. Run initialization pass
    fixture.detectChanges();
    vi.advanceTimersByTime(0);
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.currentStepType()).toBe(SandboxPageType.HOME);
  });

  it('should navigate straight to Record Report when landing on deep links', () => {
    // 1. 🚀 THE REAL FIX: Simulate the deep link arrival BEFORE initialization
    // simulateUrlPop updates the internal path AND broadcasts the synchronous routing frame event
    (mockLocation as SpyLocation).simulateUrlPop('/dataset/90');

    // 2. Supply only the distinct parameters needed for this specific state machine
    mockParams$.next({ id: '90' });
    mockQueryParams$.next({ recordId: '2' });

    // 3. Run the initial Zoneless compilation sequence
    fixture.detectChanges();
    vi.advanceTimersByTime(0);
    fixture.detectChanges();

    expect(component.trackDatasetId()).toBe('90');
    expect(component.trackRecordId()).toBe('2');
    expect(component.currentStepType()).toBe(SandboxPageType.REPORT);
  });

  it('should maintain the active deep-linked page selection when data updates land', () => {
    // 1. Simulate the arrival pattern identically
    (mockLocation as SpyLocation).simulateUrlPop('/dataset/90');
    mockParams$.next({ id: '90' });
    mockQueryParams$.next({ recordId: '2' });

    fixture.detectChanges();
    vi.advanceTimersByTime(0);
    fixture.detectChanges();

    expect(component.currentStepType()).toBe(SandboxPageType.REPORT);
  });
});
