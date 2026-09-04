import { Component, input } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgTemplateOutlet } from '@angular/common';
import { ParameterFieldName, WorkflowFieldData } from '../../../_models';
import { TranslatePipe } from '../../../_translate';
import { CheckboxComponent } from 'shared';

@Component({
  selector: 'app-workflow-form-field-transform',
  templateUrl: './workflow-form-field-transform.component.html',
  styleUrls: ['./workflow-form-field-transform.component.scss'],
  imports: [FormsModule, ReactiveFormsModule, NgTemplateOutlet, TranslatePipe, CheckboxComponent]
})
export class WorkflowFormFieldTransformComponent {
  public ParameterFieldName = ParameterFieldName;

  conf = input.required<WorkflowFieldData>();
  customXsltAllowed = input<boolean>(false);
  workflowForm = input.required<FormGroup>();
}
