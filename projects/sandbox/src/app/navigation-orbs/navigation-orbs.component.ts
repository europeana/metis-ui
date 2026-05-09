import { NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { ClassMap } from 'shared';

@Component({
  selector: 'sb-navigation-orbs',
  templateUrl: './navigation-orbs.component.html',
  styleUrls: ['./navigation-orbs.component.scss'],
  standalone: true,
  imports: [NgClass, NgTemplateOutlet, NgIf, NgFor]
})
export class NavigationOrbsComponent {
  static maxOrbsUncollapsed = 5;

  // --- Inputs (Modern Signal API) ---
  count = input<number>(0);
  maxUncollapsed = input<number>(NavigationOrbsComponent.maxOrbsUncollapsed);
  index = input<number>(0);
  ariaLabel = input<string>('');
  tabIndex = input<number | undefined>(undefined);
  tooltips = input<Array<string>>([]);
  tooltipDefault = input<string | null>(null);
  indicatorAttributes = input<Array<string | null>>([]);

  links = input<Array<string>>([]);

  // Class Map Inputs
  fnClassMapOuter = input<(i: number) => ClassMap>((_: number) => ({}));
  fnClassMapInner = input<(i: number) => ClassMap>((_: number) => ({}));

  // --- Output ---
  clickEvent = output<number>();

  // --- Computed Signals (Reactive Logic) ---

  // Replaces the old 'count' setter logic
  collapsed = computed(() => this.count() > this.maxUncollapsed());

  steps = computed(() => Array.from({ length: this.count() }, (_, i) => i));

  // Replaces the old 'indicatorAttributes' setter logic
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
    const innerClasses = this.fnClassMapInner()(idx);

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
      const innerClasses = this.fnClassMapInner()(idx);
      if (innerClasses['locked']) {
        suffix = ' (log in to enable)';
      }
      return `${tooltips[idx]}${suffix}`;
    }
    return this.tooltipDefault();
  }

  getModifiedTabIndex(idx: number): number {
    const innerClasses = this.fnClassMapInner()(idx);
    if (innerClasses['is-active'] || innerClasses['locked']) {
      return -1;
    }
    const currentTabIndex = this.tabIndex();
    return currentTabIndex !== undefined ? currentTabIndex : 0;
  }

  // Note: If you need to mutate 'index' internally, convert it to a model()
  // or handle the increment via the output to the parent.
  clickedNext(): void {
    this.clickEvent.emit(this.index() + 1);
  }

  clickedPrev(): void {
    this.clickEvent.emit(this.index() - 1);
  }
}
