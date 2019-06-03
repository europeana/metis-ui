import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { PluginType, WorkflowFieldDataParameterised } from '../../../_models';

@Component({
  selector: 'app-workflow-form-field-harvest',
  templateUrl: './workflow-form-field-harvest.component.html',
  styleUrls: ['./workflow-form-field-harvest.component.scss']
})
export class WorkflowFormFieldHarvestComponent {
  @Input() conf: WorkflowFieldDataParameterised;
  @Input() workflowForm: FormGroup;
  @Output() fieldChanged: EventEmitter<string> = new EventEmitter();

  onFieldChanged(fieldName: string): void {
    this.fieldChanged.emit(fieldName);
  }

  isProtocolHTTP(): boolean {
    return this.workflowForm
      ? this.workflowForm.value.pluginType === PluginType.HTTP_HARVEST
      : false;
  }

  getImportSummary(): string {
    let res = 'Harvest URL: ';
    if (this.isProtocolHTTP()) {
      res += this.workflowForm.value.url.trim();
    } else {
      res +=
        this.workflowForm.value.harvestUrl.trim() +
        '<br/>Setspec: ' +
        this.workflowForm.value.setSpec;
    }
    if (this.workflowForm.value.metadataFormat) {
      res += '<br/>Metadata format: ' + this.workflowForm.value.metadataFormat;
    }
    return res;
  }
}
