import { Component, OnInit } from '@angular/core';
import { WorkflowService } from '../../_services';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {

  constructor(private workflows: WorkflowService) { }

  report: string = '';

  ngOnInit() {
    if (this.workflows.getCurrentReport()) {
      let reportcontent = this.workflows.getCurrentReport().errors;
      
      for (let i = 0; i < reportcontent.length; i++) {
        for (let key in reportcontent[i]) {  
          this.report += '<strong>' + key + '</strong>: ' + reportcontent[i][key] + '</br>';
        }
        this.report += '</br>';
      }
    }
  }

  closeReport () {
  	this.report = undefined;
  }

}
