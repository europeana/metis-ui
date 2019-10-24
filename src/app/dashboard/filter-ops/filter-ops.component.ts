import { Component, EventEmitter, Input, Output, QueryList, ViewChildren } from '@angular/core';

import { isValidDate } from '../../_helpers/date-helpers';
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

  anyErrors(): boolean {
    let res = false;
    if (this.optionComponents) {
      this.optionComponents.toArray().forEach((item) => {
        if (item.hasError) {
          res = true;
        }
      });
    }
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
        this.conf.forEach((s) => {
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
    const now =
      val === 1
        ? new Date()
        : new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
    const then = new Date(now.getTime());

    then.setDate(now.getDate() - val);
    now.setDate(now.getDate() + 1);

    return '&fromDate=' + then.toISOString() + '&toDate=' + now.toISOString();
  }

  hide(): void {
    this.showing = false;
    this.updateParameters();
  }

  getDateParamString(
    paramName: string | undefined,
    paramNameFallback: string,
    paramVal: string
  ): string {
    let res = '';
    if (['1', '7', '30'].indexOf(paramVal) > -1) {
      res += this.getFromToParam(Number(paramVal));
    } else {
      if (isValidDate(paramVal)) {
        const date = new Date(paramVal);
        if (paramName === 'toDate') {
          date.setDate(date.getDate() + 1);
        }
        res += '&' + (paramName ? paramName : paramNameFallback) + '=' + date.toISOString();
      }
    }
    return res;
  }

  updateParameters(): void {
    let paramString = '';
    Object.entries(this.params).forEach((entry: [string, FilterParamValue[]]) => {
      if (entry[1].length > 0) {
        entry[1].forEach((fpv: FilterParamValue) => {
          if (entry[0] === 'DATE') {
            paramString += this.getDateParamString(fpv.name, entry[0], fpv.value);
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
