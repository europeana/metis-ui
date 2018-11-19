import { Type } from '@angular/core';
import { Dataset } from '../_models/dataset';
import { Workflow } from '../_models/workflow';

interface DatasetComponent {
  datasetData: Dataset;
  workflowData?: Workflow;
}

export class DatasetTab {
  constructor(public component: Type<DatasetComponent>, public dataset: Dataset, public workflow: Workflow | undefined) {}
}
