import { Component, EventEmitter, Input, Output } from '@angular/core';
// sonar-disable-next-statement (sonar doesn't read tsconfig paths entry)
import { ClassMap } from 'shared';

@Component({
  selector: 'sb-navigation-orbs',
  templateUrl: './navigation-orbs.component.html',
  styleUrls: ['./navigation-orbs.component.scss']
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

  @Input() links: Array<string> = [];
  @Input() tooltips: Array<string> = [];
  @Output() clickEvent = new EventEmitter<number>();

  clicked(event: { ctrlKey: boolean; preventDefault: () => void }, index: number): void {
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
}
