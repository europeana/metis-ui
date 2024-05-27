import { StepStatus } from '../_models';
import { RenameStepPipe } from '.';

describe('RenameStepPipe', () => {
  it('should transform', () => {
    const pipe = new RenameStepPipe();
    expect(pipe.transform(StepStatus.HARVEST_HTTP)).toEqual('Harvest (http)');
  });

  it('should handle unknown values', () => {
    const pipe = new RenameStepPipe();
    const val = 'X';
    expect(pipe.transform(val)).toEqual(val);
  });
});
