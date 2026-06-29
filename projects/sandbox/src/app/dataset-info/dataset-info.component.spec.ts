import { Location } from '@angular/common';
import { HttpErrorResponse, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { SpyLocation } from '@angular/common/testing';
import { CUSTOM_ELEMENTS_SCHEMA, provideZonelessChangeDetection, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { MockComponent, MockInstance, MockProvider } from 'ng-mocks';

import { of, throwError } from 'rxjs';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEvent, KeycloakEventType } from 'keycloak-angular';
import Keycloak from 'keycloak-js';

import { ModalConfirmComponent, ModalConfirmService } from 'shared';
import {
  MockDatasetHierarchyService,
  mockDatasetInfo,
  MockDebiasService,
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
import { DatasetStatus, DebiasState, ItemDescriptor } from '../_models';

describe('DatasetInfoComponent - Complete Test Suite', () => {
  let component: DatasetInfoComponent;
  let fixture: ComponentFixture<DatasetInfoComponent>;
  let router: Router;
  let uploadService: UploadService;
  let sandboxConfService: SandboxConfService;

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
        MockProvider(MatomoService),
        MockProvider(SandboxConfService, {
          setAncestorAlignment: vi.fn(),
          toggleAncestorMode: vi.fn()
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
        {
          provide: DebiasService,
          useClass: MockDebiasService
        },
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
});
