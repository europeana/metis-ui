/** FilterOptionComponent
/* a single filter for the dashboard executions overview data.
*/
import { NgClass } from '@angular/common';
import { Component, ElementRef, input, signal, TemplateRef, viewChild } from '@angular/core';
import {
  CanHaveError,
  FilterExecutionConfOption,
  FilterExecutionProvider,
  FilterParamHash,
  FilterParamType,
  FilterParamValue
} from '../../../_models/filterExecution';
import { TranslatePipe } from '../../../_translate';

@Component({
  selector: 'app-filter-option',
  templateUrl: './filter-option.component.html',
  styleUrls: ['./filter-option.component.scss'],
  imports: [NgClass, TranslatePipe]
})
export class FilterOptionComponent implements CanHaveError {
  readonly config = input.required<FilterExecutionConfOption>();
  readonly filterName = input.required<FilterParamType>();
  readonly index = input<number | undefined>();
  readonly isRowEnd = input<boolean | undefined>();
  readonly multi = input<boolean | undefined>();
  readonly parentCmp = input.required<FilterExecutionProvider>();
  readonly params = input.required<FilterParamHash>();
  readonly rowIndex = input.required<number>();

  readonly filterOptionTemplate = viewChild.required<TemplateRef<HTMLElement>>(
    'filterOptionTemplate'
  );
  readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('input');

  private readonly _hasError = signal(false);

  get hasError(): boolean {
    return this._hasError();
  }
  set hasError(val: boolean) {
    this._hasError.set(val);
  }

  /** valueIndex
  /* return the index of the specified parameter within the params array
  */
  valueIndex(name: FilterParamType, value: string, inputRef?: number): number {
    let res = -1;
    this.params()[name].forEach((item: FilterParamValue, i: number) => {
      if (value && value.length > 0 && item.value === value && item.inputRef === inputRef) {
        res = i;
      }
    });
    return res;
  }

  /** valueIsSet
  /* indicate if the value is set
  */
  valueIsSet(): boolean {
    return this.valueIndex(this.filterName(), this.getVal(), this.index()) > -1;
  }

  /** toggleParamValue
  /*
  */
  toggleParamValue(): void {
    const val = this.getVal();
    if (this.index() !== undefined && this.index() !== null) {
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
    this.params()[this.filterName()] = this.params()[this.filterName()].filter(
      (param: FilterParamValue) => {
        return param.inputRef !== this.index();
      }
    );
  }

  /** clearParamValue
  /* removes this instance's value from the parameter hash based on value
  */
  clearParamValue(value: string): void {
    const index = this.valueIndex(this.filterName(), value, this.index());
    if (index > -1) {
      this.params()[this.filterName()].splice(index, 1);
    }
  }

  /** clearParam
  /* removes this instance's value from the parameter hash
  */
  clearParam(): void {
    if (this.config().group) {
      this.params()[this.filterName()] = this.params()[this.filterName()].filter(
        (param: FilterParamValue) => {
          return param.group === this.config().group;
        }
      );
    } else {
      this.params()[this.filterName()] = [];
    }
  }

  /** addParam
  /* adds this instance's value to the parameter hash
  */
  addParam(): void {
    if (this.multi() === undefined || !this.multi()) {
      this.clearParam();
    }
    this.params()[this.filterName()].push({
      value: this.getVal(),
      group: this.config().group,
      name: this.config().name,
      inputRef: this.index()
    });
  }

  /** getVal
  /* return this instance's value from the native html element or from the config
  */
  getVal(): string {
    const nativeInput = this.inputEl();
    return nativeInput ? nativeInput.nativeElement.value : this.config().value ?? '';
  }

  /** handleFocus
  /* - enable group (i.e. date picker pair) on recieving focus
  */
  handleFocus(): void {
    const group = this.config().group;
    if (group) {
      this.parentCmp().restoreGroup(group, this.index() ?? -1);
    }
    this.handleChange();
  }

  /** handleChange
  /* - toggle value change
  /* - invoke attached callback function
  */
  handleChange(): void {
    const configInput = this.config().input;
    const nativeInput = this.inputEl();
    if (configInput && nativeInput) {
      this.toggleParamValue();
      if (configInput.cbFnOnSet) {
        configInput.cbFnOnSet(
          this,
          nativeInput.nativeElement,
          this.config().group
            ? this.parentCmp().getInputGroupElements(this.config().group!)
            : undefined
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
    const configInput = this.config().input;
    const nativeInput = this.inputEl();
    if (configInput && nativeInput) {
      nativeInput.nativeElement.value = '';
      if (configInput.cbFnOnClear) {
        configInput.cbFnOnClear(nativeInput.nativeElement);
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
