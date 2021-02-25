export enum StepStatus {
  'import' = 'import',
  'validate (edm external)' = 'validate (edm external)',
  'transform' = 'transform',
  'validate (edm internal)' = 'validate (edm internal)',
  'normalise' = 'normalise',
  'enrich' = 'enrich',
  'process media' = 'process media',
  'preview' = 'preview',
  'publish' = 'publish'
}

/** Converted data **/
export interface PercentageClassInfo {
  pct: number;
  className: string;
}

/** Raw data **/

export enum Progress {
  'fail' = 'fail',
  'warn' = 'warn',
  'success' = 'success'
}

export interface ProgressByStep {
  fail: number;
  warn: number;
  success: number;
  //errors	[...]
  step: StepStatus;
  total: number;
}

export interface DatasetInfo {
  //portal-preview:	string,
  //portal-publish:	string,
  'processed-records': number;
  'progress-by-step': Array<ProgressByStep>;
  //errors	[...]
  //fail	integer($int64)
  //step	stringEnum:
  //Array [ 10 ]
  //success	integer($int64)
  //total	integer($int64)
  //warn	integer($int64)
  //}]
  //status	stringEnum:
  //Array [ 2 ]
  'total-records': number;
}
