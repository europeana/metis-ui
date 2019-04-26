import { Component, Input } from '@angular/core';

import { filterConf } from '../../_helpers/filter-conf';
import {
  FilterExecutionConf,
  FilterExecutionConfOption,
  FilterParamHash,
  FilterParamType,
  FilterParamValue,
} from '../../_models/filterExecution';

@Component({
  selector: 'app-filter-ops',
  templateUrl: './filter-ops.component.html',
  styleUrls: ['./filter-ops.component.scss'],
})
export class FilterOpsComponent {
  showing = false;
  conf: FilterExecutionConf[];
  params: FilterParamHash;
  settingFocus = false;
  @Input() isLoading: boolean;
  @Input() title: string;

  constructor() {
    this.conf = filterConf;
    this.params = Object.assign({}, ...this.conf.map((s) => ({ [s.name]: [] })));
  }

  valueIndex(name: FilterParamType, value: string, inputRef?: number): number {
    let res = -1;
    this.params[name].forEach((item: FilterParamValue, i: number) => {
      if (item.value === value && item.inputRef === inputRef) {
        res = i;
      }
    });
    return res;
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

  valueIsSet(name: FilterParamType, value: string, inputRef?: number): boolean {
    return this.valueIndex(name, value, inputRef) > -1;
  }

  addParam(
    name: FilterParamType,
    op: FilterExecutionConfOption,
    multi?: boolean,
    inputRef?: number,
  ): void {
    if (multi === undefined || !multi) {
      this.clearParam(name, op.group);
    }
    this.params[name].push({ value: op.value, group: op.group, inputRef });
    this.showParams();
  }

  restoreParamFromInput(
    name: FilterParamType,
    el: HTMLInputElement,
    group?: string,
    multi?: boolean,
    inputRef?: number,
  ): void {
    if (group) {
      const clss = el.getAttribute('class');

      if (clss && clss.length > 0 && !this.settingFocus) {
        this.settingFocus = true;
        document.querySelectorAll('.' + clss).forEach((item) => {
          if (el !== item) {
            item.dispatchEvent(new Event('restore'));
          }
        });
        this.settingFocus = false;
      }
    }
    if (el.value.length > 0 && !this.valueIsSet(name, el.value, inputRef)) {
      this.addParam(name, { value: el.value, group }, multi, inputRef);
    }
  }

  toggleParamValue(
    name: FilterParamType,
    op: FilterExecutionConfOption,
    multi?: boolean,
    inputRef?: number,
  ): void {
    if (op.value.length > 0) {
      if (inputRef) {
        this.clearParamValuesByInputRef(name, inputRef);
        this.addParam(name, op, multi, inputRef);
      } else if (this.valueIsSet(name, op.value, inputRef)) {
        this.clearParamValue(name, op.value, inputRef);
      } else {
        this.addParam(name, op, multi, inputRef);
      }
    }
  }

  clearParamValue(name: FilterParamType, value: string, inputRef?: number): void {
    const index = this.valueIndex(name, value, inputRef);
    if (index > -1) {
      this.params[name].splice(index, 1);
    }
  }

  clearParamValuesByInputRef(name: FilterParamType, inputRef?: number): void {
    this.params[name] = this.params[name].filter((param: FilterParamValue) => {
      return param.inputRef !== inputRef;
    });
  }

  clearParam(name: FilterParamType, group?: string): void {
    if (group) {
      this.params[name] = this.params[name].filter((param: FilterParamValue) => {
        return param.group === group;
      });
    } else {
      this.params[name] = [];
    }
  }

  clearParams(): void {
    this.conf.forEach((item) => this.clearParam(item.name));
  }

  showParams(): void {
    console.log('Params: ' + JSON.stringify(this.params));
  }

  hide(): void {
    this.showing = false;
  }

  toggle(): void {
    this.showing = !this.showing;
  }
}
