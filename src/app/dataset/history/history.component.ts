import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {

  constructor(private route: ActivatedRoute) { }

  @Input('datasetData') datasetData;
  @Input('inCollapsablePanel') inCollapsablePanel;
  @Input('activeSet') activeSet;

  ngOnInit() {  }

  scroll(el) {
  	el.scrollIntoView({behavior:'smooth'});
  }

}
