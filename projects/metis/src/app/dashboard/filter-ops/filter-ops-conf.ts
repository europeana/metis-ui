/** Defines which filters are available for the dashboard executions overview
 */
import { isDateSupported, isValidDate } from '../../_helpers/date-helpers';
import {
  CanHaveError,
  FilterExecutionConf,
  FilterExecutionConfOption,
  PluginType,
  WorkflowStatus
} from '../../_models';
import { RenameWorkflowPipe } from '../../_translate';

const today = new Date().toISOString().split('T')[0];

/**
 * setDateFrom
 *
 * Function to invoke when the date-from is set
 *
 * @param { CanHaveError } - cmp - the component
 * @param { HTMLInputElement } - el - the native element
 * @param { HTMLElement[] } - opElements - elements related in the config group
 **/
const setDateFrom = (cmp: CanHaveError, el: HTMLInputElement, opElements?: HTMLElement[]): void => {
  const dates = isDateSupported() && el.getAttribute('type') === 'date';
  const val = el.value;
  const max = el.getAttribute('max');

  if (val && max) {
    if (dates && val > max) {
      el.value = max;
      el.dispatchEvent(new Event('change'));
      return;
    } else if (!dates) {
      const valid = isValidDate(val);
      if (!valid) {
        cmp.setHasError(true);
        return;
      } else {
        cmp.setHasError(false);
        if (new Date(val) > new Date(max)) {
          el.value = max;
          el.dispatchEvent(new Event('change'));
          return;
        }
      }
    }
  } else {
    cmp.setHasError(false);
  }

  // Add/remove the min value attribute to/from the related html elements
  if (opElements) {
    opElements.forEach((item) => {
      if (item.id === 'date-to') {
        if (val) {
          item.setAttribute('min', val);
        } else {
          item.removeAttribute('min');
        }
      }
    });
  }
};

/**
 * setDateTo
 *
 * Function to invoke when the date-from is set
 *
 * @param { CanHaveError } - cmp - the component
 * @param { HTMLInputElement } - el - the native element
 * @param { HTMLElement[] } - opElements - elements related in the config group
 **/
const setDateTo = (cmp: CanHaveError, el: HTMLInputElement, opElements?: HTMLElement[]): void => {
  const val = el.value;
  const max = el.getAttribute('max');
  const min = el.getAttribute('min');
  const dates = isDateSupported() && el.getAttribute('type') === 'date';

  if (val) {
    if (dates) {
      if (min && val < min) {
        el.value = min;
        el.dispatchEvent(new Event('change'));
        return;
      }
      if (max && val > max) {
        el.value = max;
        el.dispatchEvent(new Event('change'));
        return;
      }
    } else {
      const valid = isValidDate(val);
      if (!valid) {
        cmp.setHasError(true);
        return;
      } else {
        if (max && new Date(val) > new Date(max)) {
          el.value = max;
          el.dispatchEvent(new Event('change'));
          return;
        } else if (min && new Date(val) < new Date(min)) {
          el.value = min;
          el.dispatchEvent(new Event('change'));
          return;
        } else {
          cmp.setHasError(false);
        }
      }
    }
  }

  if (opElements) {
    opElements.forEach((item) => {
      if (item.id === 'date-from') {
        if (val) {
          item.setAttribute('max', val);
        } else {
          item.setAttribute('max', today);
        }
      }
    });
  }
};

/**
 * filterConf
 *
 * Function to return an object that defines the filter configuration
 *
 * @returns { FilterExecutionConf[] }
 **/
export const filterConf: FilterExecutionConf[] = [
  {
    label: 'workflow',
    name: 'pluginType',
    multi: true,
    options: Object.values(PluginType).map((type) => {
      return {
        value: type,
        label: RenameWorkflowPipe.prototype.transform(type) || type
      } as FilterExecutionConfOption;
    })
  },
  {
    label: 'date',
    name: 'DATE',
    options: [
      { label: 'last24Hours', value: '1' },
      { label: 'lastWeek', value: '7' },
      { label: 'lastMonth', value: '30' },
      {
        label: 'from',
        value: '',
        name: 'fromDate',
        input: {
          id: 'date-from',
          type: 'date',
          max: today,
          cbFnOnSet: setDateFrom,
          cbFnOnClear: (el: HTMLElement): void => {
            el.setAttribute('max', today);
          }
        },
        group: 'date-pair'
      },
      {
        label: 'to',
        value: '',
        name: 'toDate',
        input: {
          id: 'date-to',
          type: 'date',
          max: today,
          cbFnOnSet: setDateTo,
          cbFnOnClear: (el: HTMLElement): void => {
            el.removeAttribute('min');
          }
        },
        group: 'date-pair'
      }
    ]
  },
  {
    label: 'status',
    name: 'pluginStatus',
    multi: true,
    options: Object.values(WorkflowStatus).map((status) => {
      return { label: status, value: status };
    })
  }
];
