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
    return {
      [pType]:
        pType === 'HARVEST'
          ? ([
              ParameterFieldName.harvestUrl,
              ParameterFieldName.metadataFormat,
              ParameterFieldName.pluginType,
              ParameterFieldName.setSpec,
              ParameterFieldName.url
            ] as ParameterField)
          : pType === PluginType.TRANSFORMATION
          ? ([ParameterFieldName.customXslt] as ParameterField)
          : pType === PluginType.LINK_CHECKING
          ? ([ParameterFieldName.performSampling] as ParameterField)
          : null
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
      return [PluginType.HTTP_HARVEST, PluginType.OAIPMH_HARVEST].indexOf(pType) > -1
        ? {
            label: '',
            name: '' as WorkflowFieldDataName,
            parameterFields: null,
            dragType: DragType.dragNone
          }
        : {
            label: PluginType[pType] as string,
            name: ('plugin' + pType) as WorkflowFieldDataName,
            parameterFields: parameterFieldPresets[pType],
            dragType: pType === 'LINK_CHECKING' ? DragType.dragSource : DragType.dragNone
          };
    })
    .filter((fData) => fData.label.length > 0)
);
