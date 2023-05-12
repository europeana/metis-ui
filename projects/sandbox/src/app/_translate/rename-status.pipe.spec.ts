import { RenameStatusPipe } from '.';
import { DatasetStatus } from '../_models';

describe('RenameStatusPipe', () => {
  it('should transform', () => {
    const pipe = new RenameStatusPipe();
    expect(pipe.transform(DatasetStatus.HARVESTING_IDENTIFIERS)).toEqual('harvesting identifiers');
    expect(pipe.transform(DatasetStatus.IN_PROGRESS)).toEqual('in progress');
    expect(pipe.transform(DatasetStatus.COMPLETED)).toEqual('completed');
    expect(pipe.transform(DatasetStatus.FAILED)).toEqual('failed');
  });
});
