import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CodemirrorComponent, CodemirrorModule } from '@ctrl/ngx-codemirror';

// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
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
import { TranslatePipe, TranslateService } from '../../_translate';
import { XmlPipe } from '../../_helpers';
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
        { provide: XmlPipe, useClass: createMockPipe('beautifyXML') }
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
    component.datasetData = mockDataset;
    router = TestBed.inject(Router);
  };

  describe('Normal operation', () => {
    beforeEach(() => {
      configureTestbed();
      b4Each();
    });

    it('should create', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should load custom XSLT', fakeAsync(() => {
      const fnCallBack = jasmine.createSpy();
      expect(component.xsltStatus).toEqual('loading');
      expect(component.xsltToSave).toBeFalsy();
      component.datasetData = ({
        xsltId: '1'
      } as unknown) as Dataset;
      component.loadCustomXSLT(fnCallBack);
      tick(1);
      expect(component.xsltStatus).toBe(XSLTStatus.HASCUSTOM);
      expect(component.xsltToSave).toBeTruthy();
      expect(fnCallBack).toHaveBeenCalled();
    }));

    it('should display xslt (no custom)', fakeAsync(() => {
      expect(component.xslt).toBeFalsy();
      expect(component.xsltStatus).toBe('loading');
      fixture.detectChanges();
      expect(component.xsltStatus).toBe(XSLTStatus.NOCUSTOM);

      component.loadDefaultXSLT();
      tick(1);
      fixture.detectChanges();
      expect(component.xsltStatus).toBe(XSLTStatus.NEWCUSTOM);
      expect(fixture.debugElement.queryAll(By.css('.view-sample-expanded')).length).toBeTruthy();
      expect(component.xslt).toBeTruthy();
      tick(1);
    }));

    it('should save xslt (custom)', fakeAsync(() => {
      fixture.detectChanges();
      component.xsltStatus = XSLTStatus.HASCUSTOM;
      component.loadDefaultXSLT();
      tick(1);
      fixture.detectChanges();
      expect(component.xsltStatus).toBe(XSLTStatus.HASCUSTOM);
      component.saveCustomXSLT(false);
      tick(2);
      fixture.detectChanges();
      expect(component.notification!.content).toBe('en:xsltSuccessful');
    }));

    it('should save xslt', fakeAsync(() => {
      fixture.detectChanges();
      expect(component.xsltStatus).toBe('no-custom');
      component.loadDefaultXSLT();
      tick(1);
      fixture.detectChanges();
      expect(component.xsltStatus).toBe('new-custom');
      component.saveCustomXSLT(false);
      tick(2);
      fixture.detectChanges();
      expect(component.notification!.content).toBe('en:xsltSuccessful');
    }));

    it('should try out saved xslt', fakeAsync(() => {
      spyOn(component, 'tryOutXSLT');
      component.loadDefaultXSLT();
      tick(1);
      component.saveCustomXSLT(true);
      tick(2);
      expect(component.tryOutXSLT).toHaveBeenCalled();
    }));

    it('should try out the xslt', fakeAsync((): void => {
      spyOn(router, 'navigate');
      tick(1);
      component.tryOutXSLT('default');
      expect(router.navigate).toHaveBeenCalledWith(['/dataset/preview/1']);
    }));

    it('should change the xslt status on cancel', fakeAsync((): void => {
      fixture.detectChanges();
      component.cancel();
      expect(component.xsltStatus).toBe('no-custom');
      component.loadDefaultXSLT();
      tick(1);
      expect(component.xsltStatus).toBe('new-custom');
      component.cancel();
      tick(1);
      expect(component.xsltStatus).toBe('no-custom');
    }));
  });

  describe('Error handling', () => {
    beforeEach(() => {
      configureTestbed(true);
      b4Each();
    });

    it('should handle errors displaying the xslt', fakeAsync(() => {
      expect(component.notification).toBeFalsy();
      component.loadDefaultXSLT();
      tick(1);
      expect(component.notification).toBeTruthy();
    }));

    it('should handle errors saving xslt', fakeAsync(() => {
      expect(component.notification).toBeFalsy();
      component.saveCustomXSLT(false);
      tick(2);
      expect(component.notification).toBeTruthy();
    }));

    it('should handle errors loading custom XSLT', fakeAsync(() => {
      expect(component.notification).toBeFalsy();
      component.datasetData = ({
        xsltId: '1'
      } as unknown) as Dataset;
      component.loadCustomXSLT();
      tick(1);
      expect(component.notification).toBeTruthy();
    }));
  });
});
