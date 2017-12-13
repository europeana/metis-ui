import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Dataset } from '../../_models';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  constructor(private route: ActivatedRoute) { }

  @Input('dataset') dataset: Dataset;
  @Input('inCollapsablePanel') inCollapsablePanel;
  @Input('activeSet') activeSet;

  ngOnInit() {  }

  scroll(el) {
  	el.scrollIntoView({behavior:'smooth'});
  }

}
