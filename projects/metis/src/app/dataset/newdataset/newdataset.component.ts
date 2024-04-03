import { Component, inject, OnInit } from '@angular/core';
import { DocumentTitleService } from '../../_services';

@Component({
  selector: 'app-newdataset',
  templateUrl: './newdataset.component.html'
})
export class NewDatasetComponent implements OnInit {
  private readonly documentTitleService = inject(DocumentTitleService);

  /** ngOnInit
  /* set the page title
  */
  ngOnInit(): void {
    this.documentTitleService.setTitle('New Dataset');
  }
}
