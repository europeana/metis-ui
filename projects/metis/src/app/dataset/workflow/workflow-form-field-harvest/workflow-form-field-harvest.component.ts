import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { PluginType, WorkflowFieldDataParameterised } from '../../../_models';
import { TranslateService } from '../../../_translate';

@Component({
  selector: 'app-workflow-form-field-harvest',
  templateUrl: './workflow-form-field-harvest.component.html',
  styleUrls: ['./workflow-form-field-harvest.component.scss']
})
export class WorkflowFormFieldHarvestComponent {
  @Input() conf: WorkflowFieldDataParameterised;
  @Input() workflowForm: FormGroup;
  @Output() fieldChanged: EventEmitter<string> = new EventEmitter();

  constructor(private readonly translate: TranslateService) {}

  /** onFieldChanged
  /* emit fieldChanged event
  */
  onFieldChanged(fieldName: string): void {
    this.fieldChanged.emit(fieldName);
  }

  /** isProtocolHTTP
  /* return true if protocol is http
  */
  isProtocolHTTP(): boolean {
    return this.workflowForm!.value.pluginType === PluginType.HTTP_HARVEST;
  }

  /** getImportSummary
  /* returns markup representation of import parameters
  */
  getImportSummary(): string {
    let res = this.translate.instant('harvestUrl') + ': ';

    if (this.isProtocolHTTP()) {
      res += this.workflowForm.value.url.trim();
    } else {
      res +=
        this.workflowForm.value.harvestUrl.trim() +
        '<br/>' +
        this.translate.instant('setSpec') +
        ': ' +
        this.workflowForm.value.setSpec;
    }
    if (this.workflowForm.value.metadataFormat) {
      res +=
        '<br/>' +
        this.translate.instant('metaDataFormat') +
        ': ' +
        this.workflowForm.value.metadataFormat;
    }
    return res;
  }
}
