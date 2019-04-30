import { Component, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';

import {
  FilterExecutionConf,
  FilterExecutionProvider,
  FilterParamHash
} from '../../_models/filterExecution';

import { filterConf } from './filter-ops-conf';
import { FilterOptionComponent } from './filter-option';

@Component({
  selector: 'app-filter-ops',
  templateUrl: './filter-ops.component.html',
  styleUrls: ['./filter-ops.component.scss']
})
export class FilterOpsComponent implements FilterExecutionProvider {
  showing = false;
  conf: FilterExecutionConf[];
  params: FilterParamHash;
  settingFocus = false;
  @Input() isLoading: boolean;
  @Input() title: string;
  @Output() overviewParams = new EventEmitter<string>();
  @ViewChildren(FilterOptionComponent) optionComponents: QueryList<FilterOptionComponent>;

  constructor() {
    this.conf = filterConf;
    this.params = Object.assign({}, ...this.conf.map((s) => ({ [s.name]: [] })));
  }

  anyValueSet(): boolean {
    let res = false;
    Object.entries(this.params).forEach(([name, val]) => {
      if (name && val.length > 0) {
        res = true;
      }
    });
    return res;
  }

  getSetSummary(): string {
    if (this.showing) {
      return '';
    }
    const res: string[] = [];
    Object.entries(this.params).forEach(([name, val]) => {
      if (val.length > 0) {
        res.push(name.charAt(0).toUpperCase() + name.slice(1).toLowerCase());
      }
    });
    return res.join(', ');
  }

  getInputGroup(group: string): FilterOptionComponent[] {
    const res: FilterOptionComponent[] = [];
    this.optionComponents.toArray().forEach((item) => {
      if (item.config.group === group) {
        res.push(item);
      }
    });
    return res;
  }

  getInputGroupElements(group: string): HTMLElement[] {
    return this.getInputGroup(group).map((item) => {
      return item.input.nativeElement;
    });
  }

  restoreGroup(group: string, callerIndex: number): void {
    this.getInputGroup(group).forEach((item) => {
      if (item.index !== callerIndex) {
        if (!item.valueIsSet()) {
          if (item.getVal().length > 0) {
            item.addParam();
          }
        }
      }
    });
  }

  reset(): void {
    this.optionComponents.forEach((item) => {
      item.clearParam();
    });
    this.optionComponents.forEach((item) => item.clear());
  }

  showParams(): void {
    console.log('Params: ' + JSON.stringify(this.params));
  }

  hide(): void {
    this.showing = false;
    // let paramString = '&pluginStatus=FAILED&pluginStatus=CANCELLED';
    const paramString = '&pluginStatus=FAILED&pluginStatus=CANCELLED';
    this.overviewParams.emit(paramString);
  }

  toggle(): void {
    this.showing = !this.showing;
  }
}
