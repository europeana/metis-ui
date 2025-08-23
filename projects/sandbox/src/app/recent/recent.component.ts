import { NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DropInModel } from '../_models';

@Component({
  selector: 'sb-recent',
  templateUrl: './recent.component.html',
  styleUrls: ['./recent.component.scss'],
  imports: [NgClass, NgIf, NgFor, NgTemplateOutlet]
})
export class RecentComponent implements OnInit {
  @Input() listView = false;
  @Input() listOpened = false;

  @Input() model: Array<DropInModel>;
  @Output() showAllRecent = new EventEmitter<void>();
  @Output() open = new EventEmitter<string>();

  menuOpen = false;

  ngOnInit(): void {
    this.menuOpen = this.listOpened;
  }

  callOpen(id: string): void {
    this.open.emit(id);
    this.menuOpen = false;
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  showAll(): void {
    this.showAllRecent.emit();
  }
}
