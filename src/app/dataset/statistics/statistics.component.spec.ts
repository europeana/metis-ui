import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
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

import { StatisticsComponent } from '.';

describe('StatisticsComponent', () => {
  let component: StatisticsComponent;
  let fixture: ComponentFixture<StatisticsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [
        StatisticsComponent,
        createMockPipe('translate'),
        createMockPipe('beautifyXML'),
      ],
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
    fixture = TestBed.createComponent(StatisticsComponent);
    component = fixture.componentInstance;
    component.datasetData = mockDataset;
  });

  it('should expand statistics', () => {
    component.statistics = mockStatistics;
    fixture.detectChanges();

    component.toggleStatistics();
    fixture.detectChanges();
    expect(
      fixture.debugElement.queryAll(By.css('.view-statistics.view-sample-expanded')).length,
    ).toBeTruthy();
  });
});
