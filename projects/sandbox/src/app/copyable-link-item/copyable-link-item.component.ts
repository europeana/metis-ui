import { NgClass, NgIf, NgTemplateOutlet } from '@angular/common';
import { Component, EventEmitter, input, Output, TemplateRef } from '@angular/core';
import { TextCopyDirective } from '../_directives/text-copy/text-copy.directive';

@Component({
  selector: 'sb-copyable-link-item',
  templateUrl: './copyable-link-item.component.html',
  imports: [NgClass, NgTemplateOutlet, NgIf, TextCopyDirective]
})
export class CopyableLinkItemComponent {
  href = input<string>();
  labelRef = input<TemplateRef<string>>();
  tabIndex = input(0);

  @Output() onClick: EventEmitter<boolean> = new EventEmitter();

  linkClick(): void {
    this.onClick.emit(true);
  }
}
