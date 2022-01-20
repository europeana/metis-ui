import { Component, Input, TemplateRef } from '@angular/core';

@Component({
  selector: 'sb-copyable-link-item',
  templateUrl: './copyable-link-item.component.html'
})
export class CopyableLinkItemComponent {
  @Input() href?: string;
  @Input() labelRef: TemplateRef<string>;
}
