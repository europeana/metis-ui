import { PluginType } from './workflow-execution';

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
    parameterFields: parameterFieldPresets.HARVEST
  }
].concat(
  Object.values(PluginType)
    .map((pType: PluginType) => {
      return [PluginType.HTTP_HARVEST, PluginType.OAIPMH_HARVEST].indexOf(pType) > -1
        ? {
            label: '' as string,
            name: '' as WorkflowFieldDataName,
            parameterFields: null
          }
        : {
            label: PluginType[pType] as string,
            name: ('plugin' + pType) as WorkflowFieldDataName,
            parameterFields: parameterFieldPresets[pType]
          };
    })
    .filter((fData) => fData.label.length > 0)
);
