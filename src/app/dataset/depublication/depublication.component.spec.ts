import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import {
  createMockPipe,
  MockDepublicationService,
  MockDepublicationServiceErrors,
  MockErrorService
} from '../../_mocked';
import { DepublicationService, ErrorService } from '../../_services';
import { DepublicationComponent } from '.';

describe('DepublicationComponent', () => {
  let component: DepublicationComponent;
  let fixture: ComponentFixture<DepublicationComponent>;

  let depublications: DepublicationService;
  const interval = 5000;

  const formBuilder: FormBuilder = new FormBuilder();

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [
        DepublicationComponent,
        createMockPipe('translate'),
        createMockPipe('renameWorkflow')
      ],
      providers: [
        {
          provide: DepublicationService,
          useClass: errorMode ? MockDepublicationServiceErrors : MockDepublicationService
        },
        { provide: ErrorService, useClass: MockErrorService },
        { provide: FormBuilder, useValue: formBuilder }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
    depublications = TestBed.get(DepublicationService);
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(DepublicationComponent);
    component = fixture.componentInstance;
  };

  afterEach(() => {
    if (component.depublicationSubscription) {
      component.depublicationSubscription.unsubscribe();
    }
  });

  describe('Normal operations', () => {
    beforeEach(async(configureTestbed));
    beforeEach(b4Each);

    it('should set the dataset id', () => {
      expect(component.depublicationData.length).toBeFalsy();
      component.datasetId = undefined;
      expect(component.depublicationData.length).toBeFalsy();
      component.datasetId = '0';
      expect(component.depublicationData.length).toBeTruthy();
    });

    it('should toggle the options', () => {
      expect(component.optionsOpen).toBeFalsy();
      component.toggleOptions();
      expect(component.optionsOpen).toBeTruthy();
      component.toggleOptions();
      expect(component.optionsOpen).toBeFalsy();
    });

    it('should open the input dialog', () => {
      component.toggleOptions();
      expect(component.optionsOpen).toBeTruthy();
      component.openDialogInput();
      expect(component.optionsOpen).toBeFalsy();
    });

    it('should open the file dialog', () => {
      component.toggleOptions();
      expect(component.optionsOpen).toBeTruthy();
      component.openDialogFile();
      expect(component.optionsOpen).toBeFalsy();
    });

    it('should clean up', () => {
      component.beginPolling();
      spyOn(component.depublicationSubscription, 'unsubscribe');
      component.ngOnDestroy();
      expect(component.depublicationSubscription.unsubscribe).toHaveBeenCalled();
    });

    it('should update data periodically and allow polling resets', fakeAsync(() => {
      spyOn(depublications, 'getPublicationInfoUptoPage').and.callThrough();
      component.beginPolling();
      //component.loadData();

      [1, 2, 3, 4, 5].forEach((index) => {
        expect(depublications.getPublicationInfoUptoPage).toHaveBeenCalledTimes(index);
        tick(interval);
      });

      expect(depublications.getPublicationInfoUptoPage).toHaveBeenCalledTimes(6);
      component.pollingRefresh.next(true);
      expect(depublications.getPublicationInfoUptoPage).toHaveBeenCalledTimes(7);

      component.depublicationSubscription.unsubscribe();
      tick(interval);
    }));
  });

  describe('Error handling', () => {
    beforeEach(async(() => {
      configureTestbed(true);
    }));

    beforeEach(b4Each);

    /*
    it('should handle load errors', () => {
      expect(component).toBeTruthy();
      component.load('0');
    });
    */
  });
});
