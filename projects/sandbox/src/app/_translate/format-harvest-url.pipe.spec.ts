import { FormatHarvestUrlPipe } from '.';
import { apiSettings } from '../../environments/apisettings';

describe('FormatHarvestUrlPipe', () => {
  it('should transform', () => {
    const pipe = new FormatHarvestUrlPipe();
    expect(pipe.transform('1', '2')).toEqual(`${apiSettings.apiHost}/dataset/1/record?recordId=2`);
  });
});
