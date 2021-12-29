export interface ClassMap {
  [details: string]: boolean;
}

export interface ClassMapFunctions {
  [details: string]: (index: number) => boolean;
}
