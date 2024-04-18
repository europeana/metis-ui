import { Component, Input } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ParameterFieldName, WorkflowFieldData } from '../../../_models';
import { TranslatePipe } from '../../../_translate';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-workflow-form-field-link-check',
  templateUrl: './workflow-form-field-link-check.component.html',
  styleUrls: ['./workflow-form-field-link-check.component.scss'],
  standalone: true,
  imports: [NgIf, FormsModule, ReactiveFormsModule, TranslatePipe]
})
export class WorkflowFormFieldLinkCheckComponent {
  public ParameterFieldName = ParameterFieldName;
  @Input() conf: WorkflowFieldData;
  @Input() workflowForm: FormGroup;
}
