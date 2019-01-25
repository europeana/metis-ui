import { PluginExecution, PluginStatus } from '../_models';

import { statusClassFromPlugin } from './statusclassfromplugin';

function makePluginExecution(status: string): PluginExecution {
  // tslint:disable: no-any
  return ({
    pluginStatus: status,
    executionProgress: { errors: 0 },
  } as any) as PluginExecution;
}

function addErrorsToPlugin(pe: PluginExecution, errors: number): PluginExecution {
  pe.executionProgress.errors = errors;
  return pe;
}

describe('status class from plugin', () => {
  it('should return "status-warning" for plugins that finished with errors', () => {
    let peFinished = makePluginExecution(PluginStatus.CANCELLED);
    expect(statusClassFromPlugin(peFinished)).not.toEqual('status-warning');
    peFinished = addErrorsToPlugin(peFinished, 1);
    expect(statusClassFromPlugin(peFinished)).toEqual('status-warning');
  });

  it('should return "status-warning" for plugins that were cancelled with errors', () => {
    let peCancelled = makePluginExecution(PluginStatus.CANCELLED);
    expect(statusClassFromPlugin(peCancelled)).not.toEqual('status-warning');
    peCancelled = addErrorsToPlugin(peCancelled, 1);
    expect(statusClassFromPlugin(peCancelled)).toEqual('status-warning');
  });

  it('should return "status-scheduled" for plugins that were cancelled with errors', () => {
    expect(statusClassFromPlugin(makePluginExecution(PluginStatus.INQUEUE))).toEqual(
      'status-scheduled'
    );
  });

  it('should return "status-cleaning" for plugins with status CLEANING', () => {
    expect(statusClassFromPlugin(makePluginExecution(PluginStatus.CLEANING))).toEqual(
      'status-cleaning'
    );
  });

  it('should return "status-running" for plugins with status RUNNING', () => {
    expect(statusClassFromPlugin(makePluginExecution(PluginStatus.RUNNING))).toEqual(
      'status-running'
    );
  });

  it('should return "status-failed" for plugins with status FAILED', () => {
    expect(statusClassFromPlugin(makePluginExecution(PluginStatus.FAILED))).toEqual(
      'status-failed'
    );
  });
});
