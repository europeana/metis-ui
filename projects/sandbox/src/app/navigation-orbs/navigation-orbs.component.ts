import { NgClass } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { ClassMap } from 'shared';

export interface MappedOrbItem {
  id: number;
  innerClasses: ClassMap;
  outerClasses: ClassMap;
  tooltip: string | null;
  tabIndex: number;
  indicator: string | null;
  href: string | null;
}

@Component({
  selector: 'sb-navigation-orbs',
  templateUrl: './navigation-orbs.component.html',
  styleUrls: ['./navigation-orbs.component.scss'],
  standalone: true,
  imports: [NgClass]
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

  classMapOuter = input<Record<number, ClassMap>>({});
  classMapInner = input<Record<number, ClassMap>>({});

  // --- Output ---
  clickEvent = output<number>();

  // --- Computed Signals ---
  collapsed = computed(() => this.count() > this.maxUncollapsed());

  steps = computed(() => {
    const keys = Object.keys(this.classMapInner()).map(Number);
    return keys.sort((a, b) => a - b);
  });

  mappedIndicators = computed(() => {
    const indicators = this.indicatorAttributes();
    const map: Record<string, string> = {};
    indicators.forEach((indicator, idx) => {
      if (indicator) map[`${idx}`] = indicator;
    });
    return map;
  });

  // zoneless caching - consolidates properties per loop index step cleanly
  orbItemsMap = computed(() => {
    const stepIndices = this.steps();
    const innerClassesRecord = this.classMapInner();
    const outerClassesRecord = this.classMapOuter();
    const tooltipsList = this.tooltips();
    const defaultText = this.tooltipDefault();
    const indicatorsMap = this.mappedIndicators();
    const linksList = this.links();
    const baseTabIndex = this.tabIndex() ?? 0;

    const map: Record<number, MappedOrbItem> = {};

    stepIndices.forEach((idx) => {
      const innerClasses = innerClassesRecord[idx] || {};
      const outerClasses = outerClassesRecord[idx] || {};
      const isLocked = !!innerClasses['locked'];
      const isActive = !!innerClasses['is-active'];

      // --- Tooltip String Resolution ---
      let resolvedTooltip = defaultText;
      if (tooltipsList.length > 0) {
        const suffix = isLocked ? ' (log in to enable)' : '';
        const positionInVisibleList = stepIndices.indexOf(idx);
        const fallbackText = tooltipsList[positionInVisibleList] ?? tooltipsList;
        resolvedTooltip = `${fallbackText}${suffix}`;
      }

      // --- TabIndex Configuration Range Resolution ---
      const resolvedTabIndex = isActive || isLocked ? -1 : baseTabIndex;

      map[idx] = {
        id: idx,
        innerClasses,
        outerClasses,
        tooltip: resolvedTooltip,
        tabIndex: resolvedTabIndex,
        indicator: indicatorsMap[`${idx}`] ?? null,
        href: linksList.length > idx ? linksList[idx] : null
      };
    });

    return map;
  });

  // Iterable list accessor for the main uncollapsed control loop template block
  orbItemsList = computed<MappedOrbItem[]>(() => Object.values(this.orbItemsMap()));

  // Dedicated current reference accessor ensuring fast rendering during collapsed state
  activeOrbItem = computed<MappedOrbItem | null>(() => {
    const currentIndex = this.index();
    return this.orbItemsMap()[currentIndex] || null;
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

  clickedNext(): void {
    this.clickEvent.emit(this.index() + 1);
  }

  clickedPrev(): void {
    this.clickEvent.emit(this.index() - 1);
  }
}
