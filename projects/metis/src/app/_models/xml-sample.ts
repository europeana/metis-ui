export enum XSLTStatus {
  LOADING = 'loading',
  NOCUSTOM = 'no-custom',
  HASCUSTOM = 'has-custom',
  NEWCUSTOM = 'new-custom'
}

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
