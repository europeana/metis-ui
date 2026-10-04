import { Component, input } from '@angular/core';

@Component({
  selector: 'app-load-title',
  templateUrl: './load-title.component.html',
  styleUrls: ['./load-title.component.scss'],
  imports: []
})
export class LoadTitleComponent {
  isLoading = input<boolean>(false);
  title = input.required<string>();
}
