import {
  FilterExecutionConf,
  FilterExecutionConfOption,
  PluginType,
  WorkflowStatus
} from '../../_models';
import { RenameWorkflowPipe } from '../../_translate';

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
        name: 'dateFrom',
        input: {
          id: 'date-from',
          type: 'date',
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
            el.removeAttribute('max');
          }
        },
        group: 'date-pair'
      },
      {
        label: 'to',
        value: '',
        name: 'dateTo',
        input: {
          id: 'date-to',
          type: 'date',
          cbFnOnSet: (el: HTMLInputElement, opElements?: HTMLElement[]): void => {
            const val = el.value;
            const min = el.getAttribute('min');

            if (val && min) {
              if (val < min) {
                el.value = min;
                el.dispatchEvent(new Event('change'));
                return;
              }
            }

            if (opElements) {
              opElements.forEach((item) => {
                if (item.id === 'date-from') {
                  val ? item.setAttribute('max', val) : item.removeAttribute('max');
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
