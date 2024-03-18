import { Directive, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appCollapsible]',
  standalone: true
})
export class CollapsibleDirective {
  @HostBinding('class.collapsed')
  isCollapsed = false;

  @HostListener('click', ['$event'])
  onCollapseEvent(e: Event): void {
    const target = e.target as Element;
    if (target?.className.includes('collapsible-trigger')) {
      this.isCollapsed = !this.isCollapsed;
      e.stopPropagation();
    }
  }
}
