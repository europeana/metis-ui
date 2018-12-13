import { Component, EventEmitter, Input, Output } from '@angular/core';

import { WorkflowExecution } from '../../_models';

@Component({
  selector: 'app-executions',
  templateUrl: './executions.component.html',
  styleUrls: ['./executions.component.scss'],
})
export class ExecutionsComponent {
  constructor() {}

  @Input() runningExecutions: WorkflowExecution[];
  @Input() finishedExecutions: WorkflowExecution[];
  @Input() isLoading: boolean;
  @Input() hasMore: boolean;

  @Output() nextPage: EventEmitter<void> = new EventEmitter();

  loadNextPage(): void {
    this.nextPage.emit();
  }
}
