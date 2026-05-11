import { Location } from '@angular/common';
import { HttpErrorResponse, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { SpyLocation } from '@angular/common/testing';
import { CUSTOM_ELEMENTS_SCHEMA, InputSignal, signal } from '@angular/core';
import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, of, throwError } from 'rxjs';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEvent, KeycloakEventType } from 'keycloak-angular';
import Keycloak from 'keycloak-js';

import { mockedKeycloak, MockModalConfirmService, ModalConfirmService } from 'shared';
import {
  MockDatasetHierarchyService,
  MockDebiasComponent,
  MockDebiasService,
  mockedMatomoService,
  MockSandboxService,
  MockUploadService,
  MockUserDataService
} from '../_mocked';
import { DatasetStatus, DebiasInfo, DebiasState } from '../_models';
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

describe('DatasetInfoComponent', () => {
  let component: DatasetInfoComponent;
  let fixture: ComponentFixture<DatasetInfoComponent>;
  let location: Location;
  let modalConfirms: ModalConfirmService;
  let matomo: MatomoService;
  let debias: DebiasService;
  let upload: UploadService;
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
        DatasetInfoComponent
      ],
      providers: [
        {
          provide: Location,
          useClass: SpyLocation
        },
        { provide: MatomoService, useValue: mockedMatomoService },
        { provide: ModalConfirmService, useClass: MockModalConfirmService },
        {
          provide: SandboxService,
          useClass: MockSandboxService
        },
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
          useValue: (): KeycloakEvent => {
            return authorisationEvent;
          }
        },
        {
          provide: DatasetHierarchyService,
          useClass: MockDatasetHierarchyService
        },
        provideHttpClient(withInterceptorsFromDi())
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .overrideComponent(DatasetInfoComponent, {
        remove: { imports: [DebiasComponent] },
        add: { imports: [MockDebiasComponent] }
      })
      .compileComponents();

    modalConfirms = TestBed.inject(ModalConfirmService);
    matomo = TestBed.inject(MatomoService);
    debias = TestBed.inject(DebiasService);
    upload = TestBed.inject(UploadService);
    location = TestBed.inject(Location);
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

  describe('Logged-in', () => {
    beforeEach(() => {
      configureTestbed(eventKeycloakLoggedIn);
      fixture = TestBed.createComponent(DatasetInfoComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('datasetId', '1');
    });

    afterAll(fakeAsync(() => {
      discardPeriodicTasks();
    }));

    it('should pre-authenticate', () => {
      expect(component.keycloakSignal()).toBeTruthy();
    });

    it('should pad the children array', () => {
      expect(component.padRerunChildren([]).length).toEqual(1);
      const id = {
        id: '1',
        name: 'a'
      };
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
      const id = {
        id: '1',
        name: 'a'
      };
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

    it('should get the toggle rerun tooltip', fakeAsync(() => {
      fixture.componentRef.setInput('datasetId', '1');
      fixture.detectChanges();

      expect(component.getToggleRerunTooltip()).toEqual(
        'can not rerun datasets that you do not own'
      );

      component.keycloak.idTokenParsed = { sub: '1234' };
      fixture.detectChanges();
      tick(1);
      fixture.detectChanges();

      expect(component.getToggleRerunTooltip()).toEqual('rerun dataset 1');
      component.editable = true;
      expect(component.getToggleRerunTooltip()).toEqual('rerun dataset 1 (cancel)');
      component.newId.set('2');
      expect(component.getToggleRerunTooltip()).toEqual('close dataset details');

      component.canReRun = signal(false);
      tick(1);
      fixture.detectChanges();
      expect(component.getToggleRerunTooltip()).toEqual(
        'can not rerun a dataset that was harvested from an uploaded file'
      );
    }));

    it('should toggle the rerun', fakeAsync(() => {
      component.fullInfoOpen = true;
      fixture.componentRef.setInput('datasetId', '1');

      component.keycloak.idTokenParsed = { sub: '1234' };

      fixture.detectChanges();
      tick(1);
      fixture.detectChanges();

      vi.spyOn(component.datasetNewName.nativeElement, 'focus');

      expect(component.editable).toBeFalsy();
      component.toggleRerun();

      expect(component.editable).toBeTruthy();

      expect(component.datasetNewName.nativeElement.focus).toHaveBeenCalled();
      component.toggleRerun();
      expect(component.editable).toBeFalsy();
      expect(component.datasetNewName.nativeElement.focus).toHaveBeenCalledTimes(1);

      component.fullInfoOpen = false;
      component.toggleRerun();
      expect(component.editable).toBeFalsy();

      tick(200);
      expect(component.editable).toBeTruthy();
      expect(component.fullInfoOpen).toBeTruthy();

      component.toggleRerun();
      expect(component.editable).toBeFalsy();

      component.canReRun = signal(false);
      TestBed.tick();
      tick(1);
      fixture.detectChanges();

      component.toggleRerun();
      expect(component.editable).toBeFalsy();
    }));

    it('should set the rerun form values', fakeAsync(() => {
      fixture.componentRef.setInput('datasetId', '1');
      fixture.detectChanges();
      tick(1);
      fixture.detectChanges();

      vi.spyOn(DatasetHierarchyService, 'suggestChildName');
      component.form.value['name'] = 'x';
      component.setRerunFormValues();

      expect(component.form.value['name']).toEqual('Test_Dataset_Name_1');
      expect(DatasetHierarchyService.suggestChildName).not.toHaveBeenCalled();

      component.linkedReRunsEnabled = true;

      component.form.value['name'] = 'x';
      component.setRerunFormValues();
      expect(component.form.value['name']).toEqual('Test_Dataset_Name_1');
      expect(DatasetHierarchyService.suggestChildName).toHaveBeenCalled();
    }));

    it('should rerun', fakeAsync(() => {
      fixture.componentRef.setInput('datasetId', '1');
      fixture.detectChanges();
      tick(1);
      fixture.detectChanges();

      let responseType = 0;

      vi.spyOn(upload, 'submitDataset').mockImplementation(() => {
        if (responseType === 0) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return of({ body: { 'dataset-id': 1 } }) as any;
        } else {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          return of({ 'dataset-id': 1 }) as any;
        }
      });
      expect(component.newId()).toBeFalsy();

      component.reRun();
      expect(upload.submitDataset).toHaveBeenCalled();
      responseType = 1;
      component.reRun();
      expect(upload.submitDataset).toHaveBeenCalledTimes(2);
      expect(component.newId()).toBeTruthy();
    }));

    it('should handle errors with the rerun', fakeAsync(() => {
      fixture.componentRef.setInput('datasetId', '1');
      fixture.detectChanges();
      tick(1);
      fixture.detectChanges();

      vi.spyOn(upload, 'submitDataset').mockImplementation(() => {
        return throwError({
          status: 500,
          statusText: 'status text',
          error: 'error response'
        } as HttpErrorResponse);
      });
      component.reRun();
      expect(upload.submitDataset).toHaveBeenCalled();
      expect(component.error).toBeTruthy();
    }));

    it('should reset the editable flag when the location changes', fakeAsync(() => {
      component.editable = true;
      location.go('/dataset/1');
      fixture.detectChanges();
      expect(component.editable).toBeTruthy();
      location.go('/dataset/2');
      fixture.detectChanges();
      expect(component.editable).toBeFalsy();
    }));

    it('should get if the debias is busy', () => {
      fixture.componentRef.setInput('datasetId', '1');
      fixture.detectChanges();
      expect(component.isDebiasBusy()).toBeFalsy();
      component.cmpDebias.isBusy = true;
      expect(component.isDebiasBusy()).toBeTruthy();
    });

    it('should initiate polling', fakeAsync(() => {
      fixture.detectChanges();
      vi.spyOn(component.cmpDebias, 'pollDebiasReport');
      tick(1);

      component.modelDebiasInfo.update((value: DebiasInfo) => {
        const newValue = { ...value };
        newValue.state = DebiasState.PROCESSING;
        return newValue;
      });

      fixture.detectChanges();
      tick(1);

      expect(component.cmpDebias.pollDebiasReport).toHaveBeenCalled();
    }));

    it('should run the debias report', fakeAsync(() => {
      const process = (): void => {
        tick(1);
        fixture.detectChanges();
        tick(1);
      };

      fixture.componentRef.setInput('datasetId', '1');
      process();

      const datasetInfo = component.datasetInfo();
      expect(datasetInfo).toBeTruthy();
      if (datasetInfo) {
        expect(datasetInfo['created-by-id']).toEqual('1234');
      }

      component.keycloak.idTokenParsed = { sub: '1234' };

      vi.spyOn(debias, 'runDebiasReport');

      component.cmpDebias.isBusy = true;
      component.runOrShowDebiasReport(true);
      process();
      expect(debias.runDebiasReport).not.toHaveBeenCalled();

      component.cmpDebias.isBusy = false;
      component.runOrShowDebiasReport(true);
      process();
      expect(debias.runDebiasReport).toHaveBeenCalled();
      expect(component.isOwner()).toBeTruthy();

      component.keycloak.idTokenParsed = { sub: '' };

      component.runOrShowDebiasReport(false);
      process();
      expect(debias.runDebiasReport).toHaveBeenCalledTimes(1);
    }));
  });

  describe('(not logged-in)', () => {
    beforeEach(() => {
      configureTestbed();
      fixture = TestBed.createComponent(DatasetInfoComponent);
      component = fixture.componentInstance;
    });

    it('should create', () => {
      expect(component).toBeTruthy();
      expect(component.datasetInfo()).toBeFalsy();
    });

    it('should compute the hierarchy alignment', () => {
      fixture.componentRef.setInput('datasetId', '1');

      expect(component.hierarchyAlignment()).toEqual('align-center');

      component.hierarchyData.set({
        siblings: [{ id: '1', name: 'One' }],
        children: [],
        hasContent: false
      });
      expect(component.hierarchyAlignment()).toEqual('push-left');

      component.hierarchyData.set({
        siblings: [],
        children: [{ id: '1', name: 'One' }],
        hasContent: false
      });
      expect(component.hierarchyAlignment()).toEqual('push-right');
    });

    it('should toggle the ancestry', fakeAsync(() => {
      fixture.componentRef.setInput('datasetId', '1');

      expect(component.isAncestorMode()).toBeFalsy();
      component.toggleAncestorMode();
      expect(component.isAncestorMode()).toBeTruthy();
      component.toggleAncestorMode();
      tick();
      expect(component.isAncestorMode()).toBeFalsy();
    }));

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

    it('should remove the class', fakeAsync(() => {
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
      tick();

      expect(el.classList.remove).not.toHaveBeenCalled();
      applied = true;
      component.removeClass(el, 'my-class');
      tick();

      expect(el.classList.remove).toHaveBeenCalled();
    }));

    it('should track the user viewing the published records', () => {
      vi.spyOn(matomo, 'trackNavigation');
      component.trackViewPublished();
      expect(matomo.trackNavigation).toHaveBeenCalledWith(['external', 'published-records']);
    });

    it('should assist with tooltip display', () => {
      expect(component.completedWithErrors()).toBeFalsy();
      component.status = DatasetStatus.COMPLETED;
      expect(component.completedWithErrors()).toBeFalsy();
      component.showCross = true;
      expect(component.completedWithErrors()).toBeTruthy();
    });

    it('should load the dataset info', fakeAsync(() => {
      fixture.componentRef.setInput('datasetId', '1');
      fixture.detectChanges();
      tick(1);
      expect(component.datasetInfo()).toBeTruthy();
    }));

    it('should close open modals when the dataset id is set', fakeAsync(() => {
      fixture.componentRef.setInput('datasetId', '1');
      fixture.detectChanges();
      expect(component.modalDebias).toBeTruthy();
      vi.spyOn(modalConfirms, 'isOpen').mockImplementation(() => {
        return true;
      });
      vi.spyOn(component.modalDebias, 'close');
      fixture.componentRef.setInput('datasetId', '2');
      tick(1);
      fixture.detectChanges();
      expect(component.modalDebias.close).toHaveBeenCalled();
    }));

    it('should set the progress data', () => {
      const data = {
        'dataset-logs': [],
        status: DatasetStatus.FAILED,
        'processed-records': 0,
        'total-records': 0,
        'progress-by-step': []
      };
      component.progressData = undefined;

      expect(component.progressData).toBeFalsy();
      component.progressData = data;

      expect(component.showTick).toBeFalsy();
      expect(component.showCross).toBeTruthy();

      data.status = DatasetStatus.IN_PROGRESS;
      component.progressData = data;

      expect(component.showCross).toBeFalsy();
      expect(component.showTick).toBeFalsy();

      component.progressData = data;

      expect(component.showTick).toBeFalsy();

      data.status = DatasetStatus.COMPLETED;
      component.progressData = data;

      expect(component.showTick).toBeTruthy();
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
      vi.spyOn(component.cmpDebias, 'reset');
      component.onDebiasHidden();
      expect(component.cmpDebias.reset).toHaveBeenCalled();
    });

    it('should toggle fullInfoOpen', () => {
      expect(component.fullInfoOpen).toBeFalsy();
      component.toggleFullInfoOpen();
      expect(component.fullInfoOpen).toBeTruthy();
      component.toggleFullInfoOpen();
      expect(component.fullInfoOpen).toBeFalsy();
    });

    it('should run the debias report', fakeAsync(() => {
      vi.spyOn(debias, 'runDebiasReport');
      expect(component.isOwner()).toBeFalsy();
      component.runOrShowDebiasReport(true);
      expect(debias.runDebiasReport).not.toHaveBeenCalled();

      component.keycloak.idTokenParsed = { sub: '1234' };

      fixture.componentRef.setInput('datasetId', '1');
      tick(1);
      fixture.detectChanges();
      tick(1);

      const datasetInfo = component.datasetInfo();
      expect(datasetInfo).toBeTruthy();
      if (datasetInfo) {
        expect(datasetInfo['created-by-id']).toEqual('1234');
      }
      expect(component.isOwner()).toBeTruthy();

      component.runOrShowDebiasReport(false);
      expect(debias.runDebiasReport).not.toHaveBeenCalled();

      component.runOrShowDebiasReport(true);
      expect(debias.runDebiasReport).toHaveBeenCalled();
    }));
  });
});
