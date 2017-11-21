import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Dataset } from '../_models';
import { AuthenticationService,
         DatasetsService } from '../_services';

@Component({
  selector: 'app-dataset-detail',
  templateUrl: './dataset-detail.component.html',
  styleUrls: ['./dataset-detail.component.scss'],
  providers: [AuthenticationService]
})

export class DatasetDetailComponent implements OnInit {

  dataset: Dataset;

  constructor(private authentication: AuthenticationService,
              private datasets: DatasetsService,
              private route: ActivatedRoute) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    this.dataset = this.datasets.getDataset(+id);
  }
}
