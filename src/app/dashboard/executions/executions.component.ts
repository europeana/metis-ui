import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { WorkflowExecution } from '../../_models/workflow-execution';
import { TranslateService } from '../../_services';

@Component({
  selector: 'app-executions',
  templateUrl: './executions.component.html',
  styleUrls: ['./executions.component.scss'],
})
export class ExecutionsComponent implements OnInit {
  constructor(private translate: TranslateService) {}

  @Input() runningExecutions: WorkflowExecution[];
  @Input() finishedExecutions: WorkflowExecution[];
  @Input() isLoading: boolean;
  @Input() hasMore: boolean;

  @Output() nextPage: EventEmitter<void> = new EventEmitter();

  errorMessage: string;
  successMessage: string;

  ngOnInit(): void {
    this.translate.use('en');
  }

  loadNextPage(): void {
    this.nextPage.emit();
  }
}
