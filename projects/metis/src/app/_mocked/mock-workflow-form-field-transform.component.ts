import { Component, input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { WorkflowFieldData } from '../_models';

@Component({
  selector: 'app-workflow-form-field-transform',
  template: ''
})
export class MockWorkflowFormFieldTransformComponent {
  conf = input.required<WorkflowFieldData>();
  workflowForm = input.required<FormGroup>();
  customXsltAllowed = input<boolean>(false);
}
