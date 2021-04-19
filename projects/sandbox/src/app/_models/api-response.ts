export interface SubmissionResponseData {
  body?: {
    'dataset-id': string;
    'records-to-process': number;
    'duplicate-records': number;
  };
}
