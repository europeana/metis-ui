import { NgClass } from '@angular/common';
import { Component, EventEmitter, input, Output } from '@angular/core';

@Component({
  selector: 'sb-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [NgClass]
})
export class HomeComponent {
  readonly showing = input(false);
  @Output() appEntryLink = new EventEmitter<Event>();

  clickEvent($event: Event): void {
    this.appEntryLink.emit($event);
  }
}
