import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { CheckboxComponent } from 'shared';
import { createMockPipe } from '../../../_mocked';
import { DragType, ParameterFieldName, PluginType } from '../../../_models';
import { WorkflowFormFieldTransformComponent } from '.';

describe('WorkflowFormFieldTransformComponent', () => {
  let component: WorkflowFormFieldTransformComponent;
  let fixture: ComponentFixture<WorkflowFormFieldTransformComponent>;

  const formBuilder: FormBuilder = new FormBuilder();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [
        CheckboxComponent,
        WorkflowFormFieldTransformComponent,
        createMockPipe('translate')
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [{ provide: FormBuilder, useValue: formBuilder }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowFormFieldTransformComponent);
    component = fixture.componentInstance;
    component.conf = {
      label: PluginType.TRANSFORMATION,
      name: 'pluginTRANSFORMATION',
      dragType: DragType.dragNone,
      parameterFields: [ParameterFieldName.customXslt]
    };
    component.workflowForm = formBuilder.group({
      pluginTRANSFORMATION: [false],
      customXslt: [File]
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the ParameterFieldName', () => {
    expect(component.ParameterFieldName).toBeTruthy();
  });
});
