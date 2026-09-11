import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';

import { createMockPipe } from 'shared';
import { MockTranslateService } from '../../../_mocked';
import { DragType, ParameterFieldName, PluginType } from '../../../_models';
import { TranslatePipe, TranslateService } from '../../../_translate';

import { WorkflowFormFieldLinkCheckComponent } from '.';

describe('WorkflowFormFieldLinkCheckComponent (Zoneless)', () => {
  let component: WorkflowFormFieldLinkCheckComponent;
  let fixture: ComponentFixture<WorkflowFormFieldLinkCheckComponent>;

  const formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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

    fixture.componentRef.setInput('conf', {
      label: PluginType.LINK_CHECKING,
      name: 'pluginLINK_CHECKING',
      dragType: DragType.dragNone,
      parameterFields: [ParameterFieldName.performSampling]
    });

    fixture.componentRef.setInput(
      'workflowForm',
      formBuilder.group({
        pluginLINK_CHECKING: [false],
        performSampling: [false]
      })
    );

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
