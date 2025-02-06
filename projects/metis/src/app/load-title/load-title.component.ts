import { NgClass } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-load-title',
  templateUrl: './load-title.component.html',
  styleUrls: ['./load-title.component.scss'],
  imports: [NgClass]
})
export class LoadTitleComponent {
  @Input() isLoading: boolean;
  @Input() inButton: boolean;
  @Input() title: string;
}
