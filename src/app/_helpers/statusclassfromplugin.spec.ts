import { PluginExecution, PluginStatus } from '../_models';

import { statusClassFromPlugin } from './statusclassfromplugin';

function makePluginExecution(status: string): PluginExecution {
  return ({
    pluginStatus: status,
    executionProgress: { errors: 0 }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any) as PluginExecution;
}

describe('status class from plugin', () => {
  it('should return "status-warning" for plugins that finished with errors', () => {
    const peFinished = makePluginExecution(PluginStatus.CANCELLED);
    expect(statusClassFromPlugin(peFinished)).not.toEqual('status-warning');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    peFinished.executionProgress = { errors: 1 } as any;
    expect(statusClassFromPlugin(peFinished)).toEqual('status-warning');
  });

  it('should return "status-warning" for plugins that were cancelled with errors', () => {
    const peCancelled = makePluginExecution(PluginStatus.CANCELLED);
    expect(statusClassFromPlugin(peCancelled)).not.toEqual('status-warning');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    peCancelled.executionProgress = { errors: 1 } as any;
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

  it('should return "status-pending" for plugins with status PENDING', () => {
    expect(statusClassFromPlugin(makePluginExecution(PluginStatus.PENDING))).toEqual(
      'status-pending'
    );
  });
});
