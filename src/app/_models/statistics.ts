export interface AttributesStatistics {
  name: string;
  occurrence: number;
  value: string;
}

export interface NodeStatistics {
  attributesStatistics: AttributesStatistics[];
  occurrence: number;
  parentXpath: string;
  value: string;
  xpath: string;
}

export interface Statistics {
  nodeStatistics: NodeStatistics[];
}
