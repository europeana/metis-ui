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
  @Input() index: number;
  @Input() workflowForm: FormGroup;
  @Output() fieldChanged: EventEmitter<string> = new EventEmitter();
  @Output() setLinkCheck: EventEmitter<number> = new EventEmitter();
  @ViewChild('pluginElement') pluginElement: ElementRef;

  ctrlSetLinkCheck(index: number): void {
    this.setLinkCheck.emit(index);
  }

  scrollToInput(): void {
    this.pluginElement.nativeElement.scrollIntoView(false);
  }

  isInactive(): boolean {
    if (this.conf.name === 'pluginLINK_CHECKING') {
      return false;
    }
    return !this.workflowForm.get(this.conf.name)!.value;
  }

  onFieldChanged(fieldName: string): void {
    this.fieldChanged.emit(fieldName);
  }
}
