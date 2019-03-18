import { HttpErrorResponse } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { throwError } from 'rxjs';

import { getCodeMirrorEditors } from '../../_helpers/test-helpers';
import {
  createMockPipe,
  mockDataset,
  MockDatasetsService,
  MockErrorService,
  MockTranslateService,
  MockWorkflowService,
} from '../../_mocked';
import { DatasetsService, ErrorService, WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';

import { MappingComponent } from '.';

describe('MappingComponent', () => {
  let component: MappingComponent;
  let fixture: ComponentFixture<MappingComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [MappingComponent, createMockPipe('translate'), createMockPipe('beautifyXML')],
      providers: [
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: DatasetsService, useClass: MockDatasetsService },
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: ErrorService, useClass: MockErrorService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingComponent);
    component = fixture.componentInstance;
    component.datasetData = mockDataset;
    router = TestBed.get(Router);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display xslt', () => {
    expect(component.xslt).toBeFalsy();
    expect(component.xsltStatus).toBe('loading');
    fixture.detectChanges();
    expect(component.xsltStatus).toBe('no-custom');

    component.loadDefaultXSLT();
    fixture.detectChanges();
    expect(component.xsltStatus).toBe('new-custom');
    expect(fixture.debugElement.queryAll(By.css('.view-sample-expanded')).length).toBeTruthy();
    expect(component.xslt).toBeTruthy();
  });

  it('should handle errors displaying the xslt', () => {
    expect(component.notification).toBeFalsy();
    const cmpDatasetsService = fixture.debugElement.injector.get<DatasetsService>(DatasetsService);

    spyOn(cmpDatasetsService, 'getXSLT').and.returnValue(
      throwError(new HttpErrorResponse({ error: 'err', status: 404, statusText: 'errText' })),
    );
    component.loadDefaultXSLT();
    fixture.detectChanges();
    expect(component.notification).toBeTruthy();
  });

  it('should save xslt', () => {
    fixture.detectChanges();
    expect(component.xsltStatus).toBe('no-custom');

    component.loadDefaultXSLT();
    fixture.detectChanges();
    expect(component.xsltStatus).toBe('new-custom');

    component.saveCustomXSLT(false);
    fixture.detectChanges();
    expect(component.notification!.content).toBe('en:xsltsuccessful');
  });

  it('should try out the xslt', fakeAsync((): void => {
    spyOn(router, 'navigate').and.callFake(() => {});
    tick();

    component.tryOutXSLT('default');
    expect(router.navigate).toHaveBeenCalledWith(['/dataset/preview/1']);
  }));

  it('toggles the editor theme', () => {
    component.allEditors = getCodeMirrorEditors();
    expect(component.editorIsDefaultTheme).toEqual(true);
    component.onThemeSet(false);
    fixture.detectChanges();
    expect(component.editorIsDefaultTheme).toEqual(false);
  });
});
