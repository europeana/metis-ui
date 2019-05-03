import { Component, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';

import {
  FilterExecutionConf,
  FilterExecutionProvider,
  FilterParamHash,
  FilterParamValue
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
        let label = name;
        this.conf.map((s) => {
          if (s.name === name) {
            label = s.label;
          }
        });
        res.push(label.charAt(0).toUpperCase() + label.slice(1).toLowerCase());
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
    this.updateParameters();
  }

  getFromToParam(val: number): string {
    const now = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    const then = new Date(now.getTime());

    then.setDate(now.getDate() - val);
    now.setDate(now.getDate() + 1);

    return '&fromDate=' + then.toISOString() + '&toDate=' + now.toISOString();
  }

  hide(): void {
    this.showing = false;
    this.updateParameters();
  }

  updateParameters(): void {
    let paramString = '';
    Object.entries(this.params).map((entry: [string, FilterParamValue[]]) => {
      if (entry[1].length > 0) {
        entry[1].map((fpv: FilterParamValue) => {
          if (entry[0] === 'DATE') {
            if (['1', '7', '30'].indexOf(fpv.value) > -1) {
              paramString += this.getFromToParam(Number(fpv.value));
            } else {
              const date = new Date(fpv.value);
              if (fpv.name === 'toDate') {
                date.setDate(date.getDate() + 1);
              }
              paramString += '&' + (fpv.name ? fpv.name : entry[0]) + '=' + date.toISOString();
            }
          } else {
            paramString += '&' + (fpv.name ? fpv.name : entry[0]) + '=' + fpv.value;
          }
        });
      }
    });
    this.overviewParams.emit(paramString);
  }

  toggle(): void {
    this.showing = !this.showing;
    if (!this.showing) {
      this.updateParameters();
    }
  }
}
