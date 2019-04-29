import { Component, ElementRef, Input, TemplateRef, ViewChild } from '@angular/core';

import {
  FilterExecutionConfOption,
  FilterExecutionProvider,
  FilterParamHash,
  FilterParamType,
  FilterParamValue,
} from '../../../_models/filterExecution';

@Component({
  selector: 'app-filter-option',
  templateUrl: './filter-option.component.html',
  styleUrls: ['./filter-option.component.scss'],
})
export class FilterOptionComponent {
  @Input() config: FilterExecutionConfOption;
  @Input() filterName: FilterParamType;
  @Input() index: number;
  @Input() isRowEnd: boolean;
  @Input() multi: boolean;
  @Input() parentCmp: FilterExecutionProvider;
  @Input() params: FilterParamHash;
  @Input() rowIndex: number;

  @ViewChild('filterOptionTemplate') filterOptionTemplate: TemplateRef<HTMLElement>;
  @ViewChild('input') input: ElementRef;

  constructor() {}

  valueIndex(name: FilterParamType, value: string, inputRef?: number): number {
    let res = -1;
    this.params[name].forEach((item: FilterParamValue, i: number) => {
      if (value.length > 0 && item.value === value && item.inputRef === inputRef) {
        res = i;
      }
    });
    return res;
  }
  valueIsSet(): boolean {
    return this.valueIndex(this.filterName, this.getVal(), this.index) > -1;
  }

  toggleParamValue(): void {
    const val = this.getVal();
    if (this.index) {
      this.clearParamValuesByInputRef();
      if (val.length === 0) {
        return;
      }
    } else if (this.valueIsSet()) {
      this.clearParamValue(val);
      return;
    }
    this.addParam();
  }

  clearParamValuesByInputRef(): void {
    this.params[this.filterName] = this.params[this.filterName].filter(
      (param: FilterParamValue) => {
        return param.inputRef !== this.index;
      },
    );
  }

  clearParamValue(value: string): void {
    const index = this.valueIndex(this.filterName, value, this.index);
    if (index > -1) {
      this.params[this.filterName].splice(index, 1);
    }
  }

  clearParam(): void {
    if (this.config.group) {
      this.params[this.filterName] = this.params[this.filterName].filter(
        (param: FilterParamValue) => {
          return param.group === this.config.group;
        },
      );
    } else {
      this.params[this.filterName] = [];
    }
  }

  addParam(): void {
    if (this.multi === undefined || !this.multi) {
      this.clearParam();
    }
    this.params[this.filterName].push({
      value: this.getVal(),
      group: this.config.group,
      inputRef: this.index,
    });
    this.showParams();
  }

  showParams(): void {
    console.log('Params: ' + JSON.stringify(this.params));
  }

  getVal(): string {
    return this.input ? this.input.nativeElement.value : this.config.value;
  }

  handleFocus(): void {
    if (this.config.group) {
      this.parentCmp.restoreGroup(this.config.group, this.index);
    }
    this.handleChange();
  }

  handleChange(): void {
    if (this.config.input) {
      const val = this.getVal();

      this.toggleParamValue();
      if (this.config.input.cbFnOnSet) {
        this.config.input.cbFnOnSet(
          val,
          this.config.group ? this.parentCmp.getInputGroupElements(this.config.group) : undefined,
        );
      }
    }
  }

  handleClick(): void {
    this.toggleParamValue();
  }

  clear(): void {
    if (this.config.input) {
      this.input.nativeElement.value = '';
      if (this.config.input.cbFnOnClear) {
        this.config.input.cbFnOnClear(this.input.nativeElement);
      }
    }
  }
}
