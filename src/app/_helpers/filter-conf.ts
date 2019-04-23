import { filterExecution } from '../_models/filterExecution';

export const filterConf: filterExecution[] = [
  {
    label: 'workflow',
    name: 'workflow',
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
    name: 'date',
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
            let dateTo = document.querySelector('#date-to');
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
            let dateFrom = document.querySelector('#date-from');
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
    name: 'status',
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
  {
    label: 'user',
    name: 'user',
    options: [{ value: 'Andy' }, { value: 'Jimmy' }, { value: 'Xena' }],
  },
];
