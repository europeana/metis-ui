export interface SubmissionResponseData {
  body?: {
    'dataset-id': number;
    'records-to-process': number;
    'duplicate-records': number;
  };
}
