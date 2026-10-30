import { Component, CUSTOM_ELEMENTS_SCHEMA, input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CodemirrorComponent, CodemirrorModule } from '@ctrl/ngx-codemirror';

import { createMockPipe } from 'shared';
import {
  MockCodemirrorComponent,
  mockDataset,
  MockDatasetsService,
  MockDatasetsServiceErrors,
  MockTranslateService,
  MockWorkflowService
} from '../../_mocked';
import { Dataset, XSLTStatus } from '../../_models';
import { DatasetsService, WorkflowService } from '../../_services';
import { EditorSafeXmlPipe, TranslatePipe, TranslateService, XmlPipe } from '../../_translate';
import { NotificationComponent } from '../../shared/notification/notification.component';
import { EditorComponent } from '../';
import { StatisticsComponent } from '../';
import { MappingComponent } from '.';

@Component({
  selector: 'app-statistics',
  template: '<div>Mock Statistics</div>',
  standalone: true
})
class MockStatisticsComponent {
  datasetData = input.required<Dataset>();
}

describe('MappingComponent', () => {
  let component: MappingComponent;
  let fixture: ComponentFixture<MappingComponent>;
  let router: Router;

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: 'dataset/preview/*', component: class DummyComponent {} },
          { path: '**', component: class FallbackComponent {} }
        ]),
        EditorComponent,
        NotificationComponent,
        MappingComponent,
        StatisticsComponent,
        CodemirrorModule
      ],
      providers: [
        { provide: WorkflowService, useClass: MockWorkflowService },
        {
          provide: DatasetsService,
          useClass: errorMode ? MockDatasetsServiceErrors : MockDatasetsService
        },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: TranslatePipe, useClass: createMockPipe('translate') },
        { provide: XmlPipe, useClass: createMockPipe('beautifyXML') },
        { provide: EditorSafeXmlPipe, useClass: createMockPipe('EditorSafeXmlPipe') }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    })
      .overrideModule(CodemirrorModule, {
        remove: { declarations: [CodemirrorComponent], exports: [CodemirrorComponent] },
        add: { declarations: [MockCodemirrorComponent], exports: [MockCodemirrorComponent] }
      })
      .overrideComponent(MappingComponent, {
        remove: { imports: [StatisticsComponent] },
        add: { imports: [MockStatisticsComponent] }
      })
      .compileComponents();
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(MappingComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('datasetData', mockDataset);
    router = TestBed.inject(Router);
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Normal operation', () => {
    beforeEach(() => {
      configureTestbed();
      b4Each();
    });

    it('should create', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should load custom XSLT', () => {
      expect(component.xsltStatus()).toEqual(XSLTStatus.LOADING);
      expect(component.xsltToSave()).toBeFalsy();

      fixture.componentRef.setInput('datasetData', ({
        xsltId: '1'
      } as unknown) as Dataset);

      component.loadCustomXSLT();
      vi.advanceTimersByTime(1);
      fixture.detectChanges();

      expect(component.xsltStatus()).toBe(XSLTStatus.HASCUSTOM);
      expect(component.xsltToSave()).toBeTruthy();
    });

    it('should display xslt (no custom)', () => {
      expect(component.xslt()).toBeFalsy();
      expect(component.xsltStatus()).toBe(XSLTStatus.LOADING);

      fixture.detectChanges();
      expect(component.xsltStatus()).toBe(XSLTStatus.NOCUSTOM);

      component.loadDefaultXSLT();
      vi.advanceTimersByTime(1);
      fixture.detectChanges();

      expect(component.xsltStatus()).toBe(XSLTStatus.NEWCUSTOM);
      expect(component.xslt()).toBeTruthy();
    });

    it('should save xslt (custom)', () => {
      fixture.detectChanges();

      component.xsltStatus.set(XSLTStatus.HASCUSTOM);
      component.loadDefaultXSLT();
      vi.advanceTimersByTime(1);
      fixture.detectChanges();
      expect(component.xsltStatus()).toBe(XSLTStatus.HASCUSTOM);

      component.saveCustomXSLT(false);
      vi.advanceTimersByTime(2);
      fixture.detectChanges();

      expect(component.notification()!.content).toBe('en:xsltSuccessful');
    });

    it('should save xslt', () => {
      fixture.detectChanges();
      expect(component.xsltStatus()).toBe(XSLTStatus.NOCUSTOM);

      component.loadDefaultXSLT();
      vi.advanceTimersByTime(1);
      fixture.detectChanges();
      expect(component.xsltStatus()).toBe(XSLTStatus.NEWCUSTOM);

      component.saveCustomXSLT(false);
      vi.advanceTimersByTime(2);
      fixture.detectChanges();

      expect(component.notification()!.content).toBe('en:xsltSuccessful');
    });

    it('should try out saved xslt', () => {
      vi.spyOn(component, 'tryOutXSLT');

      component.loadDefaultXSLT();
      vi.advanceTimersByTime(1);
      fixture.detectChanges();

      component.saveCustomXSLT(true);
      vi.advanceTimersByTime(2);
      fixture.detectChanges();

      expect(component.tryOutXSLT).toHaveBeenCalled();
    });

    it('should try out the xslt', () => {
      vi.spyOn(router, 'navigate');

      vi.advanceTimersByTime(1);
      fixture.detectChanges();

      component.tryOutXSLT('default');
      expect(router.navigate).toHaveBeenCalledWith(['/dataset/preview/1']);
    });

    it('should change the xslt status on cancel', () => {
      fixture.detectChanges();
      component.cancel();
      expect(component.xsltStatus()).toBe(XSLTStatus.NOCUSTOM);

      component.loadDefaultXSLT();
      vi.advanceTimersByTime(1);
      fixture.detectChanges();
      expect(component.xsltStatus()).toBe(XSLTStatus.NEWCUSTOM);

      component.cancel();
      vi.advanceTimersByTime(1);
      fixture.detectChanges();
      expect(component.xsltStatus()).toBe(XSLTStatus.NOCUSTOM);
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      configureTestbed(true);
      b4Each();
    });

    it('should handle errors displaying the xslt', () => {
      expect(component.notification()).toBeFalsy();

      component.loadDefaultXSLT();
      vi.advanceTimersByTime(1);
      fixture.detectChanges();

      expect(component.notification()).toBeTruthy();
    });

    it('should handle errors saving xslt', () => {
      expect(component.notification()).toBeFalsy();

      component.saveCustomXSLT(false);
      vi.advanceTimersByTime(2);
      fixture.detectChanges();

      expect(component.notification()).toBeTruthy();
    });

    it('should handle errors loading custom XSLT', () => {
      expect(component.notification()).toBeFalsy();

      fixture.componentRef.setInput('datasetData', ({
        xsltId: '1'
      } as unknown) as Dataset);

      fixture.detectChanges();

      component.loadCustomXSLT();
      vi.advanceTimersByTime(1);
      fixture.detectChanges();

      expect(component.notification()).toBeTruthy();
    });
  });
});
