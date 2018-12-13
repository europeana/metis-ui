import { NO_ERRORS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import {
  createMockPipe,
  currentWorkflow,
  MockTranslateService,
  MockWorkflowService,
} from '../../../_mocked';
import { WorkflowService } from '../../../_services';
import { TranslateService } from '../../../_translate';

import { ExecutiontableComponent } from '.';

describe('ExecutiontableComponent', () => {
  let component: ExecutiontableComponent;
  let fixture: ComponentFixture<ExecutiontableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExecutiontableComponent, createMockPipe('translate')],
      providers: [
        { provide: WorkflowService, useClass: MockWorkflowService },
        { provide: TranslateService, useClass: MockTranslateService },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExecutiontableComponent);
    component = fixture.componentInstance;
    component.execution = currentWorkflow.results[0];
    component.plugin = currentWorkflow.results[0].metisPlugins[0];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should copy information', () => {
    component.copyInformation('plugin', '1', '2');
    fixture.detectChanges();
    expect(component.contentCopied).toBe(true);
  });
});
