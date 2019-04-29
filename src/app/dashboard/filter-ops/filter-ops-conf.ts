import {
  FilterExecutionConf,
  FilterExecutionConfOption,
  PluginType,
  WorkflowStatus,
} from '../../_models';
import { RenameWorkflowPipe } from '../../_translate';

export const filterConf: FilterExecutionConf[] = [
  {
    label: 'workflow',
    name: 'WORKFLOW',
    multi: true,
    options: Object.values(PluginType)
      .map((type) => {
        return {
          value: type,
          label: RenameWorkflowPipe.prototype.transform(type) || type,
        } as FilterExecutionConfOption;
      })
      .sort((a: FilterExecutionConfOption, b: FilterExecutionConfOption) => {
        return a.label.localeCompare(b.label);
      }),
  },
  {
    label: 'date',
    name: 'DATE',
    options: [
      { label: 'last 24', value: '1' },
      { label: 'last week', value: '7' },
      { label: 'last month', value: '30' },
      {
        label: 'from',
        value: '',
        input: {
          id: 'date-from',
          type: 'date',
          cbFnOnSet: (val: string, opElements?: HTMLElement[]): void => {
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
          },
        },
        group: 'date-pair',
      },
      {
        label: 'to',
        value: '',
        input: {
          id: 'date-to',
          type: 'date',
          cbFnOnSet: (val: string, opElements?: HTMLElement[]): void => {
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
          },
        },
        group: 'date-pair',
      },
    ],
  },
  {
    label: 'status',
    name: 'STATUS',
    multi: true,
    options: Object.values(WorkflowStatus)
      .sort()
      .map((status) => {
        return { label: status.toLowerCase(), value: status };
      }),
  },
];
