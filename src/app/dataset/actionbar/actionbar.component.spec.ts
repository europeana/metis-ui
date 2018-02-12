import { RouterTestingModule } from '@angular/router/testing';
import { DatasetsService, WorkflowService, AuthenticationService, ErrorService, RedirectPreviousUrl } from '../../_services';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import {async, fakeAsync, tick, ComponentFixture, TestBed} from '@angular/core/testing';
import {BaseRequestOptions, ConnectionBackend, Http, RequestOptions} from '@angular/http';
import {Response, ResponseOptions} from '@angular/http';
import {MockBackend, MockConnection} from '@angular/http/testing';
 

import { ActionbarComponent } from './actionbar.component';

describe('ActionbarComponent', () => {
  let component: ActionbarComponent;
  let fixture: ComponentFixture<ActionbarComponent>;

  let currentWorkflow = { 
    workflowName: 'mocked';
  }

  const mockHttpProvider = {  
    deps: [ MockBackend, BaseRequestOptions ],
    useFactory: (backend: MockBackend, defaultOptions: BaseRequestOptions) => {
      return new Http(backend, defaultOptions);
    }
  }

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule],
      declarations: [ ActionbarComponent ],
      providers:    [ WorkflowService, AuthenticationService, ErrorService, RedirectPreviousUrl ]
    });

    fixture = TestBed.createComponent(ActionbarComponent);
    component    = fixture.componentInstance;

  });

  it('should create', () => {    
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should do click to show logging', fakeAsync((): void => {
    fixture.detectChanges();

    let button = fixture.debugElement.query(By.css('.log-btn'));
    if (button) {
      spyOn(component.notifyShowLogStatus, 'emit');
      button.nativeElement.click();

      fixture.detectChanges();
      tick();

      expect(component.notifyShowLogStatus.emit).toHaveBeenCalled();
    } 
    
  }));

  it('should open workflow filter', (): void => {   
    
    component.currentWorkflow = currentWorkflow;
    component.currentStatus = 'FINISHED';
    fixture.detectChanges();

    const workflow = fixture.debugElement.query(By.css('.dataset-actionbar nav .newaction-btn'));
    if (workflow) {
      workflow.triggerEventHandler('click', null);
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.workflow-selector')).length).toBeTruthy();

      component.allWorkflows = ['mocked'];
      const filter = fixture.debugElement.query(By.css('.workflow-selector a'));
      filter.triggerEventHandler('click', null);
      fixture.detectChanges();
      expect(fixture.debugElement.queryAll(By.css('.workflow-selector')).length).not.toBeTruthy();

      component.onClickedOutsideWorkflow();
      fixture.detectChanges();
    }
  });  

  it('should open log', (): void => { 

    component.currentWorkflow = currentWorkflow;
    fixture.detectChanges();

    expect(fixture.debugElement.query(By.css('.dataset-actionbar nav .log-btn')).length).not.toBeTruthy();

    const log = fixture.debugElement.query(By.css('.dataset-actionbar nav .log-btn'));
    log.triggerEventHandler('click', null);
    fixture.detectChanges();

  });

  it('should cancel', (): void => {

    component.currentWorkflow = currentWorkflow;
    component.currentStatus = 'RUNNING';
    fixture.detectChanges();

    const cancel = fixture.debugElement.query(By.css('.dataset-actionbar nav .cancel-btn'));
    if (cancel) {
      cancel.triggerEventHandler('click', null);
      fixture.detectChanges();
    }


  });

  it('should have a running workflow', (): void => {
    component.currentWorkflow = currentWorkflow;
    component.currentStatus = 'RUNNING';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.dataset-actionbar .progress') === null).toBe(false);
  });

});
