import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { RecordPublicationInfo } from '../../_models';

@Component({
  selector: 'app-depublication-row',
  templateUrl: './depublication-row.component.html',
  styleUrls: ['./depublication-row.component.scss']
})
export class DepublicationRowComponent {
  @Input() record: RecordPublicationInfo;
  @ViewChild('depublicationTemplate') depublicationTemplate: TemplateRef<HTMLElement>;
}
