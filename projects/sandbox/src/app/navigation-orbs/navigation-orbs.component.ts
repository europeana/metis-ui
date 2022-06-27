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

  @Input() index = 0;
  @Input() ariaLabel: string;
  @Input()
  set count(count: number) {
    this.collapsed = count > NavigationOrbsComponent.maxOrbsUncollapsed;
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
  @Output() clickEvent: EventEmitter<number> = new EventEmitter();

  clicked(index: number): void {
    this.clickEvent.emit(index);
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
