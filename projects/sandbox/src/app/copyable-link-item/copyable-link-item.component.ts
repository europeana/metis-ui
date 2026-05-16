import { ChangeDetectionStrategy, Component, input, output, TemplateRef } from '@angular/core';
import { NgClass, NgIf, NgTemplateOutlet } from '@angular/common';
import { TextCopyDirective } from '../_directives/text-copy/text-copy.directive';

@Component({
  selector: 'sb-copyable-link-item',
  templateUrl: './copyable-link-item.component.html',
  imports: [NgClass, NgTemplateOutlet, NgIf, TextCopyDirective],
  changeDetection: ChangeDetectionStrategy.OnPush // 🚀 Best practice for Zoneless
})
export class CopyableLinkItemComponent {
  // 🌟 Modern Signal-based inputs
  href = input<string>();
  labelRef = input.required<TemplateRef<string>>();
  tabIndex = input<number>(0);

  // 🌟 Streamlined Output API
  onClick = output<boolean>();

  linkClick(): void {
    this.onClick.emit(true);
  }
}
