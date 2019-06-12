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

  scrollToInput(smooth?: boolean): void {
    if (smooth) {
      this.pluginElement.nativeElement.classList.add('returning');
    } else {
      this.pluginElement.nativeElement.classList.remove('returning');
    }
    this.pluginElement.nativeElement.scrollIntoView(smooth ? { behavior: 'smooth' } : false);
  }

  onFieldChanged(fieldName: string): void {
    this.fieldChanged.emit(fieldName);
  }
}
