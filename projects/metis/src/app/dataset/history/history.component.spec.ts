import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';

import {
  createMockPipe,
  mockDataset,
  MockErrorService,
  mockWorkflowExecutionResults,
  MockWorkflowService
} from '../../_mocked';
import { ErrorService, WorkflowService } from '../../_services';

import { PreviewComponent } from '../preview';
import { HistoryComponent } from '.';

describe('HistoryComponent', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([
          { path: './dataset/preview/*', component: PreviewComponent }
        ])
      ],
      declarations: [
        HistoryComponent,
        createMockPipe('translate'),
        createMockPipe('renameWorkflow')
      ],
      providers: [
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: ErrorService, useClass: MockErrorService }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset the templateRowIndex', () => {
    component.templateRowIndex = 5;
    component.resetTemplateRowIndex();
    expect(component.templateRowIndex).toEqual(0);
  });

  it('should tell if the row is stripey', () => {
    expect(component.rowIsStripe()).toBeFalsy();
    expect(component.rowIsStripe()).toBeTruthy();
    expect(component.rowIsStripe()).toBeFalsy();
  });

  it('should load the next page', () => {
    component.datasetData = mockDataset;
    expect(component.currentPage).toEqual(0);
    component.loadNextPage();
    expect(component.currentPage).toEqual(1);
  });

  it('should copy the information', () => {
    component.copyInformation('X', '1', '2');
    expect(component.contentCopied).toBeTruthy();
  });

  it('should update history panel', () => {
    component.datasetData = mockDataset;
    component.lastExecutionData = mockWorkflowExecutionResults.results[4];
    fixture.detectChanges();
    expect(component.allExecutions).toBeTruthy();
  });

  it('should display history in tabs', fakeAsync(() => {
    component.datasetData = mockDataset;
    component.returnAllExecutions();
    tick(1);
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.table-grid.history')).length).toBeTruthy();
  }));
});
