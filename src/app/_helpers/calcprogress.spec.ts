import { WorkflowExecution } from '../_models';

import { calcProgress } from './calcprogress';

function makeWorkflowExecution(currIndex: number, progressStatuses: number[]): WorkflowExecution {
  // tslint:disable:no-any
  const fakePlugins = progressStatuses.map(
    (status) => ({ executionProgress: { progressPercentage: status } } as any)
  );

  return ({
    currentPluginIndex: currIndex,
    metisPlugins: fakePlugins
  } as any) as WorkflowExecution;
}

describe('calc progress', () => {
  it('should return the exact status of the plugin when the WorkflowExecution contains a single plugin', () => {
    expect(calcProgress(makeWorkflowExecution(0, [25]))).toBe(25);
    expect(calcProgress(makeWorkflowExecution(0, [50]))).toBe(50);
    expect(calcProgress(makeWorkflowExecution(0, [75]))).toBe(75);
    expect(calcProgress(makeWorkflowExecution(0, [100]))).toBe(100);
  });

  it('should calculate an overall status based on the current plugin when multiple plugins are supplied', () => {
    expect(calcProgress(makeWorkflowExecution(1, [100, 50]))).toBe(75);
    expect(calcProgress(makeWorkflowExecution(3, [100, 100, 100, 0]))).toBe(75);
  });
});
