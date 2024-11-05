import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MockSandboxService, MockSandboxServiceErrors } from '../_mocked';
import { DebiasState } from '../_models';
import { SandboxService } from '../_services';
import { DebiasComponent } from '.';

describe('DebiasComponent', () => {
  let component: DebiasComponent;
  let fixture: ComponentFixture<DebiasComponent>;

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [DebiasComponent],
      providers: [
        {
          provide: SandboxService,
          useClass: errorMode ? MockSandboxServiceErrors : MockSandboxService
        }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(DebiasComponent);
    component = fixture.componentInstance;
  };

  describe('Normal Operations', () => {
    beforeEach(async(configureTestbed));
    beforeEach(b4Each);

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should poll the debias report', fakeAsync(() => {
      expect(component.debiasReport).toBeFalsy();
      component.datasetId = DebiasState.COMPLETED;
      component.startPolling();
      tick(component.apiSettings.interval);
      expect(component.debiasReport).toBeTruthy();
      tick(component.apiSettings.interval);
    }));

    const getEvent = (): Event => {
      return ({
        stopPropagation: jasmine.createSpy()
      } as unknown) as Event;
    };

    it('should close the debias info', () => {
      const e = getEvent();
      component.debiasHeaderOpen = true;
      component.closeDebiasInfo(e);
      expect(component.debiasHeaderOpen).toBeFalsy();
      expect(e.stopPropagation).toHaveBeenCalled();
    });

    it('should toggle the debias info', () => {
      const e = getEvent();
      component.debiasHeaderOpen = true;
      component.toggleDebiasInfo(e);
      expect(component.debiasHeaderOpen).toBeFalsy();
      expect(e.stopPropagation).toHaveBeenCalledTimes(1);
      component.toggleDebiasInfo(e);
      expect(component.debiasHeaderOpen).toBeTruthy();
      expect(e.stopPropagation).toHaveBeenCalledTimes(2);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async(() => {
      configureTestbed(true);
    }));

    beforeEach(b4Each);

    it('should not set the debias report on error', fakeAsync(() => {
      expect(component.debiasReport).toBeFalsy();
      component.datasetId = DebiasState.COMPLETED;
      component.startPolling();
      tick(component.apiSettings.interval);
      expect(component.debiasReport).toBeFalsy();
      tick(component.apiSettings.interval);
      expect(component.debiasReport).toBeFalsy();
    }));
  });
});
