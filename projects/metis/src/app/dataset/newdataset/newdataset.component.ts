import { Component, inject, OnInit } from '@angular/core';
import { DocumentTitleService } from '../../_services';
import { DatasetformComponent } from '../datasetform/datasetform.component';
import { TabHeadersComponent } from '../tabheader/tabheaders.component';

@Component({
  selector: 'app-newdataset',
  templateUrl: './newdataset.component.html',
  standalone: true,
  imports: [TabHeadersComponent, DatasetformComponent]
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
