import { Component, OnInit } from '@angular/core';

import { TranslateService } from '../../_translate';

@Component({
  selector: 'app-newdataset',
  templateUrl: './newdataset.component.html',
  styleUrls: ['./newdataset.component.scss'],
})
export class NewDatasetComponent implements OnInit {
  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    this.translate.use('en');
  }
}
