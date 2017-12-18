import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-datasetlog',
  templateUrl: './datasetlog.component.html',
  styleUrls: ['./datasetlog.component.scss']
})
export class DatasetlogComponent implements OnInit {

  constructor() { }

  @Input('isShowingLog') isShowingLog: boolean;
  @Output() notifyShowLogStatus: EventEmitter<boolean> = new EventEmitter<boolean>();

  ngOnInit() {
  	
  }

  closeLog() {
  	this.notifyShowLogStatus.emit(false);
  }

}
