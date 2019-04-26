import { FilterExecutionConf } from '../_models/filterExecution';

export const filterConf: FilterExecutionConf[] = [
  {
    label: 'workflow',
    name: 'WORKFLOW',
    multi: true,
    options: [
      { value: 'enrich' },
      { value: 'import a' },
      { value: 'import b' },
      { value: 'normalise' },
      { value: 'preview' },
      { value: 'validate' },
      { value: 'transform' },
    ],
  },
  {
    label: 'date',
    name: 'DATE',
    options: [
      { value: 'last 24' },
      { value: 'last week' },
      { value: 'last month' },
      {
        value: 'from',
        input: {
          id: 'date-from',
          type: 'date',
          fnOnSet: (val: string): void => {
            const dateTo = document.querySelector('#date-to');
            if (dateTo) {
              val ? dateTo.setAttribute('min', val) : dateTo.removeAttribute('min');
            }
          },
        },
        group: 'date-pair',
      },
      {
        value: 'to',
        input: {
          id: 'date-to',
          type: 'date',
          fnOnSet: (val: string): void => {
            const dateFrom = document.querySelector('#date-from');
            if (dateFrom) {
              val ? dateFrom.setAttribute('max', val) : dateFrom.removeAttribute('max');
            }
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
    options: [
      { value: 'cancelled' },
      { value: 'error' },
      { value: 'fail' },
      { value: 'inqueue' },
      { value: 'running' },
      { value: 'success' },
    ],
  },
];
