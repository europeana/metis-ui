export interface AttributeStatistics {
  xPath: string;
  value: string;
  occurrences: number;
}

export interface NodeValueStatistics {
  value: string;
  occurrences: number;
  attributeStatistics: AttributeStatistics[];
}

export interface NodePathStatistics {
  xPath: string;
  moreLoaded?: boolean;
  nodeValueStatistics: NodeValueStatistics[];
}

export interface Statistics {
  taskId: number;
  nodePathStatistics: NodePathStatistics[];
}
