/** FilterOptionComponent
/* a single filter for the dashboard executions overview data.
*/
import { NgClass } from '@angular/common';
import { Component, ElementRef, input, model, signal, viewChild } from '@angular/core';
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
  readonly rowIndex = input.required<number>();

  readonly params = model.required<FilterParamHash>();
  readonly inputEl = viewChild<ElementRef<HTMLInputElement>>('input');

  readonly hasError = signal(false);

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
  /* toggle parameter value state tracks
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
    const currentHash = this.params();
    const updatedArray = currentHash[this.filterName()].filter(
      (param: FilterParamValue) => param.inputRef !== this.index()
    );

    this.params.set({
      ...currentHash,
      [this.filterName()]: updatedArray
    });
  }

  /** clearParamValue
  /* removes this instance's value from the parameter hash based on value
  */
  clearParamValue(value: string): void {
    const currentHash = this.params();
    const index = this.valueIndex(this.filterName(), value, this.index());

    if (index > -1) {
      const updatedArray = [
        ...currentHash[this.filterName()].slice(0, index),
        ...currentHash[this.filterName()].slice(index + 1)
      ];

      this.params.set({
        ...currentHash,
        [this.filterName()]: updatedArray
      });
    }
  }

  /** clearParam
  /* removes this instance's value from the parameter hash
  */
  clearParam(currentHash = this.params()): FilterParamValue[] {
    if (this.config().group) {
      return currentHash[this.filterName()].filter(
        (param: FilterParamValue) => param.group === this.config().group
      );
    }
    return [];
  }

  /** addParam
  /* adds this instance's value to the parameter hash
  */
  addParam(): void {
    const currentHash = this.params();
    const baseArray =
      this.multi() === undefined || !this.multi()
        ? this.clearParam(currentHash)
        : [...currentHash[this.filterName()]];

    const updatedArray = [
      ...baseArray,
      {
        value: this.getVal(),
        group: this.config().group,
        name: this.config().name,
        inputRef: this.index()
      }
    ];

    this.params.set({
      ...currentHash,
      [this.filterName()]: updatedArray
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

      // Clean up the parameter values immutably
      this.clearParamValuesByInputRef();
    }
  }
}
