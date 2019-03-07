// Java name: Record

export interface XmlSample {
  ecloudId: string;
  xmlRecord: string;
}

export interface HistoryVersion {
  workflowId: number;
  pluginType: string;
  finishedTime?: number;
}

export interface HistoryVersions {
  evolutionSteps: Array<HistoryVersion>;
}
