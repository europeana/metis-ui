import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { createMockPipe } from 'shared';
import { MockTranslateService } from '../../../_mocked';
import { DragType, ParameterFieldName, PluginType } from '../../../_models';
import { TranslatePipe, TranslateService } from '../../../_translate';

import { WorkflowFormFieldMediaProcessComponent } from '.';

describe('WorkflowFormFieldMediaProcessComponent', () => {
  let component: WorkflowFormFieldMediaProcessComponent;
  let fixture: ComponentFixture<WorkflowFormFieldMediaProcessComponent>;

  const formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, WorkflowFormFieldMediaProcessComponent],
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

    fixture = TestBed.createComponent(WorkflowFormFieldMediaProcessComponent);
    component = fixture.componentInstance;

    // Use setInput to safely register dynamic form values into required signals
    fixture.componentRef.setInput('conf', {
      label: PluginType.MEDIA_PROCESS,
      name: 'pluginMEDIA_PROCESS',
      dragType: DragType.dragNone,
      parameterFields: [ParameterFieldName.throttlingLevel]
    });

    fixture.componentRef.setInput(
      'workflowForm',
      formBuilder.group({
        pluginMEDIA_PROCESS: [false],
        throttlingLevel: ['']
      })
    );

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
