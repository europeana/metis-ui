import { PluginExecution, PluginType, WorkflowExecution } from '../_models';
import { canCancelWorkflow } from './can-cancel-workflow';

describe('can-cancel-workflow', () => {
  it('should calculate if the workflow can be cancelled', (): void => {
    const we = {
      cancelling: false
    } as WorkflowExecution;

    const setPlugin = (pluginType: PluginType): void => {
      we.metisPlugins = [({ pluginType: pluginType } as unknown) as PluginExecution];
    };

    expect(canCancelWorkflow(undefined)).toBeFalsy();

    we.metisPlugins = [];
    expect(canCancelWorkflow(we)).toBeFalsy();

    setPlugin(PluginType.PUBLISH);
    expect(canCancelWorkflow(we)).toBeFalsy();

    setPlugin(PluginType.NORMALIZATION);
    expect(canCancelWorkflow(we)).toBeTruthy();

    setPlugin(PluginType.DEPUBLISH);
    expect(canCancelWorkflow(we)).toBeFalsy();
  });
});
