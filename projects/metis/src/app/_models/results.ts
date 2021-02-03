// Java name: ResponseListWrapper

export interface ResultsBase<T> {
  results: T[];
  maxResultCountReached?: boolean;
}

export interface Results<T> extends ResultsBase<T> {
  listSize: number;
  nextPage: number;
}

export interface MoreResults<T> extends ResultsBase<T> {
  more: boolean;
}
