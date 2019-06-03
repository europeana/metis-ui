import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { WorkflowFieldData } from '../../../_models';

@Component({
  selector: 'app-workflow-form-field-link-check',
  templateUrl: './workflow-form-field-link-check.component.html',
  styleUrls: ['./workflow-form-field-link-check.component.scss']
})
export class WorkflowFormFieldLinkCheckComponent {
  @Input() conf: WorkflowFieldData;
  @Input() workflowForm: FormGroup;
}
