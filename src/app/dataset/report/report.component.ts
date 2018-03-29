import { Component, OnInit } from '@angular/core';
import { WorkflowService, TranslateService } from '../../_services';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html'
})
export class ReportComponent implements OnInit {

  constructor(private workflows: WorkflowService,
    private translate: TranslateService) { }

  report;

  /** ngOnInit
  /* init this component
  /* if report not empty, create a report object
  /* set translation language
  */  
  ngOnInit() {

    if (this.workflows.getCurrentReport()) {
      this.report = this.workflows.getCurrentReport().errors;  
    }

    if (typeof this.translate.use === 'function') { 
      this.translate.use('en'); 
    }
  }

  /** closeReport
  /* set report to empty, to close the repot
  */  
  closeReport () {
  	this.report = undefined;
  }

}
