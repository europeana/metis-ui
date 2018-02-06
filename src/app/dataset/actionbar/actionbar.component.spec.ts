import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DatasetsService, WorkflowService, AuthenticationService, ErrorService, RedirectPreviousUrl } from '../../_services';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { ActionbarComponent } from './actionbar.component';
import { WorkflowServiceStub } from '../../_mocked';

describe('ActionbarComponent', () => {
  let component: ActionbarComponent;
  let fixture: ComponentFixture<ActionbarComponent>;
  let tempWorkflowService;

  beforeEach(() => {

    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule],
      declarations: [ ActionbarComponent ],
      providers:    [ {provide: WorkflowService, useValue: WorkflowServiceStub }, AuthenticationService, ErrorService, RedirectPreviousUrl ]
    });

    fixture = TestBed.createComponent(ActionbarComponent);
    component    = fixture.componentInstance;

    tempWorkflowService = TestBed.get(WorkflowService);

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

  it('stub object and injected service should not be the same', () => {
    expect(tempWorkflowService === WorkflowService).toBe(false);
  });

  it('should have a running workflow', (): void => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.dataset-actionbar') === null).toBe(false);
  });

});
