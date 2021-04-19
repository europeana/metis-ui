/** FilterOptionComponent
/* a single filter for the dashboard executions overview data.
*/
import { Component, ElementRef, Input, TemplateRef, ViewChild } from '@angular/core';

import {
  CanHaveError,
  FilterExecutionConfOption,
  FilterExecutionProvider,
  FilterParamHash,
  FilterParamType,
  FilterParamValue
} from '../../../_models/filterExecution';

@Component({
  selector: 'app-filter-option',
  templateUrl: './filter-option.component.html',
  styleUrls: ['./filter-option.component.scss']
})
export class FilterOptionComponent implements CanHaveError {
  @Input() config: FilterExecutionConfOption;
  @Input() filterName: FilterParamType;
  @Input() index: number;
  @Input() isRowEnd: boolean;
  @Input() multi: boolean;
  @Input() parentCmp: FilterExecutionProvider;
  @Input() params: FilterParamHash;
  @Input() rowIndex: number;

  @ViewChild('filterOptionTemplate', { static: true }) filterOptionTemplate: TemplateRef<
    HTMLElement
  >;
  @ViewChild('input') input: ElementRef;

  hasError = false;

  /** valueIndex
  /* return the index of the specified parameter within the params array
  */
  valueIndex(name: FilterParamType, value: string, inputRef?: number): number {
    let res = -1;
    this.params[name].forEach((item: FilterParamValue, i: number) => {
      if (value.length > 0 && item.value === value && item.inputRef === inputRef) {
        res = i;
      }
    });
    return res;
  }

  /** valueIsSet
  /* indicate if the value is set
  */
  valueIsSet(): boolean {
    return this.valueIndex(this.filterName, this.getVal(), this.index) > -1;
  }

  /** toggleParamValue
  /*
  */
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

  /** clearParamValuesByInputRef
  /* removes this instance's value from the parameter hash based on index
  */
  clearParamValuesByInputRef(): void {
    this.params[this.filterName] = this.params[this.filterName].filter(
      (param: FilterParamValue) => {
        return param.inputRef !== this.index;
      }
    );
  }

  /** clearParamValue
  /* removes this instance's value from the parameter hash based on value
  */
  clearParamValue(value: string): void {
    const index = this.valueIndex(this.filterName, value, this.index);
    if (index > -1) {
      this.params[this.filterName].splice(index, 1);
    }
  }

  /** clearParam
  /* removes this instance's value from the parameter hash
  */
  clearParam(): void {
    if (this.config.group) {
      this.params[this.filterName] = this.params[this.filterName].filter(
        (param: FilterParamValue) => {
          return param.group === this.config.group;
        }
      );
    } else {
      this.params[this.filterName] = [];
    }
  }

  /** addParam
  /* adds this instance's value to the parameter hash
  */
  addParam(): void {
    if (this.multi === undefined || !this.multi) {
      this.clearParam();
    }
    this.params[this.filterName].push({
      value: this.getVal(),
      group: this.config.group,
      name: this.config.name,
      inputRef: this.index
    });
  }

  /** getVal
  /* return this instance's value from the native html element or from the config
  */
  getVal(): string {
    return this.input ? this.input.nativeElement.value : this.config.value;
  }

  /** handleFocus
  /* - enable group (i.e. date picker pair) on recieving focus
  */
  handleFocus(): void {
    if (this.config.group) {
      this.parentCmp.restoreGroup(this.config.group, this.index);
    }
    this.handleChange();
  }

  /** handleChange
  /* - toggle value change
  /* - invoke attached callback function
  */
  handleChange(): void {
    if (this.config.input) {
      this.toggleParamValue();
      if (this.config.input.cbFnOnSet) {
        this.config.input.cbFnOnSet(
          this,
          this.input.nativeElement,
          this.config.group ? this.parentCmp.getInputGroupElements(this.config.group) : undefined
        );
      }
    }
  }

  /** handleClick
  /* toggle value change
  */
  handleClick(): void {
    this.toggleParamValue();
  }

  /** clear
  /* - clear html input value
  /* - invoke attached callback function
  */
  clear(): void {
    if (this.config.input) {
      this.input.nativeElement.value = '';
      if (this.config.input.cbFnOnClear) {
        this.config.input.cbFnOnClear(this.input.nativeElement);
      }
    }
  }

  /** setHasError
  /* update the instance's hasError value
  */
  setHasError(val: boolean): void {
    this.hasError = val;
  }
}
