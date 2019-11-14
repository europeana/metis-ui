import { WorkflowExecution } from '../_models';

/** calcProgress
/* calculates the completed percentage of a workflow execution
*/
export function calcProgress(ongoing: WorkflowExecution): number {
  const currIndex: number = ongoing.currentPluginIndex ? ongoing.currentPluginIndex : 0;

  const pct: number = (currIndex / ongoing.metisPlugins.length) * 100;
  const exP = ongoing.metisPlugins[currIndex].executionProgress;
  let subPct: number = exP ? exP.progressPercentage : 0;
  subPct = Math.max(subPct, 0) / ongoing.metisPlugins.length;
  return pct + subPct;
}
