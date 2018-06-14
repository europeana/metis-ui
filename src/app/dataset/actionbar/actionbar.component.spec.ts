import { RouterTestingModule } from '@angular/router/testing';
import { DatasetsService, WorkflowService, AuthenticationService, ErrorService, RedirectPreviousUrl, TranslateService } from '../../_services';
import { MockAuthenticationService, MockWorkflowService, MockDatasetService, currentWorkflow, currentDataset, currentUser } from '../../_mocked';

import { TRANSLATION_PROVIDERS, TranslatePipe, RenameWorkflowPipe }   from '../../_translate';
import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { Observable } from 'rxjs';
import { async, fakeAsync, tick, ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionbarComponent } from './actionbar.component';


describe('ActionbarComponent', () => {
  let component: ActionbarComponent;
  let fixture: ComponentFixture<ActionbarComponent>;
  let service;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule],
      declarations: [ ActionbarComponent, TranslatePipe, RenameWorkflowPipe ],
      providers:    [ {provide: WorkflowService, useClass: MockWorkflowService}, 
        {provide: DatasetsService, useClass: MockDatasetService}, 
        { provide: AuthenticationService, useClass: MockAuthenticationService}, 
        ErrorService, 
        RedirectPreviousUrl,
        { provide: TranslateService,
            useValue: {
              translate: () => {
                return {};
              }
            }
        }]       
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionbarComponent);
    component = fixture.componentInstance;  
  });

  it('should create', () => {    
    component.datasetData = currentDataset;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should return last execution and start polling a running execution', () => {    
    fixture.detectChanges();
    component.datasetData = currentDataset;
    component.returnLastExecution();

    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.dataset-actionbar .progressbar')).length).toBeTruthy();
  });

  it('should do click to show logging', fakeAsync((): void => {
    component.currentWorkflow = currentWorkflow['results'][0];
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

  it('should cancel', (): void => {
    component.currentWorkflow = currentWorkflow;
    component.currentStatus = 'RUNNING';
    fixture.detectChanges();

    const cancel = fixture.debugElement.query(By.css('.dataset-actionbar nav .cancel-btn'));
    if (cancel) {
      cancel.triggerEventHandler('click', null);
      component.currentStatus = 'CANCELLED';
      fixture.detectChanges();
      expect(component.currentStatus).toBe('CANCELLED');
    }
  });

  it('should run a workflow', (): void => {
    component.currentWorkflow = currentWorkflow;
    component.currentStatus = 'FINISHED';
    fixture.detectChanges();
    const run = fixture.debugElement.query(By.css('.newaction-btn'));
    if (run) {
      run.triggerEventHandler('click', null);
      component.currentStatus = 'INQUEUE';
      fixture.detectChanges();
      expect(component.currentStatus).toBe('INQUEUE');
    }
  });

  it('should have a running workflow', (): void => {
    component.currentWorkflow = currentWorkflow;
    component.currentStatus = 'RUNNING';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.dataset-actionbar .progress') === null).toBe(false);
  });

  /*it('should update after workflow change', async(() => {
    spyOn(component.workflows.changeWorkflow, 'emit').and.returnValue(currentWorkflow['results'][0]);
  }));*/

});
