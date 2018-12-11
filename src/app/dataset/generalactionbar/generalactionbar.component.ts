import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { Workflow, WorkflowExecution, WorkflowStatus } from '../../_models';
import { WorkflowService } from '../../_services';
import { TranslateService } from '../../_translate';

@Component({
  selector: 'app-generalactionbar',
  templateUrl: './generalactionbar.component.html',
  styleUrls: ['./generalactionbar.component.scss'],
})
export class GeneralactionbarComponent implements OnInit {
  constructor(private workflows: WorkflowService, private translate: TranslateService) {}

  @Input() datasetId: string;
  @Input() workflowData?: Workflow;
  @Input() isStarting = false;

  @Input()
  set lastExecutionData(value: WorkflowExecution | undefined) {
    if (value) {
      this.workflowStatus = value.workflowStatus;
      this.currentPlugin = this.workflows.getCurrentPlugin(value);
      this.totalPlugins = value.metisPlugins.length;
      this.pluginPercentage = (this.currentPlugin / this.totalPlugins) * 100;
    }
  }

  @Output() startWorkflow = new EventEmitter<void>();

  workflowStatus?: WorkflowStatus;
  currentPlugin = 0;
  totalPlugins = 0;
  pluginPercentage = 0;

  ngOnInit(): void {
    this.translate.use('en');
  }
}
