export interface SubmissionResponseData {
  'dataset-id': string;
  'records-to-process': number;
  'duplicate-records': number;
}

export interface SubmissionResponseDataWrapped {
  body?: SubmissionResponseData;
}
