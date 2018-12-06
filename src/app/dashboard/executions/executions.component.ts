import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { TranslateService } from '../../_services';
import { WorkflowExecution } from '../../_models/workflow-execution';

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
