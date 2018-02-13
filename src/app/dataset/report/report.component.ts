import { Component, OnInit } from '@angular/core';
import { WorkflowService, TranslateService } from '../../_services';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {

  constructor(private workflows: WorkflowService,
    private translate: TranslateService) { }

  report;

  ngOnInit() {
    if (this.workflows.getCurrentReport()) {
      this.report = this.workflows.getCurrentReport().errors[0];
    }
    this.translate.use('en');
  }

  closeReport () {
  	this.report = undefined;
  }

}
