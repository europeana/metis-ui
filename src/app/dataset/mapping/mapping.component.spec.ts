import { async, ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks } from '@angular/core/testing';
import { CodemirrorModule } from 'ng2-codemirror';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MockWorkflowService, MockDatasetService, currentWorkflow, currentDataset, xslt, MockAuthenticationService, currentUser, statistics } from '../../_mocked';

import { DatasetsService, WorkflowService, TranslateService, RedirectPreviousUrl, ErrorService, AuthenticationService } from '../../_services';

import { MappingComponent } from './mapping.component';

import { By } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TRANSLATION_PROVIDERS, TranslatePipe }   from '../../_translate';
import { XmlPipe }   from '../../_helpers';

describe('MappingComponent', () => {
  let component: MappingComponent;
  let fixture: ComponentFixture<MappingComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule, CodemirrorModule, FormsModule ],
      declarations: [ MappingComponent, TranslatePipe, XmlPipe ],
      providers: [ {provide: WorkflowService, useClass: MockWorkflowService}, 
        { provide: DatasetsService, useClass: MockDatasetService },
        { provide: TranslateService,
          useValue: {
            translate: () => {
              return {};
            }
          }
        },
        RedirectPreviousUrl,
        ErrorService,
        { provide: AuthenticationService, useClass: MockAuthenticationService}
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingComponent);
    component = fixture.componentInstance;
    component.datasetData = currentDataset;
    router = TestBed.get(Router);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should expand statistics', () => {
    component.statistics = statistics['nodeStatistics'];
    fixture.detectChanges();

    component.toggleStatistics();
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.view-statistics.view-sample-expanded')).length).toBeTruthy();
  });

  it('should display xslt', () => {
    component.loadXSLT('default');
    component.fullView = true;
    fixture.detectChanges();    
    expect(fixture.debugElement.queryAll(By.css('.view-sample-expanded')).length).toBeTruthy();
  });

  it('should save xslt', () => {
    component.fullView = true;
    component.loadXSLT('default');
    fixture.detectChanges();
    component.saveXSLT();
    fixture.detectChanges();    
    expect(component.xsltType).toBe('custom');
  });

  it('should not display messages', () => {
    component.successMessage = 'test';
    component.closeMessages();
    fixture.detectChanges(); 
    expect(component.successMessage).toBe(undefined);
  });

  it('should display xslt in cards', () => {
    fixture.detectChanges();
    component.fullView = false;
    component.loadXSLT('default');
    fixture.detectChanges();      
    expect(component.xslt.length).not.toBe(1);
  });

  it('should expand xslt card', () => {
    component.fullView = false;
    component.loadXSLT('default');
    fixture.detectChanges();    
    component.expandSample(1);    
    expect(component.expandedSample).toBe(1);
  });

  it('should create a full xslt after viewing cards', () => {
    component.loadXSLT('default');
    component.fullView = false;
    component.getFullXSLT();
    component.saveXSLT();
    expect(component.xsltType).toBe('custom');
  });

  it('should try out the xslt', fakeAsync((): void => {
    component.fullView = false;
    
    spyOn(router, 'navigate').and.callFake(() => { });
    tick();
    
    component.tryOutXSLT('default');
    expect(router.navigate).toHaveBeenCalledWith(['/dataset/preview/1']);

  }));

});
