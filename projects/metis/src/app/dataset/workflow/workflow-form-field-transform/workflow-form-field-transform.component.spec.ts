import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { CheckboxComponent, createMockPipe } from 'shared';
import { MockTranslateService } from '../../../_mocked';
import { TranslatePipe, TranslateService } from '../../../_translate';
import { DragType, ParameterFieldName, PluginType } from '../../../_models';
import { WorkflowFormFieldTransformComponent } from '.';

describe('WorkflowFormFieldTransformComponent (Zoneless)', () => {
  let component: WorkflowFormFieldTransformComponent;
  let fixture: ComponentFixture<WorkflowFormFieldTransformComponent>;

  const formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckboxComponent, ReactiveFormsModule, WorkflowFormFieldTransformComponent],
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

    fixture = TestBed.createComponent(WorkflowFormFieldTransformComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('conf', {
      label: PluginType.TRANSFORMATION,
      name: 'pluginTRANSFORMATION',
      dragType: DragType.dragNone,
      parameterFields: [ParameterFieldName.customXslt]
    });

    fixture.componentRef.setInput(
      'workflowForm',
      formBuilder.group({
        pluginTRANSFORMATION: [false],
        customXslt: [File]
      })
    );

    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the ParameterFieldName', () => {
    expect(component.ParameterFieldName).toBeTruthy();
  });
});
