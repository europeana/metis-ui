import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ClassMap } from '../_models';

@Component({
  selector: 'sb-navigation-orbs',
  templateUrl: './navigation-orbs.component.html',
  styleUrls: ['./navigation-orbs.component.scss']
})
export class NavigationOrbsComponent {
  static maxOrbsUncollapsed = 5;
  collapsed = false;
  @Input() index = 0;
  steps: Array<number>;
  _indicatorAttributes: { [details: string]: string } = {};

  @Input()
  set count(count: number) {
    this.collapsed = count > NavigationOrbsComponent.maxOrbsUncollapsed;
    this.steps = new Array(count).fill(null).map((_: number, num: number) => {
      return num;
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
