export interface ClassMap {
  [details: string]: boolean;
}

export interface ClassMapFunctions {
  [details: string]: (index: number) => boolean;
}

export enum DisplayedTier {
  CONTENT = 0,
  METADATA
}

export enum DisplayedMetaTier {
  LANGUAGE = 0,
  ELEMENTS,
  CLASSES
}
