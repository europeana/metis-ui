import { WorkflowExecution } from '../_models';

export function calcProgress(ongoing: WorkflowExecution): number {
  if (!ongoing.currentPluginIndex) {
    return 0;
  }

  const pct: number = (ongoing.currentPluginIndex / ongoing.metisPlugins.length) * 100;
  let subPct: number =
    ongoing.metisPlugins[ongoing.currentPluginIndex].executionProgress.progressPercentage;
  subPct = Math.max(subPct, 0) / ongoing.metisPlugins.length;
  return pct + subPct;
}
