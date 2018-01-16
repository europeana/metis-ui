import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { WorkflowService, AuthenticationService } from '../../_services';
import { StringifyHttpError } from '../../_helpers';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  constructor(private route: ActivatedRoute, 
    private workflows: WorkflowService,
    private authentication: AuthenticationService, 
    private router: Router) { }

  @Input('datasetData') datasetData;
  @Input('inCollapsablePanel') inCollapsablePanel;
  
  errorMessage: string;

  ngOnInit() {  }

  scroll(el) {
  	el.scrollIntoView({behavior:'smooth'});
  }

  triggerWorkflow() {    

    this.workflows.triggerNewWorkflow(this.datasetData.datasetId).subscribe(result => {

      this.workflows.setActiveWorkflow('start!');
      
    }, (err: HttpErrorResponse) => {
      if (err.error.errorMessage === 'Wrong access token') {
        this.authentication.logout();
        this.router.navigate(['/login']);
      }

      this.errorMessage = `Not able to load this dataset: ${StringifyHttpError(err)}`;
      
    });

  }

}
