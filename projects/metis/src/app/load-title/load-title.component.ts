import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-load-title',
  templateUrl: './load-title.component.html',
  styleUrls: ['./load-title.component.scss'],
  standalone: true,
  imports: [NgClass]
})
export class LoadTitleComponent {
  @Input() isLoading: boolean;
  @Input() inButton: boolean;
  @Input() title: string;
}
