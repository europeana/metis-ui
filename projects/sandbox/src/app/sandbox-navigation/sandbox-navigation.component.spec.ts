import { Location } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
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
import { NavigationOrbsComponent } from '../navigation-orbs';
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

  let mockParams$: BehaviorSubject<Params>;
  let mockQueryParams$: BehaviorSubject<Params>;
  let mockNavConfSignal: any;

  let mockSandboxConfService: any;
  let mockSandboxService: any;
  let mockMatomoService: any;
  let mockLocation: any;
  let mockKeycloakAuthService: any;

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
    mockNavConfSignal = signal(mockInitialConf);

    // Mock your internal service wrapper directly to manage authentication hooks cleanly
    mockKeycloakAuthService = {
      isLoggedIn: vi.fn().mockResolvedValue(true),
      username: signal('sandbox-user')
    };

    mockSandboxConfService = {
      navConf: mockNavConfSignal.asReadonly(),
      isAncestorMode: vi.fn().mockReturnValue(false),
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
      getDatasetInfo: vi.fn().mockReturnValue(of(undefined)),
      requestProgress: vi.fn().mockReturnValue(of({ status: DatasetStatus.COMPLETED })),
      getProblemPatternsDataset: vi.fn().mockReturnValue(of({}))
    };

    mockMatomoService = {
      trackNavigation: vi.fn()
    };

    mockLocation = {
      path: vi.fn().mockReturnValue(''),
      subscribe: vi.fn(),
      go: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, SandboxNavigatonComponent, MockNavigationOrbsComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SandboxConfService, useValue: mockSandboxConfService },
        { provide: SandboxService, useValue: mockSandboxService },
        { provide: MatomoService, useValue: mockMatomoService },
        { provide: Location, useValue: mockLocation },
        { provide: KeycloakAuthService, useValue: mockKeycloakAuthService }, // Mock the target service token cleanly
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
        remove: { imports: [DatasetInfoComponent, NavigationOrbsComponent] },
        add: {
          imports: [MockComponent(DatasetInfoComponent), MockComponent(NavigationOrbsComponent)]
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
    fixture.detectChanges();
    vi.advanceTimersByTime(0);
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(component.currentStepType()).toBe(SandboxPageType.HOME);
  });

  it('should navigate straight to Record Report when landing on deep links', () => {
    mockLocation.path.mockReturnValue('/dataset/90');
    mockParams$.next({ id: '90' });
    mockQueryParams$.next({ recordId: '2' });

    fixture.detectChanges();
    vi.advanceTimersByTime(0);
    fixture.detectChanges();

    expect(component.trackDatasetId()).toBe('90');
    expect(component.trackRecordId()).toBe('2');
    expect(component.currentStepType()).toBe(SandboxPageType.REPORT);
  });

  it('should activate Problems Dataset layout when view=problems query param matches', () => {
    mockLocation.path.mockReturnValue('/dataset/90');
    mockParams$.next({ id: '90' });
    mockQueryParams$.next({ view: 'problems' });

    fixture.detectChanges();
    vi.advanceTimersByTime(0);
    fixture.detectChanges();

    expect(component.currentStepType()).toBe(SandboxPageType.PROBLEMS_DATASET);
  });

  it('should maintain the active deep-linked page selection when data updates land', () => {
    mockLocation.path.mockReturnValue('/dataset/90');
    mockParams$.next({ id: '90' });
    mockQueryParams$.next({ recordId: '2' });

    fixture.detectChanges();
    vi.advanceTimersByTime(0);
    fixture.detectChanges();

    expect(component.currentStepType()).toBe(SandboxPageType.REPORT);

    TestBed.runInInjectionContext(() => {
      const currentConfState = mockSandboxConfService.navConf();
      const reportStep = currentConfState.find(
        (step: any) => step.stepType === SandboxPageType.REPORT
      );
      expect(reportStep.isHidden).toBe(false);
    });
  });
});
