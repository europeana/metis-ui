import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatasetsService } from '../../_services';
import { Dataset } from '../../_models';

@Component({
  selector: 'app-actionbar',
  templateUrl: './actionbar.component.html',
  styleUrls: ['./actionbar.component.scss']
})

export class ActionbarComponent implements OnInit {

  constructor(private datasets: DatasetsService,
  	private route: ActivatedRoute) { }

  dataset: Dataset;

  @Input('isShowingLog') isShowingLog: boolean;
  @Output() notifyShowLogStatus: EventEmitter<boolean> = new EventEmitter<boolean>();

  ngOnInit() {

  	this.route.params.subscribe(params => {
      this.dataset = this.datasets.getDataset(+params['id']);      
    });

  }

  showLog() {
    // get information to display? 
    this.notifyShowLogStatus.emit(true);
  }

}
