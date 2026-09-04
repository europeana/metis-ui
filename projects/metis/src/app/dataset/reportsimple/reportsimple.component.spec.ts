import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import {
  createMockPipe,
  MockModalConfirmService,
  ModalConfirmComponent,
  ModalConfirmService
} from 'shared';
import {
  MockTranslateService,
  MockWorkflowService,
  MockWorkflowServiceErrors,
  mockXmlSamples
} from '../../_mocked';
import { PluginType } from '../../_models';
import { WorkflowService } from '../../_services';
import { NotificationComponent } from '../../shared';
import { RenameWorkflowPipe, TranslateService } from '../../_translate';
import { ReportSimpleComponent } from '.';

describe('ReportSimpleComponent', () => {
  let component: ReportSimpleComponent;
  let fixture: ComponentFixture<ReportSimpleComponent>;
  let workflows: WorkflowService;
  let modalConfirms: ModalConfirmService;

  const mockError = {
    errorType: 'my type',
    message: 'oh no',
    occurrences: 1,
    errorDetails: []
  };
  const reportRequest = { workflowExecutionId: '1' };

  const configureTestingModule = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [NotificationComponent, ReportSimpleComponent, ModalConfirmComponent],
      providers: [
        { provide: TranslateService, useClass: MockTranslateService },
        {
          provide: WorkflowService,
          useClass: errorMode ? MockWorkflowServiceErrors : MockWorkflowService
        },
        { provide: ModalConfirmService, useClass: MockModalConfirmService },
        { provide: RenameWorkflowPipe, useValue: createMockPipe('renameWorkflow') }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
    workflows = TestBed.inject(WorkflowService);
    modalConfirms = TestBed.inject(ModalConfirmService);
  };

  describe('Normal Operations', () => {
    beforeEach(() => {
      configureTestingModule(false);
      fixture = TestBed.createComponent(ReportSimpleComponent);
      component = fixture.componentInstance;
    });

    it('should show if a simple message is provided', () => {
      spyOn(modalConfirms, 'open').and.callFake(() => {
        return of(true);
      });
      fixture.componentRef.setInput('reportRequest', { message: 'Hello' });
      fixture.detectChanges();
      expect(modalConfirms.open).toHaveBeenCalled();
    });

    it('should not show if an undefined message is provided', () => {
      spyOn(modalConfirms, 'open').and.callFake(() => {
        return of(true);
      });
      fixture.componentRef.setInput('reportRequest', { message: '' });
      fixture.detectChanges();
      expect(modalConfirms.open).not.toHaveBeenCalled();
    });

    it('should show if an errors array is provided', () => {
      spyOn(modalConfirms, 'open').and.callFake(() => {
        return of(true);
      });
      fixture.componentRef.setInput('reportRequest', { errors: [mockError] });
      fixture.detectChanges();
      expect(modalConfirms.open).toHaveBeenCalled();
    });

    it('should not show if the provided errors array is null', () => {
      spyOn(modalConfirms, 'open').and.callFake(() => {
        return of(true);
      });
      fixture.componentRef.setInput('reportRequest', { errors: undefined });
      fixture.detectChanges();
      expect(modalConfirms.open).not.toHaveBeenCalled();
    });

    it('should show if loading', () => {
      spyOn(modalConfirms, 'open').and.callFake(() => {
        return of(true);
      });
      fixture.componentRef.setInput('reportRequest', { workflowExecutionId: '1' });
      fixture.componentRef.setInput('reportLoading', true);
      fixture.detectChanges();
      expect(modalConfirms.open).toHaveBeenCalled();
    });

    it('should warn if the provided errors array is empty', () => {
      expect(component.notification).toBeFalsy();
      fixture.componentRef.setInput('reportRequest', { errors: [] });
      fixture.detectChanges();
      expect(component.notification!.content).toEqual('en:reportEmpty');
    });

    it('should detect if an item is downloadable', () => {
      fixture.componentRef.setInput('reportRequest', { pluginType: PluginType.TRANSFORMATION });
      fixture.detectChanges();
      expect(component.isDownloadable()).toBeTruthy();

      fixture.componentRef.setInput('reportRequest', { pluginType: PluginType.NORMALIZATION });
      fixture.detectChanges();
      expect(component.isDownloadable()).toBeTruthy();

      fixture.componentRef.setInput('reportRequest', { pluginType: PluginType.OAIPMH_HARVEST });
      fixture.detectChanges();
      expect(component.isDownloadable()).toBeFalsy();

      fixture.componentRef.setInput('reportRequest', { pluginType: PluginType.HTTP_HARVEST });
      fixture.detectChanges();
      expect(component.isDownloadable()).toBeFalsy();
    });

    it('should get the keys from an object', () => {
      expect(component.reportKeys((undefined as unknown) as Record<string, any>)).toEqual([]);
      expect(component.reportKeys({ a: 5, b: 67, zeta: 65 })).toEqual(['a', 'b', 'zeta']);
    });

    it('should download the record', () => {
      spyOn(workflows, 'getRecordFromPredecessor').and.callFake(() => {
        return of(mockXmlSamples);
      });
      fixture.componentRef.setInput('reportRequest', reportRequest);
      fixture.detectChanges();

      component.downloadRecord('1-2-3', {});
      expect(workflows.getRecordFromPredecessor).not.toHaveBeenCalled();

      component.downloadRecord('http://records/123', {});
      expect(workflows.getRecordFromPredecessor).toHaveBeenCalled();

      component.downloadRecord('1-2-3', {});
      expect(workflows.getRecordFromPredecessor).toHaveBeenCalledTimes(1);

      component.downloadRecord('XYZ', {});
      expect(workflows.getRecordFromPredecessor).toHaveBeenCalledTimes(2);

      component.downloadRecord('http:', {});
      expect(workflows.getRecordFromPredecessor).toHaveBeenCalledTimes(2);

      component.downloadRecord('http://records/123/456', {});
      expect(workflows.getRecordFromPredecessor).toHaveBeenCalledTimes(3);
    });

    it('should close the report window', () => {
      spyOn(component.closeReport, 'emit');
      component.close();
      expect(component.closeReport.emit).toHaveBeenCalledWith();
    });

    it('should determine whether something is an object', () => {
      expect(component.isObject({})).toBe(true);
      expect(component.isObject(component)).toBe(true);

      expect(component.isObject(true)).toBe(false);
      expect(component.isObject(1)).toBe(false);
      expect(component.isObject('665')).toBe(false);
      expect(component.isObject(() => undefined)).toBe(false);
      expect(component.isObject(undefined)).toBe(false);
    });

    it('should copy the report', () => {
      spyOn(navigator.clipboard, 'writeText');
      fixture.componentRef.setInput('reportRequest', { ...reportRequest, errors: [mockError] });
      fixture.detectChanges();
      component.copyReport({
        getSelection: (): null => {
          return null;
        }
      } as any);
      expect(component.notification).toBeFalsy();
      component.copyReport();
      expect(component.notification!.content).toBe('en:reportCopied');
      expect(navigator.clipboard.writeText).toHaveBeenCalled();
    });

    it('should split the camel case', () => {
      expect(component.splitCamelCase('helloThere')).toEqual('hello There');
    });
  });

  describe('Errors', () => {
    beforeEach(() => {
      configureTestingModule(true);
      fixture = TestBed.createComponent(ReportSimpleComponent);
      component = fixture.componentInstance;
    });

    it('should handle errors downloading the record', () => {
      spyOn(workflows, 'getRecordFromPredecessor').and.callFake(() => {
        return throwError(() => new HttpErrorResponse({ status: 500 }));
      });

      fixture.componentRef.setInput('reportRequest', reportRequest);
      fixture.detectChanges();

      const mockDetail = {
        identifier: 'http://records/123',
        additionalInfo: 'Test info',
        downloadError: undefined
      };

      component.downloadRecord(mockDetail.identifier, mockDetail);
      expect(mockDetail.downloadError).toBeTruthy();
    });
  });
});
