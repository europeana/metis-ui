import { Component, Input, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Dataset } from '../../_models';

@Component({
  selector: 'app-actionbar',
  templateUrl: './actionbar.component.html',
  styleUrls: ['./actionbar.component.scss']
})

export class ActionbarComponent {

  constructor(private route: ActivatedRoute) { }

  @Input('isShowingLog') isShowingLog: boolean;
  @Input('dataset') dataset: Dataset;
  
  @Output() notifyShowLogStatus: EventEmitter<boolean> = new EventEmitter<boolean>();

  showLog() {
    this.notifyShowLogStatus.emit(true);
  }

}
