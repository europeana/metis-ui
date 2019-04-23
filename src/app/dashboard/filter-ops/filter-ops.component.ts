import { Component, Input } from '@angular/core';
import { filterConf } from '../../_helpers/filter-conf';
import {
  filterExecution,
  filterExecutionOption,
  filterParamValue,
} from '../../_models/filterExecution';

@Component({
  selector: 'app-filter-ops',
  templateUrl: './filter-ops.component.html',
  styleUrls: ['./filter-ops.component.scss'],
})
export class FilterOpsComponent {
  showing: boolean = true;
  conf: filterExecution[];

  params: any = {};

  settingFocus = false;
  @Input() isLoading: boolean;
  @Input() title: string;

  constructor() {
    this.conf = filterConf;
    this.clearParams();
  }

  valueIndex(name: string, value: any, inputRef?: number): number {
    let res = -1;
    this.params[name].forEach((item: any, i: number) => {
      if (item.value === value && item.inputRef === inputRef) {
        res = i;
      }
    });
    return res;
  }

  valueIsSet(name: string, value: string, inputRef?: number): boolean {
    return this.valueIndex(name, value, inputRef) > -1;
  }

  addParam(name: string, op: filterExecutionOption, multi?: boolean, inputRef?: number): void {
    if (multi === undefined || multi === false) {
      this.clearParam(name, op.group);
    }

    this.params[name].push({ value: op.value, group: op.group, inputRef: inputRef });
    this.showParams();
  }

  restoreParamFromInput(
    name: string,
    el: HTMLInputElement,
    group: string,
    multi?: boolean,
    inputRef?: number,
  ): void {
    if (group) {
      let clss = el.getAttribute('class');

      if (clss && clss.length > 0 && !this.settingFocus) {
        this.settingFocus = true;
        document.querySelectorAll('.' + clss).forEach((item) => {
          if (el !== item) {
            (item as HTMLInputElement).focus();
          }
        });
        this.settingFocus = false;
      }
    }

    if (el.value.length > 0 && !this.valueIsSet(name, el.value, inputRef)) {
      this.addParam(name, { value: el.value, group: group }, multi, inputRef);
    }
  }

  toggleParamValue(
    name: string,
    op: filterExecutionOption,
    multi?: boolean,
    inputRef?: number,
  ): void {
    if (op.value.length > 0) {
      if (this.valueIsSet(name, op.value, inputRef)) {
        this.clearParamValue(name, op.value, inputRef);
      } else {
        this.addParam(name, op, multi, inputRef);
      }
    }
  }

  clearParamValue(name: string, value: string, inputRef?: number) {
    const index = this.valueIndex(name, value, inputRef);
    if (index > -1) {
      this.params[name].splice(index, 1);
    }
  }

  clearParam(name: string, group?: string): void {
    if (group) {
      this.params[name] = this.params[name].filter((param: filterParamValue) => {
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
    console.error('Params: ' + JSON.stringify(this.params));
  }

  hide(): void {
    this.showing = false;
  }

  toggle(): void {
    this.showing = !this.showing;
  }
}
