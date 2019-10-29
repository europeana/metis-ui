import { Component, OnInit } from '@angular/core';
import { DocumentTitleService } from '../../_services';

@Component({
  selector: 'app-newdataset',
  templateUrl: './newdataset.component.html',
  styleUrls: ['./newdataset.component.scss']
})
export class NewDatasetComponent implements OnInit {
  constructor(private readonly documentTitleService: DocumentTitleService) {}

  /** ngOnInit
  /* set the page title
  */
  ngOnInit(): void {
    this.documentTitleService.setTitle('New Dataset');
  }
}
