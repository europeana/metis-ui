import { NgClass, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';
import { DropInModel, ViewMode } from '../_models';
import { DropInComponent } from '../drop-in';

@Component({
  selector: 'sb-recent',
  templateUrl: './recent.component.html',
  styleUrls: ['./recent.component.scss'],
  imports: [NgClass, NgIf]
})
export class RecentComponent {
  @Input() dropIn: DropInComponent;
  @Input() dropInInput: HTMLElement;

  menuOpen = false;

  @Input() model: Array<DropInModel>;

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  showAll(): void {
    if (this.dropIn.viewMode() !== ViewMode.SILENT) {
      this.dropIn.close();
    }
    window.scroll(0, 0);
    this.dropIn.suspendFiltering = true;
    this.dropIn.open(this.dropInInput);
    setTimeout(() => {
      this.dropIn.toggleViewMode();
      this.dropInInput.focus();
    }, 1);
  }
}
