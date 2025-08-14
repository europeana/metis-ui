import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  TestBed,
  tick
} from '@angular/core/testing';
import { Observable, of } from 'rxjs';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEvent, KeycloakEventType } from 'keycloak-angular';
import Keycloak from 'keycloak-js';

import { mockedKeycloak, MockModalConfirmService, ModalConfirmService } from 'shared';
import {
  MockDebiasComponent,
  MockDebiasService,
  mockedMatomoService,
  MockSandboxService
} from '../_mocked';
import { DatasetStatus, DebiasInfo, DebiasState } from '../_models';
import { DebiasService, MatomoService, SandboxService } from '../_services';
import { DebiasComponent } from '../debias';
import { DatasetInfoComponent } from '.';

describe('DatasetInfoComponent', () => {
  let component: DatasetInfoComponent;
  let fixture: ComponentFixture<DatasetInfoComponent>;
  let modalConfirms: ModalConfirmService;
  let matomo: MatomoService;
  let keycloak: Keycloak;
  let debias: DebiasService;

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
      imports: [DatasetInfoComponent],
      providers: [
        { provide: MatomoService, useValue: mockedMatomoService },
        { provide: ModalConfirmService, useClass: MockModalConfirmService },
        {
          provide: SandboxService,
          useClass: MockSandboxService
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
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .overrideComponent(DatasetInfoComponent, {
        remove: { imports: [DebiasComponent] },
        add: { imports: [MockDebiasComponent] }
      })
      .compileComponents();

    debias = TestBed.inject(DebiasService);
    modalConfirms = TestBed.inject(ModalConfirmService);
    matomo = TestBed.inject(MatomoService);
    keycloak = TestBed.inject(Keycloak);
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
      expect(component.authenticated()).toBeTruthy();
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
      expect(component.authenticated()).toBeFalsy();
    });

    it('should track the user viewing the published records', () => {
      spyOn(matomo, 'trackNavigation');
      component.trackViewPublished();
      expect(matomo.trackNavigation).toHaveBeenCalledWith(['external', 'published-records']);
    });

    it('should assist with tooltip display', () => {
      expect(component.showTooltipCompletedWithErrors()).toBeFalsy();
      component.status = DatasetStatus.COMPLETED;
      expect(component.showTooltipCompletedWithErrors()).toBeFalsy();
      component.showCross = true;
      expect(component.showTooltipCompletedWithErrors()).toBeTruthy();
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
        'records-published-successfully': false,
        status: DatasetStatus.FAILED,
        'processed-records': 0,
        'total-records': 0,
        'progress-by-step': []
      };
      component.progressData = undefined;

      expect(component.progressData).toBeFalsy();
      component.progressData = data;

      expect(component.noPublishedRecordAvailable).toBeFalsy();
      expect(component.showTick).toBeFalsy();
      expect(component.showCross).toBeTruthy();

      data.status = DatasetStatus.IN_PROGRESS;
      component.progressData = data;

      expect(component.showCross).toBeFalsy();
      expect(component.showTick).toBeFalsy();

      data['records-published-successfully'] = true;
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

    it('should close fullInfoOpen', () => {
      component.fullInfoOpen = true;
      component.closeFullInfo();
      expect(component.fullInfoOpen).toBeFalsy();
      component.closeFullInfo();
      expect(component.fullInfoOpen).toBeFalsy();
    });

    it('should run the debias report', fakeAsync(() => {
      fixture.componentRef.setInput('datasetId', '1');
      fixture.detectChanges();
      TestBed.flushEffects();
      tick(1);

      component.authenticated.set(true);
      keycloak.idTokenParsed = { sub: '1234' };

      component.cmpDebias.isBusy = true;
      tick(1);
      expect(component.authenticated()).toBeTruthy();
      TestBed.flushEffects();

      spyOn(debias, 'runDebiasReport').and.callThrough();

      component.runOrShowDebiasReport(true);
      tick(1);
      fixture.detectChanges();
      TestBed.flushEffects();
      tick(1);
      expect(debias.runDebiasReport).not.toHaveBeenCalled();

      component.cmpDebias.isBusy = false;

      component.runOrShowDebiasReport(true);
      fixture.detectChanges();
      TestBed.flushEffects();
      tick(1);
      expect(debias.runDebiasReport).toHaveBeenCalled();

      component.authenticated.set(false);
      keycloak.idTokenParsed = { sub: 'tokenUnknown' };
      component.authenticated.set(true);

      TestBed.flushEffects();

      component.runOrShowDebiasReport(true);
      fixture.detectChanges();
      TestBed.flushEffects();
      tick(1);
      expect(debias.runDebiasReport).toHaveBeenCalledTimes(1);
    }));

    it('should show the debias report', fakeAsync(() => {
      fixture.componentRef.setInput('datasetId', '1');
      fixture.detectChanges();

      component.authenticated.set(true);
      keycloak.idTokenParsed = { sub: '1234' };

      spyOn(modalConfirms, 'open').and.callFake(getConfirmResult);

      tick(1);
      fixture.detectChanges();

      component.runOrShowDebiasReport(false);
      expect(modalConfirms.open).toHaveBeenCalled();
    }));

    it('should compute the debias owner', fakeAsync(() => {
      const tokenOwner = '1234';
      const tokenNonOwner = '4321';

      fixture.componentRef.setInput('datasetId', '1');
      keycloak.idTokenParsed = { sub: tokenNonOwner };

      fixture.detectChanges();
      component.authenticated.set(true);
      tick(1);

      expect(component.authenticated()).toBeTruthy();

      fixture.detectChanges();
      TestBed.flushEffects();
      expect(component.isOwner()).toBeFalsy();

      component.authenticated.set(false);
      keycloak.idTokenParsed = { sub: tokenOwner };
      component.authenticated.set(true);

      TestBed.flushEffects();

      expect(component.isOwner()).toBeTruthy();
    }));
  });
});
