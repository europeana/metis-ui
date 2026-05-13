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

import { mockedKeycloak, ModalConfirmComponent, ModalConfirmService } from 'shared';
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
  MatomoService,
  SandboxService,
  UploadService,
  UserDataService
} from '../_services';
import { DebiasComponent } from '../debias';
import { DatasetInfoComponent } from '.';
import { describe, it, expect, vi, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

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

  const fakeElement = ({} as unknown) as HTMLElement;

  const configureTestbed = (authorisationEvent = eventKeycloakLoggedOut): void => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([{ path: 'dataset/1', component: DatasetInfoComponent }]),
        DatasetInfoComponent,
        MockComponent(ModalConfirmComponent),
        MockComponent(DebiasComponent)
      ],
      providers: [
        provideZonelessChangeDetection(),
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
          provide: Keycloak,
          useValue: mockedKeycloak
        },
        {
          provide: KEYCLOAK_EVENT_SIGNAL,
          useValue: signal(authorisationEvent)
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
      fixture.detectChanges();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.clearAllTimers();
      vi.useRealTimers();
    });

    it('should pre-authenticate', () => {
      expect(component.keycloakSignal()).toBeTruthy();
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

    it('should get the toggle rerun tooltip', () => {
      fixture.componentRef.setInput('datasetId', '1');

      component.keycloak.idTokenParsed = { sub: 'wrong-user' };
      expect(component.getToggleRerunTooltip()).toBe('can not rerun datasets that you do not own');

      component.keycloak.idTokenParsed = { sub: '1234' };
      fixture.detectChanges();
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
      const mockCmpInstance = component.cmpDebias();
      expect(mockCmpInstance).toBeTruthy();

      component.onDebiasHidden();
      expect(mockCmpInstance?.reset).toHaveBeenCalled();
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

    it('should create', () => {
      const sandboxService = TestBed.inject(SandboxService);
      vi.spyOn(sandboxService, 'getDatasetInfo').mockReturnValue(of(undefined) as any);

      fixture.componentRef.setInput('datasetId', '1');
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.datasetInfo()).toBeFalsy();
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

    it('should remove the class', async () => {
      let applied = false;
      const el = ({
        classList: {
          contains: () => {
            return applied;
          },
          remove: vi.fn()
        }
      } as unknown) as HTMLElement;

      component.removeClass(el, 'my-class');
      fixture.detectChanges();

      expect(el.classList.remove).not.toHaveBeenCalled();

      applied = true;
      component.removeClass(el, 'my-class');
      fixture.detectChanges();

      expect(el.classList.remove).toHaveBeenCalled();
    });
  });
});
