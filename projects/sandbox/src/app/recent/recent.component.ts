import { NgClass, NgIf, NgTemplateOutlet } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DropInModel } from '../_models';

@Component({
  selector: 'sb-recent',
  templateUrl: './recent.component.html',
  styleUrls: ['./recent.component.scss'],
  imports: [NgClass, NgIf, NgTemplateOutlet]
})
export class RecentComponent implements OnInit {
  @Input() listView = false;
  @Input() listOpened = false;

  @Input() model: Array<DropInModel>;
  @Output() showAllRecent = new EventEmitter<void>();

  menuOpen = false;

  ngOnInit(): void {
    this.menuOpen = this.listOpened;
  }

  linkClicked(): void {
    console.log('linkClicked');
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  showAll(): void {
    this.showAllRecent.emit();
  }
}
