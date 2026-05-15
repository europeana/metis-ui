import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { ClassMap } from 'shared';

@Component({
  selector: 'sb-navigation-orbs',
  templateUrl: './navigation-orbs.component.html',
  styleUrls: ['./navigation-orbs.component.scss'],
  standalone: true,
  imports: [NgClass, NgTemplateOutlet]
})
export class NavigationOrbsComponent {
  static maxOrbsUncollapsed = 5;

  // --- Inputs ---
  count = input<number>(0);
  maxUncollapsed = input<number>(NavigationOrbsComponent.maxOrbsUncollapsed);
  index = input<number>(0);
  ariaLabel = input<string>('');
  tabIndex = input<number | undefined>(undefined);
  tooltips = input<Array<string>>([]);
  tooltipDefault = input<string | null>(null);
  indicatorAttributes = input<Array<string | null>>([]);
  links = input<Array<string>>([]);

  // ✅ Simplification: Change from function callbacks to structural records
  classMapOuter = input<Record<number, ClassMap>>({});
  classMapInner = input<Record<number, ClassMap>>({});

  // --- Output ---
  clickEvent = output<number>();

  // --- Computed Signals ---
  collapsed = computed(() => this.count() > this.maxUncollapsed());
  steps = computed(() => Array.from({ length: this.count() }, (_, i) => i));

  mappedIndicators = computed(() => {
    const indicators = this.indicatorAttributes();
    const map: Record<string, string> = {};
    indicators.forEach((indicator, idx) => {
      if (indicator) map[`${idx}`] = indicator;
    });
    return map;
  });

  // --- Methods ---
  clicked(event: { ctrlKey: boolean; preventDefault: () => void }, idx: number): void {
    const innerClasses = this.classMapInner()[idx] || {};

    if (innerClasses['locked']) {
      event.preventDefault();
      return;
    }

    if (!event.ctrlKey) {
      event.preventDefault();
      this.clickEvent.emit(idx);
    }
  }

  getTooltip(idx: number): string | null {
    const tooltips = this.tooltips();
    if (tooltips.length > 0) {
      let suffix = '';
      const innerClasses = this.classMapInner()[idx] || {};
      if (innerClasses['locked']) {
        suffix = ' (log in to enable)';
      }
      return `${tooltips[idx]}${suffix}`;
    }
    return this.tooltipDefault();
  }

  getModifiedTabIndex(idx: number): number {
    const innerClasses = this.classMapInner()[idx] || {};
    if (innerClasses['is-active'] || innerClasses['locked']) {
      return -1;
    }
    const currentTabIndex = this.tabIndex();
    return currentTabIndex !== undefined ? currentTabIndex : 0;
  }

  clickedNext(): void {
    this.clickEvent.emit(this.index() + 1);
  }

  clickedPrev(): void {
    this.clickEvent.emit(this.index() - 1);
  }
}
