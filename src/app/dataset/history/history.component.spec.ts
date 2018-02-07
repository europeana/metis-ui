import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { By } from '@angular/platform-browser';

import { DatasetsService, WorkflowService, AuthenticationService, RedirectPreviousUrl, ErrorService } from '../../_services';
import { MockWorkflowService } from '../../_mocked/workflow.mocked';

import { HistoryComponent } from './history.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('HistoryComponent', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientModule],
      declarations: [ HistoryComponent ],
      providers: [ DatasetsService, 
        {provide: WorkflowService, useValue: MockWorkflowService }, 
        RedirectPreviousUrl, 
        AuthenticationService, 
        ErrorService ],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryComponent);
    component = fixture.componentInstance;
    component.workflows = MockWorkflowService;
    fixture.detectChanges();
  });

  it('should show in collapsable panel', () => {
    component.inCollapsablePanel = true;
    fixture.detectChanges();
  });

  it('should show in tab', () => {
    component.inCollapsablePanel = false;
    fixture.detectChanges();
  });

  it('should go to next page', () => {
    component.inCollapsablePanel = false;
    component.datasetData = this.mockedDataset;
    component.nextPage = 0;
    component.returnAllExecutions();    
    fixture.detectChanges();    
  });

  it('should open workflow filter', (): void => {   
    const workflow = fixture.debugElement.query(By.css('.dropdown a'));
    if (workflow) {
      workflow.triggerEventHandler('click', null);
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.dropdown ul')).length).toBeTruthy();

      component.allWorkflows = ['mocked'];
      const filter = fixture.debugElement.query(By.css('.dropdown ul a'));
      filter.triggerEventHandler('click', null);
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.dropdown ul')).length).not.toBeTruthy();

      component.filterWorkflow = true;
      component.toggleFilterByWorkflow();
      component.onClickedOutside();
      fixture.detectChanges();
    }
  });

  it('should click load more', (): void => {   
    const loadmore = fixture.debugElement.query(By.css('.load-more-btn'));
    if (loadmore) {
      loadmore.triggerEventHandler('click', null);
      fixture.detectChanges();
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  
});

