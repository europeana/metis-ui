import { NgClass, NgIf, NgTemplateOutlet } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DropInModel } from '../_models';

@Component({
  selector: 'sb-recent',
  templateUrl: './recent.component.html',
  styleUrls: ['./recent.component.scss'],
  imports: [NgClass, NgIf, NgTemplateOutlet]
})
export class RecentComponent {
  @Input() listView = false;
  @Input() model: Array<DropInModel>;
  @Output() showAllRecent = new EventEmitter<void>();

  menuOpen = false;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  showAll(): void {
    this.showAllRecent.emit();
  }
}
