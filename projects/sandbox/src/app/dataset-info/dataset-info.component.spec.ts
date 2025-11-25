import { Location } from '@angular/common';
import { HttpErrorResponse, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { SpyLocation } from '@angular/common/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable, of, throwError } from 'rxjs';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEvent, KeycloakEventType } from 'keycloak-angular';
import Keycloak from 'keycloak-js';

import { mockedKeycloak, MockModalConfirmService, ModalConfirmService } from 'shared';
import {
  MockDebiasComponent,
  MockDebiasService,
  mockedMatomoService,
  MockSandboxService,
  MockUploadService,
  MockUserDataService
} from '../_mocked';
import { DatasetStatus, DebiasInfo, DebiasState } from '../_models';
import {
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
  };

  const getConfirmResult = (): Observable<boolean> => {
    const res = of(true);
    modalConfirms.add({ open: () => res, close: () => undefined, id: '1', isShowing: true });
    return res;
  };

  describe('Logged In', () => {
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
      TestBed.flushEffects();
      fixture.detectChanges();
      expect(component.keycloakSignal()).toBeTruthy();
    });

    it('should toggle the re-run', fakeAsync(() => {
      component.fullInfoOpen = true;
      fixture.componentRef.setInput('datasetId', '1');
      fixture.detectChanges();
      tick(1);
      fixture.detectChanges();

      spyOn(component.datasetNewName.nativeElement, 'focus');

      expect(component.editable).toBeFalsy();
      component.toggleReRun();
      expect(component.editable).toBeTruthy();
      expect(component.datasetNewName.nativeElement.focus).toHaveBeenCalled();
      component.toggleReRun();
      expect(component.editable).toBeFalsy();
      expect(component.datasetNewName.nativeElement.focus).toHaveBeenCalledTimes(1);

      component.fullInfoOpen = false;
      component.toggleReRun();
      expect(component.editable).toBeFalsy();

      tick(200);
      expect(component.editable).toBeTruthy();
      expect(component.fullInfoOpen).toBeTruthy();
    }));

    it('should re-run or toggle the re-run', () => {
      spyOn(component, 'reRun').and.callFake(() => {});
      spyOn(component, 'toggleReRun').and.callFake(() => {});

      component.reRunOrToggle();
      expect(component.reRun).toHaveBeenCalled();
      expect(component.toggleReRun).not.toHaveBeenCalled();

      component.reRunOrToggle();
      expect(component.reRun).toHaveBeenCalledTimes(2);
      expect(component.toggleReRun).not.toHaveBeenCalled();

      component.newId.set('1');
      component.reRunOrToggle();

      expect(component.reRun).toHaveBeenCalledTimes(2);
      expect(component.toggleReRun).toHaveBeenCalled();
    });

    it('should re-run', fakeAsync(() => {
      fixture.componentRef.setInput('datasetId', '1');
      fixture.detectChanges();
      tick(1);
      fixture.detectChanges();

      let responseType = 0;

      spyOn(upload, 'submitDataset').and.callFake(() => {
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

    it('should handle errors with the re-run', fakeAsync(() => {
      fixture.componentRef.setInput('datasetId', '1');
      fixture.detectChanges();
      tick(1);
      fixture.detectChanges();

      spyOn(upload, 'submitDataset').and.callFake(() => {
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
      spyOn(component.cmpDebias, 'pollDebiasReport');
      TestBed.flushEffects();
      tick(1);

      component.modelDebiasInfo.update((value: DebiasInfo) => {
        const newValue = { ...value };
        newValue.state = DebiasState.PROCESSING;
        return newValue;
      });

      fixture.detectChanges();
      TestBed.flushEffects();
      tick(1);

      expect(component.cmpDebias.pollDebiasReport).toHaveBeenCalled();
    }));

    it('should run the debias report', fakeAsync(() => {
      const process = (): void => {
        tick(1);
        fixture.detectChanges();
        TestBed.flushEffects();
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

      spyOn(debias, 'runDebiasReport').and.callThrough();

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
    }));
  });

  describe('Not logged in)', () => {
    beforeEach(() => {
      configureTestbed();
      fixture = TestBed.createComponent(DatasetInfoComponent);
      component = fixture.componentInstance;
    });

    afterAll(fakeAsync(() => {
      discardPeriodicTasks();
    }));

    it('should create', () => {
      expect(component).toBeTruthy();
      expect(component.datasetInfo()).toBeFalsy();
    });

    it('should toggle the ancestry', fakeAsync(() => {
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
          add: jasmine.createSpy()
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
          remove: jasmine.createSpy()
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
      spyOn(matomo, 'trackNavigation');
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
      spyOn(modalConfirms, 'isOpen').and.callFake(() => {
        return true;
      });
      spyOn(component.modalDebias, 'close');
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
      spyOn(modalConfirms, 'open').and.callFake(getConfirmResult);
      component.showDatasetIssues(fakeElement);
      expect(modalConfirms.open).toHaveBeenCalled();
    });

    it('should show the modal for processing errors', () => {
      spyOn(modalConfirms, 'open').and.callFake(getConfirmResult);
      component.showProcessingErrors();
      expect(modalConfirms.open).toHaveBeenCalled();
    });

    it('should handle the debias callback', () => {
      fixture.componentRef.setInput('datasetId', '1');
      fixture.detectChanges();
      spyOn(component.cmpDebias, 'reset');
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
      fixture.componentRef.setInput('datasetId', '1');
      fixture.detectChanges();
      TestBed.flushEffects();
      tick(1);

      const datasetInfo = component.datasetInfo();
      expect(datasetInfo).toBeTruthy();
      if (datasetInfo) {
        expect(datasetInfo['created-by-id']).toEqual('1234');
      }

      spyOn(debias, 'runDebiasReport').and.callThrough();

      component.runOrShowDebiasReport(true);
      tick(1);
      fixture.detectChanges();
      TestBed.flushEffects();
      tick(1);
      expect(debias.runDebiasReport).not.toHaveBeenCalled();
    }));
  });
});
