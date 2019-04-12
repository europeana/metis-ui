import { NO_ERRORS_SCHEMA, QueryList } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { createMockPipe, MockTranslateService, MockWorkflowService } from '../../_mocked';
import { WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';

import { ExecutionsgridComponent } from '.';
import { GridrowComponent } from './gridrow';

describe('ExecutionsgridComponent', () => {
  let component: ExecutionsgridComponent;
  let fixture: ComponentFixture<ExecutionsgridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [
        ExecutionsgridComponent,
        createMockPipe('renameWorkflow'),
        createMockPipe('translate'),
      ],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: TranslateService, useClass: MockTranslateService },
        { provide: WorkflowService, useClass: MockWorkflowService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutionsgridComponent);
    component = fixture.componentInstance;
  });

  it('should load', () => {
    expect(component.isLoading).toBe(true);
    component.load();
    expect(component.isLoading).toBe(false);
    expect(component.currentPage).toEqual(0);
  });

  it('should load the next page', () => {
    component.load();
    expect(component.currentPage).toEqual(0);
    component.loadNextPage();
    expect(component.currentPage).toEqual(1);
  });

  it('should set the selected index', () => {
    // tslint:disable: no-any
    component.rows = ([{ expanded: true }, { expanded: true }] as any) as QueryList<
      GridrowComponent
    >;
    expect(component.selectedDsId).toEqual('');
    component.setSelectedDsId('3');
    expect(component.selectedDsId).toEqual('3');
  });
});
