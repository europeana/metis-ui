import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CodemirrorModule } from 'ng2-codemirror';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MockWorkflowService, currentWorkflow, currentDataset } from '../../_mocked';

import { WorkflowService, TranslateService, RedirectPreviousUrl, ErrorService, AuthenticationService } from '../../_services';

import { MappingComponent } from './mapping.component';

import { By } from '@angular/platform-browser';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TRANSLATION_PROVIDERS, TranslatePipe }   from '../../_translate';
import { XmlPipe }   from '../../_helpers';

describe('MappingComponent', () => {
  let component: MappingComponent;
  let fixture: ComponentFixture<MappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule, HttpClientTestingModule, CodemirrorModule, FormsModule ],
      declarations: [ MappingComponent, TranslatePipe, XmlPipe ],
      providers: [ {provide: WorkflowService, useClass: MockWorkflowService}, 
        { provide: TranslateService,
          useValue: {
            translate: () => {
              return {};
            }
          }
        },
        RedirectPreviousUrl,
        ErrorService,
        AuthenticationService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display xslt in cards', () => {
    component.fullView = false;
    component.displayXSLT();
    fixture.detectChanges();    
    expect(fixture.debugElement.queryAll(By.css('.view-sample-expanded')).length).not.toBeTruthy();
  });

  it('should expand a statistics', () => {
    component.toggleStatistics();
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.view-statistics.view-sample-expanded')).length).toBeTruthy();
  });

  it('should expand a sample', () => {
    component.fullView = false;
    component.displayXSLT();
    component.expandSample(0);
    fixture.detectChanges();
    expect(fixture.debugElement.queryAll(By.css('.view-sample-expanded')).length).toBeTruthy();
  });
});
