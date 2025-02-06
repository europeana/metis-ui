import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { createMockPipe, MockTranslateService } from '../../../_mocked';
import { DragType, ParameterFieldName, PluginType } from '../../../_models';
import { TranslatePipe, TranslateService } from '../../../_translate';

import { WorkflowFormFieldLinkCheckComponent } from '.';

describe('WorkflowFormFieldLinkCheckComponent', () => {
  let component: WorkflowFormFieldLinkCheckComponent;
  let fixture: ComponentFixture<WorkflowFormFieldLinkCheckComponent>;

  const formBuilder: FormBuilder = new FormBuilder();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, WorkflowFormFieldLinkCheckComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: FormBuilder, useValue: formBuilder },
        {
          provide: TranslatePipe,
          useValue: createMockPipe('translate')
        },
        {
          provide: TranslateService,
          useClass: MockTranslateService
        }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(WorkflowFormFieldLinkCheckComponent);
    component = fixture.componentInstance;
    component.conf = {
      label: PluginType.LINK_CHECKING,
      name: 'pluginLINK_CHECKING',
      dragType: DragType.dragNone,
      parameterFields: [ParameterFieldName.performSampling]
    };
    component.workflowForm = formBuilder.group({
      pluginLINK_CHECKING: [false],
      performSampling: [false]
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
