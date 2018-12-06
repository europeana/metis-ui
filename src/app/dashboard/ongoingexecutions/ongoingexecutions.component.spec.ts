import {
  WorkflowService,
  TranslateService,
  DatasetsService,
  ErrorService,
  RedirectPreviousUrl,
} from '../../_services';
import {
  MockWorkflowService,
  currentWorkflow,
  MockTranslateService,
  MockDatasetService,
} from '../../_mocked';
import { TranslatePipe } from '../../_translate';

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import {} from '@angular/platform-browser';

import { OngoingexecutionsComponent } from './ongoingexecutions.component';

describe('OngoingexecutionsComponent', () => {
  let component: OngoingexecutionsComponent;
  let fixture: ComponentFixture<OngoingexecutionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, HttpClientTestingModule],
      declarations: [OngoingexecutionsComponent, TranslatePipe],
      providers: [
        { provide: DatasetsService, useClass: MockDatasetService },
        { provide: WorkflowService, useClass: MockWorkflowService },
        ErrorService,
        RedirectPreviousUrl,
        { provide: TranslateService, useClass: MockTranslateService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OngoingexecutionsComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show a log', () => {
    spyOn(component.setShowPluginLog, 'emit');
    component.showLog(currentWorkflow.results[0]);
    fixture.detectChanges();
    expect(component.setShowPluginLog.emit).toHaveBeenCalled();
  });

  it('should click view all', () => {
    component.viewAll();
    fixture.detectChanges();
    expect(window.pageYOffset).toBe(0);
  });

  it('should copy information', () => {
    component.copyInformation('plugin', '1', '2');
    fixture.detectChanges();
    expect(component.contentCopied).toBe(true);
  });
});
