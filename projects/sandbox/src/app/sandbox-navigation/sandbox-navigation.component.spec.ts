import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SandboxNavigatonComponent } from './sandbox-navigation.component';
import { SandboxConfService } from '../_services/sandbox-conf.service';
import { SandboxService, MatomoService } from '../_services';
import { ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { BehaviorSubject, of } from 'rxjs';
import { signal, Component, Input, Output, EventEmitter } from '@angular/core';
import { SandboxPage, SandboxPageType, FixedLengthArray, DatasetStatus } from '../_models';
import { ReactiveFormsModule } from '@angular/forms';
import { KeycloakService } from 'keycloak-angular';

// 1. Mock Navigation Orbs Child Component Stub to bypass template checking limits
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

  // Reactive Testing Mock Primitive Streams
  let mockParams$: BehaviorSubject<Params>;
  let mockQueryParams$: BehaviorSubject<Params>;
  let mockNavConfSignal: any;

  // Spies & Service Stubs
  let mockSandboxConfService: any;
  let mockSandboxService: any;
  let mockMatomoService: any;
  let mockLocation: any;
  let mockKeycloak: any;

  // In-Memory Configuration data snapshot footprint mapping
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

    // In-Memory configuration initialized via a true writable Signal context mapping
    mockNavConfSignal = signal(mockInitialConf);

    // Mock Service implementations tracking immutable status adjustments
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

    mockKeycloak = {
      authenticated: false,
      login: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, SandboxNavigatonComponent, MockNavigationOrbsComponent],
      providers: [
        { provide: SandboxConfService, useValue: mockSandboxConfService },
        { provide: SandboxService, useValue: mockSandboxService },
        { provide: MatomoService, useValue: mockMatomoService },
        { provide: Location, useValue: mockLocation },
        { provide: KeycloakService, useValue: mockKeycloak },
        {
          provide: ActivatedRoute,
          useValue: {
            params: mockParams$.asObservable(),
            queryParams: mockQueryParams$.asObservable()
          }
        }
      ]
    })
      // Isolate component graph layers to verify layout variables in isolation
      .overrideComponent(SandboxNavigatonComponent, {
        remove: { imports: [] },
        add: { imports: [MockNavigationOrbsComponent] }
      })
      .compileComponents();

    fixture = TestBed.createComponent(SandboxNavigatonComponent);
    component = fixture.componentInstance;
  });

  it('should initialize cleanly with default HOME parameters', fakeAsync(() => {
    fixture.detectChanges();
    tick(); // Flushes out the initial queueMicrotask template paths loops

    expect(component).toBeTruthy();
    expect(component.currentStepType()).toBe(SandboxPageType.HOME);
    expect(component.currentStepIndex()).toBe(0);
  }));

  it('should navigate straight to Record Report when landing on deep links', fakeAsync(() => {
    // Arrange: Simulate parameter snapshot: /dataset/90?recordId=2
    mockLocation.path.mockReturnValue('/dataset/90');
    mockParams$.next({ id: '90' });
    mockQueryParams$.next({ recordId: '2' });

    // Act
    fixture.detectChanges();
    tick(); // Clears internal microtask routing boundaries
    tick(0); // Clears internal manual zero-delay click timeout wrappers cleanly

    // Assert: Deep-linking precedence detector skips progress track to load report directly
    expect(component.trackDatasetId()).toBe('90');
    expect(component.trackRecordId()).toBe('2');
    expect(component.currentStepType()).toBe(SandboxPageType.REPORT);

    // Confirms visibility updates mapped through your in-memory service signal channel
    expect(mockSandboxConfService.updateStepStatus).toHaveBeenCalledWith(SandboxPageType.REPORT, {
      isHidden: false
    });
  }));

  it('should activate Problems Dataset layout when view=problems query param matches', fakeAsync(() => {
    mockLocation.path.mockReturnValue('/dataset/90');
    mockParams$.next({ id: '90' });
    mockQueryParams$.next({ view: 'problems' });

    fixture.detectChanges();
    tick();
    tick(0);

    expect(component.currentStepType()).toBe(SandboxPageType.PROBLEMS_DATASET);
    expect(
      mockSandboxConfService.updateStepStatus
    ).toHaveBeenCalledWith(SandboxPageType.PROBLEMS_DATASET, { isHidden: false });
  }));

  it('should maintain the active deep-linked page selection when data updates land', fakeAsync(() => {
    mockLocation.path.mockReturnValue('/dataset/90');
    mockParams$.next({ id: '90' });
    mockQueryParams$.next({ recordId: '2' });

    fixture.detectChanges();
    tick();
    tick(0);

    // Verify background tracking operations didn't overwrite the active display view
    expect(component.currentStepType()).toBe(SandboxPageType.REPORT);

    // Confirm the configuration service array values updated correctly
    const currentConfState = mockSandboxConfService.navConf();
    const reportStep = currentConfState.find(
      (step: any) => step.stepType === SandboxPageType.REPORT
    );
    expect(reportStep.isHidden).toBe(false);
  }));
});
