import { NgClass } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'sb-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  standalone: true,
  imports: [NgClass]
})
export class HomeComponent {
  @Input() showing = false;
  @Output() appEntryLink = new EventEmitter<Event>();

  clickEvent($event: Event): void {
    this.appEntryLink.emit($event);
  }
}
