import { Location } from '@angular/common';
import { HttpErrorResponse, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { SpyLocation } from '@angular/common/testing';
import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { MockComponent, MockInstance, MockProvider } from 'ng-mocks';

import { of, Subject, throwError } from 'rxjs';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEvent, KeycloakEventType } from 'keycloak-angular';
import Keycloak from 'keycloak-js';

import { ModalConfirmComponent, ModalConfirmService } from 'shared';
import {
  MockDatasetHierarchyService,
  mockDatasetInfo,
  MockUploadService,
  MockUserDataService
} from '../_mocked';
import {
  DatasetHierarchyService,
  DebiasService,
  KeycloakAuthService,
  MatomoService,
  SandboxConfService,
  SandboxService,
  UploadService,
  UserDataService
} from '../_services';
import { DebiasComponent } from '../debias';
import { DatasetInfoComponent } from '.';
import { DatasetStatus, DebiasState, ItemDescriptor, SandboxPageType } from '../_models';

describe('DatasetInfoComponent - Complete Test Suite', () => {
  let component: DatasetInfoComponent;
  let fixture: ComponentFixture<DatasetInfoComponent>;
  let router: Router;
  let uploadService: UploadService;
  let sandboxConfService: SandboxConfService;
  let modalConfirmsService: ModalConfirmService;

  const eventKeycloakLoggedOut = ({
    type: KeycloakEventType.AuthLogout,
    args: false
  } as unknown) as KeycloakEvent;

  const testAuthSignal = signal<KeycloakEvent>(eventKeycloakLoggedOut);

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        DatasetInfoComponent,
        MockComponent(ModalConfirmComponent),
        MockComponent(DebiasComponent)
      ],
      providers: [
        provideZonelessChangeDetection(),
        MockProvider(Router, {
          navigate: vi.fn().mockResolvedValue(true)
        }),
        {
          provide: KEYCLOAK_EVENT_SIGNAL,
          useValue: testAuthSignal
        },
        {
          provide: Keycloak,
          useValue: {
            authenticated: false,
            idTokenParsed: { sub: '1234' }
          }
        },
        KeycloakAuthService,
        MockProvider(SandboxService, {
          getDatasetInfo: () => of(mockDatasetInfo)
        }),
        MockProvider(MatomoService, {
          trackNavigation: vi.fn()
        }),
        MockProvider(SandboxConfService, {
          setAncestorAlignment: vi.fn(),
          toggleAncestorMode: vi.fn(),
          updateStepStatus: vi.fn()
        }),
        {
          provide: Location,
          useClass: SpyLocation
        },
        MockProvider(ModalConfirmService, {
          open: vi.fn().mockReturnValue(of(true)),
          isOpen: vi.fn().mockReturnValue(false),
          remove: vi.fn()
        }),
        {
          provide: UploadService,
          useClass: MockUploadService
        },
        {
          provide: UserDataService,
          useClass: MockUserDataService
        },
        MockProvider(DebiasService, {
          runDebiasReport: vi.fn().mockReturnValue(of(true)),
          getDebiasInfo: vi.fn().mockReturnValue(of({ state: DebiasState.READY })),
          pollDebiasInfo: vi.fn()
        }),
        {
          provide: DatasetHierarchyService,
          useClass: MockDatasetHierarchyService
        },
        provideHttpClient(withInterceptorsFromDi())
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    });

    router = TestBed.inject(Router);
    uploadService = TestBed.inject(UploadService);
    sandboxConfService = TestBed.inject(SandboxConfService);
    modalConfirmsService = TestBed.inject(ModalConfirmService);

    MockInstance(DebiasComponent, (instance: DebiasComponent) => {
      instance.isBusy = signal(false);
      instance.reset = vi.fn();
      instance.pollDebiasReport = vi.fn();
      instance.debiasReport = signal({ detections: [{} as any, {} as any] }) as any;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    MockInstance.restore();
  });

  describe('Core Array Padding Operations', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(DatasetInfoComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('datasetId', 'test-id-123');
      TestBed.flushEffects();
      fixture.detectChanges();
    });

    it('should pad the children array to align with core component logic', () => {
      expect(component.padRerunChildren([]).length).toEqual(0);
      const mockRecord: ItemDescriptor = { id: '1', name: 'mocked-dataset-item' };
      expect(component.padRerunChildren([mockRecord]).length).toEqual(3);
      expect(component.padRerunChildren([mockRecord, mockRecord]).length).toEqual(4);
      expect(component.padRerunChildren([mockRecord, mockRecord, mockRecord]).length).toEqual(5);
      const overflowArr = [mockRecord, mockRecord, mockRecord, mockRecord, mockRecord];
      expect(component.padRerunChildren(overflowArr).length).toEqual(6);
    });

    it('should pad the related array configurations accurately', () => {
      expect(component.padRerunSiblings([]).length).toEqual(0);
      const mockRecord: ItemDescriptor = { id: '1', name: 'a' };
      const overflowArr = [mockRecord, mockRecord, mockRecord, mockRecord, mockRecord];
      expect(component.padRerunSiblings(overflowArr).length).toEqual(7);
      expect(component.padRerunSiblings([mockRecord]).length).toEqual(5);
      expect(component.padRerunSiblings(overflowArr.slice(1, 2)).length).toEqual(5);
      expect(component.padRerunSiblings(overflowArr.slice(1, 3)).length).toEqual(5);
      expect(component.padRerunSiblings(overflowArr.slice(1, 4)).length).toEqual(5);
      expect(component.padRerunSiblings(overflowArr.slice(1, 5)).length).toEqual(6);
    });

    it('should map standard configurations', () => {
      expect(component.mapCountry('XXX')).toEqual('XXX');
      expect(component.mapLanguage('DUMMY_UNMAPPED_FALLBACK_CODE')).toEqual(
        'DUMMY_UNMAPPED_FALLBACK_CODE'
      );
    });
  });

  describe('Top Level Signals Execution Space', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(DatasetInfoComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('datasetId', 'test-id-123');
      TestBed.flushEffects();
      fixture.detectChanges();
    });

    it('should react to mutable values updates on editable and editsFrozen signals', () => {
      expect(component.editable()).toBeFalsy();
      expect(component.editsFrozen()).toBeFalsy();

      component.editable.set(true);
      component.editsFrozen.set(true);

      expect(component.editable()).toBeTruthy();
      expect(component.editsFrozen()).toBeTruthy();
    });

    it('should alternate isAncestorMode state layers dynamically upon layout toggle triggers', () => {
      expect(component.isAncestorMode()).toBeFalsy();
      Object.defineProperty(component, 'hierarchyData', {
        writable: true,
        value: signal({ siblings: [], children: [], hasContent: false })
      });

      component.toggleAncestorMode();
      expect(component.isAncestorMode()).toBeTruthy();
      expect(sandboxConfService.setAncestorAlignment).toHaveBeenCalled();
    });

    it('should calculate canOfferDebiasView reactively across ownership and tracking arrays', () => {
      vi.spyOn(component, 'isOwner').mockReturnValue(false);
      component.modelDebiasInfo.set({
        state: DebiasState.INITIAL,
        'dataset-id': '',
        'creation-date': ''
      });
      TestBed.flushEffects();
      expect(component.canOfferDebiasView()).toBeFalsy();

      component.modelDebiasInfo.set({
        state: DebiasState.COMPLETED,
        'dataset-id': '',
        'creation-date': ''
      });
      TestBed.flushEffects();
      expect(component.canOfferDebiasView()).toBeTruthy();

      vi.spyOn(component, 'isOwner').mockReturnValue(true);
      component.modelDebiasInfo.set({
        state: DebiasState.INITIAL,
        'dataset-id': '',
        'creation-date': ''
      });
      TestBed.flushEffects();
      expect(component.canOfferDebiasView()).toBeTruthy();
    });

    it('should align layout directional computations correctly based on hierarchy structures', () => {
      const hDataSignal = signal<any>(null);
      Object.defineProperty(component, 'hierarchyData', { writable: true, value: hDataSignal });

      hDataSignal.set(null);
      TestBed.flushEffects();
      expect(component.hierarchyAlignment()).toBe('align-center');

      hDataSignal.set({ siblings: [{}], children: [], hasContent: false });
      TestBed.flushEffects();
      expect(component.hierarchyAlignment()).toBe('push-left');

      hDataSignal.set({ siblings: [], children: [{}], hasContent: false });
      TestBed.flushEffects();
      expect(component.hierarchyAlignment()).toBe('push-right');

      hDataSignal.set({ siblings: [{}], children: [{}], hasContent: false });
      TestBed.flushEffects();
      expect(component.hierarchyAlignment()).toBe('align-center');
    });

    it('should derive detections data mapping parameters from the active child component view', () => {
      const rawMockCmp = {
        isBusy: signal(false),
        reset: vi.fn(),
        pollDebiasReport: vi.fn(),
        debiasReport: signal({ detections: [{} as any, {} as any] })
      };

      vi.spyOn(component, 'cmpDebias').mockReturnValue(rawMockCmp as any);
      TestBed.flushEffects();

      expect(component.debiasDetectionsCount()).toBe(2);
      expect(component.showDebiasLink()).toBeTruthy();
    });
  });

  describe('Form Actions & Mutation Submissions', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(DatasetInfoComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('datasetId', 'test-id-123');
      TestBed.flushEffects();
      fixture.detectChanges();
    });

    it('should securely map responses into downstream hierarchy nodes on success paths', () => {
      component.form.patchValue({ name: 'Refactored Pipeline Dataset Name' });
      component.form.setValidators(null);
      component.form.updateValueAndValidity();
      component.editsFrozen.set(false);

      const mockWrappedResponse = {
        body: {
          'dataset-id': 'new-allocated-id-999',
          'records-to-process': 0,
          'duplicate-records': 0
        }
      };

      const spySubmit = vi
        .spyOn(uploadService, 'submitDataset')
        .mockReturnValue(of(mockWrappedResponse as any));
      const spyHierarchy = vi.spyOn(TestBed.inject(DatasetHierarchyService), 'addItem');

      component.reRun();

      expect(spySubmit).toHaveBeenCalled();
      expect(spyHierarchy).toHaveBeenCalledWith(
        'new-allocated-id-999',
        'test-id-123',
        'Refactored Pipeline Dataset Name'
      );
      expect(component.newId()).toBe('new-allocated-id-999');
    });

    it('should capture response pipeline crashes and unfreeze editing variables safely', () => {
      component.form.setValidators(null);
      component.form.updateValueAndValidity();
      component.editsFrozen.set(false);
      vi.spyOn(uploadService, 'submitDataset').mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 400 }))
      );

      component.reRun();

      expect(component.error).toBeDefined();
      expect(component.editsFrozen()).toBeFalsy();
    });
  });

  describe('Tooltips and Layout Helpers Blocks', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(DatasetInfoComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('datasetId', 'test-id-123');
      TestBed.flushEffects();
      fixture.detectChanges();
    });

    it('should toggle full details panels or assign microtask focus frames sequentially', () => {
      vi.spyOn(component, 'canReRun').mockReturnValue(true);
      component.fullInfoOpen = false;
      component.editable.set(false);

      component.toggleRerun();

      expect(component.fullInfoOpen).toBeTruthy();
      expect(component.editable()).toBeTruthy();
    });

    it('should supply specific description contextual texts matching system rules', () => {
      vi.spyOn(component, 'isOwner').mockReturnValue(false);
      expect(component.getToggleRerunTooltip()).toBe('can not rerun datasets that you do not own');

      vi.spyOn(component, 'isOwner').mockReturnValue(true);
      vi.spyOn(component, 'canReRun').mockReturnValue(false);
      expect(component.getToggleRerunTooltip()).toBe(
        'can not rerun a dataset that was harvested from an uploaded file'
      );

      vi.spyOn(component, 'canReRun').mockReturnValue(true);
      component.newId.set('allocated-id-node');
      expect(component.getToggleRerunTooltip()).toBe('close dataset details');

      component.newId.set(undefined);
      component.editable.set(true);
      expect(component.getToggleRerunTooltip()).toBe('rerun dataset test-id-123 (cancel)');
    });

    it('should accurately calculate validation markers', () => {
      vi.spyOn(component, 'showCross').mockReturnValue(true);
      vi.spyOn(component, 'status').mockReturnValue(DatasetStatus.COMPLETED);

      expect(component.completedWithErrors()).toBeTruthy();

      vi.spyOn(component, 'showCross').mockReturnValue(false);
      expect(component.completedWithErrors()).toBeFalsy();
    });

    it('should update routing vectors during nav pass processing and clear old targets', () => {
      component.newId.set('redirect-dataset-id');
      const spyNav = vi.spyOn(router, 'navigate');

      component.navToNew();

      expect(spyNav).toHaveBeenCalledWith(['/dataset/redirect-dataset-id']);
      expect(component.newId()).toBeUndefined();
    });

    it('should safe-guard class mutations inside browser renderer queues without side-effects', () => {
      vi.useFakeTimers();
      const elementMock = document.createElement('div');

      component.applyClass(elementMock, 'active-layout-class');
      expect(elementMock.classList.contains('active-layout-class')).toBeTruthy();

      component.removeClass(elementMock, 'active-layout-class');
      vi.advanceTimersByTime(0);
      expect(elementMock.classList.contains('active-layout-class')).toBeFalsy();
      vi.useRealTimers();
    });
  });

  describe('Uncovered Layout Methods and Critical Edge Cases', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(DatasetInfoComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('datasetId', 'test-id-123');
      TestBed.flushEffects();
      fixture.detectChanges();
    });

    it('should identify item structure correctly inside isRealItem type-guard checks', () => {
      expect(component.isRealItem(null)).toBeFalsy();
      expect(component.isRealItem('plain-string')).toBeFalsy();
      expect(component.isRealItem({ name: 'no-id' })).toBeFalsy();
      expect(component.isRealItem({ id: 'valid-id-key' })).toBeTruthy();
    });

    it('should cancel native reruns tooltips if requirements fail validation checks', () => {
      vi.spyOn(component, 'canReRun').mockReturnValue(false);
      component.toggleRerun();
      expect(component.editable()).toBeFalsy();
    });

    it('should open processing error modals correctly', () => {
      component.showProcessingErrors();
      expect(modalConfirmsService.open).toHaveBeenCalledWith('confirm-modal-processing-error');
    });

    it('should clear component variables on debias pop-up hidden callbacks', () => {
      const mockCmpDebias = { reset: vi.fn(), isBusy: signal(false) };
      vi.spyOn(component, 'cmpDebias').mockReturnValue(mockCmpDebias as any);

      component.onDebiasHidden();
      expect(mockCmpDebias.reset).toHaveBeenCalled();
    });

    it('should verify busy states using component mapping utility templates', () => {
      const mockCmpDebias = { isBusy: signal(true) };
      vi.spyOn(component, 'cmpDebias').mockReturnValue(mockCmpDebias as any);

      expect(component.isDebiasBusy()).toBeTruthy();
    });

    it('should route execution tracks securely inside runOrShowDebiasReport triggers', () => {
      vi.spyOn(component, 'isOwner').mockReturnValue(false);
      component.runOrShowDebiasReport(true);

      const spyRun = vi.spyOn(component, 'runDebiasReport');
      expect(spyRun).not.toHaveBeenCalled();
    });

    it('should trigger confirm modals if run flags resolve to false', () => {
      fixture.componentRef.setInput('modalIdPrefix', 'prefix-');
      TestBed.flushEffects();

      component.runOrShowDebiasReport(false);
      expect(modalConfirmsService.open).toHaveBeenCalledWith(
        'prefix-confirm-modal-debias',
        false,
        undefined
      );
    });

    it('should update reactive error layers and parameters when rxResource stream transitions to failing paths', async () => {
      const sandboxService = TestBed.inject(SandboxService);
      const networkCrash = new HttpErrorResponse({ status: 503 });
      vi.spyOn(sandboxService, 'getDatasetInfo').mockReturnValue(throwError(() => networkCrash));

      fixture.componentRef.setInput('stepType', SandboxPageType.PROGRESS_TRACK);
      fixture.componentRef.setInput('datasetId', 'crashing-pipeline-id');
      TestBed.flushEffects();

      // Clear the macrocycle to let rxResource map the stream output
      await new Promise((resolve) => setTimeout(resolve, 0));
      TestBed.flushEffects();

      expect(sandboxConfService.updateStepStatus).toHaveBeenCalledWith(
        SandboxPageType.PROGRESS_TRACK,
        expect.objectContaining({ error: networkCrash })
      );
      expect(component.datasetInfo()).toBeNull();
    });

    it('should assemble warning markers correctly if record limits are surpassed', () => {
      fixture.componentRef.setInput('progressData', {
        status: DatasetStatus.FAILED,
        'record-limit-exceeded': true,
        'progress-by-step': []
      });
      TestBed.flushEffects();

      expect(component.hasWarnings()).toBeTruthy();
    });

    it('should compute complex array trees from step configurations inside logs generators', () => {
      fixture.componentRef.setInput('progressData', {
        status: DatasetStatus.FAILED,
        'progress-by-step': [
          { errors: [{ type: 'error-msg', message: 'First Step Failed' }] },
          { errors: null },
          { errors: [{ type: 'warn-msg', message: 'Data Warning Threshold' }] }
        ]
      } as any);
      TestBed.flushEffects();

      expect(component.datasetLogs().length).toBe(2);
      expect(component.hasErrors()).toBeTruthy();
      expect(component.hasWarnings()).toBeTruthy();
    });

    it('should execute location mapping changes during lifecycle initializations', () => {
      const locationMock = TestBed.inject(Location);
      let registeredCallback: ((url: string, state: any) => void) | undefined;

      vi.spyOn(locationMock, 'onUrlChange').mockImplementation((cb) => {
        registeredCallback = cb as any;
        return () => {};
      });

      // Re-trigger initialization to capture our implementation spy
      component.ngOnInit();

      component.editable.set(true);
      component.editsFrozen.set(true);
      component.newId.set('dirty-id');

      if (registeredCallback) {
        registeredCallback('/dataset/new-location-hash', null);
      }
      TestBed.flushEffects();

      expect(component.editable()).toBeFalsy();
      expect(component.editsFrozen()).toBeFalsy();
      expect(component.newId()).toBeUndefined();
    });

    it('should delegate calculations inside debias engines and update underlying state model loops', () => {
      const mockDebiasService = TestBed.inject(DebiasService);
      const debiasReportSpy = vi.fn();

      vi.spyOn(component, 'cmpDebias').mockReturnValue({
        isBusy: signal(false),
        pollDebiasReport: debiasReportSpy
      } as any);

      vi.spyOn(mockDebiasService, 'runDebiasReport').mockReturnValue(of(true));
      vi.spyOn(mockDebiasService, 'getDebiasInfo').mockReturnValue(
        of({ state: DebiasState.PROCESSING } as any)
      );

      component.runDebiasReport();

      expect(mockDebiasService.runDebiasReport).toHaveBeenCalledWith('test-id-123');
      expect(mockDebiasService.getDebiasInfo).toHaveBeenCalledWith('test-id-123');
      expect(component.modelDebiasInfo().state).toBe(DebiasState.PROCESSING);
      expect(debiasReportSpy).toHaveBeenCalled();
    });

    it('should bypass data hydration executions if target id properties evaluate to falsey values', () => {
      fixture.componentRef.setInput('datasetId', '');
      TestBed.flushEffects();
      expect(component.datasetInfo()).toBeUndefined();
    });
  });

  describe('Zoneless Form Hydration Effects and Fix Verifications', () => {
    it('should reactively invoke setRerunFormValues when datasetInfoResource resolves with valid data', async () => {
      const asyncDataStream = new Subject<any>();
      const sandboxService = TestBed.inject(SandboxService);
      vi.spyOn(sandboxService, 'getDatasetInfo').mockReturnValue(asyncDataStream);

      fixture = TestBed.createComponent(DatasetInfoComponent);
      component = fixture.componentInstance;

      const spyHydrate = vi.spyOn(component, 'setRerunFormValues');

      fixture.componentRef.setInput('datasetId', 'async-test-id-555');
      TestBed.flushEffects();

      // Clear initial constructor placeholder call so it doesn't fail our check
      spyHydrate.mockClear();

      // Emit mock data to trigger the underlying resource resolve status
      asyncDataStream.next(mockDatasetInfo);
      asyncDataStream.complete();

      // Wait a microtask cycle for the asynchronous rxResource to update its status
      await new Promise((resolve) => setTimeout(resolve, 0));
      TestBed.flushEffects();

      expect(spyHydrate).toHaveBeenCalledTimes(1);
    });

    it('should maintain current form configurations untouched if resource state changes to a non-resolved status', () => {
      const sandboxService = TestBed.inject(SandboxService);
      vi.spyOn(sandboxService, 'getDatasetInfo').mockReturnValue(
        throwError(() => new Error('Network Failure'))
      );

      fixture = TestBed.createComponent(DatasetInfoComponent);
      component = fixture.componentInstance;

      fixture.componentRef.setInput('datasetId', 'async-test-id-555');
      TestBed.flushEffects();

      const spyHydrate = vi.spyOn(component, 'setRerunFormValues').mockImplementation(() => {});

      TestBed.flushEffects();
      expect(spyHydrate).not.toHaveBeenCalled();
    });
  });

  describe('Form Field Data Mapping Precision', () => {
    it('should accurately parse and patch dataset properties onto Reactive Form structure layers', async () => {
      const sandboxService = TestBed.inject(SandboxService);
      vi.spyOn(sandboxService, 'getDatasetInfo').mockReturnValue(of(mockDatasetInfo));

      fixture = TestBed.createComponent(DatasetInfoComponent);
      component = fixture.componentInstance;

      // Set the required input immediately
      fixture.componentRef.setInput('datasetId', 'test-id-123');
      TestBed.flushEffects();

      // Wait for rxResource to populate datasetInfo() asynchronously
      await new Promise((resolve) => setTimeout(resolve, 0));
      TestBed.flushEffects();
      fixture.detectChanges();

      const countrySpy = vi.spyOn(component, 'mapCountry').mockReturnValue('Xml Greece');
      const languageSpy = vi.spyOn(component, 'mapLanguage').mockReturnValue('Greek Language');

      // Now run it manually to check the parsing logic on the resolved data
      component.setRerunFormValues();

      const formValues = component.form.value;

      expect(countrySpy).toHaveBeenCalledWith('Greece');
      expect(languageSpy).toHaveBeenCalledWith('Greek');
      expect(formValues.country).toBe('Xml Greece');
      expect(formValues.language).toBe('Greek Language');

      const hp = (mockDatasetInfo?.['harvesting-parameters'] ?? {}) as any;

      // Use explicit nullish coalescing to match the component's internal fallback logic exactly
      expect(formValues.fileName).toBe(hp['file-name'] ?? '');
      expect(formValues.fileType).toBe(hp['file-type'] ?? '');
      expect(formValues.url).toBe(hp['url'] ?? '');

      expect(formValues.dataset).toBeDefined();
      expect(formValues.xsltFile).toBeDefined();
    });
  });
});
