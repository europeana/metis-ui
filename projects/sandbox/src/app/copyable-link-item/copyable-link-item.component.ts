import { NgClass, NgIf, NgTemplateOutlet } from '@angular/common';
import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { TextCopyDirective } from '../_directives/text-copy/text-copy.directive';

@Component({
  selector: 'sb-copyable-link-item',
  templateUrl: './copyable-link-item.component.html',
  standalone: true,
  imports: [NgClass, NgTemplateOutlet, NgIf, TextCopyDirective]
})
export class CopyableLinkItemComponent {
  @Input() href?: string;
  @Input() labelRef: TemplateRef<string>;
  @Output() onClick: EventEmitter<boolean> = new EventEmitter();

  linkClick(): void {
    this.onClick.emit(true);
  }
}
