import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';

import { Workflow, WorkflowExecution, WorkflowStatus } from '../../_models';
import { WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';

@Component({
  selector: 'app-generalactionbar',
  templateUrl: './generalactionbar.component.html',
  styleUrls: ['./generalactionbar.component.scss'],
})
export class GeneralactionbarComponent implements OnInit, OnChanges {
  constructor(private workflows: WorkflowService, private translate: TranslateService) {}

  @Input() datasetId: string;
  @Input() lastExecutionData?: WorkflowExecution;
  @Input() workflowData?: Workflow;

  @Output() startWorkflow = new EventEmitter<void>();

  workflowStatus?: WorkflowStatus;
  currentPlugin = 0;
  totalPlugins = 0;
  pluginPercentage = 0;

  ngOnInit(): void {
    this.translate.use('en');
  }

  ngOnChanges(): void {
    if (this.lastExecutionData) {
      this.workflowStatus = this.lastExecutionData.workflowStatus;
      this.currentPlugin = this.workflows.getCurrentPlugin(this.lastExecutionData);
      this.totalPlugins = this.lastExecutionData.metisPlugins.length;
      this.pluginPercentage = (this.currentPlugin / this.totalPlugins) * 100;
    }
  }
}
