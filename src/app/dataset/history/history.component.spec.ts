import { async, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { By } from '@angular/platform-browser';

import {BaseRequestOptions, ConnectionBackend, Http, RequestOptions} from '@angular/http';
import {Response, ResponseOptions} from '@angular/http';
import {MockBackend, MockConnection} from '@angular/http/testing';
import { TRANSLATION_PROVIDERS, TranslatePipe }   from '../../_translate';

import { DatasetsService, WorkflowService, AuthenticationService, RedirectPreviousUrl, ErrorService, TranslateService } from '../../_services';

import { HistoryComponent } from './history.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('HistoryComponent', () => {
  let component: HistoryComponent;
  let fixture: ComponentFixture<HistoryComponent>;
  let spy: any;


  let datasetData = { 
    datasetId: 1 
  }

  const mockHttpProvider = {  
    deps: [ MockBackend, BaseRequestOptions ],
    useFactory: (backend: MockBackend, defaultOptions: BaseRequestOptions) => {
      return new Http(backend, defaultOptions);
    }
  }

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientModule],
      declarations: [ HistoryComponent, TranslatePipe ],
      providers: [ DatasetsService,    
        WorkflowService,     
        RedirectPreviousUrl, 
        AuthenticationService, 
        ErrorService,
        { provide: TranslateService,
          useValue: {
            translate: () => {
              return {};
            }
          }
        }],
      schemas: [ NO_ERRORS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HistoryComponent);
    component = fixture.componentInstance;
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

