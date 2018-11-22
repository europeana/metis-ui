import { Component, OnChanges, OnInit, Input } from '@angular/core';

import { WorkflowService, TranslateService } from '../../_services';
import { WorkflowExecution } from '../../_models/workflow-execution';
import { Workflow } from '../../_models/workflow';
import { Dataset } from '../../_models/dataset';

@Component({
  selector: 'app-generalactionbar',
  templateUrl: './generalactionbar.component.html',
  styleUrls: ['./generalactionbar.component.scss']
})
export class GeneralactionbarComponent implements OnInit, OnChanges {

  constructor(private workflows: WorkflowService,
    private translate: TranslateService) { }

  @Input() isLoading: boolean;
  @Input() datasetData: Dataset;
  @Input() lastExecutionData: WorkflowExecution;
  @Input() workflowData: Workflow;
  currentPlugin: number;
  totalPlugins: number;
  pluginPercentage: number;

  ngOnInit(): void {
    this.translate.use('en');
  }

  ngOnChanges(): void {
    if (this.lastExecutionData) {
      this.currentPlugin = this.workflows.getCurrentPlugin(this.lastExecutionData);
      this.totalPlugins = this.lastExecutionData.metisPlugins.length;
      this.pluginPercentage = (this.currentPlugin / this.totalPlugins) * 100;
    }
  }

  selectWorkflow(): void {
    this.workflows.selectWorkflow();
  }

}
