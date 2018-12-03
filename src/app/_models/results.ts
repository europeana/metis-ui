// Java name: ResponseListWrapper

export interface Results<T> {
  results: T;
  listSize: number;
  nextPage: number;
}

export interface MoreResults<T> {
  results: T;
  more: boolean;
}
