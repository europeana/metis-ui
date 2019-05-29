import { PluginType } from '../_models';

export const workflowFormFieldConf = [
  {
    label: 'HARVEST',
    name: 'pluginHARVEST'
  },
  {
    label: PluginType.VALIDATION_EXTERNAL,
    name: 'pluginVALIDATION_EXTERNAL'
  },
  {
    label: PluginType.TRANSFORMATION,
    name: 'pluginTRANSFORMATION'
  },
  {
    label: PluginType.VALIDATION_INTERNAL,
    name: 'pluginVALIDATION_INTERNAL'
  },
  {
    label: PluginType.NORMALIZATION,
    name: 'pluginNORMALIZATION'
  },
  {
    label: PluginType.ENRICHMENT,
    name: 'pluginENRICHMENT'
  },
  {
    label: PluginType.MEDIA_PROCESS,
    name: 'pluginMEDIA_PROCESS'
  },
  {
    label: PluginType.PREVIEW,
    name: 'pluginPREVIEW'
  },
  {
    label: PluginType.PUBLISH,
    name: 'pluginPUBLISH'
  },
  {
    label: PluginType.LINK_CHECKING,
    name: 'pluginLINK_CHECKING'
  }
];
