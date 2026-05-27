import { Location } from '@angular/common';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { SpyLocation } from '@angular/common/testing';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  InputSignal,
  provideZonelessChangeDetection,
  signal
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { MockComponent, MockInstance, MockProvider } from 'ng-mocks';

import { of } from 'rxjs';
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
import { HarvestType } from '../_models';
import {
  DatasetHierarchyService,
  DebiasService,
  KeycloakAuthService,
  MatomoService,
  SandboxService,
  UploadService,
  UserDataService
} from '../_services';
import { DebiasComponent } from '../debias';
import { DatasetInfoComponent } from '.';

describe('DatasetInfoComponent', () => {
  let component: DatasetInfoComponent;
  let fixture: ComponentFixture<DatasetInfoComponent>;
  let modalConfirms: ModalConfirmService;
  //let matomo: MatomoService;
  let router: Router;

  const eventKeycloakLoggedOut = ({
    type: KeycloakEventType.AuthLogout,
    args: false
  } as unknown) as KeycloakEvent;

  const eventKeycloakLoggedIn = {
    ...eventKeycloakLoggedOut,
    type: KeycloakEventType.Ready
  };

  const testAuthSignal = signal<KeycloakEvent>(eventKeycloakLoggedOut);

  const configureTestbed = (authorisationEvent = eventKeycloakLoggedOut): void => {
    testAuthSignal.set(authorisationEvent);

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
            authenticated: authorisationEvent.type === KeycloakEventType.Ready,
            idTokenParsed: { sub: '1234' }
          }
        },
        KeycloakAuthService,
        MockProvider(SandboxService, {
          getDatasetInfo: () => of(mockDatasetInfo)
        }),
        MockProvider(MatomoService),
        {
          provide: Location,
          useClass: SpyLocation
        },
        MockProvider(ModalConfirmService),
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

    modalConfirms = TestBed.inject(ModalConfirmService);
    //matomo = TestBed.inject(MatomoService);
    router = TestBed.inject(Router);
  };

  beforeAll(() => {
    MockInstance(DebiasComponent, () => ({
      isBusy: signal(false),
      reset: vi.fn(),
      pollDebiasReport: vi.fn()
    }));

    MockInstance(ModalConfirmComponent, () => ({
      close: vi.fn(),
      open: vi.fn().mockReturnValue(of(true))
    }));
  });

  afterAll(() => {
    MockInstance(DebiasComponent, undefined);
    MockInstance(ModalConfirmComponent, undefined);
  });

  describe('Logged-in', () => {
    beforeEach(() => {
      configureTestbed(eventKeycloakLoggedIn);
      fixture = TestBed.createComponent(DatasetInfoComponent);

      component = fixture.componentInstance;
      fixture.componentRef.setInput('datasetId', '1');

      TestBed.flushEffects();
      fixture.detectChanges();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.clearAllTimers();
      vi.useRealTimers();
      vi.restoreAllMocks();
    });

    it('should pre-authenticate', () => {
      const authService = TestBed.inject(KeycloakAuthService);
      expect(authService.isAuthenticated()).toBeTruthy();
    });

    it('should pad the children array to align with core component logic', () => {
      expect(component.padRerunChildren([]).length).toEqual(0);

      const mockRecord = { id: '1', name: 'mocked-dataset-item' };

      expect(component.padRerunChildren([mockRecord]).length).toEqual(3);
      expect(component.padRerunChildren([mockRecord, mockRecord]).length).toEqual(4);
      expect(component.padRerunChildren([mockRecord, mockRecord, mockRecord]).length).toEqual(5);

      const overflowArr = [mockRecord, mockRecord, mockRecord, mockRecord, mockRecord];
      expect(component.padRerunChildren(overflowArr).length).toEqual(6);
    });

    it('should pad the related array configurations accurately', () => {
      expect(component.padRerunSiblings([]).length).toEqual(0);

      const mockRecord = { id: '1', name: 'a' };
      const overflowArr = [mockRecord, mockRecord, mockRecord, mockRecord, mockRecord];

      expect(component.padRerunSiblings(overflowArr).length).toEqual(7);
      expect(component.padRerunSiblings([mockRecord]).length).toEqual(5);
      expect(component.padRerunSiblings(overflowArr.slice(1, 2)).length).toEqual(5);
      expect(component.padRerunSiblings(overflowArr.slice(1, 3)).length).toEqual(5);
      expect(component.padRerunSiblings(overflowArr.slice(1, 4)).length).toEqual(5);
      expect(component.padRerunSiblings(overflowArr.slice(1, 5)).length).toEqual(6);
    });

    it('should navigate', () => {
      vi.spyOn(router, 'navigate');
      component.navTo('x');
      expect(router.navigate).toHaveBeenCalled();
    });

    it('should navigate to the new item', () => {
      vi.spyOn(router, 'navigate');
      component.navToNew();
      expect(router.navigate).not.toHaveBeenCalled();
      component.newId.set('1');
      component.navToNew();
      expect(router.navigate).toHaveBeenCalled();
    });

    it('should map the country', () => {
      expect(component.mapCountry('IT')).toEqual('ITALY');
      expect(component.mapCountry('XXX')).toEqual('XXX');
    });

    it('should get the toggle rerun tooltip based on permissions and states', async () => {
      fixture.componentRef.setInput('datasetId', '1');
      TestBed.flushEffects();
      fixture.detectChanges();
      await fixture.whenStable();

      // Simulate logged out tooltip path
      const keycloakMock = TestBed.inject(Keycloak);
      keycloakMock.authenticated = false;
      keycloakMock.idTokenParsed = undefined;
      testAuthSignal.set(eventKeycloakLoggedOut);
      TestBed.flushEffects();
      fixture.detectChanges();
      expect(component.getToggleRerunTooltip()).toBe('can not rerun datasets that you do not own');

      // Simulate logged in owner path
      keycloakMock.authenticated = true;
      keycloakMock.idTokenParsed = { sub: '1234' };
      testAuthSignal.set(eventKeycloakLoggedIn);
      TestBed.flushEffects();
      fixture.detectChanges();
      expect(component.getToggleRerunTooltip()).toBe('rerun dataset 1');

      component.editable.set(true);
      fixture.detectChanges();
      expect(component.getToggleRerunTooltip()).toBe('rerun dataset 1 (cancel)');

      component.newId.set('2');
      fixture.detectChanges();
      expect(component.getToggleRerunTooltip()).toBe('close dataset details');

      component.newId.set(undefined);
      component.editable.set(false);

      // 🚀 FIXED: Ensure the logged-in identity remains authenticated before triggering the new resource fetch!
      keycloakMock.authenticated = true;
      keycloakMock.idTokenParsed = { sub: '1234' };
      testAuthSignal.set(eventKeycloakLoggedIn);

      const sandboxService = TestBed.inject(SandboxService);
      vi.spyOn(sandboxService, 'getDatasetInfo').mockReturnValue(
        of({
          'created-by-id': '1234',
          'harvesting-parameters': { 'harvest-protocol': HarvestType.FILE }
        } as any)
      );

      fixture.componentRef.setInput('datasetId', 'file-harvest-triggered');
      TestBed.flushEffects();
      fixture.detectChanges();

      expect(component.getToggleRerunTooltip()).toBe(
        'can not rerun a dataset that was harvested from an uploaded file'
      );
    });

    it('should close open modals when the dataset id is set', async () => {
      fixture.componentRef.setInput('datasetId', '1');
      fixture.detectChanges();

      const mockModalInstance = { close: vi.fn() };

      // 🚀 FIXED: Return a real callable function wrapper matching standard viewChild Signal execution rules
      Object.defineProperty(component, 'modalDebias', {
        get: () => () => mockModalInstance,
        configurable: true
      });

      vi.spyOn(modalConfirms, 'isOpen').mockImplementation(() => true);

      fixture.componentRef.setInput('datasetId', '2');

      vi.advanceTimersByTime(1);
      TestBed.flushEffects();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(mockModalInstance.close).toHaveBeenCalled();
    });

    it('should show the modal for incomplete data', () => {
      const mockConfirm = of(true);
      modalConfirms.add({
        open: () => mockConfirm,
        close: () => undefined,
        id: (() => '1' as unknown) as InputSignal<string>,
        isShowing: signal(true)
      });
      vi.spyOn(modalConfirms, 'open').mockReturnValue(mockConfirm);
      const mockElement = {} as HTMLElement;
      component.showDatasetIssues(mockElement);
      expect(modalConfirms.open).toHaveBeenCalled();
    });

    it('should show the modal for processing errors', () => {
      const mockConfirm = of(true);
      modalConfirms.add({
        open: () => mockConfirm,
        close: () => undefined,
        id: (() => '1' as unknown) as InputSignal<string>,
        isShowing: signal(true)
      });
      vi.spyOn(modalConfirms, 'open').mockReturnValue(mockConfirm);
      component.showProcessingErrors();
      expect(modalConfirms.open).toHaveBeenCalled();
    });

    it('should handle the debias callback', () => {
      fixture.componentRef.setInput('datasetId', '1');
      TestBed.flushEffects();
      fixture.detectChanges();

      const mockCmpInstance = { reset: vi.fn() };
      vi.spyOn(component, 'cmpDebias').mockReturnValue(mockCmpInstance as any);

      component.onDebiasHidden();
      expect(mockCmpInstance.reset).toHaveBeenCalled();
    });

    it('should toggle fullInfoOpen', () => {
      expect(component.fullInfoOpen).toBeFalsy();
      component.toggleFullInfoOpen();
      expect(component.fullInfoOpen).toBeTruthy();
      component.toggleFullInfoOpen();
      expect(component.fullInfoOpen).toBeFalsy();
    });

    it('should run the debias report only for owners', () => {
      const debiasService = TestBed.inject(DebiasService);
      const runSpy = vi.spyOn(debiasService, 'runDebiasReport');
      const ownerSpy = vi.spyOn(component, 'isOwner');

      ownerSpy.mockReturnValue(false);
      component.runOrShowDebiasReport(true);
      expect(runSpy).not.toHaveBeenCalled();

      ownerSpy.mockReturnValue(true);
      component.modelDebiasInfo.set({ state: 'READY' } as any);

      component.runOrShowDebiasReport(true);

      vi.advanceTimersByTime(1);
      TestBed.flushEffects();
      fixture.detectChanges();

      expect(runSpy).toHaveBeenCalled();
    });
  });

  describe('(not logged-in)', () => {
    beforeEach(() => {
      configureTestbed();
      fixture = TestBed.createComponent(DatasetInfoComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('datasetId', '1');

      TestBed.flushEffects();
      fixture.detectChanges();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.clearAllTimers();
      vi.useRealTimers();
    });

    it('should apply the class', () => {
      let applied = false;
      const el = ({
        classList: {
          contains: () => applied,
          add: vi.fn()
        }
      } as unknown) as HTMLElement;

      component.applyClass(el, 'my-class');
      expect(el.classList.add).toHaveBeenCalled();
    });
  });
});
