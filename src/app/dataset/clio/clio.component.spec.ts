//import { NO_ERRORS_SCHEMA } from '@angular/core';
//import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';

/*
import {
  createMockPipe,
  MockErrorService,
  mockPluginExecution,
  MockTranslateService,
  MockWorkflowService
} from '../../_mocked';

import { ErrorService, WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';
*/
import { ClioComponent } from '.';

fdescribe('ClioComponent', () => {
  const datasetId = '0';
  let component: ClioComponent;
  let fixture: ComponentFixture<ClioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClioComponent],
      imports: [HttpClientTestingModule]

      //providers: [
      //  { provide: WorkflowService, useClass: MockWorkflowService },
      //  { provide: ErrorService, useClass: MockErrorService },
      //  { provide: TranslateService, useClass: MockTranslateService }
      //],
      //schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClioComponent);
    component = fixture.componentInstance;
    component.datasetId = datasetId;
  });

  describe('Normal operation', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should close', () => {
      component.isOpen = true;
      component.close();
      expect(component.isOpen).toBeFalsy();
    });

    it('should toggle', () => {
      component.isOpen = true;
      component.toggleVisible();
      expect(component.isOpen).toBeFalsy();
      component.toggleVisible();
      expect(component.isOpen).toBeTruthy();
    });

    it('should set the opener icon class', () => {
      expect(component.openerIconClass).toBeFalsy();

      const clioData1 = { score: 1, date: '' };
      const clioData3 = { score: 3, date: '' };

      let allClioData = [clioData1];
      component.setOpenerIconClass(allClioData);

      expect(component.openerIconClass).toBeTruthy();
      expect(component.openerIconClass).toEqual('clio-state-1');

      allClioData = [clioData1, clioData3];
      component.setOpenerIconClass(allClioData);

      expect(component.openerIconClass).toEqual('clio-state-2');
    });

    //it('should set the opener load the data', () => {
    //  spyOn(component, 'setOpenerIconClass');
    //  component.loadData(datasetId);
    //  expect(component.setOpenerIconClass).toHaveBeenCalled();
    //});

    it('should load data on init', () => {
      spyOn(component, 'loadData');
      component.ngOnInit();
      expect(component.loadData).toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {});
});
