import { NgClass, NgFor, NgIf, NgTemplateOutlet } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { ClassMap } from 'shared';

@Component({
  selector: 'sb-navigation-orbs',
  templateUrl: './navigation-orbs.component.html',
  styleUrls: ['./navigation-orbs.component.scss'],
  imports: [NgClass, NgTemplateOutlet, NgIf, NgFor]
})
export class NavigationOrbsComponent {
  static maxOrbsUncollapsed = 5;
  collapsed = false;
  steps: Array<number>;
  _indicatorAttributes: { [details: string]: string } = {};
  @Input() maxUncollapsed: number;
  @Input() index = 0;
  @Input() ariaLabel: string;
  @Input()
  set count(count: number) {
    const max = this.maxUncollapsed
      ? this.maxUncollapsed
      : NavigationOrbsComponent.maxOrbsUncollapsed;
    this.collapsed = count > max;
    this.steps = Array.from({ length: count }, (_, i) => {
      return i;
    });
  }

  @Input()
  set indicatorAttributes(indicators: Array<string>) {
    indicators.forEach((indicator: string, index: number) => {
      this._indicatorAttributes[`${index}`] = indicator;
    });
  }

  @Input() fnClassMapOuter: (i: number) => ClassMap = (_: number) => {
    return {} as ClassMap;
  };
  @Input() fnClassMapInner: (i: number) => ClassMap = (_: number) => {
    return {} as ClassMap;
  };

  @Input() tabIndex?: number;
  @Input() links: Array<string> = [];
  @Input() tooltips?: Array<string>;
  @Input() tooltipDefault: string | null = null;
  @Output() clickEvent = new EventEmitter<number>();

  clicked(event: { ctrlKey: boolean; preventDefault: () => void }, index: number): void {
    if (this.fnClassMapInner(index)['locked']) {
      event.preventDefault();
      return;
    }

    if (!event.ctrlKey) {
      event.preventDefault();
      this.clickEvent.emit(index);
    }
  }

  clickedNext(): void {
    this.index++;
    this.clickEvent.emit(this.index);
  }

  clickedPrev(): void {
    this.index--;
    this.clickEvent.emit(this.index);
  }

  getTooltip(index: number): string | null {
    if (this.tooltips) {
      let suffix = '';
      if (this.fnClassMapInner(index)['locked']) {
        suffix = ' (log in to enable)';
      }
      return `${this.tooltips[index]}${suffix}`;
    }
    return this.tooltipDefault;
  }

  getModifiedTabIndex(index: number): number {
    const innerClasses = this.fnClassMapInner(index);
    if (innerClasses['is-active'] || innerClasses['locked']) {
      return -1;
    }
    return this.tabIndex !== undefined ? this.tabIndex : 0;
  }
}
