/** Defines which filters are available for the dashboard executions overview
 */
import { isSupportedDateElement, isValidDate } from '../../_helpers/date-helpers';
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
 * setElementValue
 *
 * Sets an element's value if the value is present and dispatches the change event
 *
 * @param { HTMLInputElement } el - the native element
 * @param { string } value - the value to set
 **/
const setElementValue = (el: HTMLInputElement, value: string | null): void => {
  if (value) {
    el.value = value;
    el.dispatchEvent(new Event('change'));
  }
};

/**
 * setAttributeOnElements
 *
 * Sets the specified attribute on a (filtered) element list
 *
 * @param { string } filterId - the id to filter on
 * @param { string } attributeName - the attribute to set
 * @param { string } value - the value to set
 * @param { HTMLElement[] } opElements - elements related in the config group
 **/
const setAttributeOnElements = (
  filterId: string,
  attributeName: string,
  value: string,
  opElements?: HTMLElement[]
): void => {
  if (opElements) {
    opElements
      .filter((item) => {
        return item.id === filterId;
      })
      .forEach((item) => {
        if (value) {
          item.setAttribute(attributeName, value);
        } else {
          item.removeAttribute(attributeName);
        }
      });
  }
};

/**
 * setDateFrom
 *
 * Function to invoke when the date-from is set
 *
 * @param { CanHaveError } cmp - the component
 * @param { HTMLInputElement } el - the native element
 * @param { HTMLElement[] } opElements - elements related in the config group
 **/
const setDateFrom = (cmp: CanHaveError, el: HTMLInputElement, opElements?: HTMLElement[]): void => {
  const dates = isSupportedDateElement(el);
  const val = el.value;
  const max = el.getAttribute('max');

  if (val && max) {
    if (dates && val > max) {
      setElementValue(el, max);
      return;
    } else if (!dates) {
      const valid = isValidDate(val);
      if (!valid) {
        cmp.setHasError(true);
        return;
      } else {
        cmp.setHasError(false);
        if (new Date(val) > new Date(max)) {
          setElementValue(el, max);
          return;
        }
      }
    }
  } else {
    cmp.setHasError(false);
  }

  // Add/remove the min value attribute to/from the related html elements
  setAttributeOnElements('date-to', 'min', val, opElements);
};

/**
 * compareLTGT
 *
 * Generic comparison function (strings / Dates) that accepts a null comparison
 *
 * @param { boolean } lt - indicate if comparison is "less than" ("greater than" if false)
 * @param { string | Date } val - the value
 * @param { string | Date | null } otherVal - the other value
 * @param { boolean } compareAsDate - flag that the otherVal should be converted to a date before comparing
 **/
const compareLTGT = (
  lt: boolean,
  val: string | Date,
  otherVal: string | Date | null,
  compareAsDate = false
): boolean => {
  if (compareAsDate && otherVal) {
    otherVal = new Date(otherVal);
  }
  if (lt) {
    return !!otherVal && val < otherVal;
  } else {
    return !!otherVal && val > otherVal;
  }
};

/**
 * setDateTo
 *
 * Function to invoke when the date-from is set
 *
 * @param { CanHaveError } cmp - the component
 * @param { HTMLInputElement } el - the native element
 * @param { HTMLElement[] } opElements - elements related in the config group
 **/
const setDateTo = (cmp: CanHaveError, el: HTMLInputElement, opElements?: HTMLElement[]): void => {
  const val = el.value;
  if (!val) {
    setAttributeOnElements('date-from', 'max', today, opElements);
    return;
  }

  const max = el.getAttribute('max');
  const min = el.getAttribute('min');
  const dates = isSupportedDateElement(el);

  if (dates) {
    if (compareLTGT(true, val, min)) {
      setElementValue(el, min);
      return;
    }
    if (compareLTGT(false, val, max)) {
      setElementValue(el, max);
      return;
    }
  } else {
    const valid = isValidDate(val);
    if (!valid) {
      cmp.setHasError(true);
      return;
    } else {
      const dateFromVal = new Date(val);

      if (compareLTGT(false, dateFromVal, max, true)) {
        setElementValue(el, max);
        return;
      } else if (compareLTGT(true, dateFromVal, min, true)) {
        setElementValue(el, min);
        return;
      } else {
        cmp.setHasError(false);
      }
    }
  }
  setAttributeOnElements('date-from', 'max', val, opElements);
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
