/** FilterOpsComponent
/*  a filter menu for the dashboard executions overview data.
/*
/*  3 fields can be filtered on:
/*  3 fields can be filtered on:
/*  - dates
/*  - plugin type
/*  - plugin status
/*
/* Behaviour:
/*  - the filter is applied automatically when the menu is closed
/*  - a bold font on the menu-opener indicates that a filter is being applied
/*  - applied filter names are concatenated into a tooltip
/*
/* Notes:
/*  - a filter can use AND logic (status, type)
/*  - a filter can use OR logic (preset-date ranges)
/*  - manual date ranges are constrained to dates in the past
*/

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

  /** anyValueSet
  /* indicate if any parameter is set
  */
  anyValueSet(): boolean {
    let res = false;
    Object.entries(this.params).forEach(([name, val]) => {
      if (name && val.length > 0) {
        res = true;
      }
    });
    return res;
  }

  /** anyErrors
  /* indicate if any optionComponents has an error
  */
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

  /** getSetSummary
  /* return a comma-separated summary of parameters if component isn't showing
  */
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

  /** getInputGroup
  /* return array of filterOption components belonging to the specified group
  */
  getInputGroup(group: string): FilterOptionComponent[] {
    const res: FilterOptionComponent[] = [];
    this.optionComponents.toArray().forEach((item) => {
      if (item.config.group === group) {
        res.push(item);
      }
    });
    return res;
  }

  /** getInputGroupElements
  /* return array of native html elements belonging to the specified group
  */
  getInputGroupElements(group: string): HTMLElement[] {
    return this.getInputGroup(group).map((item) => {
      return item.input.nativeElement;
    });
  }

  restoreGroup(group: string, callerIndex: number): void {
    this.getInputGroup(group).forEach((item) => {
      if (item.index !== callerIndex && !item.valueIsSet() && item.getVal().length > 0) {
        item.addParam();
      }
    });
  }

  /** reset
  /* clear parameters and update the service parameter string
  */
  reset(): void {
    this.optionComponents.forEach((item) => {
      item.clearParam();
    });
    this.optionComponents.forEach((item) => item.clear());
    this.updateParameters();
  }

  /** getFromToParam
  /* formats the date-range paramter string
  /* (dates formatted as ISO strings)
  */
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

  /** hide
  /* - hides the filter menu
  /* - updates the search paramter string
  */
  hide(): void {
    this.showing = false;
    this.updateParameters();
  }

  /** getDateParamString
  /* - formats the pre-set date-range parameter string
  /* - checks the validity of the date (and formats) for manually-picked dates
  */
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

  /** updateParameters
  /* - build parameter string from the selected filters
  /* - emit the paramter changed event
  */
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

  /** toggle
  /* - toggle the showing variable
  /* - update the paramter string if set to not showing
  */
  toggle(): void {
    this.showing = !this.showing;
    if (!this.showing) {
      this.updateParameters();
    }
  }
}
