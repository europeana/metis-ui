import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import {
  createMockPipe,
  mockDataset,
  MockDatasetsService,
  MockErrorService,
  mockStatistics,
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

  it('should expand statistics', () => {
    component.statistics = mockStatistics.nodeStatistics;
    fixture.detectChanges();

    component.toggleStatistics();
    fixture.detectChanges();
    expect(
      fixture.debugElement.queryAll(By.css('.view-statistics.view-sample-expanded')).length,
    ).toBeTruthy();
  });

  it('should display xslt', () => {
    expect(component.xsltStatus).toBe('loading');
    fixture.detectChanges();
    expect(component.xsltStatus).toBe('no-custom');

    component.loadDefaultXSLT();
    fixture.detectChanges();
    expect(component.xsltStatus).toBe('new-custom');
    expect(fixture.debugElement.queryAll(By.css('.view-sample-expanded')).length).toBeTruthy();
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
});
