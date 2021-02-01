import { getCurrentPlugin, PluginType, WorkflowExecution } from '../_models';

/** canCancelWorkflow
/*  calculate if the workflow can be cancelled
/*  @param {WorkflowExecution} we | undefined - the execution (optional)
*/
export const canCancelWorkflow = (we: WorkflowExecution | undefined): boolean => {
  if (we && !we.cancelling) {
    const current = getCurrentPlugin(we);
    if (current) {
      return !(
        current.pluginType === PluginType.PUBLISH || current.pluginType === PluginType.DEPUBLISH
      );
    }
  }
  return false;
};
