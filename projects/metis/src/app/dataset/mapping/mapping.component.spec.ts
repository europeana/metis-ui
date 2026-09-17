import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
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
import { PreviewComponent } from '../';
import { MappingComponent } from '.';

describe('MappingComponent', () => {
  let component: MappingComponent;
  let fixture: ComponentFixture<MappingComponent>;
  let router: Router;

  const configureTestbed = (errorMode = false): void => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: './dataset/preview/1', component: PreviewComponent }
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
      .compileComponents();
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(MappingComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('datasetData', mockDataset);
    router = TestBed.inject(Router);
  };

  beforeEach(() => {
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
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
      const fnCallBack = jasmine.createSpy();
      expect(component.xsltStatus).toEqual('loading');
      expect(component.xsltToSave).toBeFalsy();

      fixture.componentRef.setInput('datasetData', ({
        xsltId: '1'
      } as unknown) as Dataset);
      fixture.detectChanges();

      component.loadCustomXSLT(fnCallBack);
      jasmine.clock().tick(1);
      fixture.detectChanges();

      expect(component.xsltStatus).toBe(XSLTStatus.HASCUSTOM);
      expect(component.xsltToSave).toBeTruthy();
      expect(fnCallBack).toHaveBeenCalled();
    });

    it('should display xslt (no custom)', () => {
      expect(component.xslt).toBeFalsy();
      expect(component.xsltStatus).toBe('loading');
      fixture.detectChanges();
      expect(component.xsltStatus).toBe(XSLTStatus.NOCUSTOM);

      component.loadDefaultXSLT();
      jasmine.clock().tick(1);
      fixture.detectChanges();

      expect(component.xsltStatus).toBe(XSLTStatus.NEWCUSTOM);
      expect(fixture.debugElement.queryAll(By.css('.view-sample-expanded')).length).toBeTruthy();
      expect(component.xslt).toBeTruthy();

      jasmine.clock().tick(1);
      fixture.detectChanges();
    });

    it('should save xslt (custom)', () => {
      fixture.detectChanges();
      component.xsltStatus = XSLTStatus.HASCUSTOM;
      component.loadDefaultXSLT();
      jasmine.clock().tick(1);
      fixture.detectChanges();
      expect(component.xsltStatus).toBe(XSLTStatus.HASCUSTOM);

      component.saveCustomXSLT(false);
      jasmine.clock().tick(2);
      fixture.detectChanges();

      expect(component.notification!.content).toBe('en:xsltSuccessful');
    });

    it('should save xslt', () => {
      fixture.detectChanges();
      expect(component.xsltStatus).toBe('no-custom');

      component.loadDefaultXSLT();
      jasmine.clock().tick(1);
      fixture.detectChanges();
      expect(component.xsltStatus).toBe('new-custom');

      component.saveCustomXSLT(false);
      jasmine.clock().tick(2);
      fixture.detectChanges();

      expect(component.notification!.content).toBe('en:xsltSuccessful');
    });

    it('should try out saved xslt', () => {
      spyOn(component, 'tryOutXSLT');

      component.loadDefaultXSLT();
      jasmine.clock().tick(1);
      fixture.detectChanges();

      component.saveCustomXSLT(true);
      jasmine.clock().tick(2);
      fixture.detectChanges();

      expect(component.tryOutXSLT).toHaveBeenCalled();
    });

    it('should try out the xslt', () => {
      spyOn(router, 'navigate');

      jasmine.clock().tick(1);
      fixture.detectChanges();

      component.tryOutXSLT('default');
      expect(router.navigate).toHaveBeenCalledWith(['/dataset/preview/1']);
    });

    it('should change the xslt status on cancel', () => {
      fixture.detectChanges();
      component.cancel();
      expect(component.xsltStatus).toBe('no-custom');

      component.loadDefaultXSLT();
      jasmine.clock().tick(1);
      expect(component.xsltStatus).toBe('new-custom');

      component.cancel();
      jasmine.clock().tick(1);
      expect(component.xsltStatus).toBe('no-custom');
    });
  });

  describe('Error handling', () => {
    beforeEach(() => {
      configureTestbed(true);
      b4Each();
    });

    it('should handle errors displaying the xslt', () => {
      expect(component.notification).toBeFalsy();

      component.loadDefaultXSLT();
      jasmine.clock().tick(1);
      fixture.detectChanges();

      expect(component.notification).toBeTruthy();
    });

    it('should handle errors saving xslt', () => {
      expect(component.notification).toBeFalsy();

      component.saveCustomXSLT(false);
      jasmine.clock().tick(2);
      fixture.detectChanges();

      expect(component.notification).toBeTruthy();
    });

    it('should handle errors loading custom XSLT', () => {
      expect(component.notification).toBeFalsy();

      fixture.componentRef.setInput('datasetData', ({
        xsltId: '1'
      } as unknown) as Dataset);
      fixture.detectChanges();

      component.loadCustomXSLT();
      jasmine.clock().tick(1);
      fixture.detectChanges();

      expect(component.notification).toBeTruthy();
    });
  });
});
