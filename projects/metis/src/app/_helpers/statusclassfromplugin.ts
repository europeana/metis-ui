import { PluginExecution, PluginStatus } from '../_models';

/** statusClassFromPlugin
/* export function for calculating css classes based on the plugin status
*/
export function statusClassFromPlugin(
  plugin: PluginExecution,
  currentPlugin?: PluginExecution
): string {
  const { executionProgress, pluginStatus } = plugin;
  if (executionProgress === undefined) {
    return `status-${pluginStatus.toString().toLowerCase()}`;
  } else if (
    executionProgress.errors > 0 &&
    (pluginStatus === PluginStatus.FINISHED || pluginStatus === PluginStatus.CANCELLED)
  ) {
    return 'status-warning';
  } else if (plugin !== currentPlugin && pluginStatus === PluginStatus.INQUEUE) {
    return 'status-scheduled';
  } else {
    return `status-${pluginStatus.toString().toLowerCase()}`;
  }
}
