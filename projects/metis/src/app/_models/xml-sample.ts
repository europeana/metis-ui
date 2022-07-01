// Java name: Record

export interface XmlSample {
  ecloudId: string;
  xmlRecord: string;
}

export interface XmlDownload extends XmlSample {
  label: string;
}

export interface HistoryVersion {
  workflowExecutionId: string;
  pluginType: string;
  finishedTime?: number;
}

export interface HistoryVersions {
  evolutionSteps: Array<HistoryVersion>;
}
