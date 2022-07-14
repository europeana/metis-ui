import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import {
  createMockPipe,
  mockDataset,
  MockDatasetsService,
  MockDatasetsServiceErrors,
  MockErrorService,
  MockTranslateService,
  MockWorkflowService
} from '../../_mocked';
import { Dataset } from '../../_models';
import { DatasetsService, ErrorService, WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';
import { EditorComponent } from '../';
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
        ])
      ],
      declarations: [
        EditorComponent,
        MappingComponent,
        createMockPipe('translate'),
        createMockPipe('beautifyXML')
      ],
      providers: [
        { provide: WorkflowService, useClass: MockWorkflowService },
        {
          provide: DatasetsService,
          useClass: errorMode ? MockDatasetsServiceErrors : MockDatasetsService
        },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: ErrorService, useClass: MockErrorService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  };

  const b4Each = (): void => {
    fixture = TestBed.createComponent(MappingComponent);
    component = fixture.componentInstance;
    component.datasetData = mockDataset;
    router = TestBed.inject(Router);
  };

  describe('Normal operation', () => {
    beforeEach(async(configureTestbed));
    beforeEach(b4Each);

    it('should create', () => {
      fixture.detectChanges();
      expect(component).toBeTruthy();
    });

    it('should load custom XSLT', fakeAsync(() => {
      expect(component.xsltStatus).toEqual('loading');
      expect(component.xsltToSave).toBeFalsy();
      component.datasetData = ({
        xsltId: '1'
      } as unknown) as Dataset;
      component.loadCustomXSLT();
      tick(1);
      expect(component.xsltStatus).toBe('has-custom');
      expect(component.xsltToSave).toBeTruthy();
    }));

    it('should display xslt', fakeAsync(() => {
      expect(component.xslt).toBeFalsy();
      expect(component.xsltStatus).toBe('loading');
      fixture.detectChanges();
      expect(component.xsltStatus).toBe('no-custom');

      component.loadDefaultXSLT();
      tick(1);
      fixture.detectChanges();
      expect(component.xsltStatus).toBe('new-custom');
      expect(fixture.debugElement.queryAll(By.css('.view-sample-expanded')).length).toBeTruthy();
      expect(component.xslt).toBeTruthy();
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
    beforeEach(async(() => {
      configureTestbed(true);
    }));
    beforeEach(b4Each);

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
