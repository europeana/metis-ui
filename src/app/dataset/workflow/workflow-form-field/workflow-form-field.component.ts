import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { WorkflowFieldData } from '../../../_models';

@Component({
  selector: 'app-workflow-form-field',
  templateUrl: './workflow-form-field.component.html',
  styleUrls: ['./workflow-form-field.component.scss']
})
export class WorkflowFormFieldComponent {
  @Input() conf: WorkflowFieldData;
  @Input() workflowForm: FormGroup;
  @Output() fieldChanged: EventEmitter<string> = new EventEmitter();
  @ViewChild('pluginElement') pluginElement: ElementRef;

  scrollToInput(): void {
    this.pluginElement.nativeElement.scrollIntoView(true);
  }

  onFieldChanged(fieldName: string): void {
    this.fieldChanged.emit(fieldName);
  }
}
