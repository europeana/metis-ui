import { PluginType } from './workflow-execution';

// header

export interface DragDT {
  setData(s1: string, s2: string): void;
  getData(s1: string): string;
  setDragImage(HTMLElement: string, i1: number, i2: number): void;
}

export interface EventDragDT extends Event {
  dataTransfer?: DragDT;
}

export enum DragType {
  dragNone = 'dragNone',
  dragCopy = 'dragCopy',
  dragSource = 'dragSource'
}

// form

export type WorkflowFieldDataName =
  | 'pluginHARVEST'
  | 'pluginTRANSFORMATION'
  | 'pluginVALIDATION_EXTERNAL'
  | 'pluginENRICHMENT'
  | 'pluginVALIDATION_INTERNAL'
  | 'pluginMEDIA_PROCESS'
  | 'pluginNORMALIZATION'
  | 'pluginLINK_CHECKING'
  | 'pluginPREVIEW'
  | 'pluginPUBLISH';

export enum ParameterFieldName {
  customXslt = 'customXslt',
  harvestUrl = 'harvestUrl',
  incrementalHarvest = 'incrementalHarvest',
  metadataFormat = 'metadataFormat',
  performSampling = 'performSampling',
  pluginType = 'pluginType',
  setSpec = 'setSpec',
  url = 'url'
}

export type ParameterField = Array<ParameterFieldName>;

interface WorkflowFieldDataBase {
  label: string;
  name: WorkflowFieldDataName;
  dragType: DragType;
  error?: boolean;
  currentlyViewed?: boolean;
}

export interface WorkflowFieldData extends WorkflowFieldDataBase {
  parameterFields?: ParameterField;
}

export interface WorkflowFieldDataParameterised extends WorkflowFieldData {
  parameterFields: ParameterField;
}

const parameterFieldPresets = Object.assign(
  {},
  ...['HARVEST', PluginType.TRANSFORMATION, PluginType.LINK_CHECKING].map((pType) => {
    let paramField = null;
    if (pType === 'HARVEST') {
      paramField = [
        ParameterFieldName.harvestUrl,
        ParameterFieldName.incrementalHarvest,
        ParameterFieldName.metadataFormat,
        ParameterFieldName.pluginType,
        ParameterFieldName.setSpec,
        ParameterFieldName.url
      ];
    } else if (pType === PluginType.TRANSFORMATION) {
      paramField = [ParameterFieldName.customXslt];
    } else if (pType === PluginType.LINK_CHECKING) {
      paramField = [ParameterFieldName.performSampling];
    }
    return {
      [pType]: paramField
    };
  })
);

export type WorkflowFormFieldConf = (WorkflowFieldData | WorkflowFieldDataParameterised)[];

export const workflowFormFieldConf: WorkflowFormFieldConf = [
  {
    label: 'HARVEST',
    name: 'pluginHARVEST' as WorkflowFieldDataName,
    parameterFields: parameterFieldPresets.HARVEST,
    dragType: DragType.dragNone
  }
].concat(
  Object.values(PluginType)
    .filter((pType: PluginType) => {
      return PluginType.DEPUBLISH !== pType;
    })
    .map((pType: PluginType) => {
      let dragType = DragType.dragNone;
      if ([PluginType.HTTP_HARVEST, PluginType.OAIPMH_HARVEST].includes(pType)) {
        return {
          label: '',
          name: '' as WorkflowFieldDataName,
          parameterFields: null,
          dragType: dragType
        };
      } else {
        if (pType === 'LINK_CHECKING') {
          dragType = DragType.dragSource;
        }
        return {
          label: PluginType[pType] as string,
          name: ('plugin' + pType) as WorkflowFieldDataName,
          parameterFields: parameterFieldPresets[pType],
          dragType: dragType
        };
      }
    })
    .filter((fData) => fData.label.length > 0)
);
