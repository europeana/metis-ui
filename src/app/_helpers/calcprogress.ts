import { WorkflowExecution } from '../_models';

export function calcProgress(ongoing: WorkflowExecution): number {
  const currIndex: number = ongoing.currentPluginIndex ? ongoing.currentPluginIndex : 0;

  const pct: number = (currIndex / ongoing.metisPlugins.length) * 100;
  let subPct: number = ongoing.metisPlugins[currIndex].executionProgress.progressPercentage;
  subPct = Math.max(subPct, 0) / ongoing.metisPlugins.length;
  return pct + subPct;
}
