export interface AttributesStatistics {
  name: string;
  value: string;
  occurrence: number;
}

export interface NodeStatistics {
  parentXpath: string;
  xpath: string;
  value: string;
  occurrence: number;
  attributesStatistics: AttributesStatistics[];
}

// Java name: StatisticsReport

export interface Statistics {
  taskId: number;
  nodeStatistics: NodeStatistics[];
}
