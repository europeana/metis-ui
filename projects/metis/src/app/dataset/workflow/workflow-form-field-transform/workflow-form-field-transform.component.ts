import { NgIf, NgTemplateOutlet } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ParameterFieldName, WorkflowFieldData } from '../../../_models';
import { TranslatePipe } from '../../../_translate';
import { CheckboxComponent } from 'shared';

@Component({
  selector: 'app-workflow-form-field-transform',
  templateUrl: './workflow-form-field-transform.component.html',
  styleUrls: ['./workflow-form-field-transform.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    NgTemplateOutlet,
    TranslatePipe,
    CheckboxComponent
  ]
})
export class WorkflowFormFieldTransformComponent {
  public ParameterFieldName = ParameterFieldName;
  @Input() conf: WorkflowFieldData;
  @Input() customXsltAllowed = false;
  @Input() workflowForm: FormGroup;
}
