import { NgClass } from '@angular/common';
import { Component, EventEmitter, inject, input, OnInit, Output } from '@angular/core';

import { DropInModel } from '../_models';
import { DropInService } from '../_services';

import { RecentComponent } from '../recent';

@Component({
  selector: 'sb-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [NgClass, RecentComponent]
})
export class HomeComponent implements OnInit {
  readonly showing = input(false);

  @Output() appEntryLink = new EventEmitter<Event>();
  @Output() showAllRecent = new EventEmitter<void>();

  dropInService = inject(DropInService);
  recentModel: Array<DropInModel>;

  ngOnInit(): void {
    this.dropInService.getUserDatasetsPolledObservable().subscribe((arr: Array<DropInModel>) => {
      this.recentModel = arr;
    });
  }

  clickEvent($event: Event): void {
    this.appEntryLink.emit($event);
  }
}
