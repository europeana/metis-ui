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
import { RouterTestingModule } from '@angular/router/testing';

import { MockComponent, MockProvider, MockInstance } from 'ng-mocks';

import { Observable, of } from 'rxjs';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEvent, KeycloakEventType } from 'keycloak-angular';
import Keycloak from 'keycloak-js';

import { ModalConfirmComponent, ModalConfirmService } from 'shared';
import {
  MockDatasetHierarchyService,
  MockDebiasService,
  MockUploadService,
  MockUserDataService,
  mockDatasetInfo
} from '../_mocked';
import { DebiasState } from '../_models';
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
  let matomo: MatomoService;
  let debias: DebiasService;
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

  const fakeElement = ({} as unknown) as HTMLElement;

  const configureTestbed = (authorisationEvent = eventKeycloakLoggedOut): void => {
    testAuthSignal.set(authorisationEvent);

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: 'dataset/1', component: DatasetInfoComponent }]),
        DatasetInfoComponent,
        MockComponent(ModalConfirmComponent),
        MockComponent(DebiasComponent)
      ],
      providers: [
        provideZonelessChangeDetection(),
        {
          // 1. Provide the structural event signal token fallback
          provide: KEYCLOAK_EVENT_SIGNAL,
          useValue: testAuthSignal
        },
        {
          // 2. Clear keycloak client lookup errors on computed evaluation paths
          provide: Keycloak,
          useValue: {
            authenticated: authorisationEvent.type === KeycloakEventType.Ready,
            idTokenParsed: { sub: '1234' }
          }
        },
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
    matomo = TestBed.inject(MatomoService);
    debias = TestBed.inject(DebiasService);
    router = TestBed.inject(Router);
  };

  const getConfirmResult = (): Observable<boolean> => {
    const res = of(true);
    modalConfirms.add({
      open: () => res,
      close: () => undefined,
      id: (() => '1' as unknown) as InputSignal<string>,
      isShowing: signal(true)
    });
    return res;
  };

  const helperLogIn = (userId = '1234'): void => {
    const keycloakMock = TestBed.inject(Keycloak);
    keycloakMock.authenticated = true;
    keycloakMock.idTokenParsed = { sub: userId };
    testAuthSignal.set(eventKeycloakLoggedIn);
    TestBed.flushEffects();
    fixture.detectChanges();
  };

  const helperLogOut = (): void => {
    const keycloakMock = TestBed.inject(Keycloak);
    keycloakMock.authenticated = false;
    keycloakMock.idTokenParsed = undefined;
    testAuthSignal.set(eventKeycloakLoggedOut);
    TestBed.flushEffects();
    fixture.detectChanges();
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
      TestBed.flushEffects();

      component = fixture.componentInstance;
      fixture.componentRef.setInput('datasetId', '1');
      fixture.detectChanges();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.clearAllTimers();
      vi.useRealTimers();
    });

    it('should pre-authenticate', () => {
      // Inject the authentication service inside your test block
      const authService = TestBed.inject(KeycloakAuthService);

      // Verify that the reactive computed state maps cleanly under the active context
      expect(authService.isAuthenticated()).toBeTruthy();
    });

    it('should pad the children array', () => {
      expect(component.padRerunChildren([]).length).toEqual(1);
      const id = { id: '1', name: 'a' };
      const arr = [id, id, id, id, id];
      expect(component.padRerunChildren(arr).length).toEqual(6);
      expect(component.padRerunChildren([id]).length).toEqual(5);
      expect(component.padRerunChildren(arr.slice(1, 2)).length).toEqual(5);
      expect(component.padRerunChildren(arr.slice(1, 3)).length).toEqual(5);
      expect(component.padRerunChildren(arr.slice(1, 4)).length).toEqual(5);
      expect(component.padRerunChildren(arr.slice(1, 5)).length).toEqual(6);
    });

    it('should pad the related array', () => {
      expect(component.padRerunSiblings([]).length).toEqual(0);
      const id = { id: '1', name: 'a' };
      const arr = [id, id, id, id, id];
      expect(component.padRerunSiblings(arr).length).toEqual(5);
      expect(component.padRerunSiblings([id]).length).toEqual(3);
      expect(component.padRerunSiblings(arr.slice(1, 2)).length).toEqual(3);
      expect(component.padRerunSiblings(arr.slice(1, 3)).length).toEqual(4);
      expect(component.padRerunSiblings(arr.slice(1, 4)).length).toEqual(5);
      expect(component.padRerunSiblings(arr.slice(1, 5)).length).toEqual(5);
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

    it('should get the toggle rerun tooltip based on permissions and states', () => {
      // 1. Establish initial parameters using the actual datasetId input signal property
      fixture.componentRef.setInput('datasetId', '1');
      fixture.detectChanges();

      helperLogOut();
      expect(component.getToggleRerunTooltip()).toBe('can not rerun datasets that you do not own');

      helperLogIn('1234');
      expect(component.getToggleRerunTooltip()).toBe('rerun dataset 1');

      component.editable.set(true);
      expect(component.getToggleRerunTooltip()).toBe('rerun dataset 1 (cancel)');

      component.newId.set('2');
      expect(component.getToggleRerunTooltip()).toBe('close dataset details');

      component.newId.set(undefined);

      // Read current values using the read-only signal unwrap getter ()
      const currentInfo = component.datasetInfo() ?? { 'created-by-id': '1234' };

      // 2. Inject SandboxService from the active test injection context
      const sandboxService = TestBed.inject(SandboxService);

      // 3. Spy on the service to return your custom mutated payload object tree
      vi.spyOn(sandboxService, 'getDatasetInfo').mockReturnValue(
        of({
          ...currentInfo,
          isHarvested: true
        } as any)
      );

      // 4. ✅ FIXED: Re-bind using the correct input property to re-trigger the internal constructor effect loop
      fixture.componentRef.setInput('datasetId', '1_reload');

      // Flush microtask queues so your changes cascade down the testing bed layout cleanly
      TestBed.flushEffects();
      fixture.detectChanges();

      expect(component.getToggleRerunTooltip()).toBe(
        'can not rerun a dataset that was harvested from an uploaded file'
      );
    });

    /*
    it('should get the toggle rerun tooltip', () => {
      fixture.componentRef.setInput('datasetId', '1');

      helperLogOut();
      expect(component.getToggleRerunTooltip()).toBe('can not rerun datasets that you do not own');

      helperLogIn();
      expect(component.getToggleRerunTooltip()).toBe('rerun dataset 1');

      component.editable = true;
      expect(component.getToggleRerunTooltip()).toBe('rerun dataset 1 (cancel)');

      component.newId.set('2');
      expect(component.getToggleRerunTooltip()).toBe('close dataset details');

      component.newId.set(undefined);
      const currentInfo = component.datasetInfo() ?? { 'created-by-id': '1234' };
      fixture.componentRef.setInput('datasetInfo', {
        ...currentInfo,
        isHarvested: true
      });

      fixture.detectChanges();
      expect(component.getToggleRerunTooltip()).toBe(
        'can not rerun a dataset that was harvested from an uploaded file'
      );
    });
    */

    it('should track the user viewing the published records', () => {
      vi.spyOn(matomo, 'trackNavigation');
      component.trackViewPublished();
      expect(matomo.trackNavigation).toHaveBeenCalledWith(['external', 'published-records']);
    });

    it('should load the dataset info', async () => {
      fixture.componentRef.setInput('datasetId', '1');
      fixture.detectChanges();
      vi.advanceTimersByTime(1);
      fixture.detectChanges();
      expect(component.datasetInfo()).toBeTruthy();
    });

    it('should close open modals when the dataset id is set', async () => {
      fixture.componentRef.setInput('datasetId', '1');
      fixture.detectChanges();

      expect(component.modalDebias()).toBeTruthy();

      vi.spyOn(modalConfirms, 'isOpen').mockImplementation(() => true);
      vi.spyOn(component.modalDebias()!, 'close');

      fixture.componentRef.setInput('datasetId', '2');

      vi.advanceTimersByTime(1);
      fixture.detectChanges();

      expect(component.modalDebias()?.close).toHaveBeenCalled();
    });

    it('should show the modal for incomplete data', () => {
      vi.spyOn(modalConfirms, 'open').mockImplementation(getConfirmResult);
      component.showDatasetIssues(fakeElement);
      expect(modalConfirms.open).toHaveBeenCalled();
    });

    it('should show the modal for processing errors', () => {
      vi.spyOn(modalConfirms, 'open').mockImplementation(getConfirmResult);
      component.showProcessingErrors();
      expect(modalConfirms.open).toHaveBeenCalled();
    });

    it('should handle the debias callback', () => {
      fixture.componentRef.setInput('datasetId', '1');
      fixture.detectChanges();

      // 1. Build a clean operational spy instance structure
      const mockCmpInstance = { reset: vi.fn() };

      // 2. Intercept the viewChild getter function to cleanly hand back our mock object structure
      vi.spyOn(component, 'cmpDebias').mockReturnValue(mockCmpInstance as any);

      // 3. Execute the target component behavior method callback
      component.onDebiasHidden();

      // 4. Assert that the underlying operation method tracking function was dispatched natively
      expect(mockCmpInstance.reset).toHaveBeenCalled();
    });

    it('should toggle fullInfoOpen', () => {
      // FIX: Evaluated cleanly as a plain boolean primitive field
      expect(component.fullInfoOpen).toBeFalsy();
      component.toggleFullInfoOpen();
      expect(component.fullInfoOpen).toBeTruthy();
      component.toggleFullInfoOpen();
      expect(component.fullInfoOpen).toBeFalsy();
    });

    it('should run the debias report only for owners', async () => {
      const runSpy = vi.spyOn(debias, 'runDebiasReport');
      const ownerSpy = vi.spyOn(component, 'isOwner');

      ownerSpy.mockReturnValue(false);
      component.runOrShowDebiasReport(true);
      expect(runSpy).not.toHaveBeenCalled();

      ownerSpy.mockReturnValue(true);

      if (typeof component.modelDebiasInfo?.set === 'function') {
        component.modelDebiasInfo.set({ state: DebiasState.READY } as any);
      } else {
        (component as any).modelDebiasInfo = { state: DebiasState.READY };
      }

      component.runOrShowDebiasReport(true);

      await vi.advanceTimersByTimeAsync(1);
      expect(runSpy).toHaveBeenCalled();
    });
  });

  describe('(not logged-in)', () => {
    beforeEach(() => {
      configureTestbed();
      fixture = TestBed.createComponent(DatasetInfoComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('datasetId', '1');
      fixture.detectChanges();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.clearAllTimers();
      vi.useRealTimers();
    });

    it('should compute the hierarchy alignment', () => {
      fixture.componentRef.setInput('datasetId', '1');
      fixture.detectChanges();

      expect(component.hierarchyAlignment()).toEqual('align-center');

      component.hierarchyData.set({
        siblings: [{ id: '1', name: 'One' }],
        children: [],
        hasContent: false
      });
      fixture.detectChanges();
      expect(component.hierarchyAlignment()).toEqual('push-left');

      component.hierarchyData.set({
        siblings: [],
        children: [{ id: '1', name: 'One' }],
        hasContent: false
      });
      fixture.detectChanges();
      expect(component.hierarchyAlignment()).toEqual('push-right');
    });

    it('should toggle the ancestry', async () => {
      fixture.componentRef.setInput('datasetId', '1');
      fixture.detectChanges();

      expect(component.isAncestorMode()).toBeFalsy();
      component.toggleAncestorMode();
      expect(component.isAncestorMode()).toBeTruthy();

      component.toggleAncestorMode();
      fixture.detectChanges();
      expect(component.isAncestorMode()).toBeFalsy();
    });

    it('should apply the class', () => {
      let applied = false;
      const el = ({
        classList: {
          contains: () => {
            return applied;
          },
          add: vi.fn()
        }
      } as unknown) as HTMLElement;

      component.applyClass(el, 'my-class');
      expect(el.classList.add).toHaveBeenCalled();

      applied = true;
      component.applyClass(el, 'my-class');
      expect(el.classList.add).toHaveBeenCalledTimes(1);
    });
  });
});
