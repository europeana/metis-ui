import { Directive, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appCollapsible]'
})
export class CollapsibleDirective {
  @HostBinding('class.collapsed')
  isCollapsed = false;

  @HostListener('click', ['$event'])
  onCollapseEvent(e: Event): void {
    const target = e.target as Element;
    if (target && target.className.includes('collapsible-trigger')) {
      this.isCollapsed = !this.isCollapsed;
      e.stopPropagation();
    }
  }
}
