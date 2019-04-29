import { PluginExecution, PluginStatus } from '../_models';

export function statusClassFromPlugin(
  plugin: PluginExecution,
  currentPlugin?: PluginExecution
): string {
  const { executionProgress, pluginStatus } = plugin;
  if (
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
