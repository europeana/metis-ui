import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatasetsService } from '../../_services';
import { Dataset } from '../../_models';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  constructor(private datasets: DatasetsService,
  	private route: ActivatedRoute) { }

  dataset: Dataset;

  ngOnInit() {

  	this.route.params.subscribe(params => {
      this.dataset = this.datasets.getDataset(+params['id']);      
    });

  }

}
