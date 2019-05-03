import {
  FilterExecutionConf,
  FilterExecutionConfOption,
  PluginType,
  WorkflowStatus
} from '../../_models';
import { RenameWorkflowPipe } from '../../_translate';

const today = new Date().toISOString().split('T')[0];

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
      { label: 'last-24-hours', value: '1' },
      { label: 'last-week', value: '7' },
      { label: 'last-month', value: '30' },
      {
        label: 'from',
        value: '',
        name: 'fromDate',
        input: {
          id: 'date-from',
          type: 'date',
          max: today,
          cbFnOnSet: (el: HTMLInputElement, opElements?: HTMLElement[]): void => {
            const val = el.value;
            const max = el.getAttribute('max');

            if (val && max) {
              if (val > max) {
                el.value = max;
                el.dispatchEvent(new Event('change'));
                return;
              }
            }

            if (opElements) {
              opElements.forEach((item) => {
                if (item.id === 'date-to') {
                  val ? item.setAttribute('min', val) : item.removeAttribute('min');
                }
              });
            }
          },
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
          cbFnOnSet: (el: HTMLInputElement, opElements?: HTMLElement[]): void => {
            const val = el.value;
            const max = el.getAttribute('max');
            const min = el.getAttribute('min');

            if (val) {
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
            }

            if (opElements) {
              opElements.forEach((item) => {
                if (item.id === 'date-from') {
                  item.setAttribute('max', val ? val : today);
                }
              });
            }
          },
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
